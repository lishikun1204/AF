import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, SendHorizonal } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { apiGet, apiPost } from '@/utils/api'
import { formatDateTime } from '@/utils/date'
import { useAdminStore } from '@/store/adminStore'
import type { TopicDetail as TopicDetailType } from '../../shared/forum'

export default function TopicDetail() {
  const params = useParams()
  const topicId = params.id || ''
  const adminToken = useAdminStore((s) => s.token)
  const isAdminMode = Boolean(adminToken)

  const [data, setData] = useState<TopicDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => body.trim().length > 0 && !isAdminMode, [body, isAdminMode])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const topic = await apiGet<TopicDetailType>(`/api/topics/${encodeURIComponent(topicId)}`)
      setData(topic)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    if (!topicId) return
    void load()
  }, [load, topicId])

  async function onSubmit() {
    if (!canSubmit || !topicId) return
    setSubmitting(true)
    setError(null)
    try {
      await apiPost(`/api/topics/${encodeURIComponent(topicId)}/comments`, { body })
      setBody('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          返回话题列表
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-zinc-200" />
        </div>
      )}

      {!loading && !data && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-700">话题不存在或已被移除。</div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-4">
            <article className="rounded-xl border border-zinc-200 bg-white p-5">
              <h1 className="text-lg font-semibold leading-snug">{data.title}</h1>
              <div className="mt-1 text-xs text-zinc-500">发布于 {formatDateTime(data.createdAt)}</div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-800">{data.body}</p>
            </article>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">评论</h2>
                <span className="text-xs text-zinc-500">{data.comments.length} 条</span>
              </div>

              <div className="mt-4 space-y-3">
                {data.comments.length === 0 && <div className="text-sm text-zinc-600">暂无评论</div>}
                {data.comments.map((c) => (
                  <div key={c.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="whitespace-pre-wrap text-sm text-zinc-800">{c.body}</div>
                    <div className="mt-2 text-xs text-zinc-500">{formatDateTime(c.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold">发布评论</div>
              <div className="mt-1 text-xs text-zinc-500">无需登录；不会记录你的身份信息。</div>
              {isAdminMode && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  管理员只读模式下不可发帖或评论。
                </div>
              )}
              <Textarea
                className="mt-3 min-h-[120px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isAdminMode ? '管理员只读模式下不可输入' : '写下你的评论…'}
                disabled={submitting || isAdminMode}
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">最多 2000 字</div>
                <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
                  <SendHorizonal className="h-4 w-4" />
                  提交
                </Button>
              </div>
              {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  )
}
