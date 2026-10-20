# Vercel Deployment Guide — CrossCash 🚀

This guide explains how to deploy **CrossCash** to [Vercel](https://vercel.com) and make it live in under 2 minutes.

---

## 🏗️ Deployment Architecture

CrossCash consists of:
1. **Frontend**: Next.js 16 (App Router + Turbopack + Tailwind CSS v4)
2. **Backend API**: Node.js & Express API with MongoDB Mongoose
3. **Database**: MongoDB Atlas Cloud Cluster

---

## 🚀 Option 1: Deploy Frontend to Vercel (Recommended)

### Step 1: Import Repository to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Select the repository **`Fahim-p2062/crossCash`** and click **Import**.

### Step 2: Configure Project Settings
In the Vercel project configuration screen:
- **Framework Preset**: `Next.js`
- **Root Directory**: Click **Edit** and select `frontend` (or leave as root with the included root build scripts).
- **Build Command**: `next build` (Default)
- **Output Directory**: `.next` (Default)

### Step 3: Configure Environment Variables
Under **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | URL of your deployed backend API (Render, Railway, or Vercel Backend). |
| `BACKEND_API_URL` | `https://your-backend-url.com` | (Optional) Used by Next.js server-side rewrites to proxy `/api/*` directly without CORS issues. |

Click **Deploy**! In about 60 seconds, your site will be live at `https://crosscash-xxx.vercel.app`.

---

## ⚡ Option 2: Deploy Backend to Vercel / Render

### Deploying Backend to Vercel:
The backend includes a pre-configured [backend/vercel.json](backend/vercel.json) serverless configuration:
1. In Vercel, click **Add New Project** and select `Fahim-p2062/crossCash`.
2. Set **Root Directory** to `backend`.
3. Add the environment variables:
   - `MONGO_URI`: `mongodb+srv://...` (your MongoDB Atlas connection string)
   - `JWT_SECRET`: Your 32+ character JWT secret
   - `FRONTEND_ORIGIN`: Your live frontend Vercel URL (e.g. `https://crosscash.vercel.app`)
4. Click **Deploy**. Your API will be live at `https://crosscash-backend-xxx.vercel.app`.

### Deploying Backend to Render / Railway:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: `5000`
- Set `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_ORIGIN`.

---

## 🧪 Local Testing

To test the production build locally before or after deploying:
```bash
# In frontend directory
npm run build
npm start
```
Frontend runs locally in production mode on `http://localhost:3000`.
