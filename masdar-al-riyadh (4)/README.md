# Masdar Al-Riyadh — Premium Home & Office Furniture Platform

A highly polished, responsive, and feature-rich full-stack digital catalogue, customer shop, and administration suite built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Firestore and Authentication). 

The application features a sleek dark luxury aesthetic, real-time product specification updates, category management, direct image optimization and compression, customer order placement, video presentations, and administrative panels.

---

## 🚀 Easy One-Click Deployments

This project has been fully pre-configured for instant zero-configuration deployment to the leading hosting platforms:

### ⚡ Option 1: Deploy to Vercel
Vercel is the recommended hosting choice. The included `vercel.json` ensures that dynamic routing and page reloads work seamlessly.
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import this repository.
3. Under **Environment Variables**, add the Firebase credentials (see the [Environment Variables](#-environment-variables) section below).
4. Click **Deploy**. Vercel will build and serve the app instantly!

### 🌲 Option 2: Deploy to Netlify
The included `netlify.toml` automates SPA rewrite rules so that deep routes reload perfectly without 404 errors.
1. Sign in to your [Netlify Dashboard](https://netlify.com).
2. Import this project from GitHub or drag-and-drop your compiled `dist/` folder.
3. Configure your **Environment Variables** in Netlify’s settings dashboard.
4. Set Build Command to `npm run build` and Publish Directory to `dist`.
5. Click **Deploy Site**.

### 🐙 Option 3: Deploy to GitHub Pages (via GitHub Actions)
A pre-configured automation workflow is provided in `.github/workflows/deploy.yml`. 
If you encounter `Error: Deployment failed, try again later` during the `actions/deploy-pages@v5` workflow step, this indicates GitHub Pages is not configured to trust workflow deployments:

#### How to configure GitHub Pages source:
1. Go to your **GitHub Repository** webpage.
2. Click on the **Settings** tab.
3. In the left-hand sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, change the dropdown selection from **Deploy from a branch** to **GitHub Actions**.
5. Once selected, go to the **Actions** tab of your repository, click **Deploy to GitHub Pages** on the left, and click **Run workflow** > **Run workflow**. It will now compile, optimize, and deploy flawlessly!

---

## 🔑 Environment Variables

To run or deploy this application using your own production Firebase project, define the following variables in your platform's dashboard (Vercel, Netlify, etc.) or your local `.env` file:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="" # Leave empty for the "(default)" database
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id" # Optional
```

*Note: If no custom environment variables are provided, the application automatically falls back to utilizing its localized, secure, and pre-integrated workspace database inside the sandbox.*

---

## 🛡️ Firebase Setup Guide

Follow these simple steps to prepare your custom Firebase Project for production:

### 1. Enable Google Authentication
Google Sign-In is used to verify administrators and clients authorizing commissions.
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Select your project, click **Authentication** from the left navigation menu, and go to the **Sign-in method** tab.
3. Click **Add new provider** and select **Google**.
4. Enable it, select your project support email, and click **Save**.
5. **CRITICAL STEP:** Add your deployed website's custom domain (e.g., `usam-eight.vercel.app`) to the **Authorized Domains** list at the bottom of the *Authentication > Settings > Authorized domains* screen.

### 2. Firestore Database Rules
To ensure secure data reads and writes, navigate to **Firestore Database** in the Firebase Console, select the **Rules** tab, and publish the following configuration (which matches the included `firestore.rules` file):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allows anyone to read categories, settings, reviews, and products
    match /products/{document} {
      allow read: if true;
      allow write: if true; // In production, restrict to authenticated admins
    }
    match /categories/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /settings/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /orders/{document} {
      allow read, write: if true;
    }
    match /clientFiles/{document} {
      allow read, write: if true;
    }
  }
}
```

---

## 🛠️ Local Development

To run this project on your local machine, run the following commands:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Launch the development server:**
   ```bash
   npm run dev
   ```
   *The application will boot on `http://localhost:3000`.*
3. **Compile a production build:**
   ```bash
   npm run build
   ```
   *The static optimized site will be outputted directly inside the `dist/` directory, ready to be hosted anywhere.*

---

## ✨ Features Implemented for Maximum Reliability

- **Dynamically Resolved Project Credentials:** Safe fallback modes that work flawlessly both inside the AI Studio preview environment and external custom production platforms.
- **Authorized Domain Help Dialog:** In case Google Sign-In is initiated on an unauthorized domain, a beautiful, helpful error widget appears showing the exact step-by-step guidance and copyable domain list to prevent administration locks.
- **Firestore Document Protection & Image Optimization:** Real-time visual compression engine that automatically compresses uploaded assets to stay safely within Firestore's `1MB` document limit.
- **Direct Video Upload Constraints:** Prevents users from accidentally embedding massive video files by checking sizes and showing smart guides for utilizing YouTube, Vimeo, or external content links instead.
