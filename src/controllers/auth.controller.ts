// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const generateToken = (user: any, role: string) => {
    return jwt.sign(
        { userId: user.id, email: user.email, systemRole: user.systemRole, roleType: role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const handleOAuthLogin = async (req: Request, res: Response) => {
    try {
        const profile = req.user as any;
        const role = (req.query.state as string) || 'SEEKER';
        const provider = profile.provider as 'google' | 'github';

        // Offload DB logic to the service
        const user = await authService.handleOAuthUser(profile, provider);

        // Generate JWT
        const token = generateToken(user, role);

        // Redirect back to frontend with the token
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${role}`);

    } catch (error) {
        console.error("OAuth Error:", error);
        res.redirect(`${FRONTEND_URL}/auth?error=oauth_failed`);
    }
};

import { OtpService } from '../services/otp.service';
import prisma from '../lib/prisma';

const otpService = new OtpService();

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, error: "Email is required" });
            return;
        }

        await otpService.generateAndSendOtp(email);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
};

export const verifyOtpLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, role } = req.body;

        // 1. Verify the code
        const isValid = await otpService.verifyOtp(email, token);
        if (!isValid) {
            res.status(401).json({ success: false, error: "Invalid or expired code" });
            return;
        }

        // 2. Check if user exists, if not, create them (Signup)
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    firstName: email.split('@')[0], // Give them a placeholder name
                    lastName: '',
                    systemRole: 'USER'
                }
            });
        }

        // 3. Generate JWT and send it back
        const jwtToken = generateToken(user, role || 'SEEKER');
        res.status(200).json({ success: true, token: jwtToken });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ success: false, error: "Verification failed" });
    }
};