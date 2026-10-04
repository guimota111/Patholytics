import React from 'react'
import type { OrganId } from '@/tools/stager/types'

interface OrganIconProps extends React.SVGProps<SVGSVGElement> {
  organId?: OrganId | string
  className?: string
}

/**
 * Mapeamento dos arquivos de ilustração anatômica médica dos órgãos.
 */
const ORGAN_IMAGE_MAP: Record<string, string> = {
  breast: '/assets/organs/organ_breast.jpg',
  prostate: '/assets/organs/organ_prostate.jpg',
  lung: '/assets/organs/organ_lung.jpg',
  stomach: '/assets/organs/organ_stomach.jpg',
  colon: '/assets/organs/organ_colon.jpg',
  kidney: '/assets/organs/organ_kidney.jpg',
  liver: '/assets/organs/organ_liver.jpg',
  pancreas: '/assets/organs/organ_pancreas.jpg',
  gallbladder: '/assets/organs/organ_gallbladder.jpg',
  bladder: '/assets/organs/organ_bladder.jpg',
  uterus: '/assets/organs/organ_uterus.jpg',
  ovary: '/assets/organs/organ_ovary.jpg',
  thyroid: '/assets/organs/organ_thyroid.jpg',
  skin: '/assets/organs/organ_skin.jpg',
  bone: '/assets/organs/organ_bone.jpg',
  soft_tissue: '/assets/organs/organ_soft_tissue.jpg',
  head_neck: '/assets/organs/organ_head_neck.jpg',
  esophagus: '/assets/organs/organ_esophagus.jpg',
  adrenal: '/assets/organs/organ_adrenal.jpg',
  thymus: '/assets/organs/organ_thymus.jpg',
  appendix: '/assets/organs/organ_appendix.jpg',
}

/**
 * Componente que renderiza a ilustração anatômica médica realista do órgão.
 * Se houver a imagem do órgão disponível em /assets/organs, renderiza a ilustração médica.
 */
export const OrganIcon: React.FC<OrganIconProps> = ({ organId, className = 'size-8', ...props }) => {
  const imageSrc = organId ? ORGAN_IMAGE_MAP[organId] : undefined

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={organId ? `Anatomia ${organId}` : 'Anatomia'}
        className={`${className} mix-blend-multiply dark:invert dark:mix-blend-screen opacity-90 transition-transform duration-500 group-hover:scale-110`}
      />
    )
  }

  // Fallback SVG para órgãos genéricos
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    </svg>
  )
}
