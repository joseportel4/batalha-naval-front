import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

 export function middleware(request: NextRequest) {

  const token = request.cookies.get('auth-token'); // cookie de autenticação
  const { pathname } = request.nextUrl

  
  const publicRouts = pathname === '/login' || pathname === '/register' || pathname === '/';

  if (!token && !publicRouts) {
  return NextResponse.redirect(new URL('/login', request.url));
  } 

  if (token && publicRouts) {
    return NextResponse.redirect(new URL('/lobby', request.url));
  }

  return NextResponse.next();
   
    }
   
    // Opcional: Defina quais paths o middleware deve ser executado
    export const config = {
      matcher: [
        /*
         * Match todas as requests path.
         * Exceto as que começam com:
         * - _next/static (arquivos estáticos)
         * - _next/image (otimização de imagens)
         * - favicon.ico (favicon)
         * - e arquivos na pasta 'public'
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
      ],
};