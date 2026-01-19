import Image from "next/image";
import "../globals.css";

export default function AuthLayout({ children }) {
    return (
        <main className="flex min-h-screen justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
            <div id="anime-container" className="flex justify-center flex-col w-full p-6 space-y-6 animate-in duration-700">
                {children}
            </div>
            <div className="min-w-2/3 relative">
                <Image src={'/bg.png'} fill={true} loading='eager' alt="Background Image" className="p-2 invert" />
            </div>
        </main>
    );
}
