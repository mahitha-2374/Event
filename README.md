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


# Ensure Node.js is Installed

# Open your terminal or command prompt.
# Type the following command to check your Node.js version:
node -v

# If you see a version number (e.g., v18.x.x or higher), you're good to go.
# If not, download and install Node.js from https://nodejs.org (LTS version recommended).

# Navigate to Your Project Directory

# In the terminal, use cd (change directory) to navigate to your project folder (e.g., Event-Calendar).
# Example:
cd Documents/Event-Calendar

# Install Project Dependencies

# Once in the project directory, run:
npm install
# (Alternatively, if you use Yarn:)
# yarn install

# Set Up Environment Variables (Important for AI Features)

# Open the .env file in the project root (Event-Calendar/.env).
# Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key from Google AI Studio.
# Example:
# GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY

# If you don't plan to use the AI features immediately, the app (calendar, event management) will still work,
# but Smart Schedule will likely fail.

# Run the Development Server

# Start the Next.js development server:
npm run dev
# (Or if using Yarn:)
# yarn dev

# Watch for the output indicating the server is ready, typically:
# ✓ Ready in x.xxs
# ● Next.js 15.x.x
#   Local: http://localhost:9002

# Access the App in Your Browser

# Open your browser and go to:
# http://localhost:9002
# (Port number may vary if 9002 is occupied.)

# Developing AI Features (Optional - Genkit Dev Server)

# Open a new terminal window, navigate to your project directory, and run:
npm run genkit:dev
# Or for auto-reloading on changes to AI files:
npm run genkit:watch

# This runs the Genkit dev server (usually at http://localhost:4000) for developing AI flows.
# The Next.js app will continue to call these flows as server actions.

# That’s it! Your Eventide Calendar application should now be running locally.
# You can make code changes and the server will auto-reload.


