/* ==========================================================================
   rcb.ts — Residual Cancer Burden (Symmans et al., J Clin Oncol 2007; MD
   Anderson Cancer Center) e sugestão de ypT/ypN (AJCC 8ª ed.).

     d_prim = √(d1 · d2)
     f_inv  = (1 − %CIS/100) · (%CA/100)
     RCB    = 1,4 · (f_inv · d_prim)^0,17 + [4 · (1 − 0,75^LN) · d_met]^0,17

   Classes: RCB-0 = 0 (pCR); RCB-I ≤ 1,36; RCB-II ≤ 3,28; RCB-III > 3,28.
   ========================================================================== */

export interface RcbInputs {
  /** Maiores dimensões do leito tumoral residual, mm. */
  d1: number | null
  d2: number | null
  /** Celularidade média de carcinoma no leito (% da área). */
  ca: number | null
  /** % do carcinoma que é in situ. */
  cis: number | null
  /** Linfonodos positivos. */
  ln: number | null
  /** Maior metástase linfonodal, mm. */
  dmet: number | null
}

export type RcbClass = 'RCB-0' | 'RCB-I' | 'RCB-II' | 'RCB-III'

export interface RcbResult {
  index: number
  rcbClass: RcbClass
  dPrim: number
  fInv: number
  primaryTerm: number
  nodalTerm: number
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function rcbClassOf(index: number): RcbClass {
  if (index <= 0) return 'RCB-0'
  if (index <= 1.36) return 'RCB-I'
  if (index <= 3.28) return 'RCB-II'
  return 'RCB-III'
}

/** `null` enquanto faltar algum dado (o cálculo exige todos os campos). */
export function computeRcb(i: RcbInputs): RcbResult | null {
  const { d1, d2, ca, cis, ln } = i
  if (d1 === null || d2 === null || ca === null || cis === null || ln === null) return null
  const lnCount = Math.max(0, Math.floor(ln))
  const dmet = lnCount > 0 ? i.dmet : 0
  if (dmet === null) return null
  if (![d1, d2, ca, cis, dmet].every((v) => Number.isFinite(v))) return null

  const dPrim = Math.sqrt(Math.max(0, d1) * Math.max(0, d2))
  const fInv = (1 - clamp(cis, 0, 100) / 100) * (clamp(ca, 0, 100) / 100)
  const primaryBase = fInv * dPrim
  const primaryTerm = primaryBase > 0 ? 1.4 * Math.pow(primaryBase, 0.17) : 0
  const nodalBase = 4 * (1 - Math.pow(0.75, lnCount)) * Math.max(0, dmet)
  const nodalTerm = nodalBase > 0 ? Math.pow(nodalBase, 0.17) : 0
  const index = primaryTerm + nodalTerm
  return { index, rcbClass: rcbClassOf(index), dPrim, fInv, primaryTerm, nodalTerm }
}

/* ---- Estadiamento sugerido ------------------------------------------------ */

export type YpT = 'ypT0' | 'ypTis' | 'ypT1mi' | 'ypT1a' | 'ypT1b' | 'ypT1c' | 'ypT2' | 'ypT3' | 'ypT4'
export type YpN = 'ypNX' | 'ypN0' | 'ypN0(i+)' | 'ypN1mi' | 'ypN1a' | 'ypN2a' | 'ypN3a'

export function suggestYpT(opts: {
  largestInvasiveMm: number | null
  residualInvasive: boolean | null
  residualDcis: boolean
  skin: boolean
  chestWall: boolean
}): YpT | null {
  if (opts.skin || opts.chestWall) return 'ypT4'
  const mm = opts.largestInvasiveMm
  if (mm === null) {
    if (opts.residualInvasive === false) return opts.residualDcis ? 'ypTis' : 'ypT0'
    return null
  }
  if (mm <= 0) return opts.residualDcis ? 'ypTis' : 'ypT0'
  if (mm <= 1) return 'ypT1mi'
  if (mm <= 5) return 'ypT1a'
  if (mm <= 10) return 'ypT1b'
  if (mm <= 20) return 'ypT1c'
  if (mm <= 50) return 'ypT2'
  return 'ypT3'
}

export function suggestYpN(opts: { examined: number | null; positive: number | null; largestMm: number | null; itcOnly: boolean }): YpN {
  const examined = opts.examined ?? 0
  const positive = opts.positive ?? 0
  if (opts.itcOnly) return 'ypN0(i+)'
  if (positive <= 0) return examined > 0 ? 'ypN0' : 'ypNX'
  if (opts.largestMm !== null && opts.largestMm <= 2) return 'ypN1mi'
  if (positive <= 3) return 'ypN1a'
  if (positive <= 9) return 'ypN2a'
  return 'ypN3a'
}
