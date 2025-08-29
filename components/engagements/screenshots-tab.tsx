'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  Plus, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  Filter,
  Calendar,
  User,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Screenshot {
  id: string
  engagement_id: string
  title: string
  description?: string
  screenshot_url: string
  screenshot_type: 'insights' | 'reach' | 'demographics' | 'engagement'
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin'
  metrics_data?: any
  uploaded_at: string
  uploaded_by?: string
}

interface ScreenshotsTabProps {
  engagementId: string
}

const screenshotTypeColors = {
  insights: 'bg-blue-100 text-blue-800',
  reach: 'bg-green-100 text-green-800',
  demographics: 'bg-purple-100 text-purple-800',
  engagement: 'bg-orange-100 text-orange-800',
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-gray-100 text-gray-800',
  youtube: 'bg-red-100 text-red-800',
  facebook: 'bg-blue-100 text-blue-800',
  linkedin: 'bg-cyan-100 text-cyan-800',
}

export default function ScreenshotsTab({ engagementId }: ScreenshotsTabProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadScreenshots()
  }, [engagementId])

  const loadScreenshots = async () => {
    try {
      const { data, error } = await supabase
        .from('engagement_screenshots')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setScreenshots(data || [])
    } catch (error) {
      console.error('Error loading screenshots:', error)
      toast.error('Failed to load screenshots')
    } finally {
      setLoading(false)
    }
  }

  const uploadScreenshot = async (screenshotData: {
    title: string
    description?: string
    screenshot_type: string
    platform: string
    file: File
  }) => {
    setIsUploading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Upload file to Supabase Storage
      const fileExt = screenshotData.file.name.split('.').pop()
      const fileName = `${engagementId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, screenshotData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase
        .from('engagement_screenshots')
        .insert({
          engagement_id: engagementId,
          title: screenshotData.title,
          description: screenshotData.description || null,
          screenshot_url: publicUrl,
          screenshot_type: screenshotData.screenshot_type as any,
          platform: screenshotData.platform as any,
          uploaded_by: user.id,
        })

      if (dbError) throw dbError

      toast.success('Screenshot uploaded successfully')
      await loadScreenshots()
    } catch (error: any) {
      console.error('Error uploading screenshot:', error)
      toast.error(`Failed to upload screenshot: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteScreenshot = async (screenshotId: string, screenshotUrl: string) => {
    try {
      // Delete from storage
      const urlParts = screenshotUrl.split('/')
      const fileName = urlParts.slice(-2).join('/') // Get last two parts (engagementId/filename)
      
      await supabase.storage
        .from('screenshots')
        .remove([fileName])

      // Delete from database
      const { error } = await supabase
        .from('engagement_screenshots')
        .delete()
        .eq('id', screenshotId)

      if (error) throw error

      toast.success('Screenshot deleted')
      await loadScreenshots()
    } catch (error: any) {
      console.error('Error deleting screenshot:', error)
      toast.error(`Failed to delete screenshot: ${error.message}`)
    }
  }

  const filteredScreenshots = screenshots.filter(screenshot => {
    if (filterType !== 'all' && screenshot.screenshot_type !== filterType) return false
    if (filterPlatform !== 'all' && screenshot.platform !== filterPlatform) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <ScreenshotUploadDialog onUpload={uploadScreenshot} isUploading={isUploading} />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="reach">Reach</SelectItem>
              <SelectItem value="demographics">Demographics</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Screenshots Grid */}
      {filteredScreenshots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScreenshots.map((screenshot) => (
            <Card key={screenshot.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium truncate">
                      {screenshot.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        className={screenshotTypeColors[screenshot.screenshot_type]}
                        variant="secondary"
                      >
                        {screenshot.screenshot_type}
                      </Badge>
                      <Badge 
                        className={platformColors[screenshot.platform]}
                        variant="secondary"
                      >
                        {screenshot.platform}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(screenshot.screenshot_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = screenshot.screenshot_url
                        link.download = screenshot.title
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteScreenshot(screenshot.id, screenshot.screenshot_url)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Screenshot Preview */}
                <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden mb-3">
                  <img
                    src={screenshot.screenshot_url}
                    alt={screenshot.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(screenshot.screenshot_url, '_blank')}
                  />
                </div>

                {/* Description */}
                {screenshot.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {screenshot.description}
                  </p>
                )}

                {/* Upload Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(screenshot.uploaded_at), 'MMM d, yyyy')}
                  </span>
                  {screenshot.uploaded_by && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Uploaded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No screenshots yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload influencer insights, reach data, and analytics screenshots to track performance.
            </p>
            <ScreenshotUploadDialog onUpload={uploadScreenshot} isUploading={isUploading} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Screenshot Upload Dialog Component
function ScreenshotUploadDialog({ 
  onUpload, 
  isUploading 
}: { 
  onUpload: (data: any) => Promise<void>
  isUploading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    screenshot_type: 'insights',
    platform: 'instagram',
    file: null as File | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.file) {
      toast.error('Title and file are required')
      return
    }

    await onUpload({
      title: form.title,
      description: form.description,
      screenshot_type: form.screenshot_type,
      platform: form.platform,
      file: form.file
    })

    setForm({
      title: '',
      description: '',
      screenshot_type: 'insights',
      platform: 'instagram',
      file: null
    })
    setOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setForm({ ...form, file })
      } else {
        toast.error('Please select an image file')
        e.target.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Screenshot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Screenshot File *</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Instagram Insights - January 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description of the screenshot"
              className="min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.screenshot_type} onValueChange={(value) => setForm({ ...form, screenshot_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insights">Insights</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="demographics">Demographics</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(value) => setForm({ ...form, platform: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Screenshot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}