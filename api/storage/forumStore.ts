import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import type { Comment, Opinion, Topic, TopicDetail, TopicListItem } from '../../shared/forum.js'

type StoredTopic = Topic & { comments: Comment[] }

type ForumData = {
  topics: StoredTopic[]
  opinions: Opinion[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '..', 'data')
const dataFilePath = path.join(dataDir, 'forum.json')

function nowIso(): string {
  return new Date().toISOString()
}

function makeId(): string {
  return crypto.randomUUID()
}

function normalizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/\r\n/g, '\n').trim()
}

function clampText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen)
}

function makeInitialData(): ForumData {
  const topic1Id = makeId()
  const topic2Id = makeId()
  const t1: StoredTopic = {
    id: topic1Id,
    title: '欢迎来到匿名论坛',
    body: '这里可以匿名发起话题并参与讨论。请保持友善与克制。',
    createdAt: nowIso(),
    comments: [
      {
        id: makeId(),
        topicId: topic1Id,
        body: '第一条回帖：你好！',
        createdAt: nowIso(),
      },
    ],
  }

  const t2: StoredTopic = {
    id: topic2Id,
    title: '你希望这里增加什么功能？',
    body: '欢迎在此讨论改进建议；也可以去“提交意见”匿名投递给管理员。',
    createdAt: nowIso(),
    comments: [],
  }

  return {
    topics: [t1, t2],
    opinions: [],
  }
}

async function ensureStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(dataFilePath)
  } catch {
    const data = makeInitialData()
    await writeData(data)
  }
}

async function readData(): Promise<ForumData> {
  await ensureStore()
  const raw = await fs.readFile(dataFilePath, 'utf-8')
  const parsed = JSON.parse(raw) as Partial<ForumData>
  return {
    topics: Array.isArray(parsed.topics) ? (parsed.topics as StoredTopic[]) : [],
    opinions: Array.isArray(parsed.opinions) ? (parsed.opinions as Opinion[]) : [],
  }
}

async function writeData(data: ForumData): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true })
  const tmpPath = `${dataFilePath}.tmp`
  const json = JSON.stringify(data, null, 2)
  await fs.writeFile(tmpPath, json, 'utf-8')
  await fs.rename(tmpPath, dataFilePath)
}

export async function listTopics(limit = 50): Promise<TopicListItem[]> {
  const data = await readData()
  const sorted = [...data.topics].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return sorted.slice(0, limit).map((t) => ({
    id: t.id,
    title: t.title,
    body: t.body,
    createdAt: t.createdAt,
    commentCount: t.comments.length,
  }))
}

export async function getTopic(topicId: string): Promise<TopicDetail | null> {
  const data = await readData()
  const found = data.topics.find((t) => t.id === topicId)
  if (!found) return null
  const commentsSorted = [...found.comments].sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  return {
    id: found.id,
    title: found.title,
    body: found.body,
    createdAt: found.createdAt,
    comments: commentsSorted,
  }
}

export async function createTopic(input: { title: unknown; body: unknown }): Promise<Topic> {
  const title = clampText(normalizeText(input.title), 120)
  const body = clampText(normalizeText(input.body), 5000)
  if (!title || !body) throw new Error('INVALID_INPUT')

  const data = await readData()
  const topicId = makeId()
  const topic: StoredTopic = {
    id: topicId,
    title,
    body,
    createdAt: nowIso(),
    comments: [],
  }
  data.topics.push(topic)
  await writeData(data)
  return {
    id: topic.id,
    title: topic.title,
    body: topic.body,
    createdAt: topic.createdAt,
  }
}

export async function addComment(topicId: string, input: { body: unknown }): Promise<Comment> {
  const body = clampText(normalizeText(input.body), 2000)
  if (!body) throw new Error('INVALID_INPUT')

  const data = await readData()
  const topic = data.topics.find((t) => t.id === topicId)
  if (!topic) throw new Error('NOT_FOUND')

  const comment: Comment = {
    id: makeId(),
    topicId,
    body,
    createdAt: nowIso(),
  }
  topic.comments.push(comment)
  await writeData(data)
  return comment
}

export async function createOpinion(input: { body: unknown }): Promise<Opinion> {
  const body = clampText(normalizeText(input.body), 5000)
  if (!body) throw new Error('INVALID_INPUT')

  const data = await readData()
  const opinion: Opinion = {
    id: makeId(),
    body,
    createdAt: nowIso(),
  }
  data.opinions.push(opinion)
  await writeData(data)
  return opinion
}

export async function listOpinions(limit = 200): Promise<Opinion[]> {
  const data = await readData()
  const sorted = [...data.opinions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return sorted.slice(0, limit)
}

export async function getOpinion(opinionId: string): Promise<Opinion | null> {
  const data = await readData()
  return data.opinions.find((o) => o.id === opinionId) ?? null
}

