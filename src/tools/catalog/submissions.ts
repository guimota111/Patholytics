/* ==========================================================================
   submissions.ts — o envio de fotos para a curadoria. A foto é reduzida no
   navegador e gravada, em base64, num documento da coleção `submissions`:
   sem Storage, sem backend, só a regra do Firestore que aceita criação de
   quem está logado. O curador lê no console do Firebase e passa o que
   aprovar para os módulos em `content/`, com o crédito.
   ========================================================================== */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { CatalogId } from './types'

/** Documento do Firestore tem 1 MiB; a foto fica bem abaixo para sobrar espaço para o resto. */
export const MAX_IMAGE_CHARS = 850_000
const MAX_EDGE = 1600

export interface SubmissionInput {
  catalog: CatalogId
  /** Verbete a que a foto se refere, quando enviada de dentro de um. */
  entryId: string | null
  /** O que é (nome do bicho ou do material), no dizer de quem envia. */
  subject: string
  /** Onde foi encontrado (órgão, sítio). */
  site: string
  notes: string
  /** Como a pessoa quer ser creditada. */
  credit: string
  uid: string
  email: string | null
  /** JPEG em data URL, já reduzido. */
  image: string
}

/**
 * Reduz a foto para caber no documento: redimensiona ao maior lado de 1600 px
 * e baixa a qualidade do JPEG até o base64 ficar abaixo do limite.
 */
export async function prepareImage(file: File): Promise<string> {
  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  for (const quality of [0.86, 0.8, 0.72, 0.62, 0.5, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= MAX_IMAGE_CHARS) return url
  }
  // Ainda grande: encolhe mais uma vez e tenta de novo.
  const smaller = document.createElement('canvas')
  smaller.width = Math.round(canvas.width * 0.6)
  smaller.height = Math.round(canvas.height * 0.6)
  smaller.getContext('2d')?.drawImage(canvas, 0, 0, smaller.width, smaller.height)
  const url = smaller.toDataURL('image/jpeg', 0.6)
  if (url.length > MAX_IMAGE_CHARS) throw new Error('image too large')
  return url
}

function loadBitmap(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image failed'))
    }
    img.src = url
  })
}

export async function submitPhoto(input: SubmissionInput): Promise<void> {
  const { db } = await import('@/lib/firestore')
  await addDoc(collection(db, 'submissions'), {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}
