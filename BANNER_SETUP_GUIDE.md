# Banner Admin Setup - Complete Guide

## ✅ What I've Done

1. **Created API Route** (`/api/admin/banners/route.js`)
   - Handles POST (insert), PUT (update), DELETE operations
   - Uses JWT verification for admin authentication
   - Uses service role key for database operations (bypasses RLS)

2. **Updated Client Code** (`/admin/banner/add/page.jsx`)
   - Fetches session and passes JWT token to API
   - Added console logging for debugging
   - Better error messages

3. **Updated `.env.local`**
   - Added placeholder for `SUPABASE_JWT_SECRET`

## 🔧 Steps You Need to Complete

### Step 1: Get Your Supabase JWT Secret
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Settings** → **API**
3. Under **JWT Settings**, copy the **JWT Secret**
4. Paste it into `.env.local`:
   ```
   SUPABASE_JWT_SECRET=your_copied_secret_here
   ```

### Step 2: Install jsonwebtoken Package
Run this in your project directory:
```bash
npm install jsonwebtoken
```

### Step 3: Restart Your Development Server
```bash
npm run dev
```

## 🧪 Test It

1. Click "Add New Banner" button
2. Open Browser DevTools → **Console**
3. You should see logs like:
   - `✅ Session retrieved. Token: ...`
   - `API Response: 201 { data: ... }`

## 🔐 How It Works

```
CLIENT (Browser)
  ↓
  1. User logs in → Supabase creates JWT token
  2. User clicks "Add Banner"
  3. Client retrieves session from browser storage
  4. Client sends POST with Authorization: Bearer {token}
  ↓
SERVER (Next.js API Route)
  ↓
  1. Receives request with Bearer token
  2. Uses JWT_SECRET to verify and decode token
  3. Extracts user ID from token
  4. Checks if user ID matches ADMIN_UUID
  5. If admin: Uses service role key to insert into database
  6. If not admin: Returns 403 Forbidden
  ↓
DATABASE (Supabase)
  ↓
  - Service role key bypasses RLS
  - Data inserted directly into banners table
```

## ❌ Troubleshooting

| Error | Solution |
|-------|----------|
| `SUPABASE_JWT_SECRET is not set` | Add it to `.env.local` and restart dev server |
| `Invalid or expired token` | User session expired - refresh page and log in again |
| `Admin access required` | Your user UUID doesn't match `ADMIN_UUID` in the API route |
| `Module not found: jsonwebtoken` | Run `npm install jsonwebtoken` |

## 📝 Your Admin UUID
```
3f08327d-5f25-4440-87d1-aa711eb52fb1
```
This is hardcoded in `/api/admin/banners/route.js` - make sure it matches your Supabase auth user ID!

---

Once you complete these steps, try adding a banner again and check the browser console for detailed logs! 🚀
