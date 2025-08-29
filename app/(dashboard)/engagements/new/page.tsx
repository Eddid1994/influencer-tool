'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  User, 
  Calendar,
  DollarSign,
  FileText,
  Package,
  CheckCircle,
  Plus,
  X,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface Deliverable {
  platform: string
  deliverable: string
  quantity: number
  plannedDate?: string
  product?: string
}

export default function NewEngagementPage() {
  const router = useRouter()
  // Temporarily use service role key for testing
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data
  const [campaignName, setCampaignName] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedInfluencer, setSelectedInfluencer] = useState('')
  const [selectedContact, setSelectedContact] = useState('')
  const [period, setPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })
  const [financial, setFinancial] = useState({
    amount: '',
    currency: 'EUR',
    paymentTerms: 'Net 30',
    targetViews: '',
    budget: ''
  })
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('negotiating')
  
  // Lists for dropdowns
  const [brands, setBrands] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [brandContacts, setBrandContacts] = useState<any[]>([])
  
  const loadData = async () => {
    const [brandsRes, influencersRes] = await Promise.all([
      supabase.from('brands').select('*').order('name'),
      supabase.from('influencers').select('*').order('name')
    ])
    
    setBrands(brandsRes.data || [])
    setInfluencers(influencersRes.data || [])
  }
  
  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])
  
  const loadBrandContacts = async (brandId: string) => {
    const { data } = await supabase
      .from('brand_contacts')
      .select('*')
      .eq('brand_id', brandId)
    setBrandContacts(data || [])
  }
  
  const addDeliverable = () => {
    setDeliverables([
      ...deliverables,
      {
        platform: 'instagram',
        deliverable: 'post',
        quantity: 1,
        plannedDate: '',
        product: ''
      }
    ])
  }
  
  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index))
  }
  
  const updateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...deliverables]
    updated[index] = { ...updated[index], [field]: value }
    setDeliverables(updated)
  }
  
  const calculateTotal = () => {
    // Simple calculation - in real app would be more complex
    const baseAmount = parseFloat(financial.amount) || 0
    return baseAmount
  }
  
  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Create the engagement
      const periodLabel = `${period.year}-${String(period.month).padStart(2, '0')} ${new Date(period.year, period.month - 1).toLocaleString('en', { month: 'long' })}`
      
      const { data: engagement, error: engError } = await supabase
        .from('engagements')
        .insert({
          brand_id: selectedBrand,
          influencer_id: selectedInfluencer,
          brand_contact_id: selectedContact || null,
          period_label: periodLabel,
          period_year: period.year,
          period_month: period.month,
          status: status,
          agreed_total_cents: calculateTotal() * 100,
          agreed_currency: financial.currency,
          payment_terms: financial.paymentTerms,
          notes: notes || null,
          campaign_name: campaignName || null,
          budget: financial.budget ? parseFloat(financial.budget) : null,
          target_views: financial.targetViews ? parseInt(financial.targetViews) : null,
          opened_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (engError) throw engError
      
      // Create deliverables
      if (deliverables.length > 0 && engagement) {
        const deliverableData = deliverables.map(d => ({
          engagement_id: engagement.id,
          platform: d.platform,
          deliverable: d.deliverable,
          quantity: d.quantity,
          planned_publish_at: d.plannedDate || null,
          promoted_product: d.product || null
        }))
        
        const { error: delError } = await supabase
          .from('deliverables')
          .insert(deliverableData)
        
        if (delError) throw delError
      }
      
      // Create initial task
      if (engagement) {
        await supabase
          .from('engagement_tasks')
          .insert({
            engagement_id: engagement.id,
            title: 'Send initial briefing',
            type: 'followup',
            due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
          })
      }
      
      toast.success('Engagement created successfully!')
      router.push(`/engagements/${engagement?.id}`)
      
    } catch (error: any) {
      console.error('Error creating engagement:', error)
      toast.error(error.message || 'Failed to create engagement')
    } finally {
      setLoading(false)
    }
  }
  
  const steps = [
    { number: 1, title: 'Campaign Basics', icon: FileText },
    { number: 2, title: 'Select Parties', icon: Building2 },
    { number: 3, title: 'Set Period', icon: Calendar },
    { number: 4, title: 'Define Deliverables', icon: Package },
    { number: 5, title: 'Financial Terms & Goals', icon: DollarSign },
    { number: 6, title: 'Review & Create', icon: CheckCircle }
  ]
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/engagements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Engagement</h1>
            <p className="text-muted-foreground">Set up a new influencer collaboration</p>
          </div>
        </div>
        <Badge variant="outline">
          Step {currentStep} of {steps.length}
        </Badge>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.number}
              className={`flex items-center ${step.number < steps.length ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.number <= currentStep
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {step.number < steps.length && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step.number < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Set up the campaign name and basic details'}
            {currentStep === 2 && 'Choose the brand and influencer for this engagement'}
            {currentStep === 3 && 'Select the campaign period'}
            {currentStep === 4 && 'Define what content will be delivered'}
            {currentStep === 5 && 'Set the financial agreement and campaign goals'}
            {currentStep === 6 && 'Review all details before creating'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Campaign Basics */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g., Summer Fashion Campaign 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive name for your campaign
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Initial Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="agreed">Agreed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Campaign Description (Optional)</Label>
                <Textarea
                  placeholder="Describe the campaign objectives and key requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Select Parties */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brand *</Label>
                <Select value={selectedBrand} onValueChange={(value) => {
                  setSelectedBrand(value)
                  loadBrandContacts(value)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {brandContacts.length > 0 && (
                <div className="space-y-2">
                  <Label>Brand Contact (Optional)</Label>
                  <Select value={selectedContact} onValueChange={setSelectedContact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact person" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandContacts.map(contact => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Influencer *</Label>
                <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an influencer" />
                  </SelectTrigger>
                  <SelectContent>
                    {influencers.map(influencer => (
                      <SelectItem key={influencer.id} value={influencer.id}>
                        {influencer.name} {influencer.instagram_handle && `(${influencer.instagram_handle})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Step 3: Period */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select 
                    value={String(period.year)} 
                    onValueChange={(v) => setPeriod({...period, year: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map(year => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select 
                    value={String(period.month)} 
                    onValueChange={(v) => setPeriod({...period, month: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={String(month)}>
                          {new Date(2025, month - 1).toLocaleString('en', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  This engagement will be for: <strong>{new Date(period.year, period.month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</strong>
                </p>
              </div>
            </div>
          )}
          
          {/* Step 4: Deliverables */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {deliverables.map((deliverable, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Deliverable {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDeliverable(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select 
                          value={deliverable.platform}
                          onValueChange={(v) => updateDeliverable(index, 'platform', v)}
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
                      
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={deliverable.deliverable}
                          onValueChange={(v) => updateDeliverable(index, 'deliverable', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="post">Post</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="reel">Reel</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={deliverable.quantity}
                          onChange={(e) => updateDeliverable(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Planned Date</Label>
                        <Input
                          type="date"
                          value={deliverable.plannedDate}
                          onChange={(e) => updateDeliverable(index, 'plannedDate', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 col-span-2">
                        <Label>Product/Service</Label>
                        <Input
                          placeholder="What will be promoted?"
                          value={deliverable.product}
                          onChange={(e) => updateDeliverable(index, 'product', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button onClick={addDeliverable} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </div>
          )}
          
          {/* Step 5: Financial & Goals */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Financial Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Budget</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="5000"
                        value={financial.budget}
                        onChange={(e) => setFinancial({...financial, budget: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total budget allocated for this campaign
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Agreed Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="3500"
                        value={financial.amount}
                        onChange={(e) => setFinancial({...financial, amount: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Agreed payment to influencer
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={financial.currency}
                      onValueChange={(v) => setFinancial({...financial, currency: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select 
                      value={financial.paymentTerms}
                      onValueChange={(v) => setFinancial({...financial, paymentTerms: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Upon Delivery">Upon Delivery</SelectItem>
                        <SelectItem value="50% Upfront, 50% Completion">50% Upfront, 50% Completion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Campaign Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Campaign Goals</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Target Views/Impressions</Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={financial.targetViews}
                      onChange={(e) => setFinancial({...financial, targetViews: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Expected reach for this campaign
                    </p>
                    
                    {financial.targetViews && financial.amount && parseFloat(financial.targetViews) > 0 && parseFloat(financial.amount) > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Estimated TKP:</strong> {financial.currency} {((parseFloat(financial.amount) / parseFloat(financial.targetViews)) * 1000).toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          (Cost per thousand impressions)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Campaign Name</p>
                  <p className="font-medium text-lg">{campaignName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">
                    {brands.find(b => b.id === selectedBrand)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Influencer</p>
                  <p className="font-medium">
                    {influencers.find(i => i.id === selectedInfluencer)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {new Date(period.year, period.month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    {financial.currency} {financial.budget || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agreed Amount</p>
                  <p className="font-medium">
                    {financial.currency} {calculateTotal().toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Views</p>
                  <p className="font-medium">
                    {financial.targetViews ? parseInt(financial.targetViews).toLocaleString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{financial.paymentTerms}</p>
                </div>
              </div>
              
              {deliverables.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Deliverables</p>
                  <div className="space-y-2">
                    {deliverables.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant="outline">
                          {d.quantity}x {d.platform} {d.deliverable}
                        </Badge>
                        {d.product && <span className="text-sm">- {d.product}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 6 ? (
          <Button
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            disabled={
              (currentStep === 1 && !campaignName) ||
              (currentStep === 2 && (!selectedBrand || !selectedInfluencer)) ||
              (currentStep === 5 && !financial.amount)
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Engagement'}
          </Button>
        )}
      </div>
    </div>
  )
}