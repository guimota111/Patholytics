import {
  Archive,
  Calculator,
  CircleDot,
  ClipboardList,
  Fingerprint,
  Grid3x3,
  ListTree,
  Ruler,
  Microscope,
  ScanEye,
  TestTubes,
  type LucideIcon,
} from 'lucide-react'

export type ToolStatus = 'available' | 'coming-soon'
export type ToolCategoryId = 'calculators' | 'staging' | 'differential' | 'imaging' | 'workflow'

export interface Tool {
  id: string
  /** i18n key under `tools.` holding `name` and `description`. */
  i18nKey: string
  icon: LucideIcon
  category: ToolCategoryId
  status: ToolStatus
  /** Set once the tool ships; `undefined` while it is still in the queue. */
  path?: string
}

export interface ToolCategory {
  id: ToolCategoryId
  icon: LucideIcon
  /** i18n key under `tools.categories.` holding `name` and `description`. */
  i18nKey: string
}

/**
 * The dashboard is grouped by these from day one so that shipping a tool is a
 * one-line change here — no layout work, no new route wiring pattern.
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: 'calculators', icon: Calculator, i18nKey: 'calculators' },
  { id: 'staging', icon: ListTree, i18nKey: 'staging' },
  { id: 'differential', icon: TestTubes, i18nKey: 'differential' },
  { id: 'imaging', icon: Microscope, i18nKey: 'imaging' },
  { id: 'workflow', icon: Grid3x3, i18nKey: 'workflow' },
]

export const TOOLS: Tool[] = [
  {
    id: 'gleason',
    i18nKey: 'gleason',
    icon: Calculator,
    category: 'calculators',
    status: 'available',
    path: '/tools/prostate',
  },
  {
    id: 'stager',
    i18nKey: 'stager',
    icon: ListTree,
    category: 'staging',
    status: 'available',
    path: '/tools/stager',
  },
  {
    id: 'name-that-cyst',
    i18nKey: 'nameThatCyst',
    icon: CircleDot,
    category: 'differential',
    status: 'coming-soon',
  },
  {
    id: 'marker-helper',
    i18nKey: 'markerHelper',
    icon: TestTubes,
    category: 'differential',
    status: 'coming-soon',
  },
  {
    id: 'ackerman',
    i18nKey: 'ackerman',
    icon: Fingerprint,
    category: 'differential',
    status: 'coming-soon',
  },
  {
    id: 'ki67',
    i18nKey: 'ki67',
    icon: ScanEye,
    category: 'imaging',
    status: 'coming-soon',
  },
  {
    id: 'bone-marrow',
    i18nKey: 'boneMarrow',
    icon: Microscope,
    category: 'imaging',
    status: 'coming-soon',
  },
  {
    id: 'field-converter',
    i18nKey: 'fieldConverter',
    icon: Ruler,
    category: 'calculators',
    status: 'available',
    path: '/tools/fields',
  },
  {
    id: 'report-archive',
    i18nKey: 'reportArchive',
    icon: Archive,
    category: 'workflow',
    status: 'available',
    path: '/tools/archive',
  },
  {
    id: 'organizer',
    i18nKey: 'organizer',
    icon: ClipboardList,
    category: 'workflow',
    status: 'available',
    path: '/tools/organizer',
  },
  {
    id: 'tma',
    i18nKey: 'tma',
    icon: Grid3x3,
    category: 'workflow',
    status: 'available',
    path: '/tools/tma',
  },
]

export const toolsByCategory = (category: ToolCategoryId): Tool[] =>
  TOOLS.filter((tool) => tool.category === category)

export const availableTools = (): Tool[] => TOOLS.filter((tool) => tool.status === 'available')

export const comingSoonTools = (): Tool[] => TOOLS.filter((tool) => tool.status === 'coming-soon')
