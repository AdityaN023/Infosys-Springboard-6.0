export const checkFlaskAPI = async () => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL, {
            method: "GET",
            signal: controller.signal,
        });

        clearTimeout(timeout);

        return res.ok;
    } catch (error) {
        return false;
    }
};