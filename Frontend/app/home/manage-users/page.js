'use client'
import { dateTimeSplit } from '@/lib/dateTimeSplit';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import BarGraph from '@/component/BarGraph';
import LineChart from '@/component/LineChart';

const ManageUser = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState(null);
    const [userAnalysis, setUserAnalysis] = useState(null);
    const [usageStatistics, setUsageStatistics] = useState(null);

    async function getUsers() {
        if (!session) return;

        const getUserReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/admin/users?UserID=${session.user.UserID}`);
        const getUserRes = await getUserReq.json();
        if (getUserRes.success) {
            setUsers(getUserRes.users);
            setUserAnalysis(getUserRes.userCount);
            setUsageStatistics(getUserRes.usageCount);
        } else {
            console.log(getUserRes.error);
        }
    }
    
    useEffect(() => {
        (async () => {
            await getUsers();
        })();
    }, [session])

    return (
        <div className='p-4'>
            <div className="flex items-center justify-center rounded bg-neutral-900/80 mb-4">
                <div className='w-full p-6'>
                    <h2 className='text-center text-2xl font-bold font-serif mb-2'>New Users Statistics</h2>
                    <BarGraph userAnalysis={userAnalysis} />
                </div>
            </div>
            <div className="flex items-center justify-center rounded bg-neutral-900/80 mb-4">
                <div className='w-full p-6'>
                    <h2 className='text-center text-2xl font-bold font-serif mb-2'>Weekly Usage Statistics</h2>
                    <LineChart usageStatistics={usageStatistics} />
                </div>
            </div>
            <div className='className="p-4 flex justify-center flex-col space-y-6 py-4'>
                <h1 className='text-4xl text-center font-bold'>Manage Users</h1>
                <div className="relative overflow-x-auto shadow-xs rounded-lg border">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-sm bg-orange-600 font-bold">
                            <tr className='text-nowrap'>
                                <th scope="col" className="px-6 py-3">
                                    User Name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Email Id
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Joining Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Last Login
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users && users.length > 0
                                    ? users.map((userDetails, _index) => {
                                        let [createdAtDate, createdAtTime] = dateTimeSplit(userDetails.CreatedAt);
                                        let [loginAtDate, loginAtTime] = dateTimeSplit(userDetails.LoginAt);

                                        return (
                                            <tr className='border-t border-white font-bold' id={userDetails.UserID} key={userDetails.UserID}>
                                                <th scope="row" className="px-6 py-4">
                                                    {userDetails.UserName}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {userDetails.UserEmail}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {createdAtDate}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {loginAtDate} {loginAtTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {userDetails.UserRole}
                                                </td>
                                                {
                                                    userDetails.UserRole !== 'Admin'
                                                        ? <td className="px-6 py-4">
                                                            <button type="button" className="bg-green-600 text-white hover:bg-green-600/80 cursor-pointer font-bold leading-5 rounded-lg text-xs px-3 py-2 focus:outline-none" onClick={(e) => changeRole(e, 'Promote')}>Promote</button>
                                                        </td>
                                                        : <td className="px-6 py-4 text-right flex justify-center items-center gap-2">
                                                            <button type="button" className="bg-red-600 text-white hover:bg-red-600/80 cursor-pointer font-bold leading-5 rounded-lg text-xs px-3 py-2 focus:outline-none" onClick={(e) => changeRole(e, 'Demote')}>Demote</button>
                                                        </td>
                                                }
                                            </tr>
                                        )
                                    })
                                    : <tr className="border-t">
                                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                            No Records Found
                                        </th>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ManageUser;