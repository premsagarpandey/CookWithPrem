# CookWithPrem 🍳

> **Step-by-Step Recipes by Prem Sagar Pandey**

A premium, ultra-lightweight cooking recipe platform built as a personal project. It features a **pure HTML/CSS/JS frontend** served by a custom **C++ HTTP server** — no frameworks, no bloat.

Total project size: **under 1 MB** (compared to 450MB+ with typical JS frameworks).

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🍦 **Vanilla Stack** | Built with HTML5, CSS3, and ES6 JavaScript. Zero framework overhead. |
| 🎨 **Premium UI** | Elegant color palette, responsive grids, 3D card animations, and interactive modals. |
| 📂 **Multi-Page Layout** | Home, Recipes (with category filtering & fuzzy search), About, and Contact pages. |
| ⚡ **C++ Backend** | Custom HTTP server handles routing, serves static files, and exposes REST APIs. |
| 🌐 **Cross-Platform Sockets** | Uses Winsock on Windows and POSIX sockets on Linux/macOS. |
| 🚀 **One-Click Launch** | VBS script to start the server and open the browser automatically. |

---

## 📂 Project Structure

```
CookWithPrem/
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── Start_CookWithPrem.vbs        # One-click launcher (starts server + opens browser)
│
├── frontend/                     # Static Frontend
│   ├── index.html                # Home page
│   ├── recipes.html              # Recipe catalog (dynamic filtering & search)
│   ├── about.html                # About page
│   ├── contact.html              # Contact form
│   ├── style.css                 # Stylesheets
│   ├── app.js                    # Client-side logic
│   └── images/                   # Image assets
│
└── backend/                      # C++ Web Server
    ├── main.cpp                  # HTTP socket server source
    ├── recipes.json              # Recipe database
    ├── categories.json           # Category database
    └── CMakeLists.txt            # CMake build configuration
```

---

## 🚀 Quick Start

### Option 1: One-Click Launch (Windows)
Double-click **`Start_CookWithPrem.vbs`** — it starts the server in the background and opens the website automatically.

### Option 2: Manual Setup

**1. Compile the backend:**
```bash
cd backend
g++ main.cpp -o cpp_backend.exe -lws2_32
```

**2. Run the server:**
```bash
./cpp_backend.exe
```

**3. Open in browser:**
```
http://localhost:8080
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recipes` | Returns all recipes as JSON |
| `GET` | `/api/categories` | Returns all categories as JSON |

---

## 👨‍💻 Author

**Prem Sagar Pandey**
B.Tech Student — Bhopal

Built with ❤️ and a lot of cooking experiments.
