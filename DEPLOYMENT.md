# Mesa Redonda v1.4 - Deployment Guide

## 🚀 Quick Deploy Checklist

### Pre-Deploy
- [x] Build passing locally (`npm run build`)
- [x] All tests passing
- [x] Environment variables documented
- [ ] Stripe products created
- [ ] Production keys ready

### Vercel Setup
- [ ] Project imported
- [ ] Environment variables configured
- [ ] Domain configured
- [ ] Deploy successful

### Stripe Configuration
- [ ] Products created (Starter, Pro, Team)
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to Vercel
- [ ] Test checkout flow

### Post-Deploy Verification
- [ ] Landing page loads
- [ ] Signup flow works
- [ ] Blog posts render correctly
- [ ] Upgrade page loads
- [ ] Checkout redirects to Stripe
- [ ] Webhook receives events

---

## 📋 Detailed Steps

### 1. Stripe Dashboard Setup (CRITICAL)

#### Create Products
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create 3 products:

**Product 1: Starter**
- Name: `Mesa Redonda - Starter`
- Description: `Para profissionais que querem decisões melhores`
- Pricing: `R$ 49.00 BRL / month`
- Recurring: ✅ Yes
- Copy the Price ID: `price_xxxxxxxxxxxxx`

**Product 2: Pro**
- Name: `Mesa Redonda - Pro`
- Description: `Para times que precisam de agilidade estratégica`
- Pricing: `R$ 99.00 BRL / month`
- Recurring: ✅ Yes
- Copy the Price ID: `price_xxxxxxxxxxxxx`

**Product 3: Team**
- Name: `Mesa Redonda - Team`
- Description: `Para empresas que tomam decisões em escala`
- Pricing: `R$ 299.00 BRL / month`
- Recurring: ✅ Yes
- Copy the Price ID: `price_xxxxxxxxxxxxx`

#### Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy:
   - **Publishable key**: `pk_test_xxxxxxxxxxxxx` (not used in backend)
   - **Secret key**: `sk_test_xxxxxxxxxxxxx`

---

### 2. Vercel Deployment

#### Import Project
1. Go to https://vercel.com/new
2. Import from GitHub
3. Select `mesa-redonda` repository
4. Framework Preset: **Next.js**
5. Root Directory: `./`
6. Build Command: `npm run build`
7. Output Directory: `.next`

#### Configure Environment Variables

Go to **Settings → Environment Variables** and add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (PRODUCTION KEYS!)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (from step 1)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM=price_xxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# App URL (your production domain)
NEXT_PUBLIC_APP_URL=https://mesaredonda.app
```

**Important**: Use **Production** keys for Stripe in production!

#### Deploy
1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Verify deployment at `https://your-project.vercel.app`

---

### 3. Configure Stripe Webhook

#### Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Description: `Mesa Redonda Subscription Events`
5. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**

#### Get Webhook Secret
1. Click on the newly created endpoint
2. Click **Reveal** under "Signing secret"
3. Copy the secret: `whsec_xxxxxxxxxxxxx`
4. Go to Vercel → Settings → Environment Variables
5. Update `STRIPE_WEBHOOK_SECRET` with this value
6. Redeploy (Vercel will auto-redeploy on env var change)

---

### 4. Database Setup (Supabase)

#### Run Migrations
```bash
# Connect to production database
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

#### Run Seeds (Optional)
```bash
npx supabase db seed
```

#### Verify Tables
Check that these tables exist:
- `workspaces`
- `table_templates`
- `table_categories`
- `table_jobs`
- `user_intents`
- `events`

---

### 5. Post-Deploy Verification

#### Test Checklist

**Landing Page**
- [ ] Visit `https://your-domain.com`
- [ ] All sections load correctly
- [ ] CTAs work
- [ ] Navigation smooth

**Signup Flow**
- [ ] Click "Começar Grátis"
- [ ] Create account
- [ ] Redirects to `/app`
- [ ] JobPicker loads

**Library Filtering**
- [ ] Click on JTBD (e.g., "Crescer Receita")
- [ ] Redirects to `/app/library?job=grow-revenue`
- [ ] Banner shows "Filtrando por objetivo"
- [ ] Templates filtered correctly

**Blog**
- [ ] Visit `/blog`
- [ ] Click on article
- [ ] MDX renders correctly (checkboxes, tables, code)
- [ ] TOC works
- [ ] Progress bar updates
- [ ] Share buttons work
- [ ] Related articles show

**Upgrade Flow**
- [ ] Visit `/upgrade`
- [ ] 3 plans show correctly
- [ ] Click "Upgrade para Pro"
- [ ] Redirects to Stripe Checkout
- [ ] Fill test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Redirects back to `/app?checkout=success`
- [ ] Check Supabase: `subscription_plan` updated to `pro`

**Webhook**
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Click on endpoint
- [ ] Check "Recent events"
- [ ] Verify `checkout.session.completed` received
- [ ] Status: `200 OK`

---

### 6. Monitoring

#### Vercel Logs
- Go to Vercel Dashboard → Deployments → Latest → Functions
- Monitor for errors

#### Stripe Webhook Logs
- Go to Stripe Dashboard → Webhooks → Your endpoint
- Check "Recent events" for failures

#### Supabase Logs
- Go to Supabase Dashboard → Logs
- Monitor database queries

---

## 🐛 Common Issues

### Webhook Returns 400
**Cause**: Invalid signature
**Fix**: Verify `STRIPE_WEBHOOK_SECRET` is correct

### Checkout Redirects to 404
**Cause**: Missing Price IDs
**Fix**: Verify `NEXT_PUBLIC_STRIPE_PRICE_*` env vars

### Database Connection Failed
**Cause**: Wrong Supabase credentials
**Fix**: Verify `NEXT_PUBLIC_SUPABASE_URL` and keys

### Build Fails on Vercel
**Cause**: TypeScript errors or missing env vars
**Fix**: Check build logs, verify all env vars set

---

## 🎯 Success Criteria

✅ All pages load without errors  
✅ Signup flow completes successfully  
✅ Checkout redirects to Stripe  
✅ Webhook receives and processes events  
✅ Subscription plan updates in database  
✅ Blog posts render correctly with MDX  

---

## 📞 Support

If you encounter issues:
1. Check Vercel logs
2. Check Stripe webhook logs
3. Check Supabase logs
4. Verify all environment variables
5. Test locally first with `npm run dev`

---

**Ready for Production!** 🚀
