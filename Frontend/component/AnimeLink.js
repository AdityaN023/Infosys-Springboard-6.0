'use client'
import React from 'react'
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';


const AnimeLink = (props) => {
    const router = useRouter();
    const pathName = usePathname();

    function addDelay() {
        return new Promise((resolve) => {
            setTimeout(() => { resolve(); }, 600);
        });
    }

    async function handleClick(e) {
        e.preventDefault();
        document.getElementById('anime-container').classList.add('animate-out');
        await addDelay();
        router.push(props.href);
    }

    useEffect(() => {
        document.getElementById('anime-container').classList.remove('animate-out');
    }, [pathName])


    return (
        <Link {...props} onClick={(e) => handleClick(e)} />
    )
}

export default AnimeLink
