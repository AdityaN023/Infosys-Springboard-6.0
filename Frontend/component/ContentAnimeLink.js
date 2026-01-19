'use client'
import React from 'react'
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';


const ContentAnimeLink = (props) => {
    const router = useRouter();
    const pathName = usePathname();

    function addDelay() {
        return new Promise((resolve) => {
            setTimeout(() => { resolve(); }, 600);
        });
    }

    async function handleClick(e) {
        e.preventDefault();
        if (pathName !== props.href) {
            document.getElementById('content').classList.add('content-animate-out');
            await addDelay();
            router.push(props.href);
        }
    }

    useEffect(() => {
        document.getElementById('content').classList.remove('content-animate-out');
    }, [pathName])


    return (
        <Link {...props} onClick={(e) => handleClick(e)} />
    )
}

export default ContentAnimeLink