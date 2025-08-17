import InfluencerForm from '@/components/influencers/influencer-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewInfluencerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Influencer</CardTitle>
        </CardHeader>
        <CardContent>
          <InfluencerForm />
        </CardContent>
      </Card>
    </div>
  )
}