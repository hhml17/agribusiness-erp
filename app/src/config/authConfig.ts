/**
 * Configuración de Azure AD (MSAL)
 * Compartida con el Portal BI para SSO consistente
 */

import type { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '6df64cf9-c03e-43ed-93fa-fd61ca10dc84',
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'organizations'}`,
        redirectUri: window.location.origin + '/app',
        postLogoutRedirectUri: window.location.origin
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
