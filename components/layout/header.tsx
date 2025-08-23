'use client'

import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const supabase = createClient()

  const initials = user.email
    ?.split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('global-search') as HTMLInputElement
        searchInput?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      // Search across influencers, brands, and campaigns
      const [influencers, brands, campaigns] = await Promise.all([
        supabase
          .from('influencers')
          .select('id, name, platform')
          .ilike('name', `%${query}%`)
          .limit(3),
        supabase
          .from('brands')
          .select('id, name, industry')
          .ilike('name', `%${query}%`)
          .limit(3),
        supabase
          .from('campaigns')
          .select('id, name, status')
          .ilike('name', `%${query}%`)
          .limit(3),
      ])

      const results = [
        ...(influencers.data || []).map(item => ({ ...item, type: 'influencer' })),
        ...(brands.data || []).map(item => ({ ...item, type: 'brand' })),
        ...(campaigns.data || []).map(item => ({ ...item, type: 'campaign' })),
      ]

      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [supabase])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  const handleResultClick = (result: any) => {
    setShowResults(false)
    setSearchQuery('')
    
    switch (result.type) {
      case 'influencer':
        router.push(`/influencers/${result.id}`)
        break
      case 'brand':
        router.push(`/brands/${result.id}`)
        break
      case 'campaign':
        router.push(`/campaigns/${result.id}`)
        break
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 flex items-center gap-8 max-w-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="global-search"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            className="pl-10 pr-20 h-9 bg-gray-50 border-gray-200 hover:bg-white focus:bg-white rounded-lg"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">
            <Command className="h-3 w-3" />K
          </kbd>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-medium text-black">{result.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                  </div>
                  {result.type === 'influencer' && (
                    <span className="text-xs text-gray-400">{result.platform}</span>
                  )}
                  {result.type === 'brand' && (
                    <span className="text-xs text-gray-400">{result.industry}</span>
                  )}
                  {result.type === 'campaign' && (
                    <span className="text-xs text-gray-400">{result.status}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500 text-center">No results found</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg hover:bg-gray-100"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-lg hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-black text-white text-sm font-medium">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 rounded-lg shadow-lg border-gray-200" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-black">Account</p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem className="rounded-md cursor-pointer hover:bg-gray-50">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-md cursor-pointer hover:bg-gray-50">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              className="rounded-md cursor-pointer hover:bg-gray-50 text-black"
              onClick={handleSignOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}