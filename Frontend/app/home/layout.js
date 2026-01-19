'use client'
import "../globals.css";
import "@/public/loading.gif"
import ContentAnimeLink from "@/component/ContentAnimeLink";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
    const { data: session } = useSession();
    const [isActive, setIsActive] = useState(false);
    const [isExportActive, setIsExportActive] = useState(false);

    return (
        <main className="min-h-screen bg-zinc-50 font-sans dark:bg-black relative overflow-x-hidden">
            <button type="button" className="bg-transparent box-border border border-transparent focus:ring-4 font-medium leading-5 rounded-lg ms-3 mt-3 text-sm p-2 focus:outline-none inline-flex sm:hidden">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10" />
                </svg>
            </button>

            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-full transition-transform -translate-x-full sm:translate-x-0">
                <div className="h-full px-3 py-4 overflow-y-auto border-e border-white/50 bg-gray-900 rounded-e-xl">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <ContentAnimeLink href="/home/dashboard" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" /></svg>
                                <span className="ms-3">{session?.user.UserRole + ' '}Dashboard</span>
                            </ContentAnimeLink>
                        </li>
                        <li>
                            <ContentAnimeLink href="/home/image-predict" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                <svg className="shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v14M9 5v14M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Image Prediction</span>
                            </ContentAnimeLink>
                        </li>
                        <li>
                            <ContentAnimeLink href="/home/text-predict" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                <svg className="shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h3.439a.991.991 0 0 1 .908.6 3.978 3.978 0 0 0 7.306 0 .99.99 0 0 1 .908-.6H20M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 13l2-9h12l2 9M9 7h6m-7 3h8" /></svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Text Prediction</span>
                            </ContentAnimeLink>
                        </li>
                        {
                            session && session.user.UserRole === 'Admin' && <li>
                                <button onClick={(e) => setIsActive(!isActive)} className="flex w-full items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500">
                                    <svg className="shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    <span className="ms-3 whitespace-nowrap">Manage</span>
                                    <svg className={`w-5 h-5 ml-auto text-gray-800 dark:text-white transform transition-transform duration-300 ${isActive ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                    </svg>
                                </button>
                                <ul className={`ml-5 overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-40' : 'max-h-0'}`}>
                                    <li className="pt-2">
                                        <ContentAnimeLink href="/home/manage-model" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                            <span className="flex-1 ms-3 whitespace-nowrap">Models</span>
                                        </ContentAnimeLink>
                                    </li>
                                    <li className="pt-2">
                                        <ContentAnimeLink href="/home/manage-users" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                            <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
                                        </ContentAnimeLink>
                                    </li>
                                </ul>
                            </li>
                        }
                        {
                            session && session.user.UserRole === 'Admin' && <li>
                                <button onClick={(e) => setIsExportActive(!isExportActive)} className="flex w-full items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500">
                                    <svg className="shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01" />
                                    </svg>
                                    <span className="ms-3 whitespace-nowrap">Export Data</span>
                                    <svg className={`w-5 h-5 ml-auto text-gray-800 dark:text-white transform transition-transform duration-300 ${isExportActive ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                                    </svg>
                                </button>
                                <ul className={`ml-5 overflow-hidden transition-all duration-300 ease-in-out ${isExportActive ? 'max-h-40' : 'max-h-0'}`}>
                                    <li className="pt-2">
                                        <Link href={'/api/admin/export?format=csv'} target="_self" className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                            <span className="ms-3 whitespace-nowrap">Download CSV</span>
                                        </Link>
                                    </li>
                                    <li className="pt-2">
                                        <Link href={'/api/admin/export?format=txt'} target="_self" className="w-full flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                            <span className="ms-3 whitespace-nowrap">Download TXT</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        }
                        <li>
                            <div className="flex items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                {
                                    session && session.user.image
                                        ? <Image src={session.user.image} loading="eager" alt="Profile Image" width={24} height={24} className="w-6 h-6 text-gray-800 dark:text-white rounded-full" />
                                        : <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                }

                                <span className="flex-1 ms-3 whitespace-nowrap">{session?.user.name}</span>
                            </div>
                        </li>
                        <li>
                            <button onClick={() => signOut({ callbackUrl: '/?signOut=true' })} className="flex w-full items-center px-2 py-1.5 rounded-lg hover:bg-white/20 hover:text-blue-500 group">
                                <svg className="shrink-0 w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2" /></svg>
                                <span className="ms-3 whitespace-nowrap">Sign Out</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* <div className="p-4 sm:ml-[56.5%] h-screen justify-center items-center fixed -z-10 hidden">
                <img src="/loading.gif" alt="An animated example GIF" width="50" height="50" className="invert" />
            </div> */}

            <div id="content" className="p-4 sm:ml-64 content-animate-in duration-700">
                {children}
            </div>
        </main>
    );
}