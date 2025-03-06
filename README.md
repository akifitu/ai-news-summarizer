# News Summarizer

A web application for those who don't use social media but want to stay informed about trending topics and news. This application fetches trending topics from Twitter and news from Reddit, organizes them, and provides AI-powered summaries of related news articles.

## Features

- View trending topics from Twitter
- Browse the latest news from Reddit's r/news
- Filter news by trending topics
- Get AI-generated summaries of news articles using OpenAI
- Cached results for faster access using Upstash Redis
- Vector similarity search for related articles using Upstash Vector

## Tech Stack

- **Frontend Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Twitter API, Reddit API
- **AI Summarization**: OpenAI GPT-3.5
- **Database & Caching**: Upstash Redis
- **Vector Storage**: Upstash Vector

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Twitter Developer Account (for API access)
- OpenAI API Key
- Upstash Redis & Vector Accounts

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/news-summarizer.git
cd news-summarizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your API keys and credentials

```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Configuration

### Twitter API Setup

1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com/)
2. Create a new application and get your API keys
3. Enable elevated access to use the v1.1 API endpoints for trends

### Reddit API Access

The application uses Reddit's public JSON API. No authentication is required for basic read operations, but for production use, you should:

1. Create a Reddit account
2. Register an application at [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
3. Use the generated client ID and secret for authentication

### Upstash Setup

1. Create accounts for [Upstash Redis](https://upstash.com/redis) and [Upstash Vector](https://upstash.com/vector)
2. Create databases for both services
3. Copy the REST URLs and tokens to your `.env.local` file

## Deployment

This Next.js application can be deployed using Vercel:

1. Push your code to GitHub
2. Import the project to Vercel
3. Set up the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
