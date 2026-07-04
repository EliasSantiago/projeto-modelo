import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Limpa o DOM entre testes de componente.
afterEach(() => cleanup())
