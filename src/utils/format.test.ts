import { describe, expect, it } from 'vitest'
import { formatDate, truncate } from './format'

describe('formatDate', () => {
  it('formata no padrão pt-BR', () => {
    expect(formatDate('2026-07-04T12:00:00Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('truncate', () => {
  it('mantém texto curto', () => {
    expect(truncate('abc', 10)).toBe('abc')
  })

  it('trunca texto longo com reticências', () => {
    expect(truncate('abcdef', 4)).toBe('abc…')
  })
})
