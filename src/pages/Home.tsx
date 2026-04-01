import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MessageCircle } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { apiGet, apiPost } from '@/utils/api'
import { formatDateTime } from '@/utils/date'
import { useAdminStore } from '@/store/adminStore'
import type { TopicListItem } from '../../shared/forum'

export default function Home() {
  const navigate = useNavigate()
  const adminToken = useAdminStore((s) => s.token)
  const isAdminMode = Boolean(adminToken)

  const [topics, setTopics] = useState<TopicListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = useMemo(() => title.trim().length > 0 && body.trim().length > 0 && !isAdminMode, [title, body, isAdminMode])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const list = await apiGet<TopicListItem[]>('/api/topics')
      setTopics(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreateTopic() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const topic = await apiPost<{ id: string; title: string; body: string; createdAt: string }>('/api/topics', { title, body })
      setTitle('')
      setBody('')
      await load()
      navigate(`/topic/${topic.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold">公开话题</div>
              <div className="mt-1 text-sm text-zinc-600">无需登录即可发起与参与讨论；不会记录普通用户信息。</div>
            </div>
            <Link to="/opinion" className="text-sm text-zinc-700 hover:text-zinc-900 underline underline-offset-4">
              去提交意见
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">话题列表</div>
            <div className="mt-3 space-y-2">
              {loading && (
                <>
                  <div className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                  <div className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                </>
              )}
              {!loading && topics.length === 0 && <div className="text-sm text-zinc-600">暂无话题</div>}
              {topics.map((t) => (
                <Link
                  key={t.id}
                  to={`/topic/${t.id}`}
                  className="block rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">{t.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">{formatDateTime(t.createdAt)}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-zinc-600">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t.commentCount}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold">创建话题</div>
            <div className="mt-1 text-xs text-zinc-500">匿名发起话题，提交后可在详情页继续讨论。</div>
            {isAdminMode && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                管理员只读模式下不可发帖。
              </div>
            )}
            <div className="mt-3">
              <div className="text-xs font-medium text-zinc-600">标题</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAdminMode ? '管理员只读模式下不可输入' : '一句话概括…'}
                disabled={submitting || isAdminMode}
                className="mt-2"
              />
            </div>
            <div className="mt-3">
              <div className="text-xs font-medium text-zinc-600">正文</div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isAdminMode ? '管理员只读模式下不可输入' : '写下话题内容…'}
                disabled={submitting || isAdminMode}
                className="mt-2 min-h-[160px]"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={onCreateTopic} disabled={!canSubmit || submitting}>
                <Plus className="h-4 w-4" />
                发布
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
