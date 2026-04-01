import { Router, type Request, type Response } from 'express'
import { addComment, createTopic, getTopic, listTopics } from '../storage/forumStore.js'

const router = Router()

function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN ?? 'dev-admin-token'
  const headerToken = req.header('x-admin-token')
  return Boolean(headerToken && headerToken === token)
}

function rejectIfAdmin(req: Request, res: Response): boolean {
  if (!isAdmin(req)) return false
  res.status(403).json({ success: false, error: 'ADMIN_READ_ONLY' })
  return true
}

router.get('/', async (req: Request, res: Response) => {
  const limitRaw = req.query.limit
  const limit = typeof limitRaw === 'string' ? Number(limitRaw) : 50
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(200, limit)) : 50
  const items = await listTopics(safeLimit)
  res.json({ success: true, data: items })
})

router.post('/', async (req: Request, res: Response) => {
  if (rejectIfAdmin(req, res)) return
  try {
    const topic = await createTopic(req.body)
    res.status(201).json({ success: true, data: topic })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN'
    if (msg === 'INVALID_INPUT') {
      res.status(400).json({ success: false, error: 'INVALID_INPUT' })
      return
    }
    res.status(500).json({ success: false, error: 'SERVER_ERROR' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  const topic = await getTopic(req.params.id)
  if (!topic) {
    res.status(404).json({ success: false, error: 'NOT_FOUND' })
    return
  }
  res.json({ success: true, data: topic })
})

router.post('/:id/comments', async (req: Request, res: Response) => {
  if (rejectIfAdmin(req, res)) return
  try {
    const comment = await addComment(req.params.id, req.body)
    res.status(201).json({ success: true, data: comment })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN'
    if (msg === 'INVALID_INPUT') {
      res.status(400).json({ success: false, error: 'INVALID_INPUT' })
      return
    }
    if (msg === 'NOT_FOUND') {
      res.status(404).json({ success: false, error: 'NOT_FOUND' })
      return
    }
    res.status(500).json({ success: false, error: 'SERVER_ERROR' })
  }
})

export default router

