# 🚀 Viewlify.app - Global Development Roadmap

---

## 📊 STATUT ACTUEL (Mise à jour: Mai 2026)

| Phase | Statut | Progression |
|-------|--------|-------------|
| Phase 0 - Fondations | ✅ Complété | 90% |
| Phase 1 - SEO Machine | 🟡 En cours | 40% |
| Phase 2 - Partage Viral | ⏳ Non démarré | 0% |
| Phase 3 - AI Insights | 🟡 Partiel | 30% |
| Phase 4 - Competitor Tracking | ⏳ Non démarré | 0% |
| Phase 5 - Monétisation | ✅ Complété | 95% |
| Phase 6 - Advanced Features | ⏳ Non démarré | 0% |
| Phase 7 - Agency Features | ⏳ Non démarré | 0% |
| Phase 8 - Polish & Growth | ⏳ Non démarré | 0% |

### 🎉 Fonctionnalités Implémentées

**Authentification & Users:**
- Better Auth avec Google OAuth
- Session management
- Tiers utilisateurs (free/creator/pro/agency)

**Stripe & Monétisation:**
- Checkout sessions avec trial 7 jours
- Webhooks complets (subscription lifecycle)
- Customer portal
- Pricing page avec toggle monthly/yearly

**Système de Quotas:**
- Tracking analyses, exports, AI insights par mois
- Modales paywall (AnalysisLimitModal, AiQuotaModal, ExportPaywallModal)
- Composants UI (QuotaSummaryCard, QuotaBadge, VideoLimitBanner)

**SEO & Pages Publiques:**
- Pages profils publiques (`/profile/$username`)
- OG images dynamiques (SVG)
- Meta tags SSR

**AI Features:**
- Chat AI avec Claude Haiku (streaming SSE)
- Contexte automatique avec données du profil
- Intégration quotas AI

**Landing Page:**
- Hero, Features, Benefits, How it works
- Testimonials, Use cases, Problem-solution
- Pricing preview, FAQ, CTA sections

---

## 🎯 Vision Stratégique

**Positionnement actuel :** Scraper TikTok basique
**Positionnement cible :** TikTok Growth Intelligence Platform

**Proposition de valeur :**
> "Découvrez pourquoi certaines vidéos TikTok explosent. Analysez n'importe quel compte, détectez les hooks viraux, les patterns d'engagement et les stratégies qui génèrent des millions de vues."

---

## 📊 Modèle de Monétisation

### Tiers de Pricing

#### 🆓 Free
- **Prix :** Gratuit
- **Limitations :**
  - 1 analyse/jour
  - 20 vidéos max par analyse
  - Pas d'historique (7 jours max)
  - Pas d'export
  - Watermark sur partages
  - Insights AI limités (1 par analyse)
- **Objectif :** Acquisition, démonstration de valeur

#### 👤 Creator — 29€/mois
- **Target :** Créateurs solo, influenceurs
- **Features :**
  - 20 analyses/mois
  - 200 vidéos max/analyse
  - Export CSV + PDF
  - Historique 3 mois
  - Insights AI complets
  - Comparaison de 2 comptes
  - Partages sans watermark
- **Objectif :** Créateurs qui monétisent déjà TikTok

#### 💼 Pro — 79€/mois
- **Target :** Agences, marques, social media managers
- **Features :**
  - Analyses illimitées
  - Vidéos illimitées
  - Historique illimité
  - Competitor tracking (jusqu'à 10 comptes)
  - Alertes email/Slack
  - Insights AI avancés (hooks, patterns, prédictions)
  - Analyse de transcripts
  - Comparatif multi-comptes (jusqu'à 5)
  - Rapports automatisés
  - Export en images stylisées
  - Priority support
- **Objectif :** Professionnels du marketing

#### 🏢 Agency — 199€/mois
- **Target :** Agences marketing, entreprises
- **Features :**
  - Tout du Pro
  - Multi-workspaces (jusqu'à 5 équipes)
  - White-label (branding personnalisé)
  - API access
  - Monitoring automatique de comptes
  - Exports automatisés (scheduling)
  - Webhooks
  - Dedicated account manager
  - SLA 99.9%
- **Objectif :** B2B, revendeurs

---

## 🗓️ Roadmap par Phase

---

## 📦 PHASE 0 - Fondations Techniques (1 semaine) ✅ COMPLÉTÉ
**Objectif :** Préparer l'infrastructure pour les features avancées

### 0.1 - Architecture & Database ✅
**Durée :** 2 jours

- [x] **Refactoring database schema**
  - Table `user` (auth, tier, stripeCustomerId, usage limits)
  - Table `session`, `account`, `verification` (Better Auth)
  - Table `subscriptions` (gestion abonnements Stripe)
  - Table `userUsage` (tracking quotas par période)
  - Table `searchRuns` (historique des analyses)
  - Table `searchJobs` (jobs de scraping)
  - Table `tiktokVideos` (cache des vidéos TikTok)
  - Table `searchRunVideos` (liaison run-vidéos)
  - Index optimisés sur toutes les tables

- [x] **Setup Auth système**
  - Better Auth avec Google OAuth
  - Session management via cookies
  - Protected routes middleware

- [x] **Rate limiting & quotas**
  - Système de quotas par tier (free/creator/pro/agency)
  - Tracking mensuel des analyses, exports, AI insights
  - Middleware `checkQuota` et `incrementUsage`

### 0.2 - Infrastructure (Partiellement)
**Durée :** 1 jour

- [ ] **Analytics setup**
  - Posthog / Plausible pour analytics
  - Event tracking (analyze_profile, export_csv, etc.)

- [ ] **Monitoring**
  - Sentry pour error tracking
  - Uptime monitoring

- [ ] **Email service**
  - Resend / SendGrid setup
  - Templates d'emails (welcome, alerts, reports)

### 0.3 - Core improvements (Partiellement)
**Durée :** 2 jours

- [x] **Performance optimization**
  - TanStack Query pour caching
  - Optimistic UI updates (partiellement)
  - Skeleton loaders (partiellement)

- [ ] **Error handling**
  - User-friendly error messages
  - Retry logic
  - Fallback UI

**📝 Livrables :**
- ✅ Auth fonctionnel (Better Auth + Google OAuth)
- ✅ Database migrations prêtes (Drizzle ORM)
- ⏳ Monitoring (non implémenté)
- ⏳ Email service (non implémenté)

---

## 🌐 PHASE 1 - SEO Machine & Acquisition Organique (2 semaines) - EN COURS
**Objectif :** Générer du trafic gratuit via SEO

### 1.1 - Profils Publics & Partageables ✅ COMPLÉTÉ
**Durée :** 4 jours

#### Feature : Page publique par profil ✅
**Route :** `/profile/$username`

**Contenu de la page (implémenté) :**
```
Hero Section:
- Avatar + nom + handle ✅
- Stats globales ✅
- CTA "Analyze this profile" ✅

Stats Overview:
- Cartes de stats ✅
- Top vidéos ✅

Recent Videos Grid:
- Vidéos avec thumbnails ✅
- Métriques clés ✅

CTA Section:
- Liens vers inscription ✅
```

**SEO Requirements :**
- [x] Meta tags dynamiques (title, description, OG) - Implémenté dans `profile.$username.tsx`
- [ ] Schema.org markup (Person, SocialMediaPosting)
- [ ] Sitemap generation automatique
- [x] SSR complet (TanStack Start) - Loader avec données profil
- [x] Canonical URLs via og:url
- [x] Open Graph images générées dynamiquement - API `/api/og/profile/$username` (SVG)

**Technique :**
```typescript
// Route: /profile/@username
- Fetch profile data
- Fetch top videos (cached)
- Generate AI insights (cached 24h)
- SSR rendering
- OG image generation (satori + sharp)
```

#### Feature : Page publique par vidéo
**Route :** `/video/:videoId`

**Contenu :**
- Player vidéo (embed TikTok)
- Métriques complètes
- Transcript
- AI analysis : "Why this video went viral"
- Profil du créateur
- Vidéos similaires

**SEO :** Même approche que profils

### 1.2 - Landing Pages Tools (SEO)
**Durée :** 3 jours

#### Tools à créer :

**1. TikTok Engagement Rate Calculator**
Route : `/tools/engagement-calculator`

```
Input:
- Likes
- Comments
- Shares
- Views

Output:
- Engagement rate %
- Benchmark par industrie
- Interprétation (excellent/good/poor)
- CTA "Analyze your full profile"
```

**2. TikTok Best Posting Time Calculator**
Route : `/tools/best-posting-time`

```
Input:
- Your niche/category
- Target country
- Your follower count

Output:
- Recommended posting times
- Heatmap by day/hour
- Reasoning
```

**3. TikTok Profile Analyzer (Free)**
Route : `/tools/profile-analyzer` (public version simple)

```
Input: @username
Output:
- Basic stats
- Top 3 videos
- Engagement rate
- CTA "Get full analysis"
```

**4. TikTok Hashtag Research**
Route : `/tools/hashtag-research`

```
Input: Main keyword
Output:
- Related hashtags
- Popularity scores
- Trending status
```

**5. TikTok Video Downloader** (bonus, viral)
Route : `/tools/video-downloader`

```
Input: Video URL
Output: Download MP4 (no watermark)
Note: Énorme trafic, acquisition massive
```

**SEO Requirements :**
- [ ] Blog-style content autour de chaque tool
- [ ] "How to" guides
- [ ] FAQ sections
- [ ] Internal linking
- [ ] Backlink strategy

### 1.3 - Category Pages & Leaderboards
**Durée :** 3 jours

#### Category Pages
**Route :** `/category/:niche`

**Niches à couvrir :**
- Fitness
- Finance
- Beauty
- Gaming
- Comedy
- Education
- Food
- Fashion
- Travel
- Tech

**Contenu par page :**
```
Hero:
- "Top TikTok Creators in [Niche]"
- Description SEO-friendly

Leaderboard:
- Top 50 creators (by followers, engagement, growth)
- Filtres (timeframe, metric)
- Pagination

Trending Videos:
- Top 20 videos ce mois-ci

Insights:
- "What's working in [niche] right now"
- Common patterns
- Trending formats
```

**Génération automatique :**
- [ ] Scraper qui catégorise les profils
- [ ] Mise à jour hebdomadaire
- [ ] Cache agressif

#### Weekly Viral Reports
**Route :** `/viral/:year/:week`

**Contenu :**
```
- Top 50 videos of the week
- Breakout creators (nouveaux qui explosent)
- Trending sounds
- Trending hashtags
- AI insights: "What made these videos viral"
```

**Distribution :**
- [ ] Page web indexable
- [ ] Newsletter hebdomadaire
- [ ] Social media posts
- [ ] Reddit posts (r/TikTok, r/marketing)

### 1.4 - Blog Auto-Généré
**Durée :** 2 jours

**Articles à générer automatiquement :**

1. **"Top 10 TikTok Creators in [Niche] - [Month] [Year]"**
   - Mise à jour mensuelle
   - Données réelles de votre DB
   - SEO optimized

2. **"How [Creator] Got [X] Million Views in [Timeframe]"**
   - Case studies automatiques
   - AI-generated insights
   - Partageables

3. **"TikTok Trends Report - [Month] [Year]"**
   - Trending formats
   - Trending sounds
   - Emerging niches

**Stack technique :**
- [ ] Contentlayer / MDX pour blog structure
- [ ] GPT-4 pour génération de contenu
- [ ] Cron jobs pour mise à jour
- [ ] RSS feed

**📝 Livrables Phase 1 :**
- ✅ Pages profils publiques avec SSR et OG images
- ⏳ Tools SEO (non implémentés)
- ⏳ Category pages (non implémentés)
- ⏳ Blog auto-généré (non implémenté)
- ⏳ Sitemap automatique (non implémenté)

**🎯 KPIs Phase 1 :**
- 10K+ visiteurs organiques/mois (mois 3)
- 50+ backlinks naturels
- Top 10 Google pour "tiktok engagement calculator"

---

## 🎨 PHASE 2 - Partage Viral & Acquisition (1 semaine) - NON DÉMARRÉ
**Objectif :** Transformer les users en ambassadeurs

### 2.1 - Analyses Partageables
**Durée :** 2 jours

#### Feature : Share Analysis
**Flow :**
1. User fait une analyse
2. Bouton "Share" visible
3. Options de partage :
   - Copy link
   - Twitter
   - LinkedIn
   - Facebook
   - WhatsApp

**URL format :**
```
viewlify.app/share/abc123
```

**Page de partage :**
- Statistiques principales
- Top 3 vidéos
- AI insights preview
- Branding (logo, watermark si Free)
- CTA "Analyze your own profile"

**Technique :**
```typescript
// Table: shared_analyses
- id
- analysis_id
- slug (abc123)
- is_public
- created_at
- views_count
- user_tier (pour watermark conditionnel)
```

### 2.2 - Export Image Stylisé
**Durée :** 3 jours

#### Feature : Export as Image
**Formats :**

**1. Stats Card (Instagram format 1080x1080)**
```
Design:
- Gradient background (brand colors)
- Profile picture + name
- 4 key metrics (followers, views, engagement, growth)
- Mini bar chart
- Logo + watermark (si Free)
- QR code vers profile public
```

**2. Video Performance Card**
```
- Video thumbnail
- Metrics overlay
- "Why it went viral" insight
- Profile attribution
- Logo
```

**3. Comparison Card** (Pro+)
```
Side-by-side comparison
- 2 profiles
- Key metrics
- "Winner" badge
- Insights
```

**Stack technique :**
```typescript
// Backend: Générer images
- @vercel/og (satori)
- sharp pour PNG
- Canvas API en fallback

// Frontend: Download
- Bouton "Export as Image"
- Preview modal
- Download ZIP si multiple formats
```

**Watermark logic :**
```typescript
if (user.tier === 'free') {
  // Watermark visible: "Analyzed with Viewlify.app"
} else {
  // Clean export, just small logo
}
```

### 2.3 - Embed Widgets
**Durée :** 2 jours

#### Feature : Embeddable Stats Widget

**Use case :** Créateurs peuvent embed leurs stats TikTok sur leur site

**Widget code :**
```html
<script src="https://viewlify.app/embed.js"></script>
<div data-tiktok-analyzer="@username"></div>
```

**Rendu :**
- Mini card avec stats en temps réel
- Lien vers analyse complète
- Personnalisable (colors, size)

**Avantages :**
- Backlinks naturels
- Acquisition
- Créateurs deviennent ambassadeurs

**📝 Livrables Phase 2 :**
- ✅ Partage viral activé
- ✅ Export image fonctionnel
- ✅ Embed widgets prêts
- ✅ Landing page /share/

**🎯 KPIs Phase 2 :**
- 1000+ analyses partagées/mois
- 500+ images exportées/mois
- 10% conversion share → signup

---

## 🤖 PHASE 3 - AI Insights (MVP) (2 semaines) - PARTIELLEMENT COMPLÉTÉ
**Objectif :** Différenciation par l'intelligence artificielle

### 3.1 - Basic AI Analysis ✅ COMPLÉTÉ
**Durée :** 4 jours

#### Feature : Profile AI Chat ✅
**Implémenté :** Chat IA avec Claude Haiku pour analyser les profils

**Endpoint :** `POST /api/chat/stream` (SSE streaming)
- Système de prompts contextuels avec données du profil
- Streaming des réponses via Server-Sent Events
- Intégration avec système de quotas AI
- Utilise Claude Haiku 4.5

#### Feature : Profile AI Insights (original plan)
**Endpoint :** `POST /api/ai/analyze-profile`

**Input :**
```typescript
{
  profileId: string,
  videos: Video[] // top 20 videos
}
```

**AI Processing :**
```typescript
// Analyse avec GPT-4
const prompt = `
Analyze this TikTok profile:
- Username: ${profile.handle}
- Followers: ${profile.followers}
- Videos analyzed: ${videos.length}

Top 5 videos:
${videos.slice(0, 5).map(v => `
  - ${v.description}
  - Views: ${v.views}, Likes: ${v.likes}
  - Transcript: ${v.transcript?.slice(0, 200)}
`).join('\n')}

Provide insights on:
1. Content themes (3-5 main themes)
2. Successful patterns (what makes videos perform)
3. Hook strategies (how they capture attention)
4. Posting consistency (frequency, timing)
5. Audience engagement tactics
6. Recommendations for improvement

Format as JSON:
{
  "themes": ["theme1", "theme2"],
  "patterns": ["pattern1", "pattern2"],
  "hooks": ["hook1", "hook2"],
  "posting_schedule": "analysis",
  "engagement_tactics": ["tactic1"],
  "recommendations": ["rec1", "rec2"],
  "viral_score": 85,
  "summary": "One paragraph summary"
}
`;

const insights = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" }
});
```

**Output :**
```typescript
{
  themes: string[],
  patterns: string[],
  hooks: string[],
  posting_schedule: string,
  engagement_tactics: string[],
  recommendations: string[],
  viral_score: number, // 0-100
  summary: string,
  generated_at: timestamp
}
```

**UI Display :**
```
Section "AI Insights"

📊 Content Strategy
- Themes: [badges]
- Successful Patterns: [list with icons]

🎯 Viral Formula
- Hook Strategies: [list]
- Engagement Tactics: [list]

⏰ Posting Optimization
- Frequency: "3-4 times/day"
- Best times: "18h-20h, 12h-14h"

💡 Recommendations
- Actionable tips (numbered list)

🔥 Viral Score: 85/100
[Progress bar]
"Better than 85% of creators in this niche"
```

**Caching strategy :**
```typescript
// Cache AI insights 24h
// Regenerate si nouvelles vidéos
```

### 3.2 - Video AI Analysis
**Durée :** 3 jours

#### Feature : "Why This Video Went Viral"

**Trigger :** Click sur une vidéo dans le tableau

**AI Analysis :**
```typescript
const prompt = `
Analyze why this TikTok video performed well:

Video data:
- Description: "${video.description}"
- Views: ${video.views}
- Likes: ${video.likes}
- Comments: ${video.comments}
- Shares: ${video.shares}
- Engagement rate: ${engagementRate}%
- Duration: ${video.duration}s
- Transcript: "${video.transcript}"
- Hashtags: ${video.tags.join(', ')}
- Audio: ${video.audioTrack}

Creator context:
- Avg views: ${profile.avgViews}
- This video vs avg: ${performanceVsAvg}x

Provide analysis:
1. Hook analysis (first 3 seconds)
2. Content structure
3. Emotional triggers used
4. Why it resonated with audience
5. Replicable elements
6. Viral factors (trending sound, hashtag, format)

Format as JSON.
`;
```

**UI Display :**
```
Modal: "Video Performance Analysis"

[Video player]

🎯 Performance Overview
- Views: 2.4M (5.2x above average)
- Engagement: 12.8% (Excellent)
- Viral coefficient: 3.8

🪝 Hook Analysis
"This video hooks viewers by..."
- First 3 seconds breakdown
- Attention-grabbing elements

📝 Content Breakdown
- Structure analysis
- Pacing
- Emotional journey

🔥 Viral Factors
✅ Trending sound (+450% this week)
✅ Timely topic
✅ Strong call-to-action
✅ Relatable scenario

♻️ How to Replicate
1. Step-by-step guide
2. Template to follow
3. Best practices
```

### 3.3 - Competitor Comparison AI
**Durée :** 3 jours

#### Feature : "You vs Competitor"

**Input :** 2 profiles à comparer

**AI Analysis :**
```typescript
const prompt = `
Compare these two TikTok creators:

Creator A:
${profileA data}

Creator B:
${profileB data}

Provide:
1. Performance comparison
2. Content strategy differences
3. What A does better than B
4. What B does better than A
5. Opportunities for A to improve
6. Market positioning

Format as JSON.
`;
```

**UI Display :**
```
Side-by-side comparison

Left: You         Right: Competitor
[Stats comparison]

AI Analysis:
📊 Performance Gap
"You're behind by 23% in engagement"

🎯 Where You Win
- Higher comment rate
- Better consistency

⚠️ Where They Win
- Better hooks (40% more retention)
- Trending audio usage

💡 Action Plan
1. Adopt their hook strategy
2. Use trending sounds more
3. Post at their peak times
```

### 3.4 - Viral Score Predictor
**Durée :** 2 jours

#### Feature : Predict Video Performance

**ML Model :**
```typescript
// Simple regression model
// Features:
- Follower count
- Historical avg engagement
- Hook quality (AI-scored)
- Trending sound (boolean)
- Trending hashtag (boolean)
- Video length
- Time of posting
- Caption length
- Has CTA (boolean)

// Output:
- Predicted views (range)
- Predicted engagement rate
- Viral probability (%)
- Confidence level
```

**Training data :**
- Your database of analyzed videos
- Periodic retraining

**UI :**
```
"Viral Probability Predictor"

Input:
- Your follower count
- Planned posting time
- Using trending sound? Y/N
- Video duration

Output:
📊 Predicted Performance
- Views: 50K - 150K
- Engagement: 8-12%
- Viral probability: 65%

💡 How to improve:
- Post at 18h instead (+15% views)
- Use trending sound (+25% views)
- Add CTA in caption (+10% engagement)
```

**📝 Livrables Phase 3 :**
- ✅ Chat AI sur profils (Claude Haiku avec streaming)
- ✅ Quotas AI intégrés au système de facturation
- ⏳ AI analysis par vidéo (non implémenté)
- ⏳ Comparaison AI (non implémenté)
- ⏳ Prédicteur viral (non implémenté)

**🎯 KPIs Phase 3 :**
- 80%+ users engaging avec AI insights
- 5+ min time on page (vs 2min baseline)
- 20% upgrade Free → Paid (grâce aux insights)

---

## 🔔 PHASE 4 - Competitor Tracking & Retention (1.5 semaines) - NON DÉMARRÉ
**Objectif :** Réduire le churn, créer de l'habitude

### 4.1 - Watchlist System
**Durée :** 3 jours

#### Feature : "Track Competitors"

**UI Flow :**
1. Bouton "Add to Watchlist" sur n'importe quel profil
2. Dashboard "/watchlist"
3. List des comptes trackés
4. Status : new videos, performance changes

**Database :**
```typescript
// Table: watchlist
- user_id
- profile_handle
- added_at
- alert_frequency (daily, weekly, instant)
- alert_channels (email, slack, webhook)

// Table: watchlist_snapshots
- watchlist_id
- snapshot_at
- followers
- videos_count
- avg_engagement
- top_video_id
```

**Monitoring cron :**
```typescript
// Runs every 6 hours
- Check all watchlists
- Detect changes:
  - New video posted
  - Video went viral (>3x avg views)
  - Follower milestone reached
  - Engagement spike
- Queue alerts
```

**Dashboard UI :**
```
My Watchlist (5/10 slots used)

[Card for each competitor]
- Avatar + name
- Last checked: 2 hours ago
- Changes:
  • New video posted (2 hours ago)
    "5 tips for..." - 45K views
  • Follower growth: +1.2K today

[Activity Feed]
Timeline of all changes across watchlist
```

### 4.2 - Alert System
**Durée :** 2 jours

#### Email Alerts

**Templates :**

**1. New Video Alert**
```
Subject: @competitor just posted a new video

Hi {name},

@competitor posted a new video 2 hours ago:

"{video_title}"
Current performance:
- 45K views
- 2.8K likes
- 12.5% engagement rate

[View full analysis]
[Add to my strategy]
```

**2. Viral Alert**
```
Subject: 🔥 @competitor's video is going viral

@competitor's video is performing 5.2x above their average!

"{video_title}"
- 2.4M views (vs 450K avg)
- 180K likes
- 15.8% engagement rate

Why it's working:
[AI insight preview]

[See full breakdown]
```

**3. Milestone Alert**
```
Subject: @competitor hit 100K followers

Your competitor @competitor just reached a milestone:
✨ 100K followers

Growth rate: +15% this month
What changed: [AI insight]

[See their strategy]
```

#### Slack Integration
```typescript
// Webhook to Slack
POST slack_webhook_url
{
  text: "🔔 New video from @competitor",
  attachments: [{
    title: video.title,
    fields: [
      { title: "Views", value: "45K" },
      { title: "Engagement", value: "12.5%" }
    ],
    actions: [{
      type: "button",
      text: "View Analysis",
      url: analysisUrl
    }]
  }]
}
```

### 4.3 - Weekly Digest
**Durée :** 2 jours

#### Feature : Weekly Competitor Report

**Sent every Monday morning**

**Content :**
```
📊 Your Weekly TikTok Intelligence Report

This week in your watchlist:

🔥 Hottest Videos
1. @competitor1 - "How to..." (2.4M views)
2. @competitor2 - "Best..." (1.8M views)

📈 Biggest Growers
- @competitor3: +12K followers (+8%)
- @competitor1: +8.5K followers (+5%)

🎯 Trending Topics in Your Niche
- "morning routine" (+450%)
- "productivity hacks" (+320%)

💡 Opportunities Detected
- Trending sound: [Song Name] (use it now!)
- Hashtag: #trend123 (low competition, high reach)

[View Full Report in Dashboard]
```

**Personalization :**
- Based on user's niche
- Based on watchlist
- AI-generated insights

**📝 Livrables Phase 4 :**
- ✅ Watchlist fonctionnel
- ✅ Alerts email
- ✅ Slack integration
- ✅ Weekly digest
- ✅ Dashboard watchlist

**🎯 KPIs Phase 4 :**
- 60%+ users créent une watchlist
- 40% reduction de churn (vs baseline)
- 80%+ open rate sur alerts
- 30%+ CTR sur weekly digest

---

## 💳 PHASE 5 - Monétisation & Paywall (1 semaine) ✅ COMPLÉTÉ
**Objectif :** Activer les revenus

### 5.1 - Authentication & User Management ✅
**Durée :** 2 jours

#### Setup Better Auth (choix final au lieu de Clerk)

**Features implémentées :**
- [x] Google OAuth (Better Auth)
- [x] Session management via cookies
- [x] User profile dans la DB

**Pages créées :**
```
/login ✅
/settings ✅ (partiel)
/pricing ✅
```

**Middleware :**
```typescript
// Protect routes
const protectedRoutes = [
  '/dashboard',
  '/watchlist',
  '/settings',
  '/billing'
];

// Check auth + tier
if (!user) redirect('/signin');
if (user.tier === 'free' && limitReached) {
  showUpgradeModal();
}
```

### 5.2 - Stripe Integration ✅
**Durée :** 2 jours

#### Products Setup ✅

**Stripe Products (implémentés dans stripe.config.ts) :**
```typescript
// Free - 0€
// Creator - 29€/mo (300€/an)
// Pro - 79€/mo (828€/an)
// Agency - 199€/mo (2148€/an)
```

**Features implémentées :**
- [x] Checkout session (`/api/stripe/checkout`)
- [x] Customer portal (`/api/stripe/portal`)
- [x] Webhooks complets (`/api/stripe/webhook`):
  - checkout.session.completed
  - customer.subscription.created/updated/deleted
  - invoice.payment_failed
- [x] Trial period (7 jours)
- [x] Promotion codes activés
- [ ] Invoice emails (géré par Stripe)

**Implementation :**
```typescript
// /api/stripe/create-checkout
export async function createCheckout(tier: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: getPriceId(tier),
      quantity: 1,
    }],
    success_url: `${domain}/dashboard?success=true`,
    cancel_url: `${domain}/pricing`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      tier: tier,
    }
  });
  return session.url;
}

// Webhook handler
export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await activateSubscription(event.data.object);
      break;
    case 'customer.subscription.updated':
      await updateSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelSubscription(event.data.object);
      break;
  }
}
```

### 5.3 - Pricing Page ✅
**Durée :** 1 jour

#### Design ✅

**Route :** `/pricing`

**Implémenté :**
```
Hero ✅
"Simple, transparent pricing"
"Start free, upgrade anytime. No credit card required."

[Toggle: Monthly / Yearly (Save 15%)] ✅

[4 pricing cards via PricingCards component] ✅

FAQ ✅
- Can I change plans anytime? ✅
- What happens if I exceed limits? ✅
- Is there a free trial? ✅ (7 jours)
- What's your refund policy? ✅ (14 jours)

Social Proof: ⏳ Non implémenté
```

**Pricing Cards ✅ :**
```
- Tier name + price ✅
- Feature list ✅
- CTA buttons ✅
- Toggle monthly/yearly ✅
```

### 5.4 - Usage Tracking & Limits ✅
**Durée :** 2 jours

#### Quota System ✅

**Database (implémenté dans schema.ts) :**
```typescript
// Table: user_usage ✅
- id, user_id
- period_start, period_end (monthly reset)
- analyses_used
- exports_used
- ai_insights_used
- created_at, updated_at

// Fonctions implémentées (quota.server.ts):
- getUserQuota() ✅
- checkQuota() ✅
- incrementUsage() ✅
- trackUsage() ✅
- QuotaExceededError ✅
```

**UI Indicators (implémentés) :**
```
Composants paywall:
- QuotaSummaryCard ✅ - Affiche usage/limites
- QuotaBadge ✅ - Badge compact
- VideoLimitBanner ✅ - Bannière limite vidéos

Modales de paywall:
- AnalysisLimitModal ✅
- AiQuotaModal ✅
- ExportPaywallModal ✅
```

**📝 Livrables Phase 5 :**
- ✅ Auth fonctionnel (Better Auth + Google OAuth)
- ✅ Stripe integration complète
- ✅ Pricing page avec toggle monthly/yearly
- ✅ Usage tracking complet
- ✅ Modales d'upgrade (analyses, AI, exports)
- ✅ Customer portal

**🎯 KPIs Phase 5 :**
- 5% conversion Free → Paid (month 1)
- 10% conversion (month 3)
- <5% churn rate
- $10K MRR (month 3)

---

## 🚀 PHASE 6 - Advanced Features (2 semaines) - NON DÉMARRÉ
**Objectif :** Features premium pour justifier Pro/Agency tiers

### 6.1 - Advanced AI Insights
**Durée :** 4 jours

#### Hook Detection
**Feature :** Automatic hook analysis

**Algorithm :**
```typescript
// Analyze transcript first 3 seconds
const hook = transcript.slice(0, 50); // ~3 sec

const hookPatterns = [
  { pattern: /^(Watch|Wait|Stop)/, type: "Command" },
  { pattern: /^\d+ (ways|tips|secrets)/, type: "List promise" },
  { pattern: /^(You|Your)/, type: "Direct address" },
  { pattern: /\?$/, type: "Question" },
  { pattern: /^(Don't|Never)/, type: "Negative frame" },
  { pattern: /^(Here's|This is)/, type: "Declaration" },
];

// Classify hook
const hookType = detectHookType(hook, hookPatterns);

// Score effectiveness (ML model trained on your data)
const effectiveness = await scoreHook(hook, videoPerformance);
```

**UI Display :**
```
🪝 Hook Analysis

Type: Question hook
Text: "Ever wonder why you feel tired after sleeping 9 hours?"
Effectiveness: 92/100 (Excellent)

Why it works:
✓ Relatable problem
✓ Creates curiosity gap
✓ Promises answer

Similar successful hooks in your niche:
- "Are you making this mistake?"
- "Do you know the secret to...?"
```

#### Content Pacing Analysis
**Feature :** Detect cuts, transitions, pacing

**Technique :**
```typescript
// Analyze video (server-side, ffmpeg)
- Detect scene changes (cuts)
- Calculate cut frequency
- Identify transitions
- Measure segment durations

// Compare with high-performers
const avgCutsPerSecond = 0.8;
const thisCutsPerSecond = 1.2;

insight: "This video has 50% more cuts than average, creating higher energy and retention"
```

#### Emotional Journey Mapping
**Feature :** Map emotional beats in transcript

**AI Analysis :**
```typescript
const prompt = `
Analyze emotional journey in this transcript:
"${transcript}"

Identify emotional beats:
- Timestamps
- Emotion (curiosity, surprise, joy, fear, etc.)
- Intensity (1-10)

Output JSON timeline.
`;

// UI: Timeline with emotion indicators
0:00 - Curiosity (8/10) 😲
0:05 - Surprise (9/10) 😱
0:12 - Relief (7/10) 😌
0:18 - Joy (8/10) 😊
```

### 6.2 - Trend Detection
**Durée :** 3 jours

#### Trending Sounds Database
**Feature :** Track which sounds are trending

**Data collection :**
```typescript
// From each analyzed video
- audioTrack
- audioAuthor
- videoPerformance
- postedAt

// Aggregate
const trendingSounds = await db.query(`
  SELECT
    audio_track,
    COUNT(*) as usage_count,
    AVG(views) as avg_views,
    SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as recent_usage
  FROM videos
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY audio_track
  HAVING recent_usage > 10
  ORDER BY recent_usage DESC, avg_views DESC
`);
```

**UI :**
```
Route: /trending/sounds

📊 Trending Sounds This Week

[List]
1. "Song Name - Artist"
   Usage: 12K videos (+450% vs last week)
   Avg views: 850K
   Trend: 📈 Exploding
   [Preview] [Use in your video]

2. ...

Filters:
- Your niche only
- All categories
- Timeframe (24h, 7d, 30d)
```

#### Trending Hashtags
Same approach pour hashtags

#### Trending Formats
**Feature :** Detect content format trends

**Formats to detect :**
- POV
- Transition
- Before/After
- Tutorial
- Story time
- Duet/Stitch
- Green screen
- Voiceover

**Detection :**
```typescript
// Rule-based + AI
if (description.includes('POV:')) format = 'POV';
if (hasGreenScreen(video)) format = 'Green screen';

// AI classification
const format = await classifyFormat(transcript, description);
```

**UI :**
```
📊 Trending Formats in Your Niche

1. POV Videos
   Usage: +320% this week
   Avg engagement: 12.5%
   Example: [thumbnail]

2. Transition Videos
   ...
```

### 6.3 - Multi-Account Comparison
**Durée :** 3 jays

#### Feature : Compare up to 5 accounts

**UI :**
```
Route: /compare

Select accounts:
[Search bar] Add account (5 max)

[@account1] [x]
[@account2] [x]
[@account3] [x]

[Compare]

Results:

📊 Performance Overview
[Side-by-side stats]

📈 Growth Chart
[Line chart with 5 lines]

🎯 Strategy Comparison
[Table comparing content themes, posting frequency, etc.]

AI Analysis:
"Who's winning and why"
- @account1 leads in engagement due to...
- @account2 has better consistency...
- Opportunities for @account3...
```

### 6.4 - Automated Reports
**Durée :** 2 jays

#### Feature : Scheduled PDF Reports

**Setup :**
```
Route: /reports/schedule

Create new report:
- Name: "Weekly Competitor Report"
- Accounts: [@comp1, @comp2]
- Frequency: Weekly (Monday 9AM)
- Recipients: [email1, email2]
- Format: PDF + Email

[Save]
```

**Report generation :**
```typescript
// Cron job
async function generateReport(reportConfig) {
  // Gather data
  const data = await fetchAccountsData(reportConfig.accounts);

  // Generate PDF (puppeteer or react-pdf)
  const pdf = await generatePDF({
    accounts: data,
    period: 'last_7_days',
    insights: await generateAIInsights(data)
  });

  // Send email
  await sendEmail({
    to: reportConfig.recipients,
    subject: `${reportConfig.name} - ${formatDate()}`,
    attachments: [{ filename: 'report.pdf', content: pdf }]
  });
}
```

**📝 Livrables Phase 6 :**
- ✅ Hook detection
- ✅ Pacing analysis
- ✅ Trending sounds/hashtags/formats
- ✅ Multi-account comparison
- ✅ Automated reports

---

## 🏢 PHASE 7 - Agency Features (1.5 semaines) - NON DÉMARRÉ
**Objectif :** Justifier le tier à 199€/mois

### 7.1 - Workspaces
**Durée :** 3 jours

#### Feature : Multi-workspace management

**Database :**
```typescript
// Table: workspaces
- id
- owner_id
- name
- created_at

// Table: workspace_members
- workspace_id
- user_id
- role (owner, admin, member, viewer)
- invited_at

// Table: workspace_resources
// Lier analyses, watchlists à workspace
- workspace_id
- resource_type (analysis, watchlist, report)
- resource_id
```

**UI :**
```
Sidebar:
[Workspace Dropdown]
▼ Agency Name
  - My Personal
  - Client A
  - Client B
  + Create workspace

Settings:
/workspace/:id/settings
- Name
- Members [+ Invite]
- Permissions
- Billing (if sub-account)
```

### 7.2 - White-label
**Durée :** 2 jours

#### Feature : Custom branding

**Settings :**
```
/workspace/:id/branding

Logo:
[Upload] (displayed in navbar, reports)

Colors:
- Primary color: [picker]
- Secondary color: [picker]

Domain (Enterprise):
- Custom domain: analytics.youragency.com
- CNAME setup instructions

Email branding:
- From name: "YourAgency Insights"
- Footer customization
```

**Implementation :**
```typescript
// Theming system
const theme = workspace.branding || defaultTheme;

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>

// Reports include workspace branding
// Emails sent from workspace name
```

### 7.3 - API Access
**Durée :** 4 jays

#### Feature : RESTful API for agencies

**Endpoints :**
```typescript
// Authentication
POST /api/v1/auth
Headers: { "X-API-Key": "key_xxx" }

// Analyze profile
POST /api/v1/analyze
{
  "profile": "@username",
  "include_insights": true
}

Response:
{
  "analysis_id": "abc123",
  "profile": { ... },
  "videos": [ ... ],
  "insights": { ... }
}

// Get analysis
GET /api/v1/analysis/:id

// List analyses
GET /api/v1/analyses?workspace_id=xxx

// Watchlist
POST /api/v1/watchlist
GET /api/v1/watchlist
DELETE /api/v1/watchlist/:id

// Webhooks
POST /api/v1/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["video.viral", "competitor.milestone"]
}
```

**Documentation :**
```
Route: /docs/api

Interactive API docs:
- Swagger / Redoc
- Code examples (curl, Python, Node.js)
- Authentication guide
- Rate limits
- Webhook reference
```

### 7.4 - Priority Support
**Durée :** 1 jour

#### Feature : Dedicated support

**Channels :**
- [ ] Dedicated Slack channel
- [ ] Priority email (support@)
- [ ] Monthly check-in call

**Implementation :**
```
/support

Free/Creator:
"Email support: support@viewlify.app"
"Response time: 48h"

Pro:
"Priority email support"
"Response time: 24h"

Agency:
"Dedicated Slack channel + Priority email"
"Response time: 4h"
[Request Slack access]
```

**📝 Livrables Phase 7 :**
- ✅ Workspaces
- ✅ White-label
- ✅ API
- ✅ Priority support

---

## 🎨 PHASE 8 - Polish & Growth (Ongoing)

### 8.1 - Onboarding Flow
**Durée :** 2 jours

**New user flow :**
```
Step 1: Welcome
"Let's get you set up"

Step 2: Use case
"What brings you here?"
- [ ] I'm a creator
- [ ] I manage social media
- [ ] I run an agency
- [ ] Just exploring

Step 3: First analysis
"Let's analyze your first profile"
[Input] @username
[Analyze]

Step 4: Feature tour
Interactive walkthrough

Step 5: Invite to Discord/Community
```

### 8.2 - Growth Experiments

**Viral mechanics :**
- [ ] TikTok video downloader (massive traffic)
- [ ] Public leaderboards (SEO + shareability)
- [ ] "Creator of the week" (recognition)
- [ ] Badges system (gamification)

**Partnerships :**
- [ ] TikTok creator agencies
- [ ] Influencer platforms
- [ ] Course creators (affiliate)

**Content marketing :**
- [ ] Weekly blog posts
- [ ] YouTube tutorials
- [ ] Twitter threads with data insights
- [ ] LinkedIn thought leadership

### 8.3 - Community Building

**Discord server :**
- Channel #wins (users sharing results)
- Channel #viral-videos (daily viral breakdown)
- Channel #feedback
- Channel #help

**Newsletter :**
- Weekly viral report
- New features
- Tips & tricks
- User spotlights

---

## 🛠️ Stack Technique Recommandé

### Frontend
- **Framework :** React + TanStack Start (déjà en place)
- **Styling :** Tailwind + shadcn/ui (déjà en place)
- **State :** TanStack Query
- **Forms :** React Hook Form + Zod
- **Charts :** Recharts ou Tremor
- **Tables :** TanStack Table (déjà en place)

### Backend
- **Runtime :** Cloudflare Workers (déjà en place)
- **Database :** D1 (SQLite) → migrer vers Turso ou Postgres si scaling
- **ORM :** Drizzle (déjà en place)
- **Auth :** Clerk (recommandé) ou Lucia
- **Payments :** Stripe
- **Email :** Resend
- **Storage :** R2 (Cloudflare) pour vidéos

### AI & ML
- **LLM :** OpenAI GPT-4o
- **Image generation :** @vercel/og (satori)
- **ML models :** Vercel AI SDK ou Replicate

### Infrastructure
- **Hosting :** Cloudflare Pages (déjà en place)
- **Monitoring :** Sentry + Axiom
- **Analytics :** Posthog ou Plausible
- **CDN :** Cloudflare (déjà inclus)

### DevOps
- **CI/CD :** GitHub Actions
- **Testing :** Vitest (déjà en place)
- **Code quality :** Biome (déjà en place)

---

## 📊 Métriques de Succès

### Product Metrics
- **Activation :** % users qui font leur 1ère analyse
- **Engagement :** % users qui reviennent (D1, D7, D30)
- **Retention :** % users actifs après 30 jours
- **Upgrade rate :** % Free → Paid
- **Churn :** % désabonnements/mois

### Business Metrics
- **MRR :** Monthly Recurring Revenue
- **ARR :** Annual Recurring Revenue
- **CAC :** Customer Acquisition Cost
- **LTV :** Lifetime Value
- **LTV/CAC ratio :** >3 (healthy)

### Growth Metrics
- **Organic traffic :** Visiteurs SEO/mois
- **Signups :** Nouveaux users/mois
- **Viral coefficient :** Invitations/user
- **NPS :** Net Promoter Score

### Targets (Mois 6)
- 10K users (1K paid)
- $30K MRR
- 50K+ visiteurs organiques/mois
- <5% churn

---

## 💰 Budget Estimé

### Infrastructure (par mois)
- Cloudflare Workers/Pages : ~$20
- Database (Turso/Supabase) : ~$25
- R2 Storage : ~$10
- Clerk Auth : ~$25 (ou gratuit si <5K MAU)
- OpenAI API : ~$200-500 (selon usage)
- Resend Email : ~$20
- Sentry : Gratuit
- **Total : ~$300-600/mois**

### Services (one-time + recurring)
- Stripe fees : 2.9% + $0.30 par transaction
- Domain : ~$15/an
- Logo/design : ~$500 (one-time)

### Time Investment
- Phase 0-5 : ~6-8 semaines (MVP complet)
- Phase 6-8 : ongoing

---

## 🚦 Priorisation Recommandée

### 🔴 Critique (faire en premier)
1. Phase 1 : SEO Machine
2. Phase 2 : Partage viral
3. Phase 5 : Monétisation

**Pourquoi :** Acquisition + Revenus = survivre

### 🟡 Important (faire rapidement après)
4. Phase 3 : AI Insights MVP
5. Phase 4 : Competitor tracking

**Pourquoi :** Différenciation + Rétention

### 🟢 Nice-to-have (quand stable)
6. Phase 6 : Advanced features
7. Phase 7 : Agency features
8. Phase 8 : Growth experiments

**Pourquoi :** Scaling + Premium tiers

---

## 🎯 Prochaines Étapes Recommandées

### Priorité Haute (Quick Wins)

1. **Compléter Phase 1 - SEO:**
   - [ ] Sitemap automatique
   - [ ] Schema.org markup
   - [ ] Tools SEO (engagement calculator, etc.)

2. **Analytics & Monitoring:**
   - [ ] Setup Posthog/Plausible
   - [ ] Sentry pour error tracking

3. **Email Service:**
   - [ ] Setup Resend/SendGrid
   - [ ] Templates welcome, alerts

### Priorité Moyenne

4. **Phase 3 - AI Complet:**
   - [ ] Video AI Analysis ("Why this video went viral")
   - [ ] Insights automatiques par profil

5. **Phase 2 - Partage Viral:**
   - [ ] Share analysis avec lien
   - [ ] Export image stylisé

### Priorité Basse (Features Avancées)

6. **Phase 4 - Competitor Tracking**
7. **Phase 6-7 - Features Pro/Agency**
