import { create } from 'zustand'

type AdminState = {
  token: string | null
  setToken: (token: string | null) => void
}

function readToken(): string | null {
  try {
    const raw = localStorage.getItem('admin_token')
    if (!raw) return null
    return raw
  } catch {
    return null
  }
}

function writeToken(token: string | null): void {
  try {
    if (!token) {
      localStorage.removeItem('admin_token')
      return
    }
    localStorage.setItem('admin_token', token)
  } catch {
    return
  }
}

export const useAdminStore = create<AdminState>((set) => ({
  token: typeof window === 'undefined' ? null : readToken(),
  setToken: (token) => {
    writeToken(token)
    set({ token })
  },
}))

