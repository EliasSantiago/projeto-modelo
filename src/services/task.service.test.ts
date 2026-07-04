import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocka o repository: o service é testado isolado, sem tocar no banco.
vi.mock('@/repositories/task.repository', () => ({
  taskRepository: {
    findManyByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { taskRepository } from '@/repositories/task.repository'
import { taskService, TaskNotFoundError } from './task.service'

const mockRepo = vi.mocked(taskRepository)

describe('taskService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cria task associada ao usuário informado', async () => {
    mockRepo.create.mockResolvedValue({ id: '1' } as never)
    await taskService.create('user-1', { title: 'Nova' })
    expect(mockRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      title: 'Nova',
    })
  })

  it('lança TaskNotFoundError ao atualizar task inexistente', async () => {
    mockRepo.update.mockResolvedValue(null)
    await expect(
      taskService.update('user-1', { id: 'x', completed: true }),
    ).rejects.toBeInstanceOf(TaskNotFoundError)
  })

  it('lança TaskNotFoundError ao remover task de outro usuário', async () => {
    mockRepo.delete.mockResolvedValue(false)
    await expect(taskService.remove('user-1', 'x')).rejects.toBeInstanceOf(
      TaskNotFoundError,
    )
  })
})
