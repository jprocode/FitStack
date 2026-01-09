import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  LayoutDashboard,
  User,
  Scale,
  Target,
  Dumbbell,
  ListTodo,
  History,
  LogOut,
  Activity,
  Utensils,
  Sparkles,
  BarChart3,
  TrendingUp,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/metrics', label: 'Body Metrics', icon: Scale },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/analytics/body', label: 'Body Analytics', icon: TrendingUp },
  { href: '/analytics/workout', label: 'Workout Analytics', icon: BarChart3 },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/plans', label: 'Workout Plans', icon: ListTodo },
  { href: '/templates', label: 'Quick Templates', icon: ListTodo },
  { href: '/history', label: 'History', icon: History },
  { href: '/nutrition/dashboard', label: 'Nutrition', icon: Utensils },
  { href: '/nutrition/meal-plans', label: 'Meal Plans', icon: Sparkles },
]

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  )
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold text-gradient">FitStack</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="px-6 py-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  <span className="font-display text-lg font-bold text-gradient">FitStack</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100vh-65px)]">
                <NavContent onLinkClick={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold text-gradient">FitStack</span>
            </div>
            <ThemeToggle />
          </div>

          <NavContent />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:pt-0 lg:ml-64">
        <div className="container py-6 px-4 sm:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
