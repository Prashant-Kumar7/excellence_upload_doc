import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Use environment variable first, then fallback to request origin
  // This ensures production redirects work correctly
  const origin = "https://excellence-upload-doc.vercel.app"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure we redirect to the correct production URL
      const redirectUrl = origin.includes('localhost') 
        ? requestUrl.origin 
        : origin || 'https://excellence-upload-doc.vercel.app'
      return NextResponse.redirect(`${redirectUrl}${next}`)
    }
  }

  // Return the user to an error page with instructions
  const redirectUrl = origin.includes('localhost') 
    ? requestUrl.origin 
    : origin || 'https://excellence-upload-doc.vercel.app'
  return NextResponse.redirect(`${redirectUrl}/login?error=auth_failed`)
}

