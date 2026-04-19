# FlowSphere – Intelligent Venue Experience System

FlowSphere is a smart venue management and attendee experience platform. This repository contains the frontend application and the Venue Brain dashboard.

## Tech Stack
- Frontend: Vanilla JavaScript + Vite
- Styling: Custom CSS (Glassmorphism, CSS Variables)
- Deployment: Docker + Nginx

## Getting Started

```bash
npm install
npm run dev
```

## Docker Build

```bash
docker build -t flowsphere .
docker run -p 8080:80 flowsphere
```
