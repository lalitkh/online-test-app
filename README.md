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

## Adding Your Questions

Add a JSON file to the `public/` folder with your own questions:
```json
{
  "title": "Your Quiz Title",
  "duration": 600,
  "questions": [
    {
      "topic": "science",
      "id": 1,
      "question": "Your question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}
```

Then register it in the `subjects` array inside `src/App.tsx`.

## Technologies Used

- React 18.3
- TypeScript
- Vite 7
- Tailwind CSS
- Lucide React (icons)
- MathJax 3
