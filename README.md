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


# 📅 Event-Calendar Setup Instructions

# 🚀 1. Ensure Node.js is Installed

# Open your terminal or command prompt and check the Node.js version:
node -v

# If you see a version number (e.g., v18.x.x or higher), you're good to go.
# If not, download and install Node.js from https://nodejs.org (LTS version recommended).

# 📁 2. Navigate to Your Project Directory
cd Documents/Event-Calendar

# 📦 3. Install Project Dependencies
npm install
# Or if you prefer Yarn:
# yarn install

# 🔐 4. Set Up Environment Variables (For AI Features)
# Edit the .env file in the root of your project (Event-Calendar/.env):
# GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
# Replace YOUR_ACTUAL_GEMINI_API_KEY with your actual Gemini API key from Google AI Studio.
# If you don’t plan to use the AI features immediately, the calendar and event management will work,
# but Smart Schedule will likely fail.

# 🏃 5. Run the Development Server
npm run dev
# Or if using Yarn:
# yarn dev

# You should see output like:
# ✓ Ready in x.xxs
# ● Next.js 15.x.x
#   Local: http://localhost:9002

# 🌐 6. Access the App in Your Browser
# Open your browser and go to:
# http://localhost:9002
# (The port may vary if 9002 is occupied.)

# 🧠 7. (Optional) Developing AI Features with Genkit
# In a separate terminal window, navigate to the project directory and run:
npm run genkit:dev
# Or for auto-reloading on changes:
npm run genkit:watch

# This runs Genkit (usually at http://localhost:4000) for testing and inspecting AI flows.
# The Next.js app will continue to call these flows as server actions.

# 🎉 That’s It!
# Your Eventide Calendar app is now running locally!
# You can make changes to the code, and the dev server will auto-reload.
