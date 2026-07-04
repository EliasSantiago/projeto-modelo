import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocka a Server Action: evita carregar a cadeia de banco/env nos testes.
vi.mock('@/actions/task.actions', () => ({
  createTaskAction: vi.fn(),
}))

import { createTaskAction } from '@/actions/task.actions'
import { TaskForm } from './task-form'

const mockCreate = vi.mocked(createTaskAction)

describe('<TaskForm />', () => {
  beforeEach(() => vi.clearAllMocks())

  it('não chama a action quando o título está vazio (validação Zod)', async () => {
    render(<TaskForm />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    expect(mockCreate).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('chama a action com o título ao enviar válido', async () => {
    mockCreate.mockResolvedValue({ ok: true, data: { id: '1' } as never })
    render(<TaskForm />)
    await userEvent.type(screen.getByPlaceholderText(/nova tarefa/i), 'Estudar')
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    expect(mockCreate).toHaveBeenCalledWith({ title: 'Estudar' })
  })
})
