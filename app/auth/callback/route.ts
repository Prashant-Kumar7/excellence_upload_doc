import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine the correct origin for redirect
  // Priority: 1. Referer header, 2. Environment variable, 3. Request origin
  const referer = request.headers.get('referer')
  const origin = 
    (referer ? new URL(referer).origin : null) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

