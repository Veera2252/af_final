# Google OAuth Setup Guide

This guide will help you configure Google OAuth for your AlphaFly application.

## Step 1: Enable Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Fill in the required fields:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
5. Set the redirect URLs:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://yourdomain.com/auth/callback`
5. Copy the **Client ID** and **Client Secret**

## Step 3: Update Supabase Configuration

Update your `supabase/config.toml` file with your actual Google credentials:

```toml
[auth.external.google]
enabled = true
client_id = "your-actual-google-client-id"
secret = "your-actual-google-client-secret"
redirect_uri = "http://localhost:5173/auth/callback"
scopes = ["email", "profile"]
```

## Step 4: Environment Variables (Optional)

Create a `.env` file in your project root:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 5: Test the Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the login page

3. Click the "Continue with Google" button

4. You should be redirected to Google for authentication

## Troubleshooting

### Common Issues:

1. **"Google sign-in is not configured"**
   - Make sure Google provider is enabled in Supabase
   - Check that your credentials are correct

2. **"Redirect URL mismatch"**
   - Ensure the redirect URLs match exactly in both Google Cloud Console and Supabase
   - Include the protocol (http/https)

3. **"OAuth configuration error"**
   - Verify your Client ID and Client Secret are correct
   - Make sure the Google+ API is enabled

4. **"No OAuth URL received"**
   - Check your Supabase project settings
   - Ensure the site URL is configured correctly

### Debug Mode:

The application now includes enhanced logging. Check the browser console for detailed error messages when testing Google authentication.

## Production Deployment

For production deployment:

1. Update the redirect URLs in Google Cloud Console to use your production domain
2. Update the `site_url` in your Supabase configuration
3. Set the environment variables in your hosting platform
4. Test the authentication flow thoroughly

## Support

If you continue to experience issues:

1. Check the Supabase logs in your dashboard
2. Verify your Google Cloud Console configuration
3. Ensure all redirect URLs are properly configured
4. Contact Supabase support if the issue persists
