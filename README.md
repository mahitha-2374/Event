# 📅 Event Calendar

The **Event Calendar** is a simple yet powerful tool designed to help users manage, schedule, and track events efficiently. Whether you’re planning meetings, tracking holidays, or managing personal schedules, this calendar keeps you on top of your commitments.

---

## ✨ Features

- **Create, edit, and delete events** with custom titles, descriptions, dates, and times.
- **Multiple calendar views**: month, week, and day formats.
- **Recurring events** with customizable repetition (daily, weekly, custom).
- **Color-coded categories** for easy differentiation of event types.
- **Reminders and notifications** for upcoming events.
- **Responsive design** for use across devices.
- **Optional integration** with external calendars (e.g., Google Calendar, Outlook).


Got it! You want a **more clean, appealing, and properly structured version**, where instructions are **formatted for a GitHub README**, but **not as one big code block**. Let me give you a **normal, Markdown-friendly version** that looks polished, clear, and visually appealing when rendered on GitHub:

---

# 📅 Event-Calendar Setup Guide

Follow these steps to set up and run the **Event-Calendar** project locally.

---

## 🚀 1. Ensure Node.js is Installed

Open your terminal or command prompt and check your Node.js version:

```bash
node -v
```

✅ If you see a version number (e.g., `v18.x.x` or higher), you're good to go.
❌ If not, download and install Node.js from [nodejs.org](https://nodejs.org) (LTS version recommended).

---

## 📁 2. Navigate to Your Project Directory

Use `cd` to navigate to your project folder:

```bash
cd Documents/Event-Calendar
```

---

## 📦 3. Install Project Dependencies

Run the following command to install dependencies:

```bash
npm install
```

Or if you prefer Yarn:

```bash
yarn install
```

---

## 🔐 4. Set Up Environment Variables (For AI Features)

Edit the `.env` file in your project root and update it like this:

```dotenv
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

Replace `YOUR_ACTUAL_GEMINI_API_KEY` with your **Gemini API Key** from **Google AI Studio**.

> 💡 **Note**: If you don’t plan to use the AI features immediately, the calendar and event management will still work, but Smart Schedule will likely fail.

---

## 🏃 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Or if using Yarn:

```bash
yarn dev
```

You should see output like:

```
✓ Ready in x.xxs
● Next.js 15.x.x
  Local: http://localhost:9002
```

---

## 🌐 6. Access the App in Your Browser

Open your browser and go to:

```
http://localhost:9002
```

The port might vary if `9002` is already in use.

---

## 🧠 7. (Optional) Developing AI Features with Genkit

In a new terminal window, navigate to your project folder and run:

```bash
npm run genkit:dev
```

Or for auto-reloading on changes:

```bash
npm run genkit:watch
```

This starts the **Genkit development server** (usually at `http://localhost:4000`) for developing and testing AI flows.
Your Next.js app will continue to call these flows as server actions.

---

## 🎉 That’s It!

Your **Event-Calendar** app should now be running locally.
You can make code changes, and the development server will **auto-reload** in your browser.

---

