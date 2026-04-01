import { Router, type Request, type Response } from 'express'
import { getOpinion, listOpinions } from '../storage/forumStore.js'

const router = Router()

function getAdminToken(): string {
  return process.env.ADMIN_TOKEN ?? 'dev-admin-token'
}

function isAdmin(req: Request): boolean {
  const headerToken = req.header('x-admin-token')
  return Boolean(headerToken && headerToken === getAdminToken())
}

router.post('/login', async (req: Request, res: Response) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (token && token === getAdminToken()) {
    res.json({ success: true })
    return
  }
  res.status(401).json({ success: false, error: 'UNAUTHORIZED' })
})

router.get('/opinions', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' })
    return
  }
  const items = await listOpinions(200)
  const summaries = items.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    preview: o.body.length > 80 ? `${o.body.slice(0, 80)}…` : o.body,
  }))
  res.json({ success: true, data: summaries })
})

router.get('/opinions/:id', async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' })
    return
  }
  const item = await getOpinion(req.params.id)
  if (!item) {
    res.status(404).json({ success: false, error: 'NOT_FOUND' })
    return
  }
  res.json({ success: true, data: item })
})

export default router

