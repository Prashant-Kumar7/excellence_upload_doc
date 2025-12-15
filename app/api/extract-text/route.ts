import { extractTextFromFile } from '@/lib/utils/text-extraction'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Extracting text from file:', file.name, file.type, file.size)
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    console.log('File extension:', fileExtension)
    
    const extractedText = await extractTextFromFile(file)
    console.log('Text extracted successfully, length:', extractedText?.length || 0)
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.warn('Warning: Extracted text is empty')
    }

    return NextResponse.json({ extractedText })
  } catch (error: any) {
    console.error('Text extraction error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to extract text',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

