import type { NextFunction, Request, Response } from 'express'

function parseCharset(contentType: string | undefined): string | null {
  if (!contentType) return null
  const parts = contentType.split(';').map((p) => p.trim())
  for (const p of parts) {
    const lower = p.toLowerCase()
    if (lower.startsWith('charset=')) {
      return lower.slice('charset='.length).trim()
    }
  }
  return null
}

function decodeUtf16Be(buf: Buffer): string {
  const copy = Buffer.from(buf)
  copy.swap16()
  return copy.toString('utf16le')
}

function stripBomChar(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1)
  return text
}

export function decodeJsonBytes(buf: Buffer, contentType: string | undefined): string {
  const charset = parseCharset(contentType)

  if (charset === 'utf-8' || charset === 'utf8') return stripBomChar(buf.toString('utf8'))
  if (charset === 'utf-16le') return stripBomChar(buf.toString('utf16le'))
  if (charset === 'utf-16be') return stripBomChar(decodeUtf16Be(buf))

  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8')
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le')
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return decodeUtf16Be(buf.subarray(2))
  }

  const utf8 = buf.toString('utf8')
  try {
    const t = stripBomChar(utf8)
    JSON.parse(t)
    return t
  } catch {
    const u16le = buf.toString('utf16le')
    try {
      const t = stripBomChar(u16le)
      JSON.parse(t)
      return t
    } catch {
      const t = stripBomChar(decodeUtf16Be(buf))
      return t
    }
  }
}

export function jsonBody(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.header('content-type')
  const isJson = Boolean(contentType && (contentType.includes('application/json') || contentType.includes('+json')))
  if (!isJson) {
    next()
    return
  }

  if (!Buffer.isBuffer(req.body)) {
    next()
    return
  }

  const buf = req.body
  if (buf.length === 0) {
    req.body = {}
    next()
    return
  }

  const text = decodeJsonBytes(buf, contentType ?? undefined)
  try {
    req.body = JSON.parse(text)
    next()
  } catch {
    res.status(400).json({ success: false, error: 'INVALID_JSON' })
  }
}
