# LikaAI Setup & Testing Guide

## Overview
LikaAI has been upgraded with complete authentication, premium features, user preferences, and database integration.

## Features Implemented

### 1. Authentication System
- **Sign Up**: Users can create accounts with name, email, phone, and password
- **Login**: Existing users can log in with email and password
- **Auto-redirect**: After signup, users are automatically switched to login tab
- **Session management**: Users stay logged in across page refreshes

### 2. Email Notifications
- Automatic email sent to `rebbrownlikalani@gmail.com` when new users register
- Contains user details: name, email, phone, registration date

### 3. Premium Subscription System
- Two tiers: Basic ($5/month) and Premium ($15/month)
- Payment form collects: email, phone, card details
- Premium features: PDF exports, unlimited flashcards, priority support
- Subscription data stored in Supabase

### 4. User Preferences & Auto-Learning
- Theme selection (dark, light, solarized)
- Notes level preferences (basic, intermediate, advanced)
- Flashcard difficulty settings
- Auto-learns from user behavior

### 5. Activity Logging
- All user actions tracked in Supabase
- Activities: login, signup, flashcard generation, PDF exports, premium upgrades

### 6. Feedback System
- Users can submit bug reports, feature requests, or general feedback
- Rating system (1-5 stars)
- Feedback stored in database

### 7. Settings Page
- View account information
- Manage premium subscription
- Customize preferences
- View activity history
- Clear data or delete account

## Database Schema

### Tables Created:
1. **profiles** - User profile information
2. **premium_subscriptions** - Premium plan subscriptions
3. **user_preferences** - User settings and preferences
4. **user_activity_logs** - User activity tracking
5. **feedback** - User feedback submissions

## Testing Instructions

### Test Authentication Flow:

1. **Sign Up New User**
   ```
   Navigate to: /src/pages/auth.html
   Click "Sign Up" tab
   Fill in:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890
   - Password: test123
   - Confirm Password: test123
   - Check terms checkbox
   Click "Create Account"
   ```

2. **Verify Email Notification**
   - Check `rebbrownlikalani@gmail.com` for new user notification
   - Email contains user details and registration timestamp

3. **Login**
   ```
   After signup, you'll be switched to login tab
   Email field should be pre-filled
   Enter password: test123
   Click "Login"
   Should redirect to index.html
   ```

4. **Verify Logged In State**
   - Navigation should show user name
   - Settings and Feedback buttons visible
   - Can generate flashcards
   - Premium badge shown if subscribed

### Test Premium Features:

1. **Try PDF Export (without premium)**
   ```
   Generate flashcards
   Click "Export PDF"
   Premium upgrade modal should appear
   ```

2. **Subscribe to Premium**
   ```
   Click "Select Premium" plan
   Fill payment form:
   - Email: user@example.com
   - Phone: +1234567890
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVV: 123
   Click "Complete Purchase"
   ```

3. **Verify Premium Access**
   - Premium badge appears in navigation
   - PDF export now works
   - Subscription visible in settings

### Test Settings Page:

1. **Navigate to Settings**
   ```
   Click settings icon (⚙️) in navigation
   Or go to: /src/pages/settings.html
   ```

2. **Verify Display**
   - Account information shown
   - Premium subscription status visible
   - Preferences editable
   - Activity history displayed

3. **Update Preferences**
   ```
   Change theme to "Light"
   Change notes level to "Advanced"
   Toggle examples/diagrams
   Adjust flashcard difficulty slider
   All changes auto-saved
   ```

### Test Feedback:

1. **Submit Feedback**
   ```
   Click feedback icon (💬) in navigation
   Or go to: /src/pages/feedback.html
   Select feedback type: "Bug"
   Enter subject and message
   Rate experience (1-5 stars)
   Click "Submit Feedback"
   ```

2. **Verify Storage**
   - Feedback appears in history
   - Stored in Supabase feedback table

## API Endpoints

### Edge Function:
- **notify-new-user**: `POST /functions/v1/notify-new-user`
  - Sends email notification on new user registration
  - Payload: `{ name, email, phone }`

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## File Structure

```
/src
  /auth          - Authentication logic
  /config        - Supabase configuration
  /core          - Core application managers
  /feedback      - Feedback system
  /pages         - HTML pages
  /settings      - Settings page logic
  /styles        - CSS files
```

## Key Files:

- `src/auth/auth.js` - Authentication handlers
- `src/core/main.js` - Main application initialization
- `src/core/authManager.js` - Auth state management
- `src/core/premiumManager.js` - Premium subscription logic
- `src/core/preferencesManager.js` - User preferences & auto-learning
- `src/config/supabase.js` - Supabase client setup

## Troubleshooting

### Authentication Issues:
1. Check browser console for errors
2. Verify Supabase URL and anon key in `.env`
3. Ensure RLS policies are enabled on tables

### Email Notifications Not Received:
1. Edge function deployed: Check with `supabase functions list`
2. Email service configured (Resend API key required)
3. Check edge function logs for errors

### Premium Features Not Working:
1. Verify premium subscription in database
2. Check expiry date is in future
3. Status should be 'active'

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Passwords are hashed by Supabase Auth
- Card details: Only last 4 digits stored
- JWT authentication for all API calls

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

For issues or questions, submit feedback through the app or contact support.

---

**LikaAI** - Transform Your Learning with AI
