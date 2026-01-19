import { getDB } from "@/lib/db";
import { sendEmail } from "@/lib/resend-api";
import generateSecureOTP from "@/lib/verification-code";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const verification_Code = searchParams.get("verificationCode");

    const con = await getDB();

    const [codeMatch] = await con.query('SELECT * FROM verification WHERE UserEmail = ? && verificationCode = ? && expiresAt > ?', [email, verification_Code, Date.now()]);

    return NextResponse.json({
        'success': codeMatch.length > 0
    })
}

export async function POST(request) {
    const con = await getDB();
    const recipient = await request.json();
    const verification_Code = generateSecureOTP();
    const [codeExists] = await con.query('SELECT * FROM verification WHERE UserEmail = ?', [recipient.email]);

    if (codeExists.length > 0) {
        const [userDetails] = await con.query('SELECT UserName FROM users WHERE UserEmail = ?', [recipient.email]);

        if (userDetails.length > 0) {
            recipient.uname = userDetails[0].UserName
        }

        await con.query('UPDATE verification SET verificationCode = ? WHERE UserEmail = ?;', [verification_Code, recipient.email]);
    } else {
        await con.query('INSERT INTO verification (UserEmail, verificationCode) VALUES (?, ?)', [recipient.email, verification_Code]);
    }
    
    const html = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>Email Verification</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                    body {
                        margin: 0;
                    padding: 0;
                    background-color: #f4f6f8;
                    font-family: Arial, Helvetica, sans-serif;
        }

                    .email-container {
                        max - width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

                    .email-header {
                        background - color: #2563eb;
                    color: #ffffff;
                    text-align: center;
                    padding: 24px;
                    font-size: 22px;
                    font-weight: bold;
        }

                    .email-body {
                        padding: 30px;
                    color: #333333;
                    font-size: 15px;
                    line-height: 1.6;
                    text-align: center;
        }

                    .verification-code {
                        margin: 24px 0;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    color: #2563eb;
                    background-color: #f1f5ff;
                    padding: 16px 24px;
                    border-radius: 6px;
                    display: inline-block;
        }

                    .email-footer {
                        padding: 20px;
                    font-size: 13px;
                    color: #777777;
                    text-align: center;
                    background-color: #fafafa;
        }

                    @media only screen and (max-width: 600px) {
          .email - body {
                        padding: 20px;
          }

                    .verification-code {
                        font - size: 26px;
                    letter-spacing: 4px;
          }
        }
                </style>
            </head>
            <body>

                <div class="email-container">
                    <div class="email-header">
                        Verify Your Email
                    </div>

                    <div class="email-body">
                        <p>Hello, ${recipient.uname}</p>

                        <p>
                            Please use the verification code below to confirm your email address.
                        </p>

                        <div class="verification-code">
                            ${verification_Code}
                        </div>

                        <p>
                            This code is valid for the next <strong>10 minutes</strong>.
                            If you did not request this, please ignore this email.
                        </p>

                        <p>
                            Thank you,<br />
                            <strong>Your Team</strong>
                        </p>
                    </div>

                    <div class="email-footer">
                        © 2025 POSTANALYSER. All rights reserved.
                    </div>
                </div>

            </body>
        </html>`

    await sendEmail(recipient.email, 'Email verification Email by FakeJobPostAnalyser', html)

    return NextResponse.json({ codeSend: true })
}