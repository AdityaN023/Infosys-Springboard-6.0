'use client'
import { dateTimeSplit } from '@/lib/dateTimeSplit';
import { useSession } from 'next-auth/react'
import Image from 'next/image';
import React from 'react'

const Profile = () => {
    const { data: session } = useSession();

    return (
        <div className='p-4 flex flex-col items-center py-[8%]'>
            <h1 className="text-3xl font-bold mb-1">My Profile</h1>
            <p className="text-slate-400 text-sm mb-6">
                View your account information and access details.
            </p>

            <div className="max-w-xl bg-linear-to-br from-slate-900 via-slate-900 to-slate-800
            p-6 rounded-2xl border border-slate-800 shadow-xl">

                <div className="flex items-center gap-4 mb-6">

                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-black">
                        {
                            session && session.user.image
                                ? <Image src={session.user.image} loading="eager" alt="Profile Image" width={100} height={100} className="w-full h-full text-gray-800 dark:text-white rounded-full" />
                                : <svg className="w-full h-full text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                        }
                    </div>

                    <div>
                        <p className="text-xl font-semibold text-white">{session && session.user.name}</p>
                        <p className="text-sm text-slate-400">{session && session.user.email}</p>

                        <p className="text-slate-400 text-sm mt-1">
                            Role:
                            {
                                session && session.user.UserRole === 'Admin'
                                    ? <span className="text-green-400 font-semibold">ADMIN</span>
                                    : <span className="text-blue-400 font-semibold">USER</span>
                            }
                        </p>

                        <p className="text-slate-400 text-sm">
                            Last Login: {session && dateTimeSplit(session.user.LoginAt).map((val, _index) => val + ' ')}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-start items-center border-t border-slate-800 pt-3 gap-2">
                        <span className="text-slate-400 text-sm">Account Type</span>

                        {
                            session && session.user.UserRole === 'Admin'
                                ? <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/10 text-green-400">
                                    Administrator
                                </span>
                                : <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-400">
                                    Standard User
                                </span>
                        }
                    </div>
                </div>

                <p className="text-slate-400 text-sm mt-5 leading-relaxed">
                    This account allows you to analyze job postings, view confidence scores,
                    manage access based on role, and download prediction reports.
                </p>
            </div>

            <p className="text-xs text-slate-500 mt-4 max-w-xl">
                For security reasons, profile details cannot be edited directly.
                Please contact support if changes are required.
            </p>
        </div >
    )
}

export default Profile
