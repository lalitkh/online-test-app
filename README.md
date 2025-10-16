# Online Test Application

A modern, responsive online test/quiz application built with React, TypeScript, and Vite.

## Features

- ✅ Load questions from external JSON file
- ⏱️ Built-in timer with auto-submit
- 📊 Instant scoring and detailed results
- 🎯 Question navigation
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS

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

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Adding Your Questions

Edit the `public/questions.json` file with your own questions:
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

## Technologies Used

- React 18.3
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
