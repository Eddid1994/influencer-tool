'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Influencers', href: '/influencers', icon: Users },
  { name: 'Brands', href: '/brands', icon: Building2 },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    
    // Load saved state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between px-6">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-black">
              Visca CRM
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black',
                  isCollapsed && 'justify-center'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-gray-500',
                    !isCollapsed && 'mr-3'
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>

        <Separator className="my-6 bg-gray-200" />

        {/* Settings */}
        <Link
          href="/settings"
          title="Settings"
          className={cn(
            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
            pathname === '/settings'
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black',
            isCollapsed && 'justify-center'
          )}
        >
          <Settings
            className={cn(
              'h-5 w-5 flex-shrink-0 transition-colors',
              pathname === '/settings' ? 'text-white' : 'text-gray-500',
              !isCollapsed && 'mr-3'
            )}
          />
          {!isCollapsed && (
            <span className="font-medium">Settings</span>
          )}
        </Link>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-black text-white text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          title="Sign out"
          className={cn(
            "w-full mt-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg",
            isCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>
    </div>
  )
}