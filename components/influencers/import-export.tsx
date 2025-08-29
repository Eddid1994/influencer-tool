'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import Papa from 'papaparse'
import { Database } from '@/types/database'

type Influencer = Database['public']['Tables']['influencers']['Row']

interface ImportExportProps {
  currentData?: Influencer[]
}

export default function ImportExport({ currentData }: ImportExportProps) {
  const [importing, setImporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleExport = () => {
    const exportData = currentData?.map(item => ({
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      instagram_handle: item.instagram_handle || '',
      instagram_followers: item.instagram_followers || 0,
      tiktok_handle: item.tiktok_handle || '',
      tiktok_followers: item.tiktok_followers || 0,
      youtube_handle: item.youtube_handle || '',
      youtube_subscribers: item.youtube_subscribers || 0,
      niche: item.niche?.join(', ') || '',
      status: item.status || 'new',
      notes: item.notes || ''
    }))

    const csv = Papa.unparse(exportData || [])
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `influencers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const data = results.data.map((row: any) => ({
          name: row.name,
          email: row.email || null,
          phone: row.phone || null,
          instagram_handle: row.instagram_handle || null,
          instagram_followers: parseInt(row.instagram_followers) || null,
          tiktok_handle: row.tiktok_handle || null,
          tiktok_followers: parseInt(row.tiktok_followers) || null,
          youtube_handle: row.youtube_handle || null,
          youtube_subscribers: parseInt(row.youtube_subscribers) || null,
          niche: row.niche ? row.niche.split(',').map((n: string) => n.trim()) : [],
          status: row.status || 'new',
          notes: row.notes || null
        }))

        const validData = data.filter((item) => item.name)

        if (validData.length > 0) {
          const { error } = await supabase
            .from('influencers')
            .insert(validData)

          if (error) {
            console.error('Import error:', error)
            alert('Error importing data. Please check the file format.')
          } else {
            router.refresh()
            alert(`Successfully imported ${validData.length} influencers`)
          }
        }

        setImporting(false)
        // Reset the input
        event.target.value = ''
      },
      error: (error) => {
        console.error('Parse error:', error)
        setImporting(false)
        alert('Error parsing CSV file')
      }
    })
  }

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567890',
        instagram_handle: '@janedoe',
        instagram_followers: '125000',
        tiktok_handle: '@janedoe',
        tiktok_followers: '85000',
        youtube_handle: '@janedoe',
        youtube_subscribers: '50000',
        niche: 'fashion, lifestyle',
        status: 'new',
        notes: 'Interested in fashion collaborations'
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'influencers_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={downloadTemplate}
        title="Download CSV template"
      >
        Template
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          disabled={importing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button variant="outline" disabled={importing}>
          <Upload className="h-4 w-4 mr-2" />
          {importing ? 'Importing...' : 'Import CSV'}
        </Button>
      </div>

      <Button variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  )
}