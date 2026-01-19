import "./globals.css";
import "@/public/loading.gif"
import SessionWrapper from "@/component/SessionWrapper";

export const metadata = {
    title: "POSTANALYSER",
    description: "A application which predicts whether the job post is real or fake based on description and other factors.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="scroll-smooth">
                <SessionWrapper refetchOnWindowFocus={false} refetchInterval={0}>
                    {children}
                </SessionWrapper>
            </body>
        </html >
    );
}