# 🍳 CookWithPrem

<p align="center">
  <b>A lightweight, zero-framework recipe platform powered by a custom C++ HTTP web server.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-C%2B%2B17-00599C?style=for-the-badge&logo=cplusplus&logoColor=white" alt="C++17" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JS_--_HTML5_--_CSS3-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Bundle_Size-%3C_1_MB-brightgreen?style=for-the-badge" alt="Size" />
  <img src="https://img.shields.io/badge/Platform-Windows_%7C_Linux-blue?style=for-the-badge&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Overview

**CookWithPrem** is a personal project created to showcase how fast, elegant, and efficient a modern web application can be when built from scratch without bulky frameworks. 

While typical modern web projects pull in hundreds of megabytes of `node_modules`, **CookWithPrem delivers a complete interactive cooking platform in under 1 MB total size**. 

The frontend uses pure, semantic HTML, CSS, and Vanilla JavaScript. The backend is a custom-built, multi-platform C++ HTTP server handling socket connections, MIME type resolution, security headers, and REST API endpoints natively.

---

## ✨ Features

- ⚡ **Zero-Framework Overhead:** Built using standard **HTML5, CSS3, and ES6+ JavaScript**. Zero npm dependencies, zero build steps.
- 🚀 **Custom C++ HTTP Web Server:** Multi-platform socket implementation (**Winsock2** on Windows, **POSIX Sockets** on Linux/macOS) handling HTTP request parsing, routing, and REST APIs.
- 🎨 **Modern & Responsive UI:** Designed with custom CSS variables, dark-mode elements, micro-interactions, responsive grids, and clean visual cards.
- 🔍 **Interactive Recipe Catalog:** Real-time search and filter by dish categories, prep time, and ingredients.
- 🔒 **Security First:** Built-in Path Traversal defense, custom Security Headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`), and IP Rate Limiting.
- 🔑 **Built-in Admin Panel:** Authenticated content management via `COOK_ADMIN_KEY` for adding and editing recipes directly in the browser (`Alt + A`).
- ⚡ **One-Click Windows Launcher:** Silent `.vbs` launcher that compiles/runs the C++ server and automatically opens your browser.

---

## 💡 Why Build a C++ Web Server?

Many web developers rely heavily on Node.js/Express, Python/Django, or Next.js. I decided to build a raw C++ HTTP server to:
1. **Understand Core Networking:** Gain hands-on experience with TCP socket communication, HTTP protocol specifications, and OS-level network libraries.
2. **Extreme Efficiency:** Achieve sub-millisecond startup times and negligible memory usage (~2 MB RAM usage).
3. **Pure Craftsmanship:** Eliminate heavy black-box abstractions and control every single byte flowing between the server and the browser.

---

## 📂 Project Structure

```text
CookWithPrem/
├── Start_CookWithPrem.vbs   # One-click Windows launcher (starts server + opens browser)
├── SECURITY_GUIDE.md        # Comprehensive security architecture & deployment guide
├── .env.example             # Template for admin key & server port configuration
├── README.md                # Project documentation
│
├── frontend/                # Static Frontend Assets
│   ├── index.html           # Landing page with hero banner & featured recipes
│   ├── recipes.html         # Interactive recipe catalog & search interface
│   ├── about.html           # Project story & developer info
│   ├── contact.html         # Inquiry & feedback form
│   ├── css/                 # Modern CSS design system
│   │   └── style.css
│   └── js/                  # App logic, filtering & API fetch handlers
│       └── app.js
│
└── backend/                 # High-Performance C++ Web Server
    ├── main.cpp             # Server source (Sockets, HTTP parser, REST API, Router)
    ├── recipes.json         # Master recipe database
    ├── categories.json      # Category metadata
    └── CMakeLists.txt       # Cross-platform CMake build file
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have a C++ compiler installed:
- **Windows:** MinGW (`g++`) or MSVC compiler.
- **Linux/macOS:** `g++` or `clang++`.

---

### Method 1: One-Click Launch (Windows) 🪟

If you're on Windows, double-click:
```
Start_CookWithPrem.vbs
```
This script silently compiles the backend (if needed), starts the C++ server in the background, and opens `http://localhost:8080` in your default web browser.

---

### Method 2: Manual Compilation & Run 💻

**1. Clone the Repository**
```bash
git clone https://github.com/premsagarpandey/CookWithPrem.git
cd CookWithPrem
```

**2. Compile the Backend**

- **Windows (MinGW / Command Prompt):**
  ```cmd
  cd backend
  g++ main.cpp -o cpp_backend.exe -lws2_32
  ```

- **Linux / macOS:**
  ```bash
  cd backend
  g++ main.cpp -o cpp_backend -pthread
  ```

- **Cross-Platform (using CMake):**
  ```bash
  cd backend
  mkdir build && cd build
  cmake ..
  cmake --build .
  ```

**3. Run the Server**

- **Windows:**
  ```cmd
  cpp_backend.exe
  ```
- **Linux / macOS:**
  ```bash
  ./cpp_backend
  ```

**4. Open in Browser**  
Navigate to **`http://localhost:8080`**.

---

## 📡 REST API Documentation

The C++ server exposes lightweight REST endpoints returning JSON payloads:

| Method | Endpoint | Description | Response Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recipes` | Retrieves all recipes with ingredients & steps | `application/json` |
| `GET` | `/api/categories` | Retrieves all food categories | `application/json` |

### Sample JSON Response (`GET /api/recipes`)

```json
[
  {
    "id": 1,
    "title": "Paneer Butter Masala",
    "category": "Main Course",
    "prepTime": "30 mins",
    "difficulty": "Medium",
    "ingredients": ["Paneer", "Tomatoes", "Butter", "Spices"],
    "instructions": ["Prepare tomato gravy", "Add paneer cubes", "Simmer with cream"]
  }
]
```

---

## 🔒 Security & Admin Access

- **Admin Access:** Press `Alt + A` on the website to access the Admin Panel. Enter your `COOK_ADMIN_KEY` configured in `.env`.
- **Security Guide:** Detailed info on HTTP Security Headers, Path Traversal Protection, and Production SSL setup can be found in [`SECURITY_GUIDE.md`](SECURITY_GUIDE.md).

---

## 🛠️ Tech Stack Summary

- **Frontend:** HTML5, CSS3 (Variables, Grid, Flexbox), ES6+ Vanilla JavaScript.
- **Backend:** C++17, Sockets (Winsock2 / POSIX), RESTful JSON API.
- **Build & Tools:** CMake, MinGW / GCC, VBScript.

---

## 👨‍💻 Author

**Prem Sagar Pandey**  
*B.Tech Student — Bhopal, India*

- 🐙 **GitHub:** [premsagarpandey](https://github.com/premsagarpandey)

---

## 📜 License

This project is open-source and available under the **MIT License**.

<p align="center">
  <i>Built with ❤️, curiosity, and a passion for fast code by Prem Sagar Pandey.</i>
</p>
