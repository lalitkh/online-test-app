# Online Test Application

A modern, responsive online test/quiz application built with React, TypeScript, and Vite.

## Features

- ✅ Load questions from external JSON file
- ⏱️ Built-in timer with auto-submit
- 📊 Instant scoring and detailed results
- 🎯 Question navigation
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS
- 🧮 MathJax support for math equations

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/online-test-app.git
cd online-test-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Deploy to Vercel

### Option 1: One-click deploy from GitHub

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. Click **"Add New Project"** and import your repository.
4. Vercel will auto-detect the Vite framework. Use the default settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your app will be live in seconds.

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Run the deploy command from the project root:
```bash
vercel
```

3. Follow the prompts. For production deployment:
```bash
vercel --prod
```

> A `vercel.json` is included in the repo to handle SPA client-side routing rewrites.

## Supabase Setup (one-time)

Quiz data is stored in [Supabase](https://supabase.com) (free tier).

### 1. Create a Supabase project

Go to https://supabase.com, create a new project, and run the following SQL in the **SQL Editor**:

```sql
-- Subjects table
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 1800,
  passing_score INTEGER NOT NULL DEFAULT 90
);

-- Questions table
CREATE TABLE questions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  topic TEXT
);

-- Allow public read access
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key (found in **Settings → API**):

```bash
cp .env.example .env
```

Also add these as environment variables in your Vercel project settings.

### 3. Seed existing quiz data

```bash
npm install -D tsx dotenv
npx tsx scripts/seed-supabase.ts
```

## Adding a New Quiz (no code changes needed)

1. Open the **Supabase dashboard** → `subjects` table → **Insert row**:
   - `id`: a unique slug, e.g. `my_new_quiz`
   - `name`: display name, e.g. `My New Quiz`
   - `duration`: time in seconds, e.g. `1800` for 30 minutes
   - `passing_score`: percentage, e.g. `90`
   - `display_order`: controls sort order
   - `is_active`: `true` to show, `false` to hide

2. Go to the `questions` table → **Insert rows** for each question:
   - `subject_id`: must match the subject `id` above
   - `question`: the question text (supports HTML and LaTeX with `$$...$$`)
   - `options`: a JSON array, e.g. `["Option A", "Option B", "Option C", "Option D"]`
   - `correct_answer`: 0-based index of the correct option
   - `topic`: optional category label

3. **Done!** The app fetches data live from Supabase — no deploy needed.

## Technologies Used

- React 18.3
- TypeScript
- Vite 7
- Tailwind CSS
- Lucide React (icons)
- MathJax 3
- Supabase (backend)
