'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Image,
  File,
  FileVideo,
  FileAudio,
  Upload,
  Link
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type EngagementFile = Database['public']['Tables']['engagement_files']['Row'];

interface FilesPanelProps {
  engagementId: string;
  files: EngagementFile[];
  onUpdate: () => void;
}

const fileTypeIcons = {
  contract: FileText,
  brief: FileText,
  content: FileVideo,
  image: Image,
  invoice: FileText,
  other: File,
};

const fileTypeColors = {
  contract: 'bg-blue-100 text-blue-800',
  brief: 'bg-purple-100 text-purple-800',
  content: 'bg-green-100 text-green-800',
  image: 'bg-yellow-100 text-yellow-800',
  invoice: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function FilesPanel({ engagementId, files, onUpdate }: FilesPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [formData, setFormData] = useState({
    file_name: '',
    file_url: '',
    file_type: 'other' as EngagementFile['file_type'],
    description: '',
  });
  const supabase = createClientComponentClient<Database>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let fileUrl = formData.file_url;
      let fileName = formData.file_name;
      
      // If uploading a file, we'd need to implement file upload to Supabase Storage
      // For now, we'll just handle URL uploads
      
      if (!fileName) {
        // Extract filename from URL if not provided
        try {
          const url = new URL(fileUrl);
          fileName = url.pathname.split('/').pop() || 'Untitled';
        } catch {
          fileName = 'Untitled';
        }
      }

      const { error } = await supabase
        .from('engagement_files')
        .insert({
          engagement_id: engagementId,
          file_name: fileName,
          file_url: fileUrl,
          file_type: formData.file_type,
          description: formData.description || null,
          uploaded_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('File added successfully');
      setIsAddDialogOpen(false);
      setFormData({
        file_name: '',
        file_url: '',
        file_type: 'other',
        description: '',
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error adding file:', error);
      toast.error(error.message || 'Failed to add file');
    }
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { error } = await supabase
        .from('engagement_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('File deleted');
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Group files by type
  const groupedFiles = files.reduce((acc, file) => {
    const type = file.file_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, EngagementFile[]>);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Files & Documents</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add File</DialogTitle>
                  <DialogDescription>
                    Upload a file or add a link to an external document
                  </DialogDescription>
                </DialogHeader>
                
                {/* Upload Type Selector */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={uploadType === 'url' ? 'default' : 'outline'}
                    onClick={() => setUploadType('url')}
                    className="flex-1"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Add URL
                  </Button>
                  <Button
                    type="button"
                    variant={uploadType === 'file' ? 'default' : 'outline'}
                    onClick={() => setUploadType('file')}
                    className="flex-1"
                    disabled // File upload not implemented yet
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file_name">File Name</Label>
                    <Input
                      id="file_name"
                      placeholder="e.g., Contract_2025.pdf"
                      value={formData.file_name}
                      onChange={(e) =>
                        setFormData({ ...formData, file_name: e.target.value })
                      }
                    />
                  </div>

                  {uploadType === 'url' && (
                    <div className="space-y-2">
                      <Label htmlFor="file_url">File URL</Label>
                      <Input
                        id="file_url"
                        type="url"
                        placeholder="https://..."
                        value={formData.file_url}
                        onChange={(e) =>
                          setFormData({ ...formData, file_url: e.target.value })
                        }
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="file_type">File Type</Label>
                    <Select
                      value={formData.file_type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, file_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="brief">Brief</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add File</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedFiles).map(([type, typeFiles]) => {
                const TypeIcon = fileTypeIcons[type as keyof typeof fileTypeIcons] || File;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium capitalize">
                        {type.replace('_', ' ')}s
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {typeFiles.length}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {typeFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              {file.description && (
                                <p className="text-sm text-muted-foreground">
                                  {file.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Uploaded {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={fileTypeColors[type as keyof typeof fileTypeColors]}
                              variant="secondary"
                            >
                              {type}
                            </Badge>
                            <div className="flex gap-1">
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="icon" title="Open">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                              <a
                                href={file.file_url}
                                download={file.file_name}
                              >
                                <Button variant="ghost" size="icon" title="Download">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFile(file.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No files uploaded yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}