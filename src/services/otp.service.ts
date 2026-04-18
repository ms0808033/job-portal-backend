// backend/src/services/otp.service.ts
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma';

export class OtpService {
    private transporter;

    constructor() {
        // We use Mailtrap or generic SMTP for testing. 
        // In production, use SendGrid, AWS SES, or Google Workspace SMTP here.
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
            port: Number(process.env.SMTP_PORT) || 2525,
            auth: {
                user: process.env.SMTP_USER || 'mock_user',
                pass: process.env.SMTP_PASS || 'mock_pass',
            },
        });
    }

    async generateAndSendOtp(email: string): Promise<void> {
        // 1. Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Set expiration (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 3. Clear old tokens for this email and save the new one
        await prisma.verificationToken.deleteMany({ where: { email } });
        await prisma.verificationToken.create({
            data: { email, token: code, expiresAt }
        });

        // 4. Send the Branded Email
        const mailOptions = {
            from: '"Finwell Auth" <security@finwell.co.in>',
            to: email,
            subject: 'Your Secure Login Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #0f172a;">Welcome to Finwell Growth Solutions Pvt Ltd</h2>
                    <p style="color: #64748b; font-size: 16px;">Please use the verification code below to securely log in to your portal.</p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #10b981; font-size: 40px; letter-spacing: 5px; margin: 0;">${code}</h1>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }

    async verifyOtp(email: string, token: string): Promise<boolean> {
        const record = await prisma.verificationToken.findFirst({
            where: { email, token }
        });

        // Fail if no record exists or if the token is expired
        if (!record || record.expiresAt < new Date()) {
            return false;
        }

        // If successful, delete the token so it can't be reused
        await prisma.verificationToken.delete({ where: { id: record.id } });
        return true;
    }
}