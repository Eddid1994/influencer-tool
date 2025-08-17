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

const campaignSchema = z.object({
  campaign_name: z.string().min(1, 'Campaign name is required'),
  brand_id: z.string().min(1, 'Brand is required'),
  influencer_id: z.string().min(1, 'Influencer is required'),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
  actual_cost: z.string().optional(),
  target_views: z.string().optional(),
  actual_views: z.string().optional(),
  notes: z.string().optional(),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface CampaignEditFormProps {
  campaign: any
  brands: Array<{ id: string; name: string }>
  influencers: Array<{ id: string; name: string; instagram_handle: string | null }>
}

export default function CampaignEditForm({ campaign, brands, influencers }: CampaignEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      campaign_name: campaign.campaign_name || '',
      brand_id: campaign.brand_id || '',
      influencer_id: campaign.influencer_id || '',
      status: campaign.status || 'planned',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      budget: campaign.budget?.toString() || '',
      actual_cost: campaign.actual_cost?.toString() || '',
      target_views: campaign.target_views?.toString() || '',
      actual_views: campaign.actual_views?.toString() || '',
      notes: campaign.notes || '',
    },
  })

  async function onSubmit(values: CampaignFormValues) {
    try {
      setIsLoading(true)

      const updateData: any = {
        campaign_name: values.campaign_name,
        brand_id: values.brand_id,
        influencer_id: values.influencer_id,
        status: values.status,
        notes: values.notes || null,
      }

      // Add optional fields
      if (values.start_date) updateData.start_date = values.start_date
      if (values.end_date) updateData.end_date = values.end_date
      if (values.budget) updateData.budget = parseFloat(values.budget)
      if (values.actual_cost) updateData.actual_cost = parseFloat(values.actual_cost)
      if (values.target_views) updateData.target_views = parseInt(values.target_views)
      if (values.actual_views) updateData.actual_views = parseInt(values.actual_views)

      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaign.id)

      if (error) {
        throw error
      }

      toast.success('Campaign updated successfully')
      router.push('/campaigns')
      router.refresh()
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="campaign_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Summer Collection 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      <SelectValue placeholder="Select a brand" />
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
            name="influencer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Influencer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an influencer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {influencers.map((influencer) => (
                      <SelectItem key={influencer.id} value={influencer.id}>
                        {influencer.name}
                        {influencer.instagram_handle && (
                          <span className="text-gray-500 ml-2">
                            {influencer.instagram_handle}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormDescription>Campaign budget in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actual_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Cost</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="45000" {...field} />
                </FormControl>
                <FormDescription>Actual spent amount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_views"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Views</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000000" {...field} />
                </FormControl>
                <FormDescription>Expected reach/views</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actual_views"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Views</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="950000" {...field} />
                </FormControl>
                <FormDescription>Achieved reach/views</FormDescription>
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
                  placeholder="Campaign details, deliverables, special requirements..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Campaign'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/campaigns')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}