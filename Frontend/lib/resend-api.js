import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY);

export const sendEmail = async (to, subject, html) => {
    const {data, error} = await resend.emails.send({
        from: "Website <website@resend.dev>",
        to: to,
        subject,
        html,
    });

    if(error) {
        console.error(error);
    }
}