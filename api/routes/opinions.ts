import { Router, type Request, type Response } from 'express'
import { createOpinion } from '../storage/forumStore.js'

const router = Router()

function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN ?? 'dev-admin-token'
  const headerToken = req.header('x-admin-token')
  return Boolean(headerToken && headerToken === token)
}

router.post('/', async (req: Request, res: Response) => {
  if (isAdmin(req)) {
    res.status(403).json({ success: false, error: 'ADMIN_READ_ONLY' })
    return
  }
  try {
    const opinion = await createOpinion(req.body)
    res.status(201).json({ success: true, data: { id: opinion.id, createdAt: opinion.createdAt } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN'
    if (msg === 'INVALID_INPUT') {
      res.status(400).json({ success: false, error: 'INVALID_INPUT' })
      return
    }
    res.status(500).json({ success: false, error: 'SERVER_ERROR' })
  }
})

export default router

