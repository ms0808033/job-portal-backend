import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { handleOAuthLogin, requestOtp, verifyOtpLogin } from '../controllers/auth.controller';

const router = Router();

// Configure Google Strategy (Ensure you add these to your .env file)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
},
    (req, accessToken, refreshToken, profile, done) => {
        // Attach profile to request to be handled by our controller
        req.user = profile;
        return done(null, profile);
    }
));

// Configure GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: "/api/auth/github/callback",
    passReqToCallback: true
},
    (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
        req.user = profile;
        return done(null, profile);
    }
));

// Routes
router.get('/google', (req, res, next) => {
    // Pass the selected role in the state parameter
    const state = req.query.role ? req.query.role.toString() : 'SEEKER';
    passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    handleOAuthLogin
);

router.get('/github', (req, res, next) => {
    const state = req.query.role ? req.query.role.toString() : 'SEEKER';
    passport.authenticate('github', { scope: ['user:email'], state })(req, res, next);
});

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    handleOAuthLogin
);
router.post('/otp/send', requestOtp);
router.post('/otp/verify', verifyOtpLogin);

export default router;