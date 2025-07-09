# ✅ TaskFlow — A Modern To-Do List Web App

**TaskFlow** is a sleek, responsive, and minimalistic to-do list web app designed to help users **organize tasks** efficiently across **daily, monthly, and yearly** categories.

Built with a lightweight **Flask backend** and an **interactive Vanilla JavaScript frontend**, it delivers an elegant and intuitive task management experience.

---

## 🌟 What This Project Does

TaskFlow lets users:

- 📝 Add, complete, and delete tasks  
- 📅 Filter tasks by daily, monthly, yearly, completed, and pending  
- 💡 Toggle between Dark and Light modes  
- 💬 See a live greeting and real-time clock  
- 📂 Store their name, theme, and task history in `localStorage`  
- 📊 View real-time updates and stats (Total, Completed, Pending)  
- ⚙️ Works without a database using `tasks.json` for storage  

---

## 🚀 Features

✅ Add, complete, and delete tasks  
🔄 Real-time task updates via Fetch API  
💾 Persistent storage using `tasks.json` (no database needed)  
🎨 Fluid UI animations and interactive feedback  
🌗 Dark / Light mode toggle  
📆 Task filters: Daily, Monthly, Yearly, Completed, Pending  
📱 Fully responsive on all screen sizes  
🔐 Local user session (name, theme, history) saved in `localStorage`  
🌐 Cross-Origin support with Flask-CORS  
🤖 **AI Assistant (in progress)** – Smart task suggestions and productivity analysis *(coming soon!)*  

---

## 🧠 AI Assistant (Work in Progress)

We're working on integrating an **AI Assistant** that will help users:

- Suggest task priorities
- Create schedules based on workload
- Provide personalized productivity tips
- Send reminders and motivational nudges

Stay tuned for its release! 🚧

---

## 🛠️ Tech Stack

### 🔹 Frontend  
- HTML5 + CSS3 (with animations and responsive grid)  
- Vanilla JavaScript (DOM, Fetch API, LocalStorage)  

### 🔹 Backend  
- Python 3 + Flask (Micro web framework)  
- Flask-CORS (Handles cross-origin requests)  
- JSON-based storage (`tasks.json`)  

### 🔹 Version Control  
- Git  
- GitHub  

---

## 📸 Preview

**TaskFlow Preview**

![Image of the site](assets/screenshot.png)

---

## 🔧 Getting Started — Run Locally

Follow these steps to run **TaskFlow** on your local machine:

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
go to app.js file and do this : //const API_BASE = "http://127.0.0.1:5000";
const API_BASE = "https://taskflow-mf12.onrender.com";

Then open the cmd on the root directory and type python app.py
then copy the local host link to your browser 