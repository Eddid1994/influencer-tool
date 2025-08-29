'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Database } from '@/types/database'

type Brand = Database['public']['Tables']['brands']['Row']

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  instagram_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().optional()
})

type BrandFormData = z.infer<typeof brandSchema>

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema)
  })

  useEffect(() => {
    fetchBrand()
  }, [brandId])

  const fetchBrand = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single()

      if (error) throw error

      reset({
        name: data.name,
        website: data.website || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        address: data.address || '',
        instagram_url: data.instagram_url || '',
        twitter_url: data.twitter_url || '',
        youtube_url: data.youtube_url || '',
        notes: data.notes || ''
      })
    } catch (error) {
      console.error('Error fetching brand:', error)
      toast.error('Failed to load brand')
      router.push('/brands')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: BrandFormData) => {
    setSaving(true)

    try {
      const updateData = {
        name: data.name,
        website: data.website || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        notes: data.notes || null
      }

      const { error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', brandId)

      if (error) throw error

      toast.success('Brand updated successfully')
      router.push(`/brands/${brandId}`)
    } catch (error) {
      console.error('Error updating brand:', error)
      toast.error('Failed to update brand')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading brand...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/brands/${brandId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Brand</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter brand name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register('contact_email')}
                  placeholder="contact@example.com"
                />
                {errors.contact_email && (
                  <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  {...register('contact_phone')}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter company address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                {...register('instagram_url')}
                placeholder="https://instagram.com/brandname"
              />
              {errors.instagram_url && (
                <p className="text-sm text-red-500 mt-1">{errors.instagram_url.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                {...register('twitter_url')}
                placeholder="https://twitter.com/brandname"
              />
              {errors.twitter_url && (
                <p className="text-sm text-red-500 mt-1">{errors.twitter_url.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                {...register('youtube_url')}
                placeholder="https://youtube.com/@brandname"
              />
              {errors.youtube_url && (
                <p className="text-sm text-red-500 mt-1">{errors.youtube_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Add any additional notes about this brand..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/brands/${brandId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}