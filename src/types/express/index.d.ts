// backend/src/types/express/index.d.ts
export { };

declare global {
    namespace Express {
        export interface Request {
            user?: {
                userId: string;
                tenantId: string;
                systemRole: 'USER' | 'SUPER_ADMIN';
            };
        }
    }
}