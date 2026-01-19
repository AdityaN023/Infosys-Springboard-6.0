'use client'
import { checkFlaskAPI } from '@/lib/backendCheck';
import { dateTimeSplit } from '@/lib/dateTimeSplit';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

const ManagerModel = () => {
    const { data: session } = useSession();
    const [models, setModels] = useState(null);
    const [flaggedPosts, setFlaggedPosts] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadModel, setLoadModel] = useState(false);
    const [postDetails, setPostDetails] = useState(null);

    const RetrainingForm = () => {
        const {
            register,
            handleSubmit,
            reset,
            formState: { errors, isSubmitting }
        } = useForm();

        const onSubmit = async (data) => {
            try {
                const backendCheck = await checkFlaskAPI();
                if (backendCheck) {
                    const retrainModelReq = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}retrain`, {
                        method: 'POST',
                        body: JSON.stringify({ flaggedPosts, 'notes': data.notes, 'version': data.version, 'UserID': session.user.UserID }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const retrainModelRes = await retrainModelReq.json();

                    if (retrainModelRes.success) {
                        reset();
                        setIsSubmitting(false);
                        await getModels();
                        await getFlaggedPosts();
                    } else {
                        console.log(retrainModelRes.error);
                    }
                } else {
                    alert("Backend server not started!!!");
                }
            } catch (error) {
                console.log(error);
            }
        }

        return (
            <div className='fixed top-0 z-20 left-0 w-full'>
                <div className='ml-64 bg-neutral-800/20 min-h-screen flex justify-center items-center'>
                    <div className='p-6 rounded-2xl max-w-md bg-neutral-900 space-y-2 relative'>
                        <button type="button" className="cursor-pointer absolute top-3 right-3 bg-neutral-800 hover:bg-orange-600/60 p-1 rounded-full" onClick={() => setIsSubmitting(false)}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                        </button>
                        <h3 className='text-center text-3xl font-bold mb-4'>Model Retraining</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='mb-4'>
                                <label htmlFor="version" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Model Version
                                    {errors.version ? <span className="ml-3 text-red-500 font-bold">{errors.version.message}</span> : ''}
                                </label>
                                <input {...register('version', { required: { value: true, message: 'This field is required' }, minLength: { value: 4, message: 'Min Length is 4' }, maxLength: { value: 40, message: 'Max Length is 40' }, pattern: { value: /^[a-zA-Z0-9_ ]+$/, message: 'Should not contain special characters' } })} type="text" name="version" id="version" className="border bg-neutral-800  rounded-lg block w-full p-2.5" placeholder="Model_X" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    <p className='text-lg font-bold'>Tell us more? It's optional</p>
                                    <p>Add notes for this specific retraining process which can be used to map why retraining is carried out</p>
                                    {errors.notes ? <span className="text-red-500 font-bold">{errors.notes.message}</span> : ''}
                                </label>
                                <textarea {...register('notes', { required: { value: false }, minLength: { value: 50, message: 'Job description must have atleast 50 characters' }, maxLength: { value: 10000, message: 'Description is too long...' } })} id="notes" name="notes" rows={10} className="bg-neutral-800 border text-sm rounded-lg block min-w-full px-3 py-2.5 shadow-xs resize-none" placeholder="Add Note..." />
                            </div>
                            <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}>Retrain</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const PostDetails = () => {
        return (
            <div className='fixed top-0 z-20 left-0 w-full'>
                <div className='ml-64 bg-neutral-800/20 min-h-screen flex justify-center items-center'>
                    <div className='p-6 rounded-2xl min-w-md max-w-md bg-neutral-900 space-y-2 relative'>
                        <button type="button" className="cursor-pointer absolute top-3 right-3 bg-neutral-800 hover:bg-orange-600/60 p-1 rounded-full" onClick={() => setPostDetails(null)}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                        </button>
                        <h3 className='text-center text-3xl font-bold mb-4'>Post Details</h3>
                        <p className='text-lg font-bold'>Job Post</p>
                        <div className="mb-4">
                            <textarea id="job_text" name="job_text" rows={6} className="bg-neutral-800 border text-sm rounded-lg block min-w-full px-3 py-2.5 shadow-xs resize-none" disabled={false} defaultValue={postDetails.job_text} readOnly={true} />
                        </div>
                        <p className='text-lg font-bold'>Reason</p>
                        <div className="mb-4">
                            <textarea id="reason" name="reason" rows={6} className="bg-neutral-800 border text-sm rounded-lg block min-w-full px-3 py-2.5 shadow-xs resize-none" disabled={true} defaultValue={postDetails.reason} readOnly={true} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    async function handleLoadModel() {
        setLoadModel(true);
        try {
            const backendCheck = await checkFlaskAPI();
            if (backendCheck) {
                const loadModelReq = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}load_model`);
                const loadModelRes = await loadModelReq.json();

                if (loadModelRes.success) {
                    await getModels()
                } else {
                    console.log(loadModelRes.error);
                }
            } else {
                alert("Backend server not started!!!");
            }
        } catch (error) {
            console.log(error);
        }
        setLoadModel(false);
    }

    async function getModels() {
        if (!session) return;

        const getModelsReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/admin/model`);
        const getModelsRes = await getModelsReq.json();
        if (getModelsRes.success) {
            setModels(getModelsRes.models);
        } else {
            console.log(getModelsRes.error);
        }
    }

    async function getFlaggedPosts() {
        if (!session) return;

        const getFlaggedPostsReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction/flagged`);
        const getFlaggedPostsRes = await getFlaggedPostsReq.json();
        if (getFlaggedPostsRes.success) {
            setFlaggedPosts(getFlaggedPostsRes.flagged_posts);
        } else {
            console.log(getFlaggedPostsRes.error);
        }
    }

    async function removeFlag(flag_id) {
        if (!session) return;

        const removeFlagReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction/flagged`, {
            method: 'DELETE',
            body: JSON.stringify({ flag_id, UserID: session.user.UserID })
        });
        const removeFlagRes = await removeFlagReq.json();
        if (removeFlagRes.success) {
            await getFlaggedPosts();
        } else {
            console.log(removeFlagRes.error);
        }
    }

    useEffect(() => {
        (async () => {
            await getModels();
            await getFlaggedPosts();
        })();
    }, [session])

    return (
        <div className='p-4'>
            {postDetails && <PostDetails />}
            {isSubmitting && <RetrainingForm />}
            <div className='className="p-4 flex justify-center flex-col space-y-6 py-4'>
                <h1 className='text-4xl text-center font-bold'>Manage Models</h1>
                <div className="relative overflow-x-auto shadow-xs rounded-lg border">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-sm bg-orange-600 font-bold">
                            <tr className='text-nowrap'>
                                <th scope="col" className="px-6 py-3">
                                    Model Version
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Training Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Training Time
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Accuracy
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    F1 Score
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Comments
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                models && models.length > 0
                                    ? models.map((modelDetails, _index) => {
                                        const [trainingDate, trainingTime] = dateTimeSplit(modelDetails.training_time);

                                        return (
                                            <tr className='border-t border-white font-bold' id={modelDetails.model_id} key={modelDetails.model_id}>
                                                <th scope="row" className="px-6 py-4">
                                                    {modelDetails.version}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {trainingDate}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {trainingTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {modelDetails.accuracy}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {modelDetails.f1_score}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {
                                                        modelDetails.comments
                                                            ? modelDetails.comments
                                                            : <button>Add Comments</button>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                    : <tr className="border-t">
                                        <td className="p-12 text-center" colSpan={6}>
                                            <button onClick={(e) => handleLoadModel()} className={`px-4 py-2 rounded-lg text-xl font-bold cursor-pointer bg-orange-600 inline-flex items-center ${loadModel && 'opacity-80'}`} disabled={loadModel}>
                                                {
                                                    loadModel && <svg className={`w-5 h-5 me-2 text-white animate-spin`} viewBox="0 0 100 101" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                                    </svg>
                                                }
                                                Load Model
                                            </button>
                                        </td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='className="p-4 flex justify-center flex-col space-y-6 py-4'>
                <h1 className='text-4xl text-center font-bold'>Flagged Posts</h1>
                <div className="relative overflow-x-auto shadow-xs rounded-lg border">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-sm bg-orange-600 font-bold">
                            <tr className='text-nowrap'>
                                <th scope="col" className="px-6 py-3">
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Flagged By
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Flagged On
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Result / Confidence Score
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Model Version
                                </th>
                                <th scope="col" className="px-6 py-3">
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                flaggedPosts && flaggedPosts.length > 0
                                    ? flaggedPosts.map((flaggedDetails, _index) => {
                                        const [trainingDate, trainingTime] = dateTimeSplit(flaggedDetails.flagged_time);

                                        return (
                                            <tr className='border-t border-white font-bold text-nowrap' id={flaggedDetails.flag_id} key={flaggedDetails.flag_id}>
                                                <td className="px-6 py-4">
                                                    <button className='text-orange-300 cursor-pointer hover:text-orange-400' onClick={() => setPostDetails({
                                                        'job_text': flaggedDetails.job_text,
                                                        'reason': flaggedDetails.reason
                                                    })}>View Details</button>
                                                </td>
                                                <th scope="row" className="px-6 py-4">
                                                    {flaggedDetails.UserName}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {trainingDate} {trainingTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {flaggedDetails.result.toUpperCase()} / {flaggedDetails.confidence_Level}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {flaggedDetails.version}
                                                </td>
                                                <td className="pe-6 py-4">
                                                    <button type="button" onClick={() => removeFlag(flaggedDetails.flag_id)} className='flex justify-center items-center gap-1 text-red-400 hover:text-red-400/80 cursor-pointer'>
                                                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                                                        </svg>
                                                        <span>Remove</span>
                                                    </button>
                                                </td>
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
                {
                    flaggedPosts && flaggedPosts.length > 0 && <div>
                        <button onClick={() => setIsSubmitting(true)} className={`text-white bg-red-600 hover:bg-red-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 inline-flex items-center ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`} disabled={isSubmitting}>
                            {
                                isSubmitting && <svg className={`w-5 h-5 me-2 text-white animate-spin`} viewBox="0 0 100 101" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                            }
                            Retrain Model
                        </button>
                    </div>
                }
            </div>
        </div>
    )
}

export default ManagerModel
