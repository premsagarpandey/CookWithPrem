# CookWithPrem 🍳
> **Step-by-Step Recipes by Prem Sagar Pandey**

A production-ready, enterprise-quality, fully responsive cooking recipe platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase. This platform features a premium minimalist UI/UX design (featuring a natural White, Cream, Sage Green, and Warm Brown theme), strict SEO compliance, built-in dynamic sitemaps, JSON-LD recipe/breadcrumb schemas, and a full role-based administration panel.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode compliant)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components & Icons**: [shadcn/ui](https://ui.shadcn.com/) & [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Firebase Auth](https://firebase.google.com/docs/auth), [Cloud Firestore](https://firebase.google.com/docs/firestore), and [Firebase Storage](https://firebase.google.com/docs/storage)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages, layouts, sitemaps, and robots)
│   ├── admin/            # Role-based admin panel (Recipes, Comments, Newsletter, Users)
│   ├── categories/       # Category directory and dynamic slug pages
│   ├── recipes/          # Recipe feed and dynamic step-by-step recipe detail pages
│   └── (static pages)/   # About, contact, profile, privacy, terms, search
├── components/           # Reusable UI component layers
│   ├── auth/             # Protected routes, Admin guards, and Authentication modals
│   ├── layout/           # Shared global components (Navbar, Footer)
│   ├── recipe/           # Recipes list feeds and recipe detail components
│   └── ui/               # Design system elements (Dialog, input, button wrappers)
├── contexts/             # Global contexts (AuthContext for persistent login sessions)
├── lib/                  # Utilities, Constants, Firebase client instances, and schemas
│   ├── firebase/         # Firebase initialization, Storage helpers, and Firestore APIs
│   ├── constants.ts      # Static branding variables, menu systems, and categories config
│   ├── utils.ts          # Core styling concatenation (cn), custom time utilities
│   └── validators.ts     # Zod validation schemas (forms, recipes, messages, newsletters)
└── types/                # Strict TypeScript declaration types
```

---

## 🔒 Security & Rules

This project includes pre-configured security rules for Firestore and Storage to guarantee secure role-based operations:
1. **`firestore.rules`**: Restricts recipe and category creation to administrators only, protects bookmark write rights to the respective logged-in user, and checks user ownership before modifying comments and ratings.
2. **`storage.rules`**: Restricts raw recipe asset upload permissions to administrators while allowing public read access, and locks user avatar writes to the account holder.

Deploy rules via CLI:
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
Ensure you have [Node.js (v18.x or later)](https://nodejs.org/) installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<your-username>/CookWithPrem.git
cd CookWithPrem
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and copy the contents from `.env.example`, replacing the placeholders with your actual Firebase API keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_SITE_URL="https://cookwithprem.com"
```

### 4. Running Locally
Run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Production Compilation & Lint Checks
Compile the production bundle and verify strict type-checking and ESLint compliance:
```bash
# Run lint verification (succeeds with 0 errors/warnings)
npm run lint

# Compile production build
npm run build
```

---

## 📈 SEO & Performance Optimization

- **Next.js Image**: All images (including remote assets from Firebase Storage or Google OAuth avatars) are loaded using optimized `<Image />` tags with custom remote domain mappings.
- **Dynamic Sitemap & Robots**: Fully functional sitemap (`sitemap.xml`) and crawler controller (`robots.txt`) dynamically register static pages and fetch dynamic recipes from Firestore. Includes a fallback catcher to prevent compilation crashes during initial setups.
- **Rich Snippets (JSON-LD)**: Embeds granular Schema.org `Recipe` and `BreadcrumbList` formats into dynamically generated recipe detail pages to display premium aggregate ratings and cooking times directly in search queries.
