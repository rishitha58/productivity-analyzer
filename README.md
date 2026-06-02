# 🌸 Productivity Analyzer

> An AI-powered productivity & study companion built with React, Node.js, and dual-AI architecture (Groq + Gemini).

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini-purple)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack productivity application designed for students. Built as a 3rd year B.E. mini project, featuring AI-powered task extraction, focus mode with persistent timer, mock tests, and intelligent file processing.

## ✨ Features

### 📝 Smart Journal
- Write naturally → AI converts to structured tasks
- Goal-aligned task suggestions
- Streak tracking & daily motivation

### 🎯 Goal Roadmap
- Long-term goals broken into phases & milestones
- AI-generated personalized study plans
- Progress visualization

### 🧠 Focus Mode
- Customizable Pomodoro timer (15/25/45/60 min presets)
- **Floating widget** that persists across pages
- Local music player (Lo-fi, Rain, Nature, Piano)
- AI doubt solver with beautiful markdown rendering
- Auto-save session state

### 📝 Mock Tests
- Generate from any topic
- From focus mode doubts
- From your saved notes
- Multi-choice questions with explanations

### 💡 Key Points Extraction
- From topic names
- From pasted text
- From your notes (multi-select)
- **From uploaded PDF/TXT files** (multiple files)

### 💬 AI Chat Assistant
- Powered by Groq (Llama 3.3) for speed
- Personalized based on user goals
- Markdown formatting support
- Smart fallback to Gemini

### 📊 Smart History
- 3-way undone task handler (Did it / Add today / Skip)
- Visual status badges (completed late, skipped, carried forward)
- Automatic deduplication
- Daily completion analytics

### 🚗 Travel Reminders
- Auto-extract from journal
- Mode-aware (driving/walking/cycling)
- Smart departure time calculations

### 📈 Additional Features
- Mistakes tracking from mock tests
- Productivity insights & analytics
- Sleep schedule tracking
- Smart notifications system

## 🛠️ Tech Stack

### **Frontend**
- React 18 + Vite
- Tailwind CSS v3
- Framer Motion (animations)
- React Router v6
- React Markdown
- Lucide React (icons)

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- pdfjs-dist (PDF parsing)
- Axios

### **AI Integration**
- **Groq** (Llama 3.3 70B) — Chat & Doubts (14,400 req/day)
- **Gemini 2.5 Flash** — Structured JSON tasks (250 req/day)
- Intelligent fallback system for reliability

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Gemini API key — [Get free key](https://aistudio.google.com/apikey)
- Groq API key — [Get free key](https://console.groq.com/keys)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/productivity-analyzer.git
cd productivity-analyzer