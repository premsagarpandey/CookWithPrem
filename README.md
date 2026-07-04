# CookWithPrem 🍳
> **Step-by-Step Recipes by Prem Sagar Pandey**

A super simple, lightweight cooking recipe platform built using a **pure HTML/CSS/JS frontend** and a **C++ backend HTTP server**. The project size has been reduced from 450MB+ (framework overhead) to **under 1MB**!

---

## 📂 Project Structure

```
CookWithPrem/
├── frontend/                     # ── STATIC FRONTEND LAYER ───────────────
│   ├── index.html                # Main homepage & recipe viewer
│   ├── style.css                 # Sage Green, Cream, and Brown theme styles
│   └── app.js                    # Fetch logic to query C++ backend & render cards
│
└── backend/                      # ── C++ BACKEND WEB SERVER ──────────────
    ├── main.cpp                  # C++ HTTP socket server
    ├── recipes.json              # Recipes JSON database
    ├── categories.json           # Categories JSON database
    ├── CMakeLists.txt            # CMake configuration
    └── cpp_backend.exe           # Compiled backend binary (Windows)
```

---

## 🛠️ How to Compile & Run

### 1. Compile the Backend (MinGW/GCC)
Open terminal/cmd in the `backend/` folder and run:

```bash
# Compilation
g++ main.cpp -o cpp_backend.exe -lws2_32

# Execution
./cpp_backend.exe
```

### 2. View the Website
Once the backend server starts, it will listen on port `8080`.
Open your browser and navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🎓 Design Focus
- **Pure HTML, CSS, & Vanilla JS**: Zero dependencies, no node_modules, no frameworks, no configuration bloat.
- **Lightweight C++ Server**: Acts as both the API server (serving JSON data) and the static file server (serving HTML, CSS, and JS).
- **CORS Compliant**: Ready to handle AJAX fetch requests.
