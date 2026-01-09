# Florida - Speed Reading Trainer

Florida is a modern, offline-first speed reading application that leverages **RSVP (Rapid Serial Visual Presentation)** technology to help you read faster and more efficiently.

## Features

- **RSVP Technology**: deeply customizable reading experience using rapid serial visual presentation to minimize eye movement and subvocalization.
- **Offline-First**: Built with local storage (IndexedDB) integration, ensuring your library is always available without an internet connection.
- **Multi-Format Support**:
  - **EPUB**
  - **PDF**
  - **TXT**
- **Distraction-Free UI**: Minimalist interface designed to keep you focused on the text.
- **OpenDyslexic Font Support**: Accessibility options for dyslexic readers.
- **Progress Tracking**: Automatically saves your reading progress for every book.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Local Storage**: IndexedDB (via `idb`)
- **File Parsing**:
  - `epubjs` for EPUB files
  - `pdfjs-dist` for PDF files
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/xanthisafk/florida.git
   cd florida
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deploy

1. Build the application:

```bash
npm run build
```

2. Login to Cloudflare:

```bash
npx wrangler login
```

3. Deploy the application to Cloudflare Pages. The `wrangler.jsonc` is already setup.

- If you want to change the name of app, you can do so in `wrangler.jsonc`.

```bash
npx wrangler pages deploy
```
