import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import BrandsTable from '@/components/brands/brands-table'
import BrandDialog from '@/components/brands/brand-dialog'

export default async function BrandsPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  // Get engagement KPIs for each brand
  const { data: engagementStats } = await supabase
    .from('engagements')
    .select('brand_id, agreed_total_cents, total_revenue_cents')
    .in('brand_id', brands?.map(b => b.id) || [])
  
  // Calculate KPIs per brand
  const brandKPIs = new Map()
  engagementStats?.forEach(engagement => {
    if (!brandKPIs.has(engagement.brand_id)) {
      brandKPIs.set(engagement.brand_id, {
        totalSpent: 0,
        totalRevenue: 0
      })
    }
    const kpi = brandKPIs.get(engagement.brand_id)
    kpi.totalSpent += engagement.agreed_total_cents || 0
    kpi.totalRevenue += engagement.total_revenue_cents || 0
  })
  
  // Add KPI data to brands
  const brandsWithKPIs = brands?.map(brand => {
    const kpi = brandKPIs.get(brand.id) || { totalSpent: 0, totalRevenue: 0 }
    return {
      ...brand,
      totalSpent: kpi.totalSpent,
      totalRevenue: kpi.totalRevenue,
      roas: kpi.totalSpent > 0 ? kpi.totalRevenue / kpi.totalSpent : 0
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500">Manage brand partnerships</p>
        </div>
        <BrandDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </BrandDialog>
      </div>
      
      <BrandsTable brands={brandsWithKPIs || []} />
    </div>
  )
}