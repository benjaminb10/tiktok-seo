# 🚀 Deployment Guide - Cloudflare Pages + Railway

This guide will help you deploy **Viewlify.app** with:
- **Frontend/API**: Cloudflare Pages (Free tier)
- **Sidecar Worker**: Railway ($5/month)
- **Database**: Cloudflare D1 (Free tier)

**Total cost**: ~$5/month

---

## 📋 Prerequisites

1. **Accounts**:
   - [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
   - [Railway account](https://railway.app) ($5/month)
   - GitHub account (for CI/CD)

2. **Tools to install**:
   ```bash
   # Wrangler CLI (Cloudflare)
   npm install -g wrangler

   # Railway CLI
   npm install -g @railway/cli
   ```

---

## 🌩️ Part 1: Deploy to Cloudflare Pages

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate.

### Step 2: Create D1 Database

```bash
# Create the database
npx wrangler d1 create tiktok-analyzer-db
```

**Copy the output!** You'll see something like:
```
[[d1_databases]]
binding = "DB"
database_name = "tiktok-analyzer-db"
database_id = "xxxx-xxxx-xxxx-xxxx"  # ← COPY THIS ID
```

### Step 3: Update wrangler.toml

Open `wrangler.toml` and add your database ID:

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "tiktok-analyzer-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Paste your ID here
```

### Step 4: Run Database Migrations

```bash
# Apply migrations to production D1
npx wrangler d1 execute tiktok-analyzer-db --remote --file=drizzle/0000_initial.sql
```

### Step 5: Build Your Application

```bash
npm run build
```

### Step 6: Deploy to Cloudflare Pages

```bash
# Create Pages project
npx wrangler pages project create viewlify

# Deploy
npx wrangler pages deploy dist/client --project-name=viewlify
```

You'll get a URL like: `https://viewlify.pages.dev`

### Step 7: Configure Environment Variables

Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → viewlify → Settings → Environment variables

Add these variables for **Production**:

| Variable | Value |
|----------|-------|
| `SIDECAR_TOKEN` | Generate a secure random string (use: `openssl rand -base64 32`) |
| `NODE_VERSION` | `20` |

**Save your `SIDECAR_TOKEN`** - you'll need it for Railway!

### Step 8: Bind D1 Database

In Cloudflare Dashboard → Pages → viewlify → Settings → Functions:

1. Scroll to "D1 database bindings"
2. Add binding:
   - Variable name: `DB`
   - D1 database: `tiktok-analyzer-db`
3. Save

---

## 🚂 Part 2: Deploy Sidecar to Railway

### Step 1: Login to Railway

```bash
railway login
```

### Step 2: Initialize Project

```bash
railway init
```

Choose:
- Create new project: **Yes**
- Project name: **viewlify-sidecar**

### Step 3: Configure Environment Variables

```bash
# Set your Cloudflare Pages URL
railway variables set APP_URL=https://viewlify.pages.dev

# Set the SAME sidecar token you used in Cloudflare
railway variables set SIDECAR_TOKEN=your-token-from-cloudflare

# Set worker ID
railway variables set WORKER_ID=railway-worker-1

# Set concurrency (optional)
railway variables set SIDECAR_CONCURRENCY=5

# Set metadata limit (optional)
railway variables set METADATA_LIMIT=100
```

### Step 4: Deploy

```bash
railway up
```

This will:
1. Upload your code
2. Install Node.js 20
3. Install Python 3 and yt-dlp
4. Start the sidecar worker

### Step 5: Verify Deployment

```bash
# Check logs
railway logs
```

You should see:
```
[sidecar] leasing jobs...
```

---

## 🔄 Part 3: Setup Automatic Deployments (Optional)

### GitHub Actions for Cloudflare

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: viewlify
          directory: dist/client
```

**Setup GitHub Secrets**:

1. Get your Cloudflare API Token:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Create Token → Edit Cloudflare Workers → Use template
   - Permissions: Account - Cloudflare Pages (Edit)

2. Get your Account ID:
   - Cloudflare Dashboard → Pages → viewlify → Copy Account ID

3. Add to GitHub:
   - GitHub repo → Settings → Secrets and variables → Actions
   - Add:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`

### Railway Auto-Deploy

Railway automatically deploys from GitHub:

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Project settings → Connect to GitHub
3. Select your repository
4. Every push to `main` will auto-deploy!

---

## 🔧 Part 4: Custom Domain (Optional)

### Add Custom Domain to Cloudflare Pages

1. Cloudflare Dashboard → Pages → viewlify → Custom domains
2. Click "Set up a custom domain"
3. Enter: `viewlify.app`
4. Cloudflare will automatically configure DNS

**Update Railway**:
```bash
railway variables set APP_URL=https://viewlify.app
```

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Visit your Cloudflare Pages URL
- [ ] Landing page loads correctly
- [ ] Try analyzing a TikTok profile (e.g., `@charlidamelio`)
- [ ] Check Railway logs: `railway logs`
- [ ] Verify sidecar is processing jobs
- [ ] Check D1 database has data: `npx wrangler d1 execute tiktok-analyzer-db --remote --command="SELECT * FROM runs LIMIT 5"`

---

## 🐛 Troubleshooting

### Frontend doesn't load
- Check build output: `npm run build`
- Verify Cloudflare deployment: `npx wrangler pages deployment list --project-name=viewlify`

### Sidecar not working
```bash
# Check Railway logs
railway logs

# Verify environment variables
railway variables

# Test yt-dlp installation
railway run yt-dlp --version
```

### Database errors
```bash
# Check D1 connection
npx wrangler d1 execute tiktok-analyzer-db --remote --command="SELECT 1"

# Re-run migrations if needed
npx wrangler d1 execute tiktok-analyzer-db --remote --file=drizzle/0000_initial.sql
```

### CORS errors
- Verify `APP_URL` in Railway matches your Cloudflare URL
- Check `SIDECAR_TOKEN` is identical in both services

---

## 💰 Costs Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Cloudflare Pages | Free | $0 |
| Cloudflare D1 | Free (100k reads/day) | $0 |
| Railway | Hobby | $5/month |
| **Total** | | **$5/month** |

---

## 📚 Useful Commands

```bash
# === Cloudflare ===

# Deploy frontend
npm run build && npx wrangler pages deploy dist/client --project-name=viewlify

# Check D1 database
npx wrangler d1 execute tiktok-analyzer-db --remote --command="SELECT COUNT(*) FROM videos"

# View logs
npx wrangler pages deployment tail --project-name=viewlify


# === Railway ===

# Deploy sidecar
railway up

# View logs
railway logs

# SSH into container
railway run bash

# Restart service
railway restart


# === Local Development ===

# Run frontend locally
npm run dev

# Run sidecar locally
npm run sidecar

# Run database migrations locally
npm run db:migrate:local
```

---

## 🎉 Success!

Your app is now live at:
- 🌐 **Frontend**: https://viewlify.pages.dev (or your custom domain)
- 🤖 **Sidecar**: Running on Railway
- 💾 **Database**: Cloudflare D1

Next steps:
1. Test the full flow (analyze a profile)
2. Monitor Railway logs for any issues
3. Set up a custom domain
4. Add monitoring/analytics
5. Configure GitHub Actions for CI/CD

---

## 📞 Need Help?

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Railway Docs**: https://docs.railway.app/
- **Issues**: Create an issue on GitHub
