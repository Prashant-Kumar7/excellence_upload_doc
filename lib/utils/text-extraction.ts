import mammoth from 'mammoth'

export async function extractTextFromPDF(file: File): Promise<string> {
  // Use pdf2json instead of pdf-parse - works better in Next.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const PDFParser = require('pdf2json')
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1)
    
    // Set up event handlers
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(`PDF parsing error: ${errData.parserError}`))
    })
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extract text from all pages
        let text = ''
        if (pdfData.Pages) {
          for (const page of pdfData.Pages) {
            if (page.Texts) {
              for (const textItem of page.Texts) {
                if (textItem.R) {
                  for (const run of textItem.R) {
                    if (run.T) {
                      // Decode URI component if needed
                      text += decodeURIComponent(run.T) + ' '
                    }
                  }
                }
              }
            }
          }
        }
        resolve(text.trim())
      } catch (error: any) {
        reject(new Error(`Failed to extract text: ${error.message}`))
      }
    })
    
    // Parse the PDF buffer
    pdfParser.parseBuffer(buffer)
  })
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    // Convert ArrayBuffer to Buffer for mammoth (works better in Node.js)
    const buffer = Buffer.from(arrayBuffer)
    
    // Use mammoth to extract text from DOCX
    // mammoth accepts buffer option in Node.js environment
    const result = await mammoth.extractRawText({ buffer })
    
    // Check if we got text
    if (result.value && result.value.trim().length > 0) {
      return result.value
    }
    
    // If extractRawText returns empty, try converting to HTML and extracting text
    const htmlResult = await mammoth.convertToHtml({ buffer })
    if (htmlResult.value) {
      // Extract text from HTML by removing tags
      const text = htmlResult.value
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&[a-z]+;/gi, ' ') // Replace other HTML entities
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
      
      if (text.length > 0) {
        return text
      }
    }
    
    // If still empty, return empty string (file might be empty or only images)
    return result.value || ''
  } catch (error: any) {
    console.error('DOCX extraction error:', error)
    throw new Error(`Failed to extract text from DOCX: ${error.message || 'Unknown error'}`)
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return await extractTextFromPDF(file)
    case 'docx':
      return await extractTextFromDOCX(file)
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}

