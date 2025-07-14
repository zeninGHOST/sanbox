# Angular v9 Azure SSO Application

This is an Angular v9 application that implements Azure Single Sign-On (SSO) authentication using MSAL (Microsoft Authentication Library) v2. The application automatically authenticates users and displays their information from the Azure AD token.

## Features

- **Angular v9** with TypeScript
- **Azure AD Authentication** using MSAL v2
- **Automatic authentication redirect** to dashboard
- **Protected routes** with authentication guards
- **Dashboard** displaying user information from Azure AD token
- **Responsive design** with modern CSS styling

## Prerequisites

- Node.js v18+ (with OpenSSL legacy provider support)
- Azure AD tenant and application registration
- Angular CLI v9

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd angular-azure-sso
npm install
```

### 2. Azure AD Configuration

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: Angular Azure SSO App
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web - `http://localhost:4200`
5. Click **Register**
6. Note down the **Application (client) ID** and **Directory (tenant) ID**
7. Go to **Authentication** and add the following redirect URIs:
   - `http://localhost:4200`
   - `http://localhost:4200/dashboard`
8. Enable **Implicit grant and hybrid flows** for **Access tokens** and **ID tokens**

### 3. Update Environment Configuration

Update the MSAL configuration in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD Application ID
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
      redirectUri: 'http://localhost:4200',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
};
```

Also update `src/environments/environment.prod.ts` with your production values.

### 4. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:4200`.

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── auth.service.ts      # MSAL authentication service
│   │   └── auth.guard.ts        # Route guard for protected routes
│   ├── dashboard/
│   │   ├── dashboard.component.ts    # Dashboard component with user info
│   │   ├── dashboard.component.html  # Dashboard template
│   │   └── dashboard.component.css   # Dashboard styles
│   ├── app.component.ts         # Main app component
│   ├── app.module.ts           # App module with MSAL configuration
│   └── app-routing.module.ts   # Routing configuration
├── environments/
│   ├── environment.ts          # Development environment config
│   └── environment.prod.ts     # Production environment config
└── styles.css                 # Global styles
```

## Authentication Flow

1. User navigates to the application
2. Auth guard checks if user is authenticated
3. If not authenticated, user is redirected to Azure AD login
4. After successful authentication, user is redirected to the dashboard
5. Dashboard displays user information from the Azure AD token

## Key Components

### AuthService
- Handles MSAL authentication operations
- Provides methods for login, logout, and token acquisition
- Exposes user authentication state

### AuthGuard
- Protects routes that require authentication
- Automatically triggers login if user is not authenticated
- Uses MSAL v2 Observable-based API

### Dashboard Component
- Displays authenticated user information
- Shows user's name, email, and other available profile data
- Styled with modern CSS for a professional appearance

## Development Notes

- This project uses Node.js v18 with `--openssl-legacy-provider` flag for compatibility with Angular v9
- MSAL v2 is used for compatibility with Angular v9
- All scripts in `package.json` include the necessary Node.js flags

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint

## Troubleshooting

### Build Issues
If you encounter build issues with Node.js v18, the project is configured to use the legacy OpenSSL provider. All npm scripts include the necessary flags.

### Authentication Issues
1. Verify your Azure AD configuration
2. Check that redirect URIs are correctly configured
3. Ensure the client ID and tenant ID are correct in environment files
4. Check browser console for MSAL error messages

### CORS Issues
Make sure your Azure AD app registration includes the correct redirect URIs for your application.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.
