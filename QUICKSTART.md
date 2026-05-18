# ⚡ Quick Start Deployment

**Time to deploy**: ~15 minutes

Follow these steps **in order**. Don't skip any step!

---

## 🔑 Step 1: Generate Secure Token

```bash
# Generate a secure token (save this!)
openssl rand -base64 32
```

**Copy this token** - you'll use it in both Cloudflare and Railway.

---

## ☁️ Step 2: Deploy to Cloudflare Pages

```bash
# Login
npx wrangler login

# Create D1 database
npx wrangler d1 create tiktok-analyzer-db
```

**IMPORTANT**: Copy the `database_id` from the output!

Open `wrangler.toml` and paste your `database_id` on line 14.

```bash
# Run migrations
npx wrangler d1 execute tiktok-analyzer-db --remote --file=drizzle/0000_initial.sql

# Build
npm run build

# Create project
npx wrangler pages project create viewlify

# Deploy
npx wrangler pages deploy dist/client --project-name=viewlify
```

**Copy your URL** (looks like: `https://viewlify-xxx.pages.dev`)

### Configure Cloudflare

Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → viewlify:

1. **Settings → Environment variables** (Production):
   - Add `SIDECAR_TOKEN` = your token from Step 1
   - Add `NODE_VERSION` = `20`

2. **Settings → Functions → D1 database bindings**:
   - Variable name: `DB`
   - D1 database: `tiktok-analyzer-db`

---

## 🚂 Step 3: Deploy Sidecar to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

Choose:
- Create new project: **Yes**
- Project name: **viewlify-sidecar**

```bash
# Set environment variables (replace with YOUR values)
railway variables set APP_URL=https://viewlify-xxx.pages.dev
railway variables set SIDECAR_TOKEN=your-token-from-step-1
railway variables set WORKER_ID=railway-worker-1

# Deploy!
railway up
```

Wait 2-3 minutes for deployment to complete.

```bash
# Check logs (should show "leasing jobs...")
railway logs
```

---

## ✅ Step 4: Test Your Deployment

1. Visit your Cloudflare Pages URL
2. Click "Analyze Your First Profile Free"
3. Enter: `@charlidamelio`
4. Click "Analyze"

If videos appear, **congrats! 🎉 You're deployed!**

---

## 🐛 Something Not Working?

### Frontend loads but analysis doesn't work

```bash
# Check Railway logs
railway logs

# Verify environment variables match
railway variables
```

Make sure `APP_URL` in Railway matches your Cloudflare URL **exactly**.

### "Database error"

```bash
# Re-run migrations
npx wrangler d1 execute tiktok-analyzer-db --remote --file=drizzle/0000_initial.sql

# Check database binding in Cloudflare Dashboard
# Pages → viewlify → Settings → Functions → D1 database bindings
```

### Sidecar not picking up jobs

Check `SIDECAR_TOKEN` is **identical** in:
- Cloudflare: Dashboard → Pages → viewlify → Settings → Environment variables
- Railway: `railway variables`

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation, troubleshooting, and advanced setup.

---

## 💰 Costs

- Cloudflare: **Free**
- Railway: **$5/month**
- Total: **$5/month**

---

## 🎯 Next Steps

1. ✅ Test the full flow
2. 📊 Set up monitoring (Railway dashboard)
3. 🌐 Add custom domain (optional)
4. 🤖 Set up GitHub Actions for auto-deploy
5. 📈 Add analytics (Google Analytics/Plausible)

**Your app is live! Go get those viral insights! 🚀**
