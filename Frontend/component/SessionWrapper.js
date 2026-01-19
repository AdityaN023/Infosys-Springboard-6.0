'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'

const SessionWrapper = ({ children }) => {
    return (
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
            {children}
        </SessionProvider>
    )
}

export default SessionWrapper