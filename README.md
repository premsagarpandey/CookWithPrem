# 🍳 CookWithPrem

<p align="center">
  <b>A lightweight, zero-framework recipe platform powered by a custom C++ HTTP web server.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-C%2B%2B17-00599C?style=flat-square&logo=cplusplus&logoColor=white" alt="C++17" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JS_--_HTML5_--_CSS3-f7df1e?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Bundle_Size-%3C_1_MB-brightgreen?style=flat-square" alt="Size" />
  <img src="https://img.shields.io/badge/Platform-Windows_%7C_Linux-blue?style=flat-square&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/License-MIT-orange?style=flat-square" alt="License" />
</p>

---

## 🌟 Overview

**CookWithPrem** is a modern, interactive web application built entirely from scratch without bulky frameworks. 

By eliminating large dependencies like `node_modules`, **CookWithPrem delivers a fully functional recipe platform in under 1 MB**. The frontend relies on semantic HTML, CSS3, and Vanilla JavaScript, while the backend is powered by a high-performance, multi-platform C++ HTTP server capable of handling REST APIs, routing, and secure socket connections natively.

---

## ✨ Features

- **Zero-Framework Architecture:** Pure HTML5, CSS3, and ES6+ JavaScript. No npm dependencies or complex build steps.
- **Custom C++ HTTP Web Server:** Multi-platform socket implementation (Winsock2 for Windows, POSIX Sockets for Linux/macOS).
- **Responsive UI:** Clean, modern design featuring dark mode, custom CSS variables, and seamless micro-interactions.
- **Interactive Recipe Catalog:** Real-time filtering and search by category, prep time, and ingredients.
- **Security Built-In:** Defenses against Path Traversal, custom Security Headers, and basic IP Rate Limiting.
- **Admin Panel:** Content management via a secure `COOK_ADMIN_KEY` for browser-based recipe editing.
- **One-Click Windows Launcher:** A convenient `.vbs` script compiles the server and launches your browser automatically.

---

## 💡 Why a C++ Web Server?

While tools like Node.js or Next.js are industry standards, this project was created to:
1. **Explore Core Networking:** Understand TCP sockets and raw HTTP protocol specifications.
2. **Maximize Efficiency:** Achieve instant startup times and incredibly low memory usage (~2 MB RAM).
3. **Embrace Craftsmanship:** Build an application without relying on black-box abstractions.

---

## 🚀 Quick Start

### Prerequisites
- **Windows:** MinGW (`g++`) or MSVC.
- **Linux/macOS:** `g++` or `clang++`.

### Method 1: One-Click Launch (Windows) 🪟
Simply double-click `Start_CookWithPrem.vbs` to automatically compile the backend, start the server, and open the app at `http://localhost:8080`.

### Method 2: Manual Compilation 💻

**1. Clone the Repository**
```bash
git clone https://github.com/premsagarpandey/CookWithPrem.git
cd CookWithPrem
```

**2. Compile the Backend**
*Windows (MinGW):*
```cmd
cd backend
g++ main.cpp -o cpp_backend.exe -lws2_32
```
*Linux / macOS:*
```bash
cd backend
g++ main.cpp -o cpp_backend -pthread
```

**3. Run the Server**
*Windows:* `cpp_backend.exe`
*Linux / macOS:* `./cpp_backend`

**4. View in Browser**
Navigate to **`http://localhost:8080`**.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/recipes` | Retrieves all recipes (ingredients & steps) |
| `GET` | `/api/categories` | Retrieves all available food categories |

---

## 🔒 Security

- **Admin Access:** Press `Alt + A` on the website to access the Admin Panel. Secure this with the `COOK_ADMIN_KEY` in `.env`.
- **Security Guide:** See [`SECURITY_GUIDE.md`](SECURITY_GUIDE.md) for details on security headers and deployment.

---

## 👨‍💻 Author & License

Created by **Prem Sagar Pandey** ([@premsagarpandey](https://github.com/premsagarpandey)).

This project is licensed under the **MIT License**.
