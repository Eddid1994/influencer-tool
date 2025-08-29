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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, Target, FileText, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const formSchema = z.object({
  campaign_name: z.string().min(2, 'Campaign name must be at least 2 characters'),
  brand_id: z.string().min(1, 'Please select a brand'),
  influencer_id: z.string().min(1, 'Please select an influencer'),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
  target_views: z.number().min(0).optional(),
  notes: z.string().optional(),
})

interface CampaignFormProps {
  brands: { id: string; name: string }[]
  influencers: { id: string; name: string }[]
}

export default function CampaignForm({ brands, influencers }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const supabase = createClient()

  const steps = [
    { id: 'basics', title: 'Campaign Basics', icon: FileText },
    { id: 'participants', title: 'Participants', icon: Users },
    { id: 'timeline', title: 'Timeline', icon: Calendar },
    { id: 'budget', title: 'Budget & Goals', icon: Target },
  ]

  const getProgress = () => {
    const filledFields = Object.entries(form.getValues()).filter(
      ([key, value]) => value !== '' && value !== null && value !== 0
    ).length
    return Math.round((filledFields / 9) * 100)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaign_name: '',
      brand_id: '',
      influencer_id: '',
      status: 'planned',
      budget: 0,
      target_views: 0,
      notes: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    const { error } = await supabase.from('campaigns').insert([values])

    if (error) {
      console.error('Error creating campaign:', error)
      setLoading(false)
    } else {
      router.push('/campaigns')
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Campaign Setup Progress</span>
            <span className="text-sm font-medium">{getProgress()}% Complete</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentStep === index
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300 mx-2" />
                )}
              </div>
            )
          })}
        </div>

        <Tabs value={steps[currentStep].id} className="space-y-4">
          {/* Step 1: Campaign Basics */}
          <TabsContent value="basics" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="campaign_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormDescription>
                        Choose a descriptive name for your campaign
                      </FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Summer Fashion Campaign 2024" 
                          {...field} 
                          className="text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Campaign Status</FormLabel>
                      <FormDescription>
                        Set the initial status of your campaign
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planned">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Planned</Badge>
                              <span>Campaign is being prepared</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <Badge>Active</Badge>
                              <span>Campaign is running</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Completed</Badge>
                              <span>Campaign has ended</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cancelled">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Cancelled</Badge>
                              <span>Campaign was cancelled</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Campaign Description</FormLabel>
                      <FormDescription>
                        Describe the campaign objectives, deliverables, and any special requirements
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Campaign objectives:\n• Increase brand awareness\n• Drive sales for summer collection\n• Generate user-generated content\n\nDeliverables:\n• 3 Instagram posts\n• 2 Instagram stories\n• 1 TikTok video"
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Participants */}
          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Partner</FormLabel>
                        <FormDescription>
                          Select the brand for this campaign
                        </FormDescription>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No brands available. Please add brands first.
                              </div>
                            ) : (
                              brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))
                            )}
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
                        <FormLabel>Lead Influencer</FormLabel>
                        <FormDescription>
                          Select the primary influencer
                        </FormDescription>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an influencer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {influencers.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No active influencers available.
                              </div>
                            ) : (
                              influencers.map((influencer) => (
                                <SelectItem key={influencer.id} value={influencer.id}>
                                  {influencer.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Start Date</FormLabel>
                        <FormDescription>
                          When will the campaign begin?
                        </FormDescription>
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
                        <FormLabel>Campaign End Date</FormLabel>
                        <FormDescription>
                          When will the campaign end?
                        </FormDescription>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Budget & Goals */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Budget</FormLabel>
                        <FormDescription>
                          Total budget allocated for this campaign
                        </FormDescription>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              type="number" 
                              placeholder="5000" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_views"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Views/Impressions</FormLabel>
                        <FormDescription>
                          Expected reach for this campaign
                        </FormDescription>
                        <FormControl>
                          <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              type="number" 
                              placeholder="100000" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {field.value && field.value > 0 && form.watch('budget') && Number(form.watch('budget')) > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Estimated TKP:</strong> ${((Number(form.watch('budget')) / field.value) * 1000).toFixed(2)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              (Cost per thousand impressions)
                            </p>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/campaigns')}
            >
              Cancel
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}