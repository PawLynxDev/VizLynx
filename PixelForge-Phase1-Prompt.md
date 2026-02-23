# PixelForge — Phase 1 Development Prompt

## Project Context

You are building **PixelForge**, an AI-powered marketing content studio for e-commerce sellers. The product lets users upload product photos and instantly generate branded marketing images ready for Instagram, Meta Ads, TikTok, and more.

This is **Phase 1 — Core Loop**. The goal is to build the minimum end-to-end flow: a user signs up, uploads a product photo, selects a template, and downloads a finished marketing image. Nothing else. No brand kits, no bulk generation, no payments — those come in later phases.

The company building this is **PawLynx**.

---

## Phase 1 Scope

### What to build:
1. **Project scaffolding** — Next.js 14+ App Router, TypeScript, Tailwind CSS, Prisma ORM, tRPC
2. **Authentication** — Sign up, log in, log out, protected routes (use Clerk or NextAuth.js)
3. **Database schema & migrations** — PostgreSQL via Supabase or Neon. Models needed for Phase 1: User, Project, SourceImage, GeneratedContent, Template
4. **File upload pipeline** — Upload product photos to AWS S3 or Cloudflare R2 using presigned URLs. Use react-dropzone on the frontend
5. **Basic dashboard UI** — Projects list page, create new project flow, project detail page showing generated content
6. **Background removal** — When a user uploads a photo, remove the background using rembg (self-hosted) or Remove.bg API. Store both the original and processed (background-removed) image
7. **Image templates (2-3 hardcoded)** — Product showcase, social media post, sale/promo graphic. Each template defines layout, text positions, and default styling
8. **Image compositing** — Use Fabric.js or Konva.js (server-side via Node canvas or client-side) to composite the final marketing image: background-removed product photo + template layout + text overlays (product name, price, CTA — hardcoded placeholder text for now)
9. **Basic export** — Download the generated image as PNG at 1080x1080

### What NOT to build (deferred to later phases):
- Brand kit system (Phase 2)
- AI copy generation / Claude API integration (Phase 2)
- Multiple export sizes (Phase 2)
- Template gallery with 10+ templates (Phase 2)
- Bulk generation / CSV import (Phase 3)
- Stripe payments / plan enforcement (Phase 4)
- Landing page / marketing site (Phase 4)
- Video generation (Phase 5)
- Music library (Phase 5)

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **File Upload:** react-dropzone + presigned S3/R2 URLs
- **Image Editor/Compositing:** Fabric.js or Konva.js

### Backend
- **API:** Next.js API Routes + tRPC
- **Database:** PostgreSQL (Supabase or Neon)
- **ORM:** Prisma
- **Auth:** Clerk or NextAuth.js
- **File Storage:** AWS S3 or Cloudflare R2
- **CDN:** Cloudflare

### AI & Media
- **Background Removal:** rembg (self-hosted Python service) or Remove.bg API
- **Image Processing:** Sharp (server-side resizing, format conversion)

### Infrastructure
- **Hosting:** Vercel (frontend + API routes)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking)

---

## Database Schema (Phase 1 Models)

Use Prisma. Generate UUIDs for all IDs. All timestamps use `DateTime @default(now())`.

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  avatarUrl       String?
  plan            String    @default("free") // free | starter | pro | agency (enforced in Phase 4)
  stripeCustomerId String?  // used in Phase 4
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  projects        Project[]
}

model Project {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  name        String
  type        String    @default("image") // image | video (video in Phase 5)
  status      String    @default("draft") // draft | processing | completed | failed
  templateId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  sourceImages     SourceImage[]
  generatedContent GeneratedContent[]
}

model SourceImage {
  id           String  @id @default(uuid())
  projectId    String
  project      Project @relation(fields: [projectId], references: [id])
  originalUrl  String  // original uploaded image URL in S3/R2
  processedUrl String? // background-removed version URL
  metadata     Json?   // { width, height, format, fileSize }
  order        Int     @default(0)
  createdAt    DateTime @default(now())
}

model GeneratedContent {
  id          String  @id @default(uuid())
  projectId   String
  project     Project @relation(fields: [projectId], references: [id])
  type        String  @default("image") // image | video (video in Phase 5)
  url         String  // final generated image URL in S3/R2
  thumbnailUrl String?
  format      String  @default("png") // png | jpg
  aspectRatio String  @default("1:1") // 1:1 only for Phase 1
  metadata    Json?   // { templateId, templateConfig, textOverlays }
  createdAt   DateTime @default(now())
}

model Template {
  id          String  @id @default(uuid())
  name        String
  category    String  // product_showcase | social_post | sale_promo
  type        String  @default("image") // image | video (video in Phase 5)
  thumbnailUrl String?
  config      Json    // { layout, textPositions, defaultColors, defaultFonts, backgroundStyle }
  isPremium   Boolean @default(false)
  createdAt   DateTime @default(now())
}
```

---

## Project Structure (Phase 1)

```
pixelforge/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard shell: sidebar nav, header
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx            # Projects list
│   │   │   │   ├── new/page.tsx        # Create new project flow
│   │   │   │   └── [id]/page.tsx       # Project detail: upload, generate, preview, download
│   │   │   └── settings/
│   │   │       └── page.tsx            # Basic account settings
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts    # tRPC handler
│   │   │   └── upload/
│   │   │       └── presign/route.ts    # Generate presigned upload URLs
│   │   ├── layout.tsx                  # Root layout
│   │   └── page.tsx                    # Redirect to /projects or /login
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── upload/
│   │   │   └── ImageUploader.tsx       # react-dropzone upload component
│   │   ├── editor/
│   │   │   └── ImagePreview.tsx        # Preview generated image
│   │   └── dashboard/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── ProjectCard.tsx         # Project thumbnail card for list view
│   ├── lib/
│   │   ├── ai/
│   │   │   └── rembg.ts               # Background removal API client
│   │   ├── media/
│   │   │   ├── sharp.ts               # Image resizing/format utils
│   │   │   └── templates.ts           # Template engine: compose product photo + layout + text
│   │   └── storage/
│   │       └── s3.ts                   # S3/R2 presigned URL generation, file operations
│   ├── server/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── trpc.ts                     # tRPC initialization + context
│   │   └── routers/
│   │       ├── project.ts              # Project CRUD + generation trigger
│   │       └── upload.ts               # Upload handling
│   ├── stores/
│   │   └── projectStore.ts            # Zustand store for active project state
│   └── types/
│       └── index.ts                    # Shared TypeScript types
├── prisma/
│   └── schema.prisma
├── public/
│   └── templates/                      # Template thumbnail images
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Core User Flow (Phase 1)

This is the single flow that must work end-to-end:

```
1. User signs up / logs in
   └─→ Redirected to /projects (empty state: "Create your first project")

2. User clicks "New Project"
   └─→ /projects/new
   └─→ Enters project name
   └─→ Selects a template (2-3 options shown as cards with thumbnails)
   └─→ Project created in DB with status "draft"

3. User uploads a product photo
   └─→ react-dropzone accepts image (jpg/png, max 10MB)
   └─→ Frontend requests presigned URL from /api/upload/presign
   └─→ Image uploaded directly to S3/R2
   └─→ SourceImage record created in DB with originalUrl
   └─→ Background removal triggered automatically
   └─→ processedUrl saved to SourceImage record
   └─→ User sees both: original and background-removed preview

4. User clicks "Generate"
   └─→ Project status → "processing"
   └─→ Template engine composites the final image:
       - Takes the processed (bg-removed) product photo
       - Applies the selected template layout
       - Adds text overlays (placeholder: "Product Name", "$29.99", "Shop Now")
       - Renders to 1080x1080 PNG
   └─→ Final image uploaded to S3/R2
   └─→ GeneratedContent record created
   └─→ Project status → "completed"

5. User previews the result
   └─→ Generated image displayed on the project detail page
   └─→ "Download" button saves the PNG locally

6. User returns to /projects
   └─→ Sees their project with thumbnail of the generated image
```

---

## Template Definitions (Phase 1 — Hardcoded)

Define 2-3 templates as JSON configs. These will be seeded into the Template table.

### Template 1: Product Showcase
```json
{
  "name": "Product Showcase",
  "category": "product_showcase",
  "config": {
    "layout": "centered",
    "background": {
      "type": "gradient",
      "colors": ["#f8f9fa", "#e9ecef"]
    },
    "productImage": {
      "position": "center",
      "maxWidth": 600,
      "maxHeight": 600,
      "offsetY": -40
    },
    "textOverlays": [
      {
        "id": "product_name",
        "text": "Product Name",
        "position": { "x": "center", "y": 820 },
        "font": "Inter",
        "fontSize": 36,
        "fontWeight": "bold",
        "color": "#1a1a1a"
      },
      {
        "id": "price",
        "text": "$29.99",
        "position": { "x": "center", "y": 870 },
        "font": "Inter",
        "fontSize": 28,
        "fontWeight": "normal",
        "color": "#666666"
      },
      {
        "id": "cta",
        "text": "Shop Now →",
        "position": { "x": "center", "y": 950 },
        "font": "Inter",
        "fontSize": 20,
        "fontWeight": "600",
        "color": "#ffffff",
        "background": "#1a1a1a",
        "padding": { "x": 32, "y": 12 },
        "borderRadius": 8
      }
    ]
  }
}
```

### Template 2: Social Post
```json
{
  "name": "Social Post",
  "category": "social_post",
  "config": {
    "layout": "split_horizontal",
    "background": {
      "type": "solid",
      "color": "#ffffff"
    },
    "productImage": {
      "position": "top",
      "maxWidth": 1080,
      "maxHeight": 700,
      "objectFit": "contain",
      "background": "#f5f5f5"
    },
    "textOverlays": [
      {
        "id": "product_name",
        "text": "Product Name",
        "position": { "x": 40, "y": 740 },
        "font": "Inter",
        "fontSize": 32,
        "fontWeight": "bold",
        "color": "#1a1a1a",
        "align": "left"
      },
      {
        "id": "description",
        "text": "Your perfect everyday essential",
        "position": { "x": 40, "y": 790 },
        "font": "Inter",
        "fontSize": 20,
        "color": "#888888",
        "align": "left"
      },
      {
        "id": "price",
        "text": "$29.99",
        "position": { "x": 40, "y": 840 },
        "font": "Inter",
        "fontSize": 40,
        "fontWeight": "bold",
        "color": "#1a1a1a",
        "align": "left"
      }
    ]
  }
}
```

### Template 3: Sale Promo
```json
{
  "name": "Sale Promo",
  "category": "sale_promo",
  "config": {
    "layout": "overlay",
    "background": {
      "type": "solid",
      "color": "#dc2626"
    },
    "productImage": {
      "position": "center",
      "maxWidth": 500,
      "maxHeight": 500,
      "offsetY": 0
    },
    "textOverlays": [
      {
        "id": "sale_badge",
        "text": "SALE",
        "position": { "x": "center", "y": 60 },
        "font": "Inter",
        "fontSize": 64,
        "fontWeight": "900",
        "color": "#ffffff",
        "letterSpacing": 8
      },
      {
        "id": "discount",
        "text": "30% OFF",
        "position": { "x": "center", "y": 140 },
        "font": "Inter",
        "fontSize": 36,
        "fontWeight": "bold",
        "color": "#fecaca"
      },
      {
        "id": "product_name",
        "text": "Product Name",
        "position": { "x": "center", "y": 880 },
        "font": "Inter",
        "fontSize": 28,
        "fontWeight": "bold",
        "color": "#ffffff"
      },
      {
        "id": "cta",
        "text": "SHOP NOW",
        "position": { "x": "center", "y": 950 },
        "font": "Inter",
        "fontSize": 22,
        "fontWeight": "bold",
        "color": "#dc2626",
        "background": "#ffffff",
        "padding": { "x": 40, "y": 14 },
        "borderRadius": 4
      }
    ]
  }
}
```

---

## API Routes (Phase 1)

### tRPC Routers

**project.ts:**
- `project.list` — Get all projects for current user (ordered by createdAt desc)
- `project.getById` — Get single project with sourceImages and generatedContent
- `project.create` — Create new project (name, templateId)
- `project.delete` — Soft delete or hard delete a project

**upload.ts:**
- `upload.getPresignedUrl` — Generate S3/R2 presigned PUT URL for a given filename and content type
- `upload.confirmUpload` — After successful upload, create SourceImage record and trigger background removal
- `upload.triggerBackgroundRemoval` — Call rembg/Remove.bg, save processed image, update SourceImage.processedUrl

**generation.ts:**
- `generation.generate` — Given a projectId, run the template engine: fetch processed image + template config → composite → upload result to S3/R2 → create GeneratedContent record → update project status
- `generation.getResult` — Get generated content for a project (URL, format, metadata)

### REST Endpoints

**POST /api/upload/presign**
- Input: `{ fileName: string, contentType: string }`
- Output: `{ uploadUrl: string, fileKey: string }`

---

## Background Removal

### Option A: rembg (self-hosted)
- Python service running rembg library
- Expose a simple HTTP endpoint: POST image → returns image with background removed
- Can run as a sidecar on Railway/Fly.io
- Free, no API costs, but requires a small server

### Option B: Remove.bg API
- Simpler to integrate (REST API call with image)
- Costs ~$0.10-0.20 per image
- Higher quality for complex backgrounds
- Rate limited on free tier

**Recommendation for Phase 1:** Start with Remove.bg API for faster integration. Switch to self-hosted rembg in Phase 2 to reduce costs at scale.

---

## Image Compositing (Template Engine)

The template engine takes three inputs and produces a final 1080x1080 PNG:

1. **Processed product image** (background removed)
2. **Template config** (JSON defining layout, text positions, colors)
3. **Text content** (hardcoded placeholders for Phase 1)

### Approach: Server-side with Sharp + node-canvas

```
Input: processedImageUrl + templateConfig + textContent
  │
  ├─ 1. Create blank 1080x1080 canvas
  ├─ 2. Draw background (gradient, solid color, or image)
  ├─ 3. Fetch and resize product image (bg-removed)
  ├─ 4. Composite product image onto canvas at template-defined position
  ├─ 5. Render text overlays (product name, price, CTA) per template config
  ├─ 6. Render CTA button/badge backgrounds if defined
  ├─ 7. Export as PNG buffer
  ├─ 8. Upload to S3/R2
  └─ 9. Return URL
```

Use **Sharp** for image compositing (fast, native) combined with **@napi-rs/canvas** or **node-canvas** for text rendering and shapes. Alternatively, use **Fabric.js** in a Node.js environment for the full compositing pipeline if more complex layouts are needed.

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Storage (S3 or R2)
S3_BUCKET_NAME="pixelforge-uploads"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_ENDPOINT="..." # For R2: https://<account>.r2.cloudflarestorage.com

# Background Removal
REMOVEBG_API_KEY="..." # If using Remove.bg
REMBG_SERVICE_URL="http://localhost:5000" # If using self-hosted rembg

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Seed Data

Create a seed script (`prisma/seed.ts`) that inserts the 3 hardcoded templates into the Template table on first run.

---

## UI Guidelines

- Use **shadcn/ui** components throughout (Button, Card, Dialog, Input, Badge, Skeleton, etc.)
- Keep the dashboard layout clean: left sidebar navigation, main content area
- Projects list: card grid showing project name, thumbnail (if generated), status badge, date
- Empty states: friendly message + CTA ("Upload your first product photo")
- Upload: drag-and-drop zone with progress indicator
- Generation: show a loading spinner/skeleton while processing, then reveal the result
- Mobile-responsive but desktop-first

---

## Definition of Done (Phase 1)

Phase 1 is complete when:

- [ ] A new user can sign up and log in
- [ ] The dashboard shows an empty projects list with a CTA to create the first project
- [ ] User can create a new project by entering a name and selecting one of 3 templates
- [ ] User can upload a product photo (jpg/png, max 10MB) via drag-and-drop
- [ ] The photo's background is automatically removed and both versions are shown
- [ ] User can click "Generate" and receive a 1080x1080 marketing image
- [ ] The generated image applies the selected template's layout, colors, and text
- [ ] User can download the generated image as PNG
- [ ] The projects list shows all created projects with thumbnails
- [ ] Auth protects all dashboard routes (unauthenticated users redirected to login)
- [ ] All images are stored in S3/R2 and served via CDN
- [ ] Database migrations run cleanly and seed data populates templates
