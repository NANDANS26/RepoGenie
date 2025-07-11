
<h1 align="center">⚡ RepoGenie</h1>

<p align="center">
  <b>Turn your GitHub repositories into stunning, professional documents — powered by AI.</b><br/>
  🧠 Automate project reports · 📄 Export as PDF, DOCX, or PPTX · 🛠️ Built for Devs, Students & Teams
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/your-username/repogenie?style=flat-square" />
  <img src="https://img.shields.io/github/forks/your-username/repogenie?style=flat-square" />
  <img src="https://img.shields.io/github/issues/your-username/repogenie?style=flat-square" />
  <img src="https://img.shields.io/github/license/your-username/repogenie?style=flat-square" />
</p>

---

## 🧠 What is RepoGenie?

**RepoGenie** is your personal AI-powered documentation wizard.

Whether you're:
- a **student** submitting a final-year project,
- a **developer** showcasing your GitHub work on your resume,
- or a **hackathon team** pitching your code to judges...

👉 RepoGenie automates the creation of stunning, customizable, and editable documents directly from your GitHub repositories.

### ✅ Features:
- 🔍 Fetches all your public GitHub repositories automatically
- ✅ Pick projects you want to include
- ✨ Auto-generates summaries, features, SWOT, and use-cases using **Gemini API**
- 💬 Choose a tone: Corporate, Geeky, Friendly, or Startup-style
- 📊 Adds stunning charts (commits, languages, stars, forks)
- 🎨 Choose from elegant design templates
- 🔎 Live preview and inline editing
- 📄 Exports to **PDF**, **DOCX**, and **PPTX**
- ⚡ All under 5 minutes!

---

## 🌐 Live Demo

👉 [Try RepoGenie Live →](https://repo-genie-9m6x.vercel.app/)

---

## 🧩 Tech Stack

| Layer        | Technology                              |
|-------------|------------------------------------------|
| Frontend     | React, Vite, TailwindCSS, Zustand        |
| Charts       | Recharts / Chart.js                     |
| Backend      | Firebase Functions (Optional)           |
| AI Integration | Gemini API (Google AI)                |
| GitHub Data  | GitHub REST API                         |
| PDF Export   | Puppeteer                               |
| DOCX Export  | docx (npm library)                      |
| PPTX Export  | PptxGenJS                               |
| Hosting      | Vercel + Git-based CI/CD                |

---

## 🚀 Getting Started (Run Locally)

### 1. 📦 Clone the Repo

```bash
git clone https://github.com/your-username/repogenie.git
cd repogenie
```

### 2. 📁 Install Dependencies

```bash
npm install
```

### 3. 🔐 Set Up Environment Variables

Create a `.env` file in the root folder and add:

```env
VITE_GITHUB_API_KEY=your_github_personal_access_token
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> 💡 Don’t have keys yet?
- [Generate GitHub Token](https://github.com/settings/tokens)
- [Access Gemini API](https://makersuite.google.com/app)

### 4. 🧪 Run the App

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## 🛠 Folder Structure

```
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── utils/
├── public/
├── functions/
├── .env.example
├── vite.config.js
```

---

## ✨ Screenshots

|Input Page | Swlection Page | Generate Page |
|----------------|--------------|-------------|
| ![](./public/1.png) | ![](./public/2.png) | ![](./public/3.png) |

---

## 💡 Use Cases

- 🧑‍🎓 Student Project Submission
- 💼 Resume & Developer Portfolio
- 🎯 Hackathon Final Deliverables
- 📊 Client Presentations for Freelancers
- 📂 OSS Contribution Documentation

---

## 📌 Future Enhancements

- 🔐 GitHub OAuth for private repo support
- 🌐 Export to live portfolio website
- 🧑‍🤝‍🧑 Team collaboration & roles
- ☁️ Upload to Google Drive / Share via URL
- 🧠 Gemini-powered Q&A assistant (Repo insights)

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!  
Please feel free to submit Issues and Pull Requests.

---

## 🙌 Acknowledgements

- [GitHub REST API](https://docs.github.com/en/rest)
- [Gemini AI](https://ai.google.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
- [html2pdf & Puppeteer](https://github.com/eKoopmans/html2pdf)

---

> 💬 _“Don’t just push code. Present it like a pro.”_ — **RepoGenie**
