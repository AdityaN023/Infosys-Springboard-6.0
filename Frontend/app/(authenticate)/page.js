'use client'
import AnimeLink from "@/component/AnimeLink";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        reset
    } = useForm();

    const onSubmit = async (data) => {
        const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
        if (res?.error) {
            setError(res.error);
        } else {
            router.push('/home/dashboard')
        }
        reset();
    }

    return (
        <>
            <h2 className="font-bold font-sans text-3xl text-center">Login</h2>
            <div className="space-y-4">
                <button type="button" onClick={() => signIn('github', { redirect: false })} className="text-white bg-[#0f1419] hover:bg-[#0f1419]/90 focus:ring-4 focus:outline-none focus:ring-[#0f1419]/50 box-border border border-transparent font-medium leading-5 rounded-xl text-sm px-4 py-2.5 text-center flex items-center justify-center dark:hover:bg-[#24292F] dark:focus:ring-[#24292F]/55 w-full">
                    <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clipRule="evenodd" /></svg>
                    Sign in with Github
                </button>
                <button type="button" onClick={() => signIn('google', { redirect: false })} className="text-white bg-orange-400 hover:bg-orange-400/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 box-border border border-transparent font-medium leading-5 rounded-xl text-sm px-4 py-2.5 text-center flex items-center justify-center dark:focus:ring-[#4285F4]/55 w-full">
                    <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z" clipRule="evenodd" /></svg>
                    Sign in with Google
                </button>
            </div>
            <div className="relative flex justify-center items-center">
                <span className="z-10 bg-black px-1.5">OR</span>
                <hr className="absolute w-full h-0.5" />
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
            {
                searchParams.has('signOut', true) || searchParams.has('userExist', true) || searchParams.has('success', true) || searchParams.has('update', true)
                    ? <div className="flex items-start sm:items-center p-4 mb-4 text-sm bg-green-800 rounded-md text-green-200 font-semibold" role="alert">
                        <svg className="w-4 h-4 me-2 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        {
                            searchParams.get('signOut') && <p>You have successfully Signed Out.</p>
                        }
                        {
                            searchParams.get('userExist') && <p>User Already Exist. Please Sign In.</p>
                        }
                        {
                            searchParams.get('success') && <p>You are ready to Sign In.</p>
                        }
                        {
                            searchParams.get('update') && <p>Credentials Update Successfully</p>
                        }
                        <button type="button" className="ml-auto cursor-pointer" onClick={() => router.push('/')}>
                            <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                        </button>
                    </div>
                    : ''
            }
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)} >
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Your email
                        {errors.email ? <span className="ml-3 text-red-500 font-bold">{errors.email.message}</span> : ''}
                    </label>
                    <input {...register('email', { pattern: { value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', message: 'Enter valid Email' }, minLength: { value: 8, message: 'Length must be greater than 8' }, maxLength: { value: 50, message: 'Length must be smaller than 50' }, required: true })} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="eg: name@gmail.com" required />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Password
                        {errors.password ? <span className="ml-3 text-red-500 font-bold">{errors.password.message}</span> : ''}
                    </label>
                    <input {...register('password', { minLength: { value: 8, message: 'Length must be greater than 8' }, maxLength: { value: 50, message: 'Length must be smaller than 50' }, required: true })} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input {...register('remember')} id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                        </div>
                    </div>
                    <AnimeLink href="/fg-password" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</AnimeLink>
                </div>
                <button type="submit" className={`w-full text-white bg-orange-600 hover:bg-orange-600/90 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${isSubmitting?'opacity-50 cursor-not-allowed':''}`} disabled={isSubmitting}>Sign In</button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don’t have an account yet? <AnimeLink href="/sign-up" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</AnimeLink>
                </p>
            </form>
        </>
    );
}
