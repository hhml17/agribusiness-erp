import { Request, Response, NextFunction } from 'express';
import { ConfidentialClientApplication } from '@azure/msal-node';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
    user?: {
        email: string;
        name: string;
        oid: string; // Azure AD Object ID
    };
}

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'organizations'}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET || ''
    }
};

const msalClient = new ConfidentialClientApplication(msalConfig);

/**
 * Middleware to verify Azure AD token
 *
 * Expected header: Authorization: Bearer <token>
 */
export async function authenticateToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // For development: Simple token validation
        // TODO: Implement proper JWT validation with Azure AD
        if (process.env.NODE_ENV === 'development') {
            // Mock user for development
            req.user = {
                email: 'dev@agribusiness.com',
                name: 'Developer',
                oid: 'dev-user-id'
            };
            next();
            return;
        }

        // Production: Validate token with Azure AD
        // This is a placeholder - implement proper token validation
        try {
            // TODO: Implement proper Azure AD token validation
            // For now, we'll accept the token and extract basic info

            // Decode token (basic implementation)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

            req.user = {
                email: payload.email || payload.preferred_username,
                name: payload.name,
                oid: payload.oid
            };

            next();
        } catch (error) {
            console.error('Token validation error:', error);
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
        return;
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            await authenticateToken(req, res, next);
        } else {
            next();
        }
    } catch (error) {
        next();
    }
}
