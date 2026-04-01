import { useMemo, useState } from 'react'
import { SendHorizonal, Shield } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { apiPost } from '@/utils/api'
import { useAdminStore } from '@/store/adminStore'

export default function Opinion() {
  const adminToken = useAdminStore((s) => s.token)
  const isAdminMode = Boolean(adminToken)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => body.trim().length > 0 && !isAdminMode, [body, isAdminMode])

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await apiPost('/api/opinions', { body })
      setDone(true)
      setBody('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
      setDone(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold">提交意见</div>
          <div className="mt-2 text-sm text-zinc-700">
            这里不会记录你的身份信息；你提交的意见仅管理员可查看；提交后无法查看历史记录。
          </div>
          {isAdminMode && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <Shield className="mt-0.5 h-4 w-4" />
              管理员只读模式下不可提交意见。
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Textarea
            className="min-h-[200px]"
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setDone(false)
            }}
            placeholder={isAdminMode ? '管理员只读模式下不可输入' : '写下你的意见…'}
            disabled={submitting || isAdminMode}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-zinc-500">最多 5000 字</div>
            <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
              <SendHorizonal className="h-4 w-4" />
              发送
            </Button>
          </div>
          {done && <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">已收到你的意见。</div>}
          {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
        </div>
      </div>
    </AppShell>
  )
}

