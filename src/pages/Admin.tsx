import { useCallback, useEffect, useMemo, useState } from 'react'
import { Shield, LogOut, RefreshCw } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { apiGet, apiPost } from '@/utils/api'
import { useAdminStore } from '@/store/adminStore'
import { formatDateTime } from '@/utils/date'

type OpinionSummary = {
  id: string
  createdAt: string
  preview: string
}

type OpinionDetail = {
  id: string
  createdAt: string
  body: string
}

export default function Admin() {
  const token = useAdminStore((s) => s.token)
  const setToken = useAdminStore((s) => s.setToken)

  const [tokenInput, setTokenInput] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const [items, setItems] = useState<OpinionSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<OpinionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headers = useMemo(() => (token ? { 'x-admin-token': token } : {}), [token])

  const doLogin = useCallback(async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await apiPost('/api/admin/login', { token: tokenInput })
      setToken(tokenInput)
      setTokenInput('')
    } catch {
      setAuthError('管理员密钥错误')
    } finally {
      setAuthLoading(false)
    }
  }, [setToken, tokenInput])

  const loadList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const list = await apiGet<OpinionSummary[]>('/api/admin/opinions', { headers })
      setItems(list)
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [headers, selectedId, token])

  const loadDetail = useCallback(async (id: string) => {
    if (!token) return
    setError(null)
    try {
      const d = await apiGet<OpinionDetail>(`/api/admin/opinions/${encodeURIComponent(id)}`, { headers })
      setDetail(d)
    } catch (e) {
      setDetail(null)
      setError(e instanceof Error ? e.message : '加载失败')
    }
  }, [headers, token])

  useEffect(() => {
    if (!token) return
    void loadList()
  }, [loadList, token])

  useEffect(() => {
    if (!selectedId) return
    void loadDetail(selectedId)
  }, [loadDetail, selectedId])

  if (!token) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4" />
              管理员登录
            </div>
            <div className="mt-2 text-sm text-zinc-700">请输入管理员密钥以只读查看意见。</div>
            <div className="mt-4">
              <div className="text-xs font-medium text-zinc-600">管理员密钥</div>
              <Input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="例如：dev-admin-token"
                type="password"
                className="mt-2"
              />
              {authError && <div className="mt-2 text-xs text-red-600">{authError}</div>}
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={doLogin} disabled={!tokenInput.trim() || authLoading}>
                登录
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">管理员只读查看</div>
          <div className="text-xs text-zinc-600">可查看所有已提交意见；不会显示任何发帖入口。</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadList} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setToken(null)
              setItems([])
              setSelectedId(null)
              setDetail(null)
            }}
          >
            <LogOut className="h-4 w-4" />
            退出
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">意见列表</div>
            <div className="text-xs text-zinc-500">{items.length} 条</div>
          </div>
          <div className="mt-3 space-y-2">
            {loading && <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />}
            {!loading && items.length === 0 && <div className="text-sm text-zinc-600">暂无意见</div>}
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedId(it.id)}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-left transition',
                  selectedId === it.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:bg-zinc-50',
                ].join(' ')}
              >
                <div className="text-xs text-zinc-500">{formatDateTime(it.createdAt)}</div>
                <div className="mt-1 text-sm text-zinc-900">{it.preview}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2">
          <div className="text-sm font-semibold">意见详情</div>
          {!detail && <div className="mt-3 text-sm text-zinc-600">选择左侧一条意见查看内容。</div>}
          {detail && (
            <div className="mt-3">
              <div className="text-xs text-zinc-500">{formatDateTime(detail.createdAt)}</div>
              <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-900">{detail.body}</div>
            </div>
          )}
          {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
        </section>
      </div>
    </AppShell>
  )
}
