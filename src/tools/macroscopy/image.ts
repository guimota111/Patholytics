/* ==========================================================================
   image.ts — a foto da bancada entra pelo celular, com 3–6 MB. O documento do
   Firestore tem 1 MiB, então a imagem é reduzida no navegador antes de subir:
   redimensiona pelo maior lado e vai baixando a qualidade até caber.
   ========================================================================== */

import { MAX_IMAGE_BYTES } from './types'

const MAX_DIMENSION = 1400
const QUALITY_STEPS = [0.85, 0.72, 0.6, 0.5, 0.4]

/** Tamanho aproximado, em bytes, do payload de um data URL base64. */
export const dataUrlBytes = (dataUrl: string): number => Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image-decode-failed'))
    }
    img.src = url
  })
}

/**
 * Devolve um data URL JPEG que cabe no documento, ou `null` quando nem na
 * qualidade mais baixa coube (foto gigantesca ou navegador sem canvas).
 */
export async function prepareImage(file: File): Promise<string | null> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(img, 0, 0, canvas.width, canvas.height)

  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrlBytes(dataUrl) <= MAX_IMAGE_BYTES) return dataUrl
  }
  return null
}
