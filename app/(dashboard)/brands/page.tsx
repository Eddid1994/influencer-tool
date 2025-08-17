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
      
      <BrandsTable brands={brands || []} />
    </div>
  )
}