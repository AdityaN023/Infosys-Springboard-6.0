import React from 'react'
import { useForm } from 'react-hook-form';

const ReportForm = ({flag_id, setFlagId}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    const onSubmit = async (data) => {
        const submitReasonReq = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}api/prediction/flagged`, {
            'method': 'PUT',
            body: JSON.stringify({ flag_id, ...data })
        });
        const submitReasonRes = await submitReasonReq.json();

        if (submitReasonRes.success) {
            reset();
            setFlagId(null);
        } else {
            console.log(submitReasonRes.error);
        }
    }

    return (
        <div className='fixed top-0 z-20 left-0 w-full'>
            <div className='ml-64 bg-neutral-800/20 min-h-screen flex justify-center items-center'>
                <div className='p-6 rounded-2xl max-w-md bg-neutral-900 space-y-2 relative'>
                    <button type="button" className="cursor-pointer absolute top-3 right-3 bg-neutral-800 hover:bg-orange-600/60 p-1 rounded-full" onClick={() => { setFlagId(null); reset();}}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg>
                    </button>
                    <h3 className='text-center text-3xl font-bold mb-4'>Report</h3>
                    <p className='text-lg font-bold'>Want to tell us more? It's optional</p>
                    <p>Sharing a few details can help us understand the issue. Please don't include personal info or questions.</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            {errors.reason ? <span className="block mb-2 text-red-500 font-bold">{errors.reason.message}</span> : ''}
                            <textarea {...register('reason', { required: { value: true, message: 'This field is required...' }, minLength: { value: 50, message: 'Job description must have atleast 50 characters' }, maxLength: { value: 10000, message: 'Description is too long...' } })} id="reason" name="reason" rows={10} className="bg-neutral-800 border text-sm rounded-lg block min-w-full px-3 py-2.5 shadow-xs resize-none" placeholder="Add details..." required />
                        </div>
                        <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}>Report</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ReportForm