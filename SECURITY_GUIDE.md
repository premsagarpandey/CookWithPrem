# 🛡️ CookWithPrem Security & Deployment Guide

This document explains the security architecture of **CookWithPrem** and how to deploy it safely to production.

---

## 🚀 1. GitHub & Public Repository Security

- **Never Commit `.env`**: The `.env` file contains your private environment variables. It is listed in `.gitignore` and must **never** be pushed to GitHub.
- **Environment Template**: Use `.env.example` as a template for environment configuration.
- **Read-Only Public Access**: By default, public visitors only have `GET` access to website files and recipes. Any attempt to modify data via `POST`, `PUT`, or `DELETE` is blocked by the C++ backend (`405 Method Not Allowed`).

---

## 🔒 2. Server Security Features Implemented

1. **Security Headers**:
   - `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing attacks)
   - `X-Frame-Options: SAMEORIGIN` (Prevents Clickjacking)
   - `X-XSS-Protection: 1; mode=block` (Blocks Cross-Site Scripting)
   - `Content-Security-Policy`: Restricts unauthorized scripts and frame sources.
   - `Referrer-Policy: strict-origin-when-cross-origin`
2. **Path Traversal Protection**:
   - URL path sanitization prevents directory traversal attacks (`../`, `%2e%2e`).
3. **IP Rate Limiting**:
   - In-memory rate limiting prevents DDoS flooding and brute-force attacks.
4. **Input Sanitization**:
   - Dynamic UI renders sanitize user input to prevent DOM XSS vulnerabilities.

---

## 🔐 3. Anti-Inspection & DevTools Protection

1. **Right-Click & Hotkey Suppression**:
   - Disables context menu (`contextmenu`) and intercepts DevTools hotkeys (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U`, `Cmd+Opt+I/J/C/U`).
2. **DevTools Anti-Debugging Trap**:
   - Detects active Chrome DevTools inspection sessions and activates anti-debugging loops.
3. **Console Scrubbing**:
   - Automatically silences `console.log` and standard output methods, printing an anti-tamper security notice.
4. **Source Code Hygiene**:
   - All structural HTML comments, boilerplate annotations, and developer hints have been stripped to present clean, production-ready code.
5. **Server Signature Obfuscation**:
   - Returns customized server header `Server: CookEngine/1.0 (Production Security Hardened)` with strict cache control directives (`Cache-Control: no-store, no-cache`).

