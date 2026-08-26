#!/usr/bin/env node
/**
 * Exporta o acervo do app antigo "Arquivo de Laudos" (projeto Firebase
 * `arquivolaudos`) para um JSON que o Patholytics importa em
 * Ferramentas → Arquivo de laudos → Importar.
 *
 * Uso (na raiz do Patholytics, com `npm install` feito):
 *   node scripts/export-arquivolaudos.mjs
 *
 * Pede o e-mail e a senha usados no app antigo (as regras de lá exigem login);
 * nada é gravado em disco além do JSON exportado. Mapeamento:
 *   laudo → report · nota → note · root → root_reports · root_notas → root_notes
 * As favoritas do usuário que fez login viram `favorite: true`.
 */
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, terminate } from 'firebase/firestore'

// Configuração pública do app antigo (src/firebase.js do repositório ArquivosLaudos).
const OLD_APP = {
  apiKey: 'AIzaSyCodngtcz1DXxzMSsMwLfjZagm0DRX-6KM',
  authDomain: 'arquivolaudos.firebaseapp.com',
  projectId: 'arquivolaudos',
}

const TYPE = { category: 'category', laudo: 'report', nota: 'note', report: 'report', note: 'note' }
const ROOT = { root: 'root_reports', root_notas: 'root_notes', root_reports: 'root_reports', root_notes: 'root_notes' }

async function ask(rl, question, hidden = false) {
  if (!hidden) return (await rl.question(question)).trim()
  // Senha sem eco: escreve a pergunta e silencia a saída enquanto o usuário digita.
  stdout.write(question)
  const muted = { write: (chunk, ...rest) => (typeof chunk === 'string' && chunk.includes('\n') ? stdout.write('\n', ...rest) : true) }
  const rlHidden = createInterface({ input: stdin, output: muted, terminal: true })
  const answer = await rlHidden.question('')
  rlHidden.close()
  return answer.trim()
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })
  const email = process.env.ARQUIVO_EMAIL || (await ask(rl, 'E-mail do Arquivo de Laudos: '))
  const password = process.env.ARQUIVO_PASSWORD || (await ask(rl, 'Senha: ', true))
  rl.close()

  const app = initializeApp(OLD_APP)
  const auth = getAuth(app)
  const db = getFirestore(app)
  try {
    let user
    try {
      ;({ user } = await signInWithEmailAndPassword(auth, email, password))
    } catch (error) {
      console.error(`\nNão foi possível entrar (${error.code ?? error.message}).`)
      process.exitCode = 1
      return
    }
    console.log(`\nConectado como ${user.email}. Lendo o acervo…`)

    const snapshot = await getDocs(collection(db, 'nodes'))
    let favorites = new Set()
    try {
      const fav = await getDoc(doc(db, 'favorites', user.uid))
      favorites = new Set(fav.exists() ? fav.data().nodeIds ?? [] : [])
    } catch {
      // sem favoritas não é erro
    }

    const nodes = snapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        parentId: ROOT[data.parentId] ?? data.parentId ?? 'root_reports',
        type: TYPE[data.type] ?? 'report',
        label: typeof data.label === 'string' ? data.label : '',
        content: typeof data.content === 'string' ? data.content : '',
        icon: typeof data.icon === 'string' ? data.icon : '',
        tags: Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === 'string') : [],
        copyCount: typeof data.copyCount === 'number' ? data.copyCount : 0,
        favorite: favorites.has(d.id),
      }
    })

    const exportedAt = new Date().toISOString()
    const out = { format: 'patholytics.archive', version: 1, exportedAt, nodes }
    const file = `arquivolaudos-export-${exportedAt.slice(0, 10)}.json`
    await writeFile(file, JSON.stringify(out, null, 2), 'utf8')

    const count = (type) => nodes.filter((n) => n.type === type).length
    console.log(`Exportado: ${count('category')} categorias, ${count('report')} laudos, ${count('note')} notas, ${favorites.size} favoritas → ${file}`)
    console.log('Agora, no Patholytics: Ferramentas → Arquivo de laudos → Importar → escolha este arquivo.')
  } finally {
    // Fecha as conexões para o processo terminar sozinho, sem process.exit().
    await terminate(db).catch(() => undefined)
    await deleteApp(app).catch(() => undefined)
  }
}

await main()
