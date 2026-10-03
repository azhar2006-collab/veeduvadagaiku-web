# Veedu Vadagaiku (வீடு வாடகைக்கு)

> **Chennai's Dedicated Rental Marketplace for Houses & Commercial Shops**

A complete, production-ready rental marketplace web application connecting tenants with verified property owners across Chennai. Built with a clean, decoupled architecture ready to be converted into an Android/iOS app via Capacitor without re-architecting the core code.

---

## 📑 Table of Contents
1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Database Setup & Migrations](#database-setup--migrations)
5. [Local Development Instructions](#local-development-instructions)
6. [Production Deployment Instructions](#production-deployment-instructions)
7. [Admin Account Creation](#admin-account-creation)
8. [Razorpay Payment Gateway Setup](#razorpay-payment-gateway-setup)
9. [Cloudinary Image Storage Configuration](#cloudinary-image-storage-configuration)
10. [Firebase OTP & Google Auth Setup](#firebase-otp--google-auth-setup)
11. [Testing Checklist](#testing-checklist)
12. [Future Mobile App Conversion (Capacitor)](#future-mobile-app-conversion-capacitor)

---

## 1. Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Mobile-first responsive real estate theme)
- **State Management**: Zustand (Auth, Local persistence)
- **Data Fetching / Cache**: TanStack React Query v5
- **Routing**: React Router DOM v6 (35 dedicated routes)
- **Forms**: React Hook Form + Zod
- **Image Uploads**: react-dropzone
- **Notifications**: react-hot-toast
- **SEO**: react-helmet-async with Open Graph tags
- **Auth SDK**: Firebase JS SDK (reCAPTCHA Phone OTP + Google OAuth)

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database / ORM**: PostgreSQL via Prisma ORM
- **Authentication**: Firebase Admin SDK (token verification) + JWT session cookies/Bearer tokens
- **Payment Processing**: Razorpay (Server-side HMAC-SHA256 signature verification + Webhook capture)
- **Cloud Storage**: Cloudinary (Automatic resizing, optimization, and secure asset management)
- **Security**: Helmet, CORS, Express-Rate-Limit (Auth & Upload limiters), Zod input sanitization

---

## 2. Project Structure

```
veeduvadagaiku-web/
├── package.json                   # Root monorepo scripts
├── README.md                      # Comprehensive documentation
├── backend/                       # Express + Prisma API
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL Schema (Users, Owners, Properties, Payments, etc.)
│   │   └── seed.ts                # Database Seeder (Listing plans & defaults)
│   └── src/
│       ├── server.ts              # Server startup & graceful shutdown
│       ├── app.ts                 # Express configuration, CORS, rate limits
│       ├── config/
│       │   ├── database.ts        # Prisma client singleton
│       │   ├── firebase.ts        # Firebase Admin SDK init
│       │   ├── cloudinary.ts      # Cloudinary image client
│       │   └── razorpay.ts        # Razorpay payment client
│       ├── controllers/           # Route logic (Auth, Properties, Payments, Admin, etc.)
│       ├── middleware/            # Auth, AdminAuth, OwnerAuth, Upload, ErrorHandler
│       ├── routes/                # Express API routes
│       ├── utils/                 # JWT, Response helpers, Validators, Chennai Localities
│       └── types/                 # TypeScript interfaces
│
└── frontend/                      # React 18 + Vite App
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx                # Master routing (35 pages)
        ├── main.tsx               # Bootstrap & Providers
        ├── config/firebase.ts     # Firebase Client SDK
        ├── lib/                   # Axios client & TanStack Query client
        ├── store/authStore.ts     # Zustand auth store with localStorage
        ├── hooks/                 # Custom hooks (useAuth, useProperties, useFavourites, etc.)
        ├── services/              # API Client Services
        ├── components/
        │   ├── common/            # Navbar, Footer, Loader, ConfirmDialog, EmptyState
        │   ├── property/          # PropertyCard, PropertyGrid, PropertyFilters, Gallery, Uploader
        │   ├── auth/              # PhoneOTPForm, GoogleSignInButton
        │   └── dashboard/         # StatCard, DashboardSidebar
        ├── layouts/               # PublicLayout, UserLayout, OwnerLayout, AdminLayout
        └── pages/
            ├── public/            # Home, Search, Houses, Shops, Details, Login, Register, Terms, Privacy
            ├── user/              # UserDashboard, Profile, Favourites, Enquiries
            ├── owner/             # OwnerDashboard, Properties, Add, Edit, Plans, Payment, Result
            └── admin/             # AdminLogin, Dashboard, Users, Owners, Properties, Pending, Payments, Plans
```

---

## 3. Environment Variables

### Backend (`backend/.env`)
```ini
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database (e.g. Supabase, Neon, or local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/veeduvadagaiku"

# JWT Authentication
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Firebase Admin SDK (From Firebase Console > Service Accounts)
FIREBASE_PROJECT_ID=veeduvadagaiku-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@veeduvadagaiku-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...YOUR_KEY...\n-----END PRIVATE KEY-----\n"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Indian Payment Gateway
RAZORPAY_KEY_ID=rzp_test_YourKeyHere
RAZORPAY_KEY_SECRET=YourSecretKeyHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

# Nodemailer / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@veeduvadagaiku.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@veeduvadagaiku.com
FROM_NAME="Veedu Vadagaiku"

# Admin Setup
ADMIN_SECRET_KEY=chennai_admin_setup_secret_key_2026
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=veeduvadagaiku-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=veeduvadagaiku-app
VITE_FIREBASE_STORAGE_BUCKET=veeduvadagaiku-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyHere
```

---

## 4. Database Setup & Migrations

1. Ensure PostgreSQL is running locally or create a free PostgreSQL instance on [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech).
2. Configure `DATABASE_URL` in `backend/.env`.
3. Generate the Prisma Client:
   ```bash
   cd backend
   npx prisma generate
   ```
4. Run migrations to create all database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed initial listing plans (Basic ₹499, Standard ₹999, Premium ₹1999):
   ```bash
   npx prisma db seed
   # or
   npm run prisma:seed
   ```

---

## 5. Local Development Instructions

### Running Both Services Concurrently
From the root directory:
```bash
# 1. Install all dependencies
npm run install:all

# 2. Run backend in one terminal
npm run dev:backend

# 3. Run frontend in another terminal
npm run dev:frontend
```

The frontend will be available at: `http://localhost:5173`  
The backend API will be available at: `http://localhost:5000`

---

## 6. Production Deployment Instructions

### Backend (Node/Docker on Render, Railway, AWS EC2, or VPS)
1. Build TypeScript:
   ```bash
   cd backend
   npm run build
   ```
2. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Start the production server:
   ```bash
   npm start
   ```

### Frontend (Vercel, Netlify, or Cloudflare Pages)
1. Set the root directory to `frontend/`.
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add all `VITE_*` environment variables in your hosting dashboard.
5. Setup SPA rewrite rules (e.g. `/* -> /index.html 200` in Netlify or `vercel.json`).

---

## 7. Admin Account Creation Instructions

1. Register or log in to the website using your desired admin Google account or mobile number.
2. In your PostgreSQL database (via `psql` or `npx prisma studio`):
   ```sql
   UPDATE "User"
   SET "role" = 'ADMIN'
   WHERE "email" = 'admin@yourcompany.com';
   ```
3. Log in through `/admin/login` using this account. You now have full access to:
   - Moderating paid listings (`/admin/pending`)
   - Approving and rejecting property ads with custom feedback
   - Managing Chennai landlords and tenants
   - Supervising Razorpay payments and platform revenue
   - Modifying listing plans & durations

---

## 8. Razorpay Payment Gateway Configuration

1. Create a free merchant account on [Razorpay](https://razorpay.com).
2. In Razorpay Dashboard > **Settings** > **API Keys**:
   - Copy `Key Id` into `backend/.env` as `RAZORPAY_KEY_ID` and `frontend/.env` as `VITE_RAZORPAY_KEY_ID`.
   - Copy `Key Secret` into `backend/.env` as `RAZORPAY_KEY_SECRET`.
3. In Razorpay Dashboard > **Webhooks**:
   - Add endpoint URL: `https://your-api-domain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy Webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
4. **Security Note**: Never trust the frontend redirect alone! The backend cryptographically validates the HMAC-SHA256 signature (`razorpay_order_id + '|' + razorpay_payment_id`) against `RAZORPAY_KEY_SECRET` before changing property status to `PENDING_APPROVAL`. Unpaid properties can **never** be published.

---

## 9. Cloudinary Image Storage Configuration

1. Create a free account at [Cloudinary](https://cloudinary.com).
2. From your Cloudinary Dashboard:
   - Copy **Cloud Name**, **API Key**, and **API Secret**.
3. Place them into `backend/.env`.
4. Property images are uploaded through the backend memory buffer to Cloudinary with automatic optimization (`quality: 'auto:good'`, max dimensions `1200x800`). Secure URLs and public IDs are saved in the PostgreSQL `PropertyImage` table.

---

## 10. OTP & Google Authentication Configuration

1. Open [Firebase Console](https://console.firebase.google.com) and create a project (`veeduvadagaiku`).
2. Go to **Authentication** > **Sign-in method**:
   - Enable **Phone** authentication (Enter test phone numbers with static OTPs for development).
   - Enable **Google** authentication.
3. In **Project Settings** > **General**:
   - Register a Web App and copy the config credentials into `frontend/.env`.
4. In **Project Settings** > **Service Accounts**:
   - Click **Generate new private key** (JSON file).
   - Extract `project_id`, `client_email`, and `private_key` into `backend/.env`.

---

## 11. Testing Checklist

Use this checklist to verify the full end-to-end functionality:

### 🏠 Public Tenant Flow
- [ ] Open homepage: hero search displays Chennai localities, house/shop selector, and budget.
- [ ] Filter by "Houses" and "Shops" — correct listings are rendered.
- [ ] Select Chennai locality (e.g., Anna Nagar, T. Nagar, Velachery) and check filtered results.
- [ ] Open a property details page: view high-resolution photo gallery, specifications, and amenities.
- [ ] Click "Chat on WhatsApp": opens WhatsApp with prefilled property title and locality.
- [ ] Click "Call Landlord": dials owner phone number directly on mobile.
- [ ] Send direct enquiry: verifies authentication, creates database record, and notifies owner.
- [ ] Toggle shortlist heart icon: property appears in Tenant Dashboard under Saved Properties.

### 🏢 Property Owner Flow
- [ ] Register as Property Owner via Phone OTP or Google Sign-In.
- [ ] Complete owner profile.
- [ ] Add Property: select House or Shop, specify Chennai locality, address, rent, deposit, size, and amenities.
- [ ] Upload multiple property photos with preview and delete options.
- [ ] Save property: property created in `DRAFT` status and redirected to Listing Plans.
- [ ] Select Listing Plan (Basic / Standard / Premium).
- [ ] Razorpay modal opens with proper amount in ₹ (paise).
- [ ] Complete payment: backend verifies cryptographic HMAC signature, sets payment to `SUCCESS`, and moves property status to `PENDING_APPROVAL`.
- [ ] Verify that property is **NOT** visible in public search yet.

### 🛡️ Admin Moderation Flow
- [ ] Access `/admin/login` and authenticate with an admin account.
- [ ] Admin Dashboard displays correct live counts (total properties, published, pending approvals, revenue).
- [ ] Navigate to `/admin/pending`: review paid listing details, uploaded photos, and owner contact.
- [ ] Click **Approve & Publish**: property status moves to `PUBLISHED` with expiration date set.
- [ ] Verify that the newly approved property is now immediately visible in public search and category pages.
- [ ] Test **Reject Ad**: enter rejection reason. Property owner receives rejection feedback in their dashboard to edit and resubmit.
- [ ] Admin can manage users, owners, review transaction logs, and edit subscription plans.

---

## 12. Future Mobile App Conversion (Capacitor)

The codebase has been designed with responsive, mobile-first layouts and clean API separation:
- Touch targets exceed 44px for native feel.
- Standard web APIs (`tel:`, `https://wa.me/`, `navigator.share`) work seamlessly in WebViews.
- To convert to an Android / iOS app in the future without rewriting:
  ```bash
  cd frontend
  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
  npx cap init "Veedu Vadagaiku" "com.veeduvadagaiku.app"
  npm run build
  npx cap add android
  npx cap add ios
  npx cap copy
  ```
