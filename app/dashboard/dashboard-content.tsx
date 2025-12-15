'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Upload, FileText, Download, LogOut, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { sanitizeFilename, sanitizeStoragePath } from '@/lib/utils/sanitize-filename'

interface Document {
  id: string
  original_filename: string
  uploaded_at: string
  extracted_text: string | null
  file_path: string
}

export default function DashboardContent({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      setDocuments(data || [])
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      const errorMessage = error?.message || 'Failed to load documents'
      toast.error(errorMessage)
      // If it's a table not found error, provide helpful message
      if (error?.message?.includes('relation') || error?.code === 'PGRST116') {
        console.error('Database table might not exist. Please run the migration SQL.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const allowedExtensions = ['pdf', 'docx']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error('Only PDF and DOCX files are allowed')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Sanitize filename for storage (keep original for display)
      const sanitizedFilename = sanitizeFilename(file.name)
      const storagePath = `${user.id}/${Date.now()}-${sanitizedFilename}`

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Extract text from file
      const formData = new FormData()
      formData.append('file', file)

      const extractResponse = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Extract text error:', errorData)
        throw new Error(errorData.error || 'Failed to extract text')
      }

      const { extractedText } = await extractResponse.json()

      // Save document metadata to database via API route (has proper auth context)
      // Use original filename for display, but sanitized path for storage
      const saveResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: storagePath,
          original_filename: file.name, // Keep original for display
          extracted_text: extractedText,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save document')
      }

      toast.success('File uploaded successfully')
      fetchDocuments()
      e.target.value = '' // Reset input
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (filePath: string, originalFilename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = originalFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleViewText = (text: string | null) => {
    if (!text) {
      toast.error('No extracted text available for this document')
      return
    }
    setSelectedText(text)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload PDF or DOCX files (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              View and manage your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet. Upload your first document above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.original_filename}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.uploaded_at), 'PPp')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewText(doc.extracted_text)}
                              disabled={!doc.extracted_text}
                            >
                              View Text
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc.file_path, doc.original_filename)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Text Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Extracted Text</DialogTitle>
              <DialogDescription>
                Text content extracted from the document
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {selectedText}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

