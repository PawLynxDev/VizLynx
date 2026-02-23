# PixelForge — AI Marketing Content Studio

## Product Vision

PixelForge is an AI-powered marketing content studio for e-commerce sellers. Upload product photos and instantly generate scroll-stopping branded marketing images — ready for Instagram, Meta Ads, TikTok, and more. Video generation capabilities expand the platform in later phases.

**Target Users:** E-commerce sellers (Etsy, Amazon, etc.), DTC brands, small marketing agencies, social media managers.

**Core Value Proposition:** Replace expensive designers with a $29-79/month tool that generates unlimited marketing images in seconds.

---

## Core Features

### 1. Photo → Marketing Image (MVP)
- Upload a product photo
- Select a template (social media post, story, ad banner, product card, sale graphic)
- AI generates a polished marketing image with:
  - Background removal / replacement
  - Text overlays with copy suggestions (AI-generated)
  - Brand kit styling
  - Multiple size variants (1080x1080, 1080x1920, 1200x628, etc.)

### 2. Brand Kit
- Upload logo (+ dark/light variants)
- Set brand colors (primary, secondary, accent)
- Choose brand fonts (from Google Fonts library)
- Save brand guidelines that auto-apply to all generated content
- Support multiple brand kits (for agencies managing multiple clients)

### 3. Bulk Generation
- Upload a CSV to import product catalog
- Select template + brand kit
- Queue bulk generation (10, 50, 100+ items)
- Progress tracking dashboard
- Download all as ZIP or push directly to ad platforms

### 4. Photo → Marketing Video (Post-MVP)
- Upload 1-5 product photos
- Select a video template (product showcase, unboxing style, lifestyle, testimonial overlay, sale/promo)
- Generates a 5-30 second video with:
  - Smooth zoom/pan/Ken Burns effects on photos
  - Dynamic text overlays (product name, price, CTA)
  - Background music from built-in royalty-free library
  - Brand kit applied (logo watermark, brand colors, fonts)
- Export in multiple aspect ratios: 9:16 (TikTok/Reels), 1:1 (Feed), 16:9 (YouTube)

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Image Editor | Fabric.js or Konva.js (for drag-and-drop editing) |
| File Upload | react-dropzone + presigned S3 URLs |
| Payments | Stripe (checkout, subscriptions, usage metering) |
| Video Preview (Phase 5) | React Player / custom canvas renderer |

### Backend
| Layer | Technology |
|-------|-----------|
| API | Next.js API Routes + tRPC |
| Database | PostgreSQL (via Supabase or Neon) |
| ORM | Prisma |
| Auth | NextAuth.js (or Clerk) |
| File Storage | AWS S3 / Cloudflare R2 |
| Job Queue | BullMQ + Redis (for async generation jobs) |
| CDN | Cloudflare |

### AI & Media APIs
| Purpose | Provider Options |
|---------|-----------------|
| Image Generation / Editing | Replicate (SDXL), Stability AI |
| Background Removal | Remove.bg, Photoroom API, or rembg (self-hosted) |
| AI Copywriting | Claude API (for generating ad copy, CTAs, captions) |
| Image Processing | Sharp (server-side resizing, format conversion) |
| Video Compositing (Phase 5) | Remotion (React-based video) or FFmpeg |
| Music (Phase 5) | Epidemic Sound API or self-curated royalty-free library |

### Infrastructure
| Purpose | Technology |
|---------|-----------|
| Hosting | Vercel (frontend) + Railway/Fly.io (workers) |
| Monitoring | Sentry + PostHog (analytics) |
| CI/CD | GitHub Actions |
| Email | Resend |

---

## Database Schema (Core Models)

```
User
├── id, email, name, avatarUrl
├── plan (free | starter | pro | agency)
├── stripeCustomerId
└── createdAt, updatedAt

BrandKit
├── id, userId
├── name
├── logoUrl, logoDarkUrl
├── primaryColor, secondaryColor, accentColor
├── fontHeading, fontBody
└── createdAt

Project
├── id, userId, brandKitId
├── name, type (image | video)
├── status (draft | processing | completed | failed)
├── templateId
└── createdAt, updatedAt

SourceImage
├── id, projectId
├── originalUrl, processedUrl (bg removed)
├── metadata (dimensions, format)
└── order

GeneratedContent
├── id, projectId
├── type (image | video)
├── url, thumbnailUrl
├── format (png | jpg | mp4 | webm)
├── aspectRatio (9:16 | 1:1 | 16:9 | 4:5)
├── duration (for videos, Phase 5)
├── metadata (AI params, template config)
└── createdAt

Template
├── id, name, category
├── type (image | video)
├── thumbnailUrl
├── config (JSON: layout, text positions, styling rules)
└── isPremium

BulkJob
├── id, userId, brandKitId, templateId
├── status (queued | processing | completed | partial_failure)
├── totalItems, completedItems, failedItems
├── inputType (csv)
└── createdAt, completedAt

MusicTrack (Phase 5)
├── id, title, artist
├── url, duration
├── mood, genre, bpm
├── licenseType
└── isActive
```

---

## Pricing Model

| Plan | Price | Includes |
|------|-------|----------|
| **Free** | $0/mo | 5 generations/month, watermark, 1 brand kit |
| **Starter** | $29/mo | 50 generations/month, no watermark, 2 brand kits |
| **Pro** | $79/mo | 300 generations/month, bulk generation, 5 brand kits, priority processing |
| **Agency** | $199/mo | 1000 generations/month, unlimited brand kits, API access, white-label |

*Additional generations: $0.15/image, $0.50/video (when available)*

---

## Development Phases

### Phase 1 — Core Loop (Weeks 1-3)
**Goal: Upload photo → get marketing image, end-to-end**

- [ ] Project setup: Next.js + TypeScript + Tailwind + Prisma + tRPC
- [ ] Auth system (NextAuth or Clerk)
- [ ] Database schema + migrations (User, Project, SourceImage, GeneratedContent, Template)
- [ ] File upload pipeline (S3/R2 presigned URLs)
- [ ] Basic dashboard UI (projects list, create new project)
- [ ] Single photo upload → background removal (rembg or Remove.bg API)
- [ ] 2-3 hardcoded image templates: product showcase, social post, sale graphic
- [ ] Image compositing with Fabric.js or Konva.js (text overlay, background swap)
- [ ] Basic export: download generated image in 1080x1080

**Deliverable:** User can sign up, upload a product photo, pick a template, and download a marketing image. No brand kit yet — use clean defaults.

**Why no brand kit here:** Getting to the core value loop fast matters more than customization. Hardcoded defaults with good typography and layouts prove the concept.

---

### Phase 2 — Brand Kit & Templates (Weeks 4-7)
**Goal: Professional-quality output with branding and variety**

- [ ] Brand kit CRUD (logo upload, brand colors, Google Fonts selection)
- [ ] Multiple brand kit support (for agencies)
- [ ] Brand kit auto-apply to all templates
- [ ] 10+ image templates across categories:
  - Social media posts (Instagram, Facebook)
  - Stories (Instagram, TikTok)
  - Ad banners (Meta Ads, Google Ads)
  - Product cards
  - Sale / promo graphics
- [ ] Template preview gallery with filtering by category
- [ ] AI copy generation via Claude API (headlines, CTAs, product descriptions, captions)
- [ ] Custom text editing on generated content (inline editor)
- [ ] Multi-size export (1080x1080, 1080x1920, 1200x628, 4:5, etc.)
- [ ] Re-generation with different styles / copy variations
- [ ] Download center (select formats and sizes, download all)

**Deliverable:** Professional-quality branded marketing images with AI-generated copy. Users can manage brand kits and choose from a rich template library.

---

### Phase 3 — Bulk Generation (Weeks 8-11)
**Goal: Scale from single images to entire product catalogs**

- [ ] CSV import for product catalogs (name, description, price, image URL)
- [ ] Bulk generation queue with BullMQ + Redis
- [ ] Progress tracking dashboard (real-time status per item)
- [ ] Batch template + brand kit selection
- [ ] ZIP download for bulk exports
- [ ] Usage analytics dashboard (generations count, templates used, export history)
- [ ] Error handling & retry logic for failed generations

**Deliverable:** Seller uploads CSV → selects template → gets marketing images for entire catalog.

---

### Phase 4 — Monetization & Launch (Weeks 12-15)
**Goal: Payment, polish, and go-to-market**

- [ ] Stripe integration (subscriptions + usage-based billing for overages)
- [ ] Plan limits enforcement (generation caps, brand kit limits, feature gating)
- [ ] Free tier watermark system ("Made with PixelForge" — doubles as acquisition channel)
- [ ] Onboarding flow (guided first-generation experience with sample product)
- [ ] Landing page with before/after demos, pricing, and social proof
- [ ] SEO + blog setup (content targeting "product photography," "marketing images for e-commerce," etc.)
- [ ] Email sequences via Resend (onboarding drip, usage tips, upgrade prompts)
- [ ] Direct export to Meta Ads / TikTok Ads (API integration)
- [ ] Launch: Product Hunt, Indie Hackers, relevant subreddits, e-commerce communities

**Deliverable:** Fully monetized product with go-to-market in motion. Users can subscribe, hit limits, and upgrade.

---

### Phase 5 — Video Generation (Weeks 16-20+)
**Goal: Expand from images to video content**

- [ ] Video generation pipeline using Remotion (deterministic, React-based compositing)
- [ ] 5-10 video templates:
  - Product showcase (zoom/pan/Ken Burns on photos)
  - Sale / promo (countdown, price reveal)
  - Lifestyle montage
  - Testimonial overlay
  - Unboxing style
- [ ] Text overlay animations (fade in, slide up, typewriter effect)
- [ ] Royalty-free music library (curated by mood: upbeat, chill, luxury, energetic)
- [ ] Music auto-sync to video duration
- [ ] Video preview player in browser
- [ ] Export in multiple aspect ratios: 9:16 (TikTok/Reels), 1:1 (Feed), 16:9 (YouTube)
- [ ] Async video processing with job queue (longer processing than images)
- [ ] Video included in bulk generation pipeline
- [ ] Updated pricing to reflect video generation costs

**Deliverable:** Full image + video marketing content studio. Users generate both formats from the same product photos.

**Future consideration:** AI-powered video generation (Runway ML, Luma Labs) as a premium tier feature once API costs and quality justify it.

---

## Project Structure

```
pixelforge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (dashboard)/        # Protected app pages
│   │   │   ├── projects/       # Project list & detail
│   │   │   ├── brand-kits/     # Brand kit management
│   │   │   ├── templates/      # Template gallery
│   │   │   ├── bulk/           # Bulk generation
│   │   │   └── settings/       # Account & billing
│   │   ├── api/                # API routes
│   │   │   ├── trpc/           # tRPC router
│   │   │   ├── webhooks/       # Stripe webhooks
│   │   │   └── upload/         # File upload endpoints
│   │   └── (marketing)/        # Landing page, pricing
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── editor/             # Image editor components
│   │   ├── upload/             # File upload components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── lib/
│   │   ├── ai/                 # AI API integrations
│   │   │   ├── replicate.ts    # Image generation
│   │   │   ├── claude.ts       # Copy generation
│   │   │   └── rembg.ts        # Background removal
│   │   ├── media/              # Media processing
│   │   │   ├── sharp.ts        # Image processing
│   │   │   └── templates.ts    # Template engine
│   │   ├── storage/            # S3/R2 operations
│   │   ├── queue/              # BullMQ job definitions
│   │   └── stripe.ts           # Payment logic
│   ├── server/
│   │   ├── db.ts               # Prisma client
│   │   ├── trpc.ts             # tRPC setup
│   │   └── routers/            # tRPC routers
│   └── types/                  # Shared TypeScript types
├── workers/
│   ├── image-generator.ts      # Image generation worker
│   └── bulk-processor.ts       # Bulk job orchestrator
├── prisma/
│   └── schema.prisma
├── public/
│   └── templates/              # Template thumbnails
└── package.json
```

*Phase 5 additions: `workers/video-generator.ts`, `src/lib/media/remotion.ts`, `src/app/(dashboard)/music/`*

---

## Team Allocation (3 People)

| Person | Focus Area | Key Responsibilities |
|--------|-----------|---------------------|
| **Dev 1 (Lead)** | Architecture + AI Pipeline | System design, AI API integrations (background removal, copy gen, image compositing), template engine, infrastructure |
| **Dev 2** | Frontend + UX | Dashboard, image editor UI, template gallery, onboarding flow, responsive design, landing page |
| **Dev 3** | Backend + Integrations | Auth, database, Stripe billing, bulk processing queue, API endpoints |

### Phase-Level Allocation

| Phase | Dev 1 | Dev 2 | Dev 3 |
|-------|-------|-------|-------|
| **1 — Core Loop** | Image pipeline, bg removal, template engine | Dashboard UI, upload flow, project views | Auth, DB schema, file upload API, S3 setup |
| **2 — Brand Kit & Templates** | AI copy generation, multi-size export | Brand kit UI, template gallery, inline editor | Brand kit API, template CRUD, download center backend |
| **3 — Bulk Generation** | Bulk processing orchestration, retry logic | Progress dashboard, analytics UI | CSV import, queue setup, ZIP export backend |
| **4 — Monetization & Launch** | Infrastructure hardening, performance | Landing page, onboarding flow, SEO | Stripe integration, plan enforcement, email sequences |
| **5 — Video** | Remotion pipeline, music sync | Video preview player, video template UI | Video job queue, music library API, updated billing |

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Image quality not good enough | Users don't convert | Invest in template design quality; use Fabric.js for pixel-perfect compositing; gather user feedback early in Phase 1 |
| AI API costs (bg removal, copy gen) | Margins squeezed | Self-host rembg for background removal; cache Claude API responses for similar products; usage-based pricing |
| Template fatigue (users want more variety) | Engagement drops | Build a flexible template engine that makes adding new templates fast; consider user-submitted templates later |
| Competition ships similar | Market share loss | Focus on e-commerce niche; iterate fast on feedback; community building |
| Slow bulk processing | User frustration | Optimize image pipeline for speed; horizontal scaling of workers; set clear expectations with progress UI |

---

## Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Registered users | 5,000 |
| Paying customers | 500 |
| MRR | $25,000 |
| Image generations per day | 2,000 |
| NPS Score | > 40 |
| Monthly churn rate | < 8% |

---

## Next Steps

1. **Initialize the repo** — Next.js + TypeScript + Tailwind + Prisma + tRPC
2. **Set up CI/CD** — GitHub Actions for lint, test, deploy
3. **Build auth + dashboard shell** — Login, projects list, navigation
4. **Prototype background removal** — Test rembg (self-hosted) vs Remove.bg API for quality/speed/cost
5. **Build first template end-to-end** — Single image generation with hardcoded styling
6. **Validate with users** — Share prototype with 10-20 e-commerce sellers for feedback before investing in Phase 2
