'use client'
import React, { useEffect, useRef, useState } from 'react'
import Doughnut from '@/component/Doughnut'
import { useSession } from 'next-auth/react';
import { dateTimeSplit } from '@/lib/dateTimeSplit';

const Dashboard = () => {
    const [predictAnalysis, setPredictAnalysis] = useState(null);
    const [predictHistory, setPredictHistory] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        (async () => {
            if (!session?.user) return;

            try {
                const UserID = session.user.UserID;

                const [analysisRes, predictionRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction/analysis?UserID=${UserID}`),
                    fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction?UserID=${UserID}`)
                ]);

                const [analysisData, predictionData] = await Promise.all([
                    analysisRes.json(),
                    predictionRes.json()
                ]);

                const history = [
                    ...(predictionData.data ?? [])
                ];

                history.sort(
                    (a, b) => new Date(b.predict_At) - new Date(a.predict_At)
                );

                setPredictAnalysis(analysisData);
                setPredictHistory(history); // store in state
            } catch (e) {
                console.error(e);
            }
        })();
    }, [session]);

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-center h-24 rounded bg-neutral-900/80">
                    <div className="flex flex-col items-center text-red-400">
                        <span className="mb-2 font-semibold text-xl">Fake Job Posts Rate</span>
                        <span className="font-semibold tracking-tight"><span className='text-2xl font-bold'>
                            {
                                predictAnalysis && (predictAnalysis.textpredict.fake > 0 || predictAnalysis.imgpredict.fake > 0)
                                    ? Math.round(
                                        ((predictAnalysis.textpredict.fake + predictAnalysis.imgpredict.fake) / (predictAnalysis.textpredict.total + predictAnalysis.imgpredict.total)) * 100
                                    )
                                    : 0
                            }
                        </span>% / 100</span>
                    </div>
                </div>
                <div className="flex items-center justify-center h-24 rounded bg-neutral-900/80">
                    <div className="flex flex-col items-center text-green-400">
                        <span className="mb-2 font-semibold text-xl">Real Job Posts Rate</span>
                        <span className="font-semibold tracking-tight"><span className='text-2xl font-bold'>
                            {
                                predictAnalysis && (predictAnalysis.textpredict.real > 0 || predictAnalysis.imgpredict.real > 0)
                                    ? Math.round(
                                        ((predictAnalysis.textpredict.real + predictAnalysis.imgpredict.real) / (predictAnalysis.textpredict.total + predictAnalysis.imgpredict.total)) * 100
                                    )
                                    : 0
                            }
                        </span>% / 100</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center justify-center h-24 rounded bg-neutral-900/80 border border-gray-400">
                    <div className="flex flex-col items-center">
                        <span className="mb-2 font-semibold">Your Total Predictions</span>
                        <span className="text-2xl font-semibold tracking-tight">
                            {predictAnalysis && (predictAnalysis.imgpredict.total + predictAnalysis.textpredict.total)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-center h-24 rounded bg-neutral-900/80 border border-green-400">
                    <div className="flex flex-col items-center">
                        <span className="mb-2 font-semibold">Real Jobs Post</span>
                        <span className="text-2xl font-semibold tracking-tight">
                            {
                                predictAnalysis && (predictAnalysis.textpredict.real + predictAnalysis.imgpredict.real)
                            }
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-center h-24 rounded bg-neutral-900/80 border border-red-400">
                    <div className="flex flex-col items-center">
                        <span className="mb-2 font-semibold">Fake Jobs Post</span>
                        <span className="text-2xl font-semibold tracking-tight">
                            {
                                predictAnalysis && (predictAnalysis.textpredict.fake + predictAnalysis.imgpredict.fake)
                            }
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded bg-neutral-900/80 p-6">
                    <h2 className='text-center text-2xl font-bold font-serif'>Description Based Predictions</h2>
                    <div className='w-full flex items-center justify-center relative'>
                        <div className='absolute flex justify-center items-center flex-col'>
                            <span className='text-2xl font-bold font-sans text-green-400'>Real Posts</span>
                            <span><span className='text-xl'>
                                {
                                    predictAnalysis && predictAnalysis.textpredict.real > 0
                                        ? Math.round(
                                            (predictAnalysis.textpredict.real / predictAnalysis.textpredict.total) * 100
                                        )
                                        : 0
                                }%
                            </span> / 100</span>
                            <span className='text-2xl font-bold font-sans text-red-400'>Fake Posts</span>
                            <span><span className='text-xl'>
                                {
                                    predictAnalysis && predictAnalysis.textpredict.fake > 0
                                        ? Math.round(
                                            (predictAnalysis.textpredict.fake / predictAnalysis.textpredict.total) * 100
                                        )
                                        : 0
                                }%
                            </span> / 100</span>
                        </div>
                        <Doughnut
                            total={
                                predictAnalysis
                                    ? predictAnalysis.textpredict.real +
                                    predictAnalysis.textpredict.fake
                                    : 0
                            }
                            labels={['Real Posts', 'Fake Posts']}
                            data={
                                predictAnalysis
                                    ? [
                                        predictAnalysis.textpredict.real,
                                        predictAnalysis.textpredict.fake,
                                    ]
                                    : [0, 0]
                            }
                            bg={['#22c55e', '#ef4444']}
                        />
                    </div>
                </div>
                <div className="rounded bg-neutral-900/80 p-6">
                    <h2 className='text-center text-2xl font-bold font-serif'>Image Based Predictions</h2>
                    <div className='w-full flex items-center justify-center'>
                        <div className='absolute flex justify-center items-center flex-col'>
                            <span className='text-2xl font-bold font-sans text-green-400'>Real Posts</span>
                            <span><span className='text-xl'>
                                {
                                    predictAnalysis && predictAnalysis.imgpredict.real > 0
                                        ? Math.round(
                                            (predictAnalysis.imgpredict.real / predictAnalysis.imgpredict.total) * 100
                                        )
                                        : 0
                                }%
                            </span> / 100</span>
                            <span className='text-2xl font-bold font-sans text-red-400'>Fake Posts</span>
                            <span><span className='text-xl'>
                                {
                                    predictAnalysis && predictAnalysis.imgpredict.fake > 0
                                        ? Math.round(
                                            (predictAnalysis.imgpredict.fake / predictAnalysis.imgpredict.total) * 100
                                        )
                                        : 0
                                }%
                            </span> / 100</span>
                        </div>
                        <Doughnut
                            total={
                                predictAnalysis
                                    ? predictAnalysis.imgpredict.real +
                                    predictAnalysis.imgpredict.fake
                                    : 0
                            }
                            labels={['Real Posts', 'Fake Posts']}
                            data={
                                predictAnalysis
                                    ? [
                                        predictAnalysis.imgpredict.real,
                                        predictAnalysis.imgpredict.fake,
                                    ]
                                    : [0, 0]
                            }
                            bg={['#22c55e', '#ef4444']}
                        />
                    </div>
                </div>
            </div>
            <div className="rounded bg-neutral-900/80 mt-4 p-4 space-y-6">
                <div className="p-2 text-lg font-medium text-left rtl:text-right">
                    Prediction History
                    <p className="mt-1.5 text-sm font-normal text-body">Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel nemo dolorem unde. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quo laudantium eligendi excepturi.</p>
                </div>
                <div className="relative overflow-x-auto shadow-xs rounded-lg border">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-sm bg-orange-600 font-bold">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Mode
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Prediction Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Prediction Time
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Fake / Real
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Confidence Level
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                predictHistory && predictHistory.length > 0
                                    ? predictHistory.map((prediction, _index) => {
                                        const [predictAtDate, predictAtTime] = dateTimeSplit(prediction.predict_At);

                                        return (
                                            <tr className={`border-t border-white font-bold ${prediction.result === 'real' ? 'text-green-400' : 'text-red-400'}`} key={_index}>
                                                <th scope="row" className="px-6 py-4">
                                                    {
                                                        prediction.pred_type === 'text' ? "Text Prediction" : "Image Prediction"
                                                    }
                                                </th>
                                                <td className="px-6 py-4">
                                                    {predictAtDate}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {predictAtTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {prediction.result.toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {prediction.confidence_Level}%
                                                </td>
                                            </tr>
                                        )
                                    })
                                    : <tr className="border-t">
                                        <td scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                            No Records Found
                                        </td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard