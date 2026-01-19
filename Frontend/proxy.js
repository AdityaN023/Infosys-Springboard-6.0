import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request) {
    const token = await getToken({ req: request });

    if (request.nextUrl.pathname.startsWith('/home/')) {
        if (!token) {
            return NextResponse.redirect(
                new URL("/", request.url)
            );
        }

        return NextResponse.next();
    }
    
    if (request.nextUrl.pathname === ('/')) {
        if (token) {
            return NextResponse.redirect(
                new URL("/home/dashboard", request.url)
            );
        }

        return NextResponse.next();
    }
}