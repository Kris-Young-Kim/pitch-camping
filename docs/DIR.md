.
├── AGENTS.md
├── app
│ ├── admin
│ │ ├── analytics
│ │ │ └── page.tsx
│ │ └── dashboard
│ │ └── page.tsx
│ ├── api
│ │ ├── safety-guidelines
│ │ │ └── route.ts
│ │ └── sync-user
│ │ └── route.ts
│ ├── auth-test
│ │ └── page.tsx
│ ├── campings
│ │ └── [contentId]
│ │ └── page.tsx
│ ├── feedback
│ │ └── page.tsx
│ ├── safety
│ │ ├── [id]
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── storage-test
│ │ └── page.tsx
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ ├── not-found.tsx
│ ├── page.tsx
│ ├── robots.ts
│ └── sitemap.ts
├── actions
│ ├── admin-stats.ts
│ ├── get-analytics.ts
│ └── submit-feedback.ts
├── CLAUDE.md
├── components
│ ├── admin
│ │ ├── popular-campings.tsx
│ │ └── stats-card.tsx
│ ├── camping-card.tsx
│ ├── camping-detail
│ │ ├── bookmark-button.tsx
│ │ ├── detail-gallery.tsx
│ │ ├── reservation-button.tsx
│ │ ├── review-section.tsx
│ │ └── share-button.tsx
│ ├── camping-filters.tsx
│ ├── camping-list.tsx
│ ├── camping-search.tsx
│ ├── feedback-form.tsx
│ ├── loading
│ │ ├── card-skeleton.tsx
│ │ ├── detail-skeleton.tsx
│ │ ├── image-skeleton.tsx
│ │ └── map-skeleton.tsx
│ ├── naver-map.tsx
│ ├── Navbar.tsx
│ ├── providers
│ │ └── sync-user-provider.tsx
│ ├── safety
│ │ ├── safety-card.tsx
│ │ ├── safety-guidelines.tsx
│ │ ├── safety-recommendations.tsx
│ │ └── safety-video.tsx
│ ├── theme-toggle.tsx
│ ├── ui
│ │ ├── accordion.tsx
│ │ ├── badge.tsx
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── dialog.tsx
│ │ ├── form.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ ├── sonner.tsx
│ │ ├── table.tsx
│ │ └── textarea.tsx
│ └── web-vitals.tsx
├── components.json
├── constants
│ └── camping.ts
├── docs
│ ├── BUSINESS_MODEL.md
│ ├── CACHING_STRATEGY.md
│ ├── COST_TRACKING.md
│ ├── DEPLOYMENT_CHECKLIST.md
│ ├── Design.md
│ ├── DIR.md
│ ├── EXTERNAL_API_INTEGRATION_PLAN.md
│ ├── FINANCIAL_MODEL.md
│ ├── LIGHTHOUSE_CHECKLIST.md
│ ├── MVP_FEATURE_CHECKLIST.md
│ ├── mermaid.md
│ ├── OPERATIONS_CHECKLIST.md
│ ├── PHASE1_PLAN.md
│ ├── PHASE2_PLAN.md
│ ├── PHASE3_PLAN.md
│ ├── PHASE4_PLAN.md
│ ├── PHASE5_PLAN.md
│ ├── PHASE6_PLAN.md
│ ├── PITCH_DECK.md
│ ├── PRD.md
│ ├── SAFETY_GUIDELINES_PLAN.md
│ └── TODO.md
├── eslint.config.mjs
├── hooks
│ ├── use-sync-user.ts
│ ├── use-toast-primitive.ts
│ └── use-toast.ts
├── lib
│ ├── api
│ │ ├── analytics.ts
│ │ ├── camping-api.ts
│ │ ├── fallback-handler.ts
│ │ ├── rate-limit-handler.ts
│ │ ├── reviews.ts
│ │ └── safety-guidelines.ts
│ ├── supabase
│ │ ├── clerk-client.ts
│ │ ├── client.ts
│ │ ├── server.ts
│ │ └── service-role.ts
│ ├── supabase.ts
│ ├── utils
│ │ ├── camping.ts
│ │ ├── logger.ts
│ │ ├── metrics.ts
│ │ ├── performance.ts
│ │ └── ranking.ts
│ └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
│ ├── icons
│ │ ├── icon-192x192.png
│ │ ├── icon-256x256.png
│ │ ├── icon-384x384.png
│ │ └── icon-512x512.png
│ ├── logo.png
│ └── og-image.png
├── README.md
├── supabase
│ ├── config.toml
│ └── migrations
│ ├── 20251106134554_update_bookmarks_schema.sql
│ ├── 20251106140000_create_statistics_tables.sql
│ ├── 20251106140001_design_rls_policies.sql
│ ├── 20251106140002_create_reviews_table.sql
│ ├── 20251106150000_create_feedback_table.sql
│ ├── 20251106160000_create_safety_guidelines_table.sql
│ ├── setup_schema.sql
│ ├── setup_storage.sql
│ └── tourapi_schema.sql
├── types
│ └── camping.ts
├── tsconfig.json
└── vercel.json
