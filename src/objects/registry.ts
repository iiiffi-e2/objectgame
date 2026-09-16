import type { ComponentType } from 'react'
import { Object001 } from './object001/Object001'
import { OBJECT_001_CONFIG } from './object001/object001Config'

export type ObjectDefinition = {
  id: string
  code: string
  title: string
  Component: ComponentType
}

export const OBJECT_REGISTRY: Record<string, ObjectDefinition> = {
  '001': {
    id: OBJECT_001_CONFIG.id,
    code: OBJECT_001_CONFIG.code,
    title: OBJECT_001_CONFIG.title,
    Component: Object001,
  },
}

export const CURRENT_OBJECT_ID = '001'
