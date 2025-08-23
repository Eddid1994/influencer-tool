'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Users, Building2, Rocket, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Influencer {
  id: string
  name: string
  email: string
  instagram_handle: string
  instagram_followers: number
  tiktok_handle: string
  tiktok_followers: number
  niche: string[]
  status: string
}

interface Brand {
  id: string
  name: string
  industry: string
}

interface CampaignAssignment {
  brandId: string
  brandName: string
  influencerIds: string[]
  influencerNames: string[]
}

export default function BulkCreateCampaignsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [assignments, setAssignments] = useState<CampaignAssignment[]>([])
  const [campaignTemplate, setCampaignTemplate] = useState({
    status: 'planned',
    budget: '',
    start_date: '',
    end_date: '',
    target_views: '',
    channel: 'instagram',
    content_type: 'post',
    notes: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Load influencers and brands on mount
  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      setIsLoadingData(true)
      const [influencersData, brandsData] = await Promise.all([
        loadInfluencers(),
        loadBrands()
      ])
      
      if (mounted) {
        setInfluencers(influencersData)
        setBrands(brandsData)
        setIsLoadingData(false)
      }
    }
    
    loadData()
    
    return () => {
      mounted = false
    }
  }, [])

  // Handle pre-selected brands (if needed in the future)
  useEffect(() => {
    if (searchParams.get('preselected') === 'true' && brands.length > 0) {
      const storedIds = sessionStorage.getItem('selectedBrandIds')
      if (storedIds) {
        try {
          const ids = JSON.parse(storedIds)
          setSelectedBrands(new Set(ids))
          
          // Create assignments for pre-selected brands
          const preselectedAssignments = ids.map((id: string) => {
            const brand = brands.find(b => b.id === id)
            return {
              brandId: id,
              brandName: brand?.name || 'Unknown',
              influencerIds: [],
              influencerNames: []
            }
          })
          setAssignments(preselectedAssignments)
          
          // Clear the session storage
          sessionStorage.removeItem('selectedBrandIds')
          
          // Move directly to step 2
          setStep(2)
        } catch (error) {
          console.error('Error loading pre-selected brands:', error)
        }
      }
    }
  }, [brands, searchParams])

  const loadInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setInfluencers(data || [])
      return data || []
    } catch (error) {
      console.error('Error loading influencers:', error)
      toast.error('Failed to load influencers. Please refresh the page.')
      return []
    }
  }

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setBrands(data || [])
      return data || []
    } catch (error) {
      console.error('Error loading brands:', error)
      toast.error('Failed to load brands. Please refresh the page.')
      return []
    }
  }

  const handleBrandToggle = (brandId: string) => {
    const newSelected = new Set(selectedBrands)
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId)
      // Remove from assignments if deselected
      setAssignments(assignments.filter(a => a.brandId !== brandId))
    } else {
      newSelected.add(brandId)
      // Add to assignments with empty influencer list
      const brand = brands.find(b => b.id === brandId)
      if (brand) {
        setAssignments([...assignments, {
          brandId,
          brandName: brand.name,
          influencerIds: [],
          influencerNames: []
        }])
      }
    }
    setSelectedBrands(newSelected)
  }

  const handleInfluencerAssignment = (brandId: string, influencerId: string) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.brandId === brandId) {
        const influencer = influencers.find(i => i.id === influencerId)
        if (!influencer) return assignment
        
        const influencerIndex = assignment.influencerIds.indexOf(influencerId)
        if (influencerIndex > -1) {
          // Remove influencer
          return {
            ...assignment,
            influencerIds: assignment.influencerIds.filter(id => id !== influencerId),
            influencerNames: assignment.influencerNames.filter(name => name !== influencer.name)
          }
        } else {
          // Add influencer
          return {
            ...assignment,
            influencerIds: [...assignment.influencerIds, influencerId],
            influencerNames: [...assignment.influencerNames, influencer.name]
          }
        }
      }
      return assignment
    }))
  }

  const moveToStep2 = () => {
    if (selectedBrands.size === 0) {
      toast.error('Please select at least one brand')
      return
    }
    setStep(2)
  }

  const moveToStep3 = () => {
    const hasAssignments = assignments.some(a => a.influencerIds.length > 0)
    if (!hasAssignments) {
      toast.error('Please assign at least one influencer to a brand')
      return
    }
    setStep(3)
  }

  // Utility function for safe number parsing
  const parseNumberSafely = (value: string, isInteger = false): number | null => {
    if (!value || value.trim() === '') return null
    const parsed = isInteger ? parseInt(value, 10) : parseFloat(value)
    return isNaN(parsed) || parsed < 0 ? null : parsed
  }

  const createAllCampaigns = async () => {
    setIsCreating(true)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create campaigns')
        return
      }

      // Prepare all campaigns for batch insertion
      const campaignsToCreate = []
      
      for (const assignment of assignments) {
        for (const influencerId of assignment.influencerIds) {
          const influencer = influencers.find(i => i.id === influencerId)
          const brand = brands.find(b => b.id === assignment.brandId)
          
          const campaignName = `${brand?.name || 'Brand'} x ${influencer?.name || 'Influencer'} - ${new Date().toLocaleDateString()}`
          
          campaignsToCreate.push({
            campaign_name: campaignName,
            brand_id: assignment.brandId,
            influencer_id: influencerId,
            created_by: user.id,
            status: campaignTemplate.status,
            budget: parseNumberSafely(campaignTemplate.budget),
            start_date: campaignTemplate.start_date || null,
            end_date: campaignTemplate.end_date || null,
            target_views: parseNumberSafely(campaignTemplate.target_views, true),
            channel: campaignTemplate.channel,
            content_type: campaignTemplate.content_type,
            notes: campaignTemplate.notes || null
          })
        }
      }

      // Batch insert all campaigns
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignsToCreate)
        .select()

      if (error) {
        console.error('Error creating campaigns:', error)
        toast.error(`Failed to create campaigns: ${error.message}`)
        return
      }

      const created = data?.length || 0
      toast.success(`Successfully created ${created} campaign${created !== 1 ? 's' : ''}`)
      router.push('/campaigns')
    } catch (error) {
      console.error('Error creating campaigns:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Bulk Create Campaigns</h1>
          <p className="text-gray-500">Select influencers, assign brands, and create multiple campaigns at once</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Select Brands</span>
        </div>
        <div className={`w-20 h-0.5 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Assign Influencers</span>
        </div>
        <div className={`w-20 h-0.5 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="font-medium">Set Details & Create</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingData && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">Loading brands and influencers...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select Brands */}
      {!isLoadingData && step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Brands</CardTitle>
            <CardDescription>Choose the brands you want to create campaigns for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {selectedBrands.size} brand(s) selected
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedBrands.size === brands.length) {
                      setSelectedBrands(new Set())
                      setAssignments([])
                    } else {
                      setSelectedBrands(new Set(brands.map(b => b.id)))
                      setAssignments(brands.map(b => ({
                        brandId: b.id,
                        brandName: b.name,
                        influencerIds: [],
                        influencerNames: []
                      })))
                    }
                  }}
                >
                  {selectedBrands.size === brands.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {brands.map(brand => (
                  <div
                    key={brand.id}
                    className="flex items-center space-x-3 p-4 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedBrands.has(brand.id)}
                      onCheckedChange={() => handleBrandToggle(brand.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{brand.name}</div>
                      <div className="text-sm text-gray-500">
                        {brand.industry && `Industry: ${brand.industry}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={moveToStep2} disabled={selectedBrands.size === 0}>
                  Next: Assign Influencers
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Assign Influencers */}
      {!isLoadingData && step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Assign Influencers</CardTitle>
            <CardDescription>Assign one or more influencers to each selected brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Multiple Assignments Possible</p>
                    <p className="text-yellow-700">Each brand can work with multiple influencers. A separate campaign will be created for each brand-influencer combination.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {assignments.map(assignment => (
                  <div key={assignment.brandId} className="border rounded-lg p-4">
                    <div className="font-medium mb-3">{assignment.brandName}</div>
                    <div className="space-y-2">
                      {influencers.map(influencer => (
                        <label
                          key={influencer.id}
                          className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                        >
                          <Checkbox
                            checked={assignment.influencerIds.includes(influencer.id)}
                            onCheckedChange={() => handleInfluencerAssignment(assignment.brandId, influencer.id)}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{influencer.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {influencer.instagram_handle && `@${influencer.instagram_handle}`}
                              {influencer.instagram_followers && ` • ${influencer.instagram_followers.toLocaleString()} followers`}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {assignment.influencerIds.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {assignment.influencerIds.length} influencer(s) selected: {assignment.influencerNames.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={moveToStep3}
                  disabled={!assignments.some(a => a.influencerIds.length > 0)}
                >
                  Next: Set Campaign Details
                  <Rocket className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Set Campaign Details & Create */}
      {!isLoadingData && step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Campaign Details</CardTitle>
              <CardDescription>Set default values for all campaigns (you can edit individual campaigns later)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={campaignTemplate.status}
                    onValueChange={(value) => setCampaignTemplate({...campaignTemplate, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget">Budget (optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={campaignTemplate.budget}
                    onChange={(e) => setCampaignTemplate({...campaignTemplate, budget: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date (optional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={campaignTemplate.start_date}
                    onChange={(e) => setCampaignTemplate({...campaignTemplate, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={campaignTemplate.end_date}
                    onChange={(e) => setCampaignTemplate({...campaignTemplate, end_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select 
                    value={campaignTemplate.channel}
                    onValueChange={(value) => setCampaignTemplate({...campaignTemplate, channel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select 
                    value={campaignTemplate.content_type}
                    onValueChange={(value) => setCampaignTemplate({...campaignTemplate, content_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="target_views">Target Views (optional)</Label>
                  <Input
                    id="target_views"
                    type="number"
                    placeholder="0"
                    value={campaignTemplate.target_views}
                    onChange={(e) => setCampaignTemplate({...campaignTemplate, target_views: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes for these campaigns..."
                    value={campaignTemplate.notes}
                    onChange={(e) => setCampaignTemplate({...campaignTemplate, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Review the campaigns that will be created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold mb-2">
                    {assignments.reduce((sum, a) => sum + a.influencerIds.length, 0)} Campaigns
                  </div>
                  <div className="text-sm text-gray-600">
                    Will be created from {selectedBrands.size} brand(s) and{' '}
                    {new Set(assignments.flatMap(a => a.influencerIds)).size} influencer(s)
                  </div>
                </div>

                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {assignments.map(assignment => (
                    assignment.influencerIds.length > 0 && (
                      <div key={assignment.brandId} className="p-3 border-b last:border-b-0">
                        <div className="font-medium">{assignment.brandName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          → {assignment.influencerNames.join(', ')}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={createAllCampaigns}
                    disabled={isCreating}
                    className="min-w-[150px]"
                  >
                    {isCreating ? (
                      'Creating...'
                    ) : (
                      <>
                        Create All Campaigns
                        <Rocket className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}