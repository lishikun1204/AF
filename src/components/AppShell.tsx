import { Link, NavLink, useLocation } from 'react-router-dom'
import { MessageSquareText, Shield, Inbox } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import type { ReactNode } from 'react'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
          isActive ? 'bg-zinc-900 text-zinc-50' : 'text-zinc-700 hover:bg-zinc-100',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const token = useAdminStore((s) => s.token)
  const location = useLocation()
  const showAdminBanner = Boolean(token) && !location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50">
              <MessageSquareText className="h-5 w-5" />
            </span>
            匿名论坛
          </Link>
          <nav className="flex items-center gap-2">
            <NavItem to="/" label="话题" />
            <NavItem to="/opinion" label="提交意见" />
            <NavItem to="/admin" label="管理员" />
          </nav>
        </div>
      </header>

      {showAdminBanner && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 text-sm text-amber-900">
            <Shield className="h-4 w-4" />
            当前处于管理员只读模式：普通发帖/评论/提交意见入口将被禁用。
            <Link to="/admin" className="inline-flex items-center gap-2 font-medium underline underline-offset-4">
              <Inbox className="h-4 w-4" />
              去查看意见
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
