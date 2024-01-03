import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    async function middleware(req) {
        const pathname = req.nextUrl.pathname
        
        //manage route protection 
        const isAuth = await getToken({req})
        const isLoginPage = pathname.startsWith('/login')

        const sensitiveRoutes = ['/dashboard']
        const isAccessingSensitiveRoutes = sensitiveRoutes.some(route => pathname.startsWith(route))

        if(isLoginPage){
            // if user is already authenticated 
            if(isAuth){
                return NextResponse.redirect(new URL('/dashboard', req.url)) //req.url is the base url : localhost:3000
            }

            // if user is not  authenticated we let them
            return NextResponse.next()
        }

        if(!isAuth && isAccessingSensitiveRoutes){
            return NextResponse.redirect(new URL('/login', req.url)) //req.url is the base url : localhost:3000
        }

        if(pathname === '/'){
            return NextResponse.redirect(new URL('/dashboard', req.url)) //req.url is the base url : localhost:3000
        }
    }, 
    //use this callback to always call the middleware and prevent error of having infinit redirect 
    {
        callbacks: {
            async authorized(){
                return true
            }
        }
    }
)

export const config = {
    matchter : ['/', '/login', '/dashboard/:path*']
}