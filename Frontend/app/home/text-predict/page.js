'use client'
import ReportForm from '@/component/ReportForm';
import { checkFlaskAPI } from '@/lib/backendCheck';
import { dateTimeSplit } from '@/lib/dateTimeSplit';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';

const TextPredict = () => {
    const type = 'text';
    const [predictionResult, setPredictionResult] = useState();
    const [flagId, setFlagId] = useState(null);
    const [filters, setFilters] = useState({
        type: 'ALL',          // REAL | FAKE | ALL
        // model: 'ALL'         // TEXT | IMAGE | COMBINED | ALL
    });
    const [predictHistory, setPredictHistory] = useState([]);
    const { data: session } = useSession();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();
    const filteredHistory = useMemo(() => {
        return predictHistory
            .filter(item => {
                // 🔹 Prediction type
                if (filters.type !== 'ALL' && item.result !== filters.type) {
                    return false;
                }

                // // 🔹 Model type
                // if (filters.model !== 'ALL' && item.model !== filters.model) {
                //     return false;
                // }

                return true;
            })
            .sort((a, b) =>
                new Date(b.predict_At).getTime() -
                new Date(a.predict_At).getTime()
            );
    }, [predictHistory, filters]);


    async function getPredictHistory() {
        if (session?.user) {
            const getPrediction = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction?UserID=${session.user.UserID}&type=${type}`);
            const getResult = await getPrediction.json();
            if (getResult.success) {
                setPredictHistory(getResult.data);
            }
        }
    }

    const onSubmit = async (data) => {
        const UserID = session.user.UserID;
        try {
            const getPrediction = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction?job_text=${data.job_text}&UserID=${UserID}&type=${type}`);
            const getResult = await getPrediction.json();

            if (getResult.success) {
                setPredictionResult(getResult.data[0]);
            } else {
                const backendCheck = await checkFlaskAPI();
                if (backendCheck) {
                    const submission_Time = new Date();

                    const predictionCall = await fetch('http://127.0.0.1:5000/checkJobPost', {
                        method: 'POST',
                        body: JSON.stringify({ ...data }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const predictionResult = await predictionCall.json();

                    if (predictionResult.success) {
                        setPredictionResult(predictionResult);

                        const storePrediction = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction`, {
                            method: 'POST',
                            body: JSON.stringify({ ...data, UserID, type, 'submission_time': submission_Time, ...predictionResult })
                        });
                        const storeResult = await storePrediction.json();

                        if (storeResult.success) {
                            await getPredictHistory();
                        } else {
                            console.error(storeResult.error)
                        }
                    } else {
                        console.log(predictionResult.error);
                    }
                } else {
                    alert("Backend server not started!!!");
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function reportPost(post_id) {
        const confirmation = confirm("Are you sure, you want to report as flagged.\nThis action is not reversible.");
        if (!confirmation) return;

        const markFlaggedReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction/flagged`, {
            'method': 'POST',
            body: JSON.stringify({ post_id })
        });
        const markFlaggedRes = await markFlaggedReq.json();

        if (markFlaggedRes.success) {
            setFlagId(markFlaggedRes.flag_id)
            await getPredictHistory();
        } else {
            console.log(markFlaggedRes.error);
        }
    }

    useEffect(() => {
        (async () => {
            await getPredictHistory();
        })();
    }, [session]);

    return (
        <div className="p-4 flex justify-center flex-col space-y-6 py-[8%] relative">
            {flagId && <ReportForm flag_id={flagId} setFlagId={setFlagId} />}
            <h1 className='text-4xl text-center font-bold'>Text Prediction</h1>
            <form className="min-w-lg mx-auto" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-6">
                    <label htmlFor="job_text" className="block mb-2.5 text-md font-medium">
                        Job Description
                        {errors.job_text ? <span className="ml-3 text-red-500 font-bold">{errors.job_text.message}</span> : ''}
                    </label>
                    <textarea {...register('job_text', { required: { value: true, message: 'This field is required...' }, minLength: { value: 50, message: 'Job description must have atleast 50 characters' }, maxLength: { value: 10000, message: 'Description is too long...' } })} id="job_text" name="job_text" rows={10} className="bg-neutral-800 border text-sm rounded-lg block min-w-full px-3 py-2.5 shadow-xs resize-none" placeholder="Enter your job post description here..." required />
                </div>
                <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}>Predict</button>
            </form>

            {
                predictionResult ? <div className="max-w-sm p-6 border rounded-lg shadow-xs mx-auto">
                    <div>
                        <h3 className="mt-6 mb-2 text-3xl font-semibold text-center">Prediction Result</h3>
                    </div>
                    <div>
                        <img src={`/${predictionResult.result}.png`} alt="Fake" />
                    </div>
                    <p className="mt-6 text-center text-xl">Confidence Level: <span>{predictionResult.confidence_Level}</span>%</p>
                    <p className="mb-6 text-center text-lg">Prediction: <span>{predictionResult.result.toUpperCase().concat(' JOB')}</span></p>
                </div> : ''
            }

            <div className="p-2 text-lg font-medium text-left rtl:text-right">
                Past Predictions
                <p className="mt-1.5 text-sm font-normal text-body">Provide feedback on past predictions to help our model to learn and predict more accurately and more.</p>
            </div>
            <ul className="hidden text-center sm:flex sm:gap-1.5 -space-x-px">
                <li className="w-full focus-within:z-10">
                    <button onClick={(e) => setFilters(prev => ({ ...prev, type: 'ALL' }))} className={`inline-flex items-center text-orange-600 justify-center w-full border rounded-s-lg font-bold leading-5 text-base px-4 py-2.5 focus:outline-none hover:bg-orange-600/40 ${filters.type === 'ALL' ? 'bg-orange-600/40' : 'cursor-pointer'}`}>
                        <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        All Job Posts
                    </button>
                </li>
                <li className="w-full focus-within:z-10">
                    <button onClick={(e) => setFilters(prev => ({ ...prev, type: 'real' }))} className={`inline-flex items-center text-green-600 justify-center w-full border font-bold leading-5 text-base px-4 py-2.5 focus:outline-none hover:bg-green-600/40 ${filters.type === 'real' ? 'bg-green-600/40' : 'cursor-pointer'}`}>
                        <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        Real Job Posts
                    </button>
                </li>
                <li className="w-full focus-within:z-10">
                    <button onClick={(e) => setFilters(prev => ({ ...prev, type: 'fake' }))} className={`inline-flex items-center text-red-600 justify-center w-full border rounded-e-lg font-bold leading-5 text-base px-4 py-2.5 focus:outline-none hover:bg-red-600/40 ${filters.type === 'fake' ? 'bg-red-600/40' : 'cursor-pointer'}`}>
                        <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                        Fake Job Posts
                    </button>
                </li>
            </ul>
            <div className="relative overflow-x-auto shadow-xs rounded-lg border">
                <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="text-sm bg-orange-600 font-bold">
                        <tr className='md:text-nowrap'>
                            <th scope="col" className="px-6 py-3">
                                Job Description
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
                            <th>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredHistory && filteredHistory.length > 0
                                ? filteredHistory.map((prediction, _index) => {
                                    const [predictAtDate, predictAtTime] = dateTimeSplit(prediction.predict_At);

                                    return (
                                        <tr className={`border-t border-white text-center font-bold ${prediction.result === 'real' ? 'text-green-400' : 'text-red-400'}`} id={prediction.post_id} key={prediction.post_id}>
                                            <th scope="row" className="px-4 py-2 text-start">
                                                {prediction.job_text.slice(0, 100)}...
                                            </th>
                                            <td className="px-4 py-2">
                                                {predictAtDate}
                                            </td>
                                            <td className="px-4 py-2">
                                                {predictAtTime}
                                            </td>
                                            <td className="px-4 py-2">
                                                {prediction.result.toUpperCase()}
                                            </td>
                                            <td className="px-4 py-2">
                                                {prediction.confidence_Level}%
                                            </td>
                                            <td className='pe-4 py-2'>
                                                <button type="button" onClick={() => { if (!prediction.flag_id) { reportPost(prediction.post_id) } }} className={`flex justify-center items-center gap-1 py-2 px-3 rounded-full bg-red-600/40 hover:bg-red-600/60 text-red-200 ${prediction.flag_id ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={prediction.flag_id != null}>
                                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={prediction.flag_id ? 'white' : 'none'} viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 14v7M5 4.971v9.541c5.6-5.538 8.4 2.64 14-.086v-9.54C13.4 7.61 10.6-.568 5 4.97Z" />
                                                    </svg>
                                                    {!prediction.flag_id && <span>Report</span>}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                                : <tr className="border-t">
                                    <th className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                        No Records Found
                                    </th>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TextPredict
