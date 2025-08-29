import { createClient } from '@/lib/supabase/server'
import ClientTemplatesPage from './client-page'

export default async function TemplatesPage() {
  const supabase = await createClient()
  
  // Fetch all templates
  const { data: templates, error } = await supabase
    .from('outreach_templates')
    .select('*')
    .order('template_type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching templates:', error)
  }

  return <ClientTemplatesPage templates={templates || []} />
}