import { describe, expect, it } from 'vitest'
import { createTaskSchema, updateTaskSchema } from './task.schema'

describe('createTaskSchema', () => {
  it('aceita um título válido e faz trim', () => {
    const result = createTaskSchema.safeParse({ title: '  Estudar  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.title).toBe('Estudar')
  })

  it('rejeita título vazio', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false)
  })

  it('rejeita título acima de 200 caracteres', () => {
    expect(createTaskSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(
      false,
    )
  })
})

describe('updateTaskSchema', () => {
  it('exige id', () => {
    expect(updateTaskSchema.safeParse({ completed: true }).success).toBe(false)
  })

  it('aceita atualização parcial de completed', () => {
    const result = updateTaskSchema.safeParse({ id: 'x', completed: true })
    expect(result.success).toBe(true)
  })
})
