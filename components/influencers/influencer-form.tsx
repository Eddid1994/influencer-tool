'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Database } from '@/types/database'

type Influencer = Database['public']['Tables']['influencers']['Row']

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  instagram_handle: z.string().optional(),
  instagram_followers: z.number().min(0).optional(),
  tiktok_handle: z.string().optional(),
  tiktok_followers: z.number().min(0).optional(),
  youtube_handle: z.string().optional(),
  youtube_subscribers: z.number().min(0).optional(),
  status: z.enum(['new', 'contacted', 'negotiating', 'active', 'inactive', 'rejected']),
  notes: z.string().optional(),
})

interface InfluencerFormProps {
  influencer?: Influencer
}

export default function InfluencerForm({ influencer }: InfluencerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [niches, setNiches] = useState<string[]>(influencer?.niche || [])
  const [nicheInput, setNicheInput] = useState('')
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: influencer?.name || '',
      email: influencer?.email || '',
      phone: influencer?.phone || '',
      instagram_handle: influencer?.instagram_handle || '',
      instagram_followers: influencer?.instagram_followers || 0,
      tiktok_handle: influencer?.tiktok_handle || '',
      tiktok_followers: influencer?.tiktok_followers || 0,
      youtube_handle: influencer?.youtube_handle || '',
      youtube_subscribers: influencer?.youtube_subscribers || 0,
      status: influencer?.status || 'new',
      notes: influencer?.notes || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    const data = {
      ...values,
      niche: niches,
    }

    const { error } = influencer
      ? await supabase.from('influencers').update(data).eq('id', influencer.id)
      : await supabase.from('influencers').insert([data])

    if (error) {
      console.error('Error saving influencer:', error)
      setLoading(false)
    } else {
      router.push('/influencers')
      router.refresh()
    }
  }

  const addNiche = () => {
    if (nicheInput && !niches.includes(nicheInput)) {
      setNiches([...niches, nicheInput])
      setNicheInput('')
    }
  }

  const removeNiche = (niche: string) => {
    setNiches(niches.filter((n) => n !== niche))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Social Media Profiles</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@janedoe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram_followers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Followers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="125000" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tiktok_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@janedoe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tiktok_followers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok Followers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="85000" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="youtube_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@janedoe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube_subscribers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Subscribers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50000" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Niches</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., fashion, lifestyle, tech"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addNiche()
                }
              }}
            />
            <Button type="button" onClick={addNiche} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {niches.map((niche) => (
              <Badge key={niche} variant="secondary">
                {niche}
                <button
                  type="button"
                  onClick={() => removeNiche(niche)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : influencer ? 'Update' : 'Create'} Influencer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/influencers')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}