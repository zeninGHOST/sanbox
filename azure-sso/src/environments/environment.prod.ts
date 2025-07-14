export const environment = {
  production: true,
  msalConfig: {
    auth: {
      clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD App Registration Client ID
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
      redirectUri: 'https://yourdomain.com'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me'
  }
};
