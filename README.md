# Life-OS | Unified Daily Tracker

Welcome to **Life-OS**, a premium, AI-powered life optimization platform. Track your habits, manage tasks, monitor wellness, and reflect through journaling—all enhanced by the **Gemini 2.0 Flash** intelligent assistant.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: A running local instance or a remote Atlas connection string
- **Gemini AI API Key**: Get one from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
Clone the repository and install dependencies from the root:
```bash
git clone https://github.com/muthanandham/habbit-tracker.git
cd habbit-tracker
npm install
```

### 3. Environment Configuration
Create a `.env` file in the **`server/`** directory (you can use `.env.example` as a template):
```bash
cp .env.example server/.env
```
Update **`server/.env`** with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/life-os
JWT_SECRET=your_secure_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Application
Start both the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Zustand, Lucide Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), AI-powered middleware
- **Intelligence**: Google Gemini 2.0 Flash (AI Assistant Layer)
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Styling**: Premium "Obsidian Archive" Dark Mode + Glassmorphism

---

## 🧪 Testing & Quality
The project follows a localized testing strategy:

- **Full Verification**: `npm run test` (Runs all unit and E2E tests)
- **Backend Tests**: `npm run test --workspace=server`
- **E2E Browser Tests**: `npm run test:e2e` (Requires Playwright browsers)
- **Linting**: `npm run lint` (Checks all workspaces for zero errors/warnings)

---

## 📂 Project Structure
```text
├── client/          # Vite + React Frontend
├── server/          # Node.js + Express Backend
├── shared/          # Shared TypeScript models/schemas
├── docs/            # Full architectural & product documentation
└── package.json     # Monorepo orchestration
```

### 🧠 AI Assistant Capabilities
The built-in **AI Life Assistant** can:
- Parse unstructured requests into habits/tasks.
- Provide "Pulse" insights on your wellness data.
- Analyze productivity patterns across your modules.
- *Note: Actions are "safe" (Create/Update/Query only). Data deletion is restricted to maintain integrity.*

---

## 🛡️ Security & Hardening
Life-OS is built with production standards:
- **Rate Limiting**: AI endpoints are protected against abuse.
- **Input Sanitization**: Full validation using `express-validator`.
- **Security Headers**: Hardened with `helmet.js`.
- **Type Safety**: strict TypeScript across total stack.

---

## 📄 License
This project is for personal life optimization. All rights reserved.
