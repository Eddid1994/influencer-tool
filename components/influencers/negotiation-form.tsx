'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CalendarIcon } from 'lucide-react'

const negotiationSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  negotiation_date: z.string().min(1, 'Date is required'),
  proposed_budget: z.string().min(1, 'Proposed budget is required'),
  influencer_rate: z.string().min(1, 'Influencer rate is required'),
  final_agreed_rate: z.string().optional(),
  status: z.enum(['initial_contact', 'negotiating', 'agreed', 'rejected', 'counter_offer']),
  proposed_deliverables: z.string().optional(),
  posts_count: z.string().optional(),
  stories_count: z.string().optional(),
  videos_count: z.string().optional(),
  expected_reach: z.string().optional(),
  expected_engagement_rate: z.string().optional(),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
  next_followup_date: z.string().optional(),
})

type NegotiationFormValues = z.infer<typeof negotiationSchema>

interface NegotiationFormProps {
  influencerId: string
  influencerName: string
  brands: Array<{ id: string; name: string }>
  lastNegotiation?: any
}

export default function NegotiationForm({ 
  influencerId, 
  influencerName, 
  brands,
  lastNegotiation 
}: NegotiationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<NegotiationFormValues>({
    resolver: zodResolver(negotiationSchema),
    defaultValues: {
      brand_id: '',
      negotiation_date: new Date().toISOString().split('T')[0],
      proposed_budget: '',
      influencer_rate: lastNegotiation?.final_agreed_rate?.toString() || '',
      final_agreed_rate: '',
      status: 'initial_contact',
      proposed_deliverables: '',
      posts_count: '',
      stories_count: '',
      videos_count: '',
      expected_reach: '',
      expected_engagement_rate: '',
      rejection_reason: '',
      notes: '',
      next_followup_date: '',
    },
  })

  async function onSubmit(values: NegotiationFormValues) {
    try {
      setIsLoading(true)

      const negotiationData: any = {
        influencer_id: influencerId,
        brand_id: values.brand_id,
        negotiation_date: values.negotiation_date,
        proposed_budget: parseFloat(values.proposed_budget),
        influencer_rate: parseFloat(values.influencer_rate),
        status: values.status,
        proposed_deliverables: values.proposed_deliverables || null,
        notes: values.notes || null,
      }

      // Add optional numeric fields
      if (values.final_agreed_rate) negotiationData.final_agreed_rate = parseFloat(values.final_agreed_rate)
      if (values.posts_count) negotiationData.posts_count = parseInt(values.posts_count)
      if (values.stories_count) negotiationData.stories_count = parseInt(values.stories_count)
      if (values.videos_count) negotiationData.videos_count = parseInt(values.videos_count)
      if (values.expected_reach) negotiationData.expected_reach = parseInt(values.expected_reach)
      if (values.expected_engagement_rate) negotiationData.expected_engagement_rate = parseFloat(values.expected_engagement_rate)
      if (values.rejection_reason) negotiationData.rejection_reason = values.rejection_reason
      if (values.next_followup_date) negotiationData.next_followup_date = values.next_followup_date

      const { error } = await supabase
        .from('negotiations')
        .insert([negotiationData])

      if (error) {
        throw error
      }

      // If agreed, create activity
      if (values.status === 'agreed') {
        await supabase.from('activities').insert([{
          influencer_id: influencerId,
          activity_type: 'negotiation_agreed',
          description: `Agreed on ${values.final_agreed_rate ? '$' + parseFloat(values.final_agreed_rate).toLocaleString() : 'terms'} with ${brands.find(b => b.id === values.brand_id)?.name}`
        }])
      }

      toast.success('Negotiation recorded successfully')
      router.push(`/influencers/${influencerId}`)
      router.refresh()
    } catch (error) {
      console.error('Error recording negotiation:', error)
      toast.error('Failed to record negotiation')
    } finally {
      setIsLoading(false)
    }
  }

  const watchStatus = form.watch('status')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="negotiation_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Negotiation Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="proposed_budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Their Offer ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormDescription>What the brand offered</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="influencer_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Our Ask ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="75000" {...field} />
                </FormControl>
                <FormDescription>What we're asking for</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="final_agreed_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agreed Rate ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="65000" {...field} />
                </FormControl>
                <FormDescription>Final agreed amount (if any)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="initial_contact">Initial Contact</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="counter_offer">Counter Offer</SelectItem>
                  <SelectItem value="agreed">Agreed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchStatus === 'rejected' && (
          <FormField
            control={form.control}
            name="rejection_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rejection Reason</FormLabel>
                <FormControl>
                  <Input placeholder="Budget gap too large, timing issues, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="proposed_deliverables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Deliverables</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="3 Instagram posts, 5 stories, 1 reel..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="posts_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posts</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
                <FormDescription>Number of posts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stories_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stories</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormDescription>Number of stories</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videos_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Videos/Reels</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormDescription>Number of videos</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_reach"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Reach</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000000" {...field} />
                </FormControl>
                <FormDescription>Expected views/impressions</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_engagement_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Engagement Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="3.5" {...field} />
                </FormControl>
                <FormDescription>Expected engagement percentage</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Key discussion points, special requirements, concerns..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Important details about this negotiation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="next_followup_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Follow-up Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>When to follow up on this negotiation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Recording...' : 'Record Negotiation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/influencers/${influencerId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}