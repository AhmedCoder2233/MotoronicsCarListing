// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth error:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
      }
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
