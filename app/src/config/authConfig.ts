/**
 * Configuración de Azure AD (MSAL)
 * Compartida con el Portal BI para SSO consistente
 */

import type { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '185a1a46-e8fe-4dc9-97b0-22629f47f8be',
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'ddf2df3e-9f06-4201-a06c-b71c69f64818'}`,
        redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
        postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
    }
};

export const loginRequest: PopupRequest = {
    scopes: ['user.read', 'openid', 'profile', 'email']
};

export const apiRequest = {
    scopes: ['api://your-api-scope'] // Actualizar cuando tengamos API
};
