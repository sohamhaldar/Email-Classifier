# AI-Powered Email Classifier

An intelligent email classification system that leverages AI to automatically categorize Gmail emails into meaningful categories. Built with Next.js, TypeScript, and integrated with Google OAuth for secure authentication.

## ✨ Features

- **🤖 AI-Powered Classification**: Automatically categorizes emails using OpenAI's GPT-4o model
- **🔐 Secure Authentication**: Google OAuth integration via Better Auth
- **📊 Smart Categorization**: Classifies emails into 6 categories:
  - Important (Security alerts, urgent matters)
  - Promotions (Sales, offers, deals)
  - Social (Social media notifications)
  - Marketing (Newsletters, job opportunities)
  - Spam (Unwanted or suspicious emails)
  - General (Everything else)
- **🎯 Category Filtering**: Filter emails by category with automatic classification
- **⚙️ Customizable Mail Count**: Fetch 10, 15, 20, 25, 30, or custom number of emails
- **💾 Local Storage**: API key persistence for seamless user experience

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) with Google OAuth
- **AI Model**: [OpenAI GPT-4o](https://openai.com/)
- **Email API**: [Google Gmail API](https://developers.google.com/gmail/api)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

You'll also need accounts and credentials for:

- [Google Cloud Console](https://console.cloud.google.com/) (for OAuth and Gmail API)
- [OpenAI API](https://platform.openai.com/) (for email classification)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (for database)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sohamhaldar/Email-Classifier.git
cd mail-classifier
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Gmail API**
   - **Google+ API** (for OAuth)

#### Create OAuth 2.0 Credentials:

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Save your **Client ID** and **Client Secret**

### 4. Set Up MongoDB

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with password
4. Get your connection string (replace `<password>` with your actual password)

### 5. Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Create a new secret key
4. Save it securely (you'll enter this in the app after login)

### 6. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-generate-random-string
BETTER_AUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string
DB_NAME=MailClassifierDB
```


### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### First Time Setup

1. **Sign In**: Click the "Sign in with Google" button on the landing page
2. **Grant Permissions**: Allow the app to access your Gmail
3. **Enter API Key**: After login, you'll be prompted to enter your OpenAI API key
4. **Save Settings**: Your API key will be stored locally for future sessions

### Using the Application

1. **Fetch Emails**: Select the number of emails to fetch from the dropdown (10-30 or custom)
2. **Classify Emails**: Click the "Classify" button to categorize your emails
3. **Filter by Category**: Click on any category in the sidebar to filter emails
4. **View Email Details**: Click on any email to see its full content
5. **Update Settings**: Click the settings icon to update your API key

### Category Descriptions

- **Important**: Security alerts, account notifications, urgent matters
- **Promotions**: Sales, offers, promotional content, deals
- **Social**: Social media notifications, friend requests
- **Marketing**: Job opportunities, newsletters, recruitment emails
- **Spam**: Suspicious or unwanted emails, phishing attempts
- **General**: Everything else that doesn't fit above categories

## 🏗️ Project Structure

```
mail-classifier/
├── app/
│   ├── api/
│   │   ├── auth/          # Better Auth routes
│   │   ├── classify/      # Email classification endpoint
│   │   └── gmail/         # Gmail API integration
│   ├── dashboard/         # Dashboard page
│   ├── mails/             # Main email interface
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── email-sheet.tsx    # Email detail view
│   ├── mail-count-selector.tsx
│   └── ui/                # Shadcn/ui components
├── context/
│   └── auth-context.tsx   # Authentication context
├── lib/
│   ├── auth.ts            # Better Auth configuration
│   ├── auth-client.ts     # Client-side auth utilities
│   ├── dbConnect.ts       # MongoDB connection
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript type definitions
└── public/                # Static assets
```

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ by Soham Haldar

## 🙏 Acknowledgments

- [Better Auth](https://www.better-auth.com/) for authentication
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [OpenAI](https://openai.com/) for powerful AI capabilities
- [Google](https://developers.google.com/) for Gmail API

---

**Note**: This application requires valid API keys and credentials. Make sure to set up all prerequisites before running the application.
