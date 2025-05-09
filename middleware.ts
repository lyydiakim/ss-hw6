
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    /* Implement a redirecting middleware YOUR CODE HERE */

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: [/* TODO: Add paths to match */]
}
