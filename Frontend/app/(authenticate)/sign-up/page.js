'use client'
import React, { useEffect, useState } from 'react'
import AnimeLink from '@/component/AnimeLink'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

const SignUp = () => {
    const router = useRouter();
    const [verification, setVerification] = useState(false);
    const [counter, setCounter] = useState();
    const [error, setError] = useState();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        getValues
    } = useForm();
    const password = watch("password");
    const email = watch("email");


    const validatePass = (pass) => {
        if (!/[A-Z]/.test(pass)) {
            return "Should contain at least one uppercase letter";
        }

        if (!/[a-z]/.test(pass)) {
            return "Should contain at least one lowercase letter";
        }

        if (!/[0-9]/.test(pass)) {
            return "Should contain at least one number";
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            return "Should contain at least one special character";
        }

        return true;
    };

    async function sendVerifyEmail(data) {
        try {
            let sendEmail = await fetch('http://localhost:3000/api/auth/verification', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await sendEmail.json().then((res) => res.codeSend);
        } catch (e) {
            console.log(e);
        }
    }

    const onSubmit = async (data) => {
        if (verification) {
            let checkVerificationCode = await fetch('http://localhost:3000/api/auth/verification?email=' + data.email + '&verificationCode=' + data.code);
            const result = await checkVerificationCode.json().then((result) => result.success);
            if (result) {
                const addUser = await fetch('http://localhost:3000/api/signUp', {
                    method: 'POST',
                    body: JSON.stringify({ uname: data.uname, email: data.email, password: data.password })
                });
                const done = await addUser.json().then((result) => result.done)
                if (done) {
                    router.push('/?success=true');
                }
            } else {
                setError('Incorrect code please try again.')
            }
        } else {
            let checkUserExist = await fetch('http://localhost:3000/api/signUp?email=' + data.email);
            let userExist = await checkUserExist.json().then((result) => result.userExist);
            if (userExist) {
                router.push('/?userExist=true')
            } else {
                let response = await sendVerifyEmail(data);
                if (response) {
                    setVerification(true);
                    setCounter(10);
                }
            }
        }
    }

    const resendCode = async () => {
        const resend = await sendVerifyEmail(getValues());
        if (resend) {
            setCounter(20);
        }
    }

    useEffect(() => {
        if (counter === 0) {
            return;
        }

        const timer = setInterval(() => {
            setCounter((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [counter]);

    return (
        <>
            <h2 className="font-bold font-sans text-3xl text-center">Sign Up</h2>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {
                    verification
                        ? <div className='space-y-4 md:space-y-6'>
                            <div className='md:space-y-2'>
                                <h4 className='font-bold font-sans text-xl text-center'>Email Verification</h4>
                                <p className='font-sans text-center'>
                                    Please type the Verification code sent to <span>{email}</span>
                                </p>
                            </div>
                            {
                                error
                                    ? <div className="flex items-start sm:items-center p-4 mb-4 text-sm bg-red-800 rounded-md text-red-200 font-semibold" role="alert">
                                        <svg className="w-4 h-4 me-2 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                        {
                                            <p>{error}</p>
                                        }
                                        <button type="button" className="ml-auto cursor-pointer" onClick={() => setError(null)}>
                                            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                            </svg>
                                        </button>
                                    </div>
                                    : ''
                            }
                            <div className='md:space-y-2'>
                                <input {...register('code', { required: { value: true, message: 'This field is required' }, minLength: { value: 6, message: 'Invalid Code. Length must be 6 digits.' }, maxLength: { value: 6, message: 'Invalid Code. Length must be 6 digits.' } })} type="text" name="code" id="code" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Verification Code" required />
                                {errors.code ? <span className="text-sm text-red-500 font-bold">{errors.code.message}</span> : ''}
                            </div>
                            <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isSubmitting && 'opacity-50 cursor-not-allowed'}`} disabled={isSubmitting}>Verify</button>
                            <p className="text-sm font-light text-orange-400 dark:text-orange-300 text-center">
                                Don't receive the verification code?
                                {
                                    counter === 0
                                        ? <button type='button' className='ml-1 hover:underline hover:text-orange-400/90 cursor-pointer' onClick={resendCode}>Resend Code</button>
                                        : <span className='ml-1'>{`Resend in 00:${String(counter).padStart(2, '0')}`}</span>
                                }
                            </p>
                            <button onClick={() => setVerification(false)} className='text-sm font-light text-gray-400 dark:text-gray-300 flex justify-center items-center gap-1 hover:text-gray-400/80 hover:dark:text-gray-300/80 cursor-pointer'>
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4" />
                                </svg> Back
                            </button>
                        </div>
                        : <div className='space-y-4 md:space-y-6'>
                            <div>
                                <label htmlFor="uname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    User Name
                                    {errors.uname ? <span className="ml-3 text-red-500 font-bold">{errors.uname.message}</span> : ''}
                                </label>
                                <input {...register('uname', { required: { value: true, message: 'This field is required' }, minLength: { value: 4, message: 'Min Length is 4' }, maxLength: { value: 40, message: 'Max Length is 40' }, pattern: { value: /^[a-zA-Z0-9_ ]+$/, message: 'Should not contain special characters' } })} type="text" name="uname" id="uname" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="XYZ ABC" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Your email
                                    {errors.email ? <span className="ml-3 text-red-500 font-bold">{errors.email.message}</span> : ''}
                                </label>
                                <input {...register('email', { minLength: { value: 8, message: 'Length must be greater than 8' }, maxLength: { value: 50, message: 'Length must be smaller than 50' }, required: true })} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="eg: name@gmail.com" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Password
                                    {errors.password ? <span className="ml-3 text-red-500 font-bold">{errors.password.message}</span> : ''}
                                </label>
                                <input {...register('password', { minLength: { value: 8, message: 'Length must be greater than 8' }, maxLength: { value: 50, message: 'Length must be smaller than 50' }, validate: validatePass, required: true })} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="c-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Confirm Password
                                    {errors['c-password'] ? <span className="ml-3 text-red-500 font-bold">{errors['c-password'].message}</span> : ''}
                                </label>
                                <input {...register('c-password', { validate: (value) => value === password || "Passwords do not match", required: true })} type="password" name="c-password" id="c-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 cursor-pointer ${isSubmitting && 'opacity-50 cursor-not-allowed'}`} disabled={isSubmitting}>Get Verification Code</button>
                        </div>
                }
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account? <AnimeLink href="/" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign In</AnimeLink>
                </p>
            </form>
        </>
    )
}

export default SignUp
