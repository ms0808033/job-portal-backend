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