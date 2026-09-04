/* ==========================================================================
   codes.ts — códigos CBHPM de patologia citados na Cartilha de Instruções
   CBHPM – Patologia 2019 (SBP/ABRALAPAC, 4ª versão, correção 20/02/2020).
   Os nomes seguem a nomenclatura da cartilha. A cartilha não traz valores
   em reais: porte e UCO devem ser consultados no referencial vigente.
   ========================================================================== */

export interface CbhpmCode {
  code: string
  name: string
}

export const CODES = {
  biopsiaSimples: { code: '4.06.01.11-0', name: 'Procedimento diagnóstico em biópsia simples, "imprint" e "cell block"' },
  multiplosFragmentos: { code: '4.06.01.19-6', name: 'Procedimento diagnóstico em biópsia com múltiplos fragmentos (3 ou mais)' },
  pecaSimples: { code: '4.06.01.20-0', name: 'Procedimento diagnóstico em peça cirúrgica ou anatômica simples' },
  pecaComplexa: { code: '4.06.01.21-8', name: 'Procedimento diagnóstico em peça cirúrgica ou anatômica complexa' },
  pecaAdicional: { code: '4.06.01.22-6', name: 'Peça cirúrgica adicional, margem cirúrgica ou grupo de linfonodos (até 6)' },
  congelacaoSem: { code: '4.06.01.01-3', name: 'Procedimento diagnóstico per operatório sem deslocamento do patologista' },
  congelacaoAdicional: { code: '4.06.01.02-1', name: 'Procedimento diagnóstico per operatório — peça adicional ou margem cirúrgica' },
  congelacaoCom: { code: '4.06.01.03-0', name: 'Procedimento diagnóstico per operatório com deslocamento do patologista' },
  paafSupSem: { code: '4.06.01.07-2', name: 'PAAF de órgãos/estruturas superficiais sem deslocamento do patologista' },
  paafProfSem: { code: '4.06.01.08-0', name: 'PAAF de órgãos/estruturas profundas sem deslocamento do patologista' },
  paafSupCom: { code: '4.06.01.09-9', name: 'PAAF de órgãos/estruturas superficiais com deslocamento do patologista' },
  paafProfCom: { code: '4.06.01.10-2', name: 'PAAF de órgãos/estruturas profundas com deslocamento do patologista' },
  citoPaaf: { code: '4.06.01.25-0', name: 'Procedimento diagnóstico em citologia de PAAF (até 5 lâminas)' },
  citoLiquidos: { code: '4.06.01.12-9', name: 'Procedimento diagnóstico em citopatologia oncótica de líquidos e raspados' },
  citoCervico: { code: '4.06.01.13-7', name: 'Procedimento diagnóstico em citopatologia cervicovaginal oncótica e microflora' },
  citoHormonal: { code: '4.06.01.16-1', name: 'Procedimento diagnóstico em citologia hormonal isolada' },
  citoHormonalSeriada: { code: '4.06.01.14-5', name: 'Procedimento diagnóstico em citologia hormonal seriada' },
  citoMeioLiquido: { code: '4.06.01.32-3', name: 'Procedimento diagnóstico em citopatologia em meio líquido' },
  revisao: { code: '4.06.01.15-3', name: 'Procedimento diagnóstico em revisão de lâminas ou cortes seriados' },
  coloracaoEspecial: { code: '4.06.01.26-9', name: 'Coloração especial (histoquímica), por coloração' },
  ihqPainel: { code: '4.06.01.17-0', name: 'Procedimento diagnóstico em painel de imuno-histoquímica (2 a 5 reações)' },
  ihqIsolada: { code: '4.06.01.18-8', name: 'Procedimento diagnóstico em imuno-histoquímica — reação isolada' },
  microscopiaEletronica: { code: '4.06.01.06-4', name: 'Procedimento diagnóstico em microscopia eletrônica, por espécime' },
  capturaHibrida: { code: '4.06.01.29-3', name: 'Procedimento diagnóstico por captura híbrida' },
  hibridizacaoInSitu: { code: '4.06.01.28-5', name: 'Procedimento diagnóstico em painel de hibridização "in situ"' },
  imunofluorescencia: { code: '4.06.01.27-7', name: 'Procedimento diagnóstico em imunofluorescência' },
  citometriaFluxo: { code: '4.06.01.30-7', name: 'Procedimento diagnóstico em citometria de fluxo (por monoclonal)' },
  citometriaImagens: { code: '4.06.01.31-5', name: 'Procedimento diagnóstico em citometria de imagens' },
  msi: { code: '4.06.01.43-9', name: 'Instabilidade de microssatélites (MSI), detecção por PCR, bloco de parafina' },
  dnaCitometria: { code: '4.06.01.38-2', name: 'DNA citometria de fluxo — parafina / outros materiais' },
  amputacaoOnco: { code: '4.06.01.24-2', name: 'Procedimento diagnóstico em amputação de membros — causa oncológica' },
  amputacaoNaoOnco: { code: '4.06.01.23-4', name: 'Procedimento diagnóstico em amputação de membros — sem causa oncológica' },
  necropsiaAdulto: { code: '4.06.01.04-8', name: 'Necrópsia de adulto, criança ou natimorto' },
  necropsiaFeto: { code: '4.06.01.05-6', name: 'Necrópsia de embrião ou feto (até 500 g)' },
} as const satisfies Record<string, CbhpmCode>

export type CodeKey = keyof typeof CODES

export const SOURCE = 'Cartilha de Instruções CBHPM – Patologia 2019 (SBP/ABRALAPAC), 4ª versão, correção de 20/02/2020'
