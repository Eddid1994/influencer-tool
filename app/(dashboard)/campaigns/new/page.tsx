import CampaignForm from '@/components/campaigns/campaign-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function NewCampaignPage() {
  const supabase = await createClient()
  
  const [{ data: brands }, { data: influencers }] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('influencers').select('id, name').eq('status', 'active').order('name')
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm brands={brands || []} influencers={influencers || []} />
        </CardContent>
      </Card>
    </div>
  )
}