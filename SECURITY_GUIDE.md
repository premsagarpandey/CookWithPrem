# 🛡️ CookWithPrem Security & Deployment Guide

This document explains the security architecture of **CookWithPrem**, how to deploy it safely to production, and how to safely update website content.

---

## 🚀 1. GitHub & Public Repository Security

- **Never Commit `.env`**: The `.env` file contains your private `COOK_ADMIN_KEY`. It is listed in `.gitignore` and must **never** be pushed to GitHub.
- **Environment Template**: Use `.env.example` as a template for environment configuration.
- **Read-Only Public Access**: By default, public visitors only have `GET` access to website files and recipes. Any unauthorized attempt to modify data via `POST`, `PUT`, or `DELETE` is blocked by the C++ backend (`403 Forbidden`).

---

## 🔑 2. Admin Authentication & Content Management

To update recipes or categories on your website:
1. Set a strong `COOK_ADMIN_KEY` in your `.env` file or server environment variables.
2. In the CookWithPrem website interface, click the **🔒 Admin Login** link (or press `Alt + A`).
3. Enter your `COOK_ADMIN_KEY`.
4. You will get access to the **Admin Control Panel** where you can add new recipes, edit existing recipes, and manage categories directly from the browser!

---

## 🔒 3. Server Security Features Implemented

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

## 🌐 4. Recommended Production Deployment Steps

When deploying to a public VPS or cloud platform (e.g. Render, Railway, AWS, DigitalOcean, or Vercel):
- **Enable HTTPS / SSL**: Use Cloudflare or Let's Encrypt so all web traffic is encrypted with TLS 1.3.
- **Enable Cloudflare WAF**: Place Cloudflare in front of your domain for free DDoS mitigation and Web Application Firewall rules.
- **Set Production Env**: Set `COOK_ADMIN_KEY` as a secure environment variable on your hosting platform dashboard.
