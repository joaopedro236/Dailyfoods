# 🍔 Dailyfoods


<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react">
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi">
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss">
  <img src="https://img.shields.io/badge/License-MIT-green">
</p>

---

# 📖 About

Dailyfoods is a full-stack food delivery application inspired by iFood.

The project was developed to practice modern web development concepts using **React**, **FastAPI**, and **PostgreSQL**, focusing on authentication, restaurant management, order visualization and responsive UI.

---


# ✨ Features

- ✅ User Authentication
- ✅ Restaurant Registration
- ✅ Dynamic Menu
- ✅ Image Upload
- ✅ Order Management
- ✅ Comments
- ✅ Responsive Design
- ✅ Cookie Authentication
- ✅ PostgreSQL Database

---

# 🏗 Architecture

```
                React
                  │
                  ▼
             FastAPI API
                  │
                  ▼
            PostgreSQL Database
```

---

# 🛠 Technologies & Tools

<div align="center">

<img src="https://skillicons.dev/icons?i=react,js,python,fastapi,postgres,html,css,tailwind,git,github,vscode"/>

</div>

---

# 📂 Project Structure

```
Dailyfoods
│
├── API
│   ├── Database
│   ├── Prompts
│   ├── Routers
│   ├── Validation
│   └── main.py
│
├── src
│   ├── Components
│   ├── StylesGlobals
│   ├── Assets
│
├── Uploads
└── README.md
```

---

# 🚀 Getting Started

## Clone

```bash
git clone https://github.com/SEU-USUARIO/Dailyfoods.git
```

## Backend

```bash
cd API

python -m venv .venv

pip install -r requirements.txt

uvicorn main:app --reload
```

## Frontend

```bash
npm install

npm run dev
```

---

#

# 🔄 Application Flow

```mermaid
graph LR

A[React] --> B[FastAPI]

B --> C[Validation]

C --> D[Authentication]

D --> E[PostgreSQL]

E --> F[Response]

F --> A
```

---

# 🎯 Learning Objectives

- REST APIs
- Authentication
- React Context
- File Upload
- PostgreSQL
- Responsive UI
- Component Architecture

---

## 📊 Dailyfoods — Tecnologias


pie title Dailyfoods - Tecnologias
    "React" : 35
    "Python / FastAPI" : 35
    "PostgreSQL" : 20
    "JavaScript / CSS" : 10

---


# 👨‍💻 Author

João Pedro 