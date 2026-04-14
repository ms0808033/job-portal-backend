// backend/src/services/auth.service.ts
import prisma from '../lib/prisma';

export class AuthService {
    async handleOAuthUser(profile: any, provider: 'google' | 'github') {
        const email = profile.emails?.[0]?.value;
        if (!email) throw new Error("No email provided by OAuth provider");

        // 1. Check if user exists by provider ID or Email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: provider === 'google' ? profile.id : undefined },
                    { githubId: provider === 'github' ? profile.id : undefined },
                    { email: email }
                ]
            }
        });

        // 2. If new, create them (Signup)
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email,
                    firstName: profile.name?.givenName || profile.displayName || 'First',
                    lastName: profile.name?.familyName || 'Last',
                    googleId: provider === 'google' ? profile.id : null,
                    githubId: provider === 'github' ? profile.id : null,
                    avatarUrl: profile.photos?.[0]?.value || null,
                }
            });
        } else {
            // 3. If exists but missing this specific provider ID, link it
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: provider === 'google' ? profile.id : user.googleId,
                    githubId: provider === 'github' ? profile.id : user.githubId,
                    avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                }
            });
        }

        return user;
    }
}