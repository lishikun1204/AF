export type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: 'GET',
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  })
  const json = (await readJson(res)) as ApiEnvelope<T> | null
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `HTTP_${res.status}`)
  }
  return json.data as T
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body ?? {}),
  })
  const json = (await readJson(res)) as ApiEnvelope<T> | null
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `HTTP_${res.status}`)
  }
  return json.data as T
}
