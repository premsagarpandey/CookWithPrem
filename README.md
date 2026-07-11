# CookWithPrem 🍳
> **Step-by-Step Recipes by Prem Sagar Pandey**

A premium, ultra-lightweight cooking recipe platform designed as a beginner-student project. It features a **pure HTML/CSS/JS frontend** served entirely by a custom-written **C++ backend HTTP server**. 

By replacing heavy frameworks like Next.js, the project disk size has been optimized from **450MB+ down to under 1MB**!

---

## ✨ Features

- 🍦 **Vanilla Stack**: Built purely using HTML5, CSS3, and standard ES6 JavaScript. No framework overhead.
- 🎨 **Premium Aesthetics**: Features a beautiful color scheme (Cream, Sage Green & Warm Brown) with responsive grids and interactive detail modals.
- 📂 **Multi-Page Layout**: Separate sections for Home, Recipes (with Category dynamic filtering and Search), About Us, and Contact Us.
- ⚡ **Lightweight C++ Server**: Actively handles routing, serves static frontend assets, and handles REST API requests (`/api/recipes`, `/api/categories`).
- 🌐 **Winsock Socket Server**: Uses native low-level Windows Sockets (`winsock2.h`) and standard POSIX sockets.

---

## 📂 Project Structure

```
CookWithPrem/
├── frontend/                     # ── STATIC FRONTEND LAYER ───────────────
│   ├── index.html                # Home Landing Page
│   ├── recipes.html              # Recipes Catalog (with dynamic filtering)
│   ├── about.html                # About Prem Sagar Pandey & cooking tips
│   ├── contact.html              # Contact Form (with live success alerts)
│   ├── style.css                 # Premium style sheets
│   └── app.js                    # Dynamic fetch operations & modal popups
│
└── backend/                      # ── C++ BACKEND WEB SERVER ──────────────
    ├── main.cpp                  # C++ HTTP socket server
    ├── recipes.json              # Recipes JSON database
    ├── categories.json           # Categories JSON database
    ├── CMakeLists.txt            # CMake configuration
    └── cpp_backend.exe           # Compiled backend binary (Windows)
```

---

## 🛠️ How to Compile & Run Locally

### 1. Compile the Backend (MinGW/GCC)
Open your command prompt or terminal in the `backend/` directory and run:

```bash
# Compile using g++ compiler linking Winsock
g++ main.cpp -o cpp_backend.exe -lws2_32

# Run the backend server
./cpp_backend.exe
```

### 2. View the Platform
Once the C++ server is running, open your web browser and visit:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🎓 Git Tutorial: How to Commit & Push Changes

If you make modifications to this project (e.g., editing HTML files, changing style sheets, or updating C++ code), follow these steps to commit and push your changes to GitHub:

### Step 1: Check your modified files
Verify what files have been changed or added:
```bash
git status
```

### Step 2: Stage the changes
Add all the changed files to the Git staging index:
```bash
git add .
```
*(Alternatively, stage a specific file using `git add folder/file.html`)*

### Step 3: Create a local Commit
Save a snapshot of your changes locally with a descriptive message:
```bash
git commit -m "Describe what changes you made (e.g., Updated contact details)"
```

### Step 4: Push the changes to GitHub
Upload your local commits to the remote repository on GitHub:
```bash
git push origin main
```
