<div align="center">
  <br />
  <h1>Samsaar</h1>
  <p>
    <strong>Your ideas, in moments.</strong>
  </p>
  <br />
</div>

## 🌟 Overview

**Samsaar** is a website that allows users to utilize generative AI to transform their ideas into production-grade UI in seconds. It also offers an infinite canvas for creators to seamlessly iterate and build their next big idea.

## ✨ Key Features

- ♾️ **Infinite Canvas Editor**: A fluid, drag-and-drop workspace powered by React and a Redux store (refer to Web Dev Prodigy's video and Excalidraw clone by Code with Antonio).
- 🧠 **AI Generation Engine**: Harness the power of generative models to immediately scaffold user interfaces, complete pages, and dynamic components.
- 🔗 **Smart Multi-Page Export**: Effortlessly export your generated designs to `.zip`. The server-side AI intelligently processes multiple pages, automatically interlinking routing paths so your downloaded HTML works natively out of the box.
- ⏪ **Robust State Management**: Powered by Redux Toolkit, featuring a custom implementation for seamless **Undo** (`Ctrl+Z`) and **Redo** (`Ctrl+Y` / `Ctrl+Shift+Z`) capabilities tailored specifically to the canvas state history.
- ⚡ **Real-time Backend**: Integrated natively with Convex for real-time application state, instant queries, and mutations.

## 🏗️ Architecture Workflow

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#111,stroke:#333,stroke-width:2px,color:#fff
    classDef backend fill:#111,stroke:#333,stroke-width:2px,color:#fff
    classDef ai fill:#000,stroke:#555,stroke-width:2px,color:#fff
    classDef db fill:#000,stroke:#f97316,stroke-width:2px,color:#fff
    classDef userNode fill:#fff,stroke:#000,stroke-width:2px,color:#000

    User([👤 User]):::userNode

    subgraph Client ["🖥️ Client-Side (Next.js / React)"]
        UI[Infinite Canvas UI]:::frontend
        Redux[(Redux Store <br> Undo/Redo History)]:::frontend
        JSZip[JSZip Asset Bundler]:::frontend
    end

    subgraph Server ["⚙️ Server-Side (Next.js API)"]
        GenAPI[POST /api/generate <br> Component Scaffolding]:::backend
        ExpAPI[POST /api/export <br> Multi-Page Linking]:::backend
    end

    subgraph Services ["☁️ Cloud Services"]
        Gemini[Google Gemini 3 Flash]:::ai
        Convex[(Convex Real-time DB)]:::db
    end

    %% Workflow Connections
    User -->|Interacts & Prompts| UI
    UI <-->|Dispatches Actions| Redux
    UI <-->|Live Data Sync| Convex
    
    UI -->|Generate UI Request| GenAPI
    GenAPI <-->|Generates UI Code| Gemini
    GenAPI -->|React/Tailwind Output| UI
    
    UI -->|Export Workspace| ExpAPI
    ExpAPI <-->|Resolves Routes| Gemini
    ExpAPI -->|Linked HTML JSON| JSZip
    JSZip -->|Downloads .zip| User
```

### 📦 Redux State Architecture (Undo / Redo)

```mermaid
graph TD
    classDef store fill:#111,stroke:#333,stroke-width:2px,color:#fff
    classDef action fill:#000,stroke:#f97316,stroke-width:2px,color:#fff

    subgraph Redux ["📦 Redux Toolkit (Shapes Slice)"]
        Past["⏪ Past Stack<br>(Array of EntityStates)"]:::store
        Current["🟢 Current Shapes<br>(Active EntityState)"]:::store
        Future["⏩ Future Stack<br>(Array of EntityStates)"]:::store
        LastSaved["💾 Last Saved Shapes<br>(Reference State)"]:::store
    end

    UserAction("🖱️ User Interaction (Draw/Move)"):::action

    UserAction -->|Updates| Current
    UserAction -.->|On interaction end| Commit("commitHistory()"):::action
    
    Commit -->|1. Pushes Last Saved to| Past
    Commit -->|2. Updates Reference| LastSaved
    Commit -->|3. Clears| Future

    Undo("↩️ undo()"):::action
    Undo -->|1. Pushes Current to| Future
    Undo -->|2. Pops Past back to| Current

    Redo("↪️ redo()"):::action
    Redo -->|1. Pushes Current to| Past
    Redo -->|2. Pops Future back to| Current
```

## 🚀 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Backend & Database**: [Convex](https://www.convex.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: Server-side routing utilizing Google Gemini capabilities.

## 🛠️ Getting Started

First, clone the repository and install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Next, initialize the Convex backend:

```bash
npx convex dev
```

Finally, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience Samsaar.

## 📁 Key File Structure

- `src/app/` - Next.js App Router endpoints, pages, and API routes.
- `src/components/canvas/` - The core engine of the infinite workspace and the shape renderer.
- `src/redux/slice/shapes/` - The comprehensive state logic, managing shapes and powering the history system.
- `src/app/api/export/` - Server-side AI logic for smart JSZip bundling and multi-page routing configuration.
- `convex/` - Backend queries, mutations, and database schemas.

## 🤝 About

This project was developed rapidly as part of a Hackathon, focusing on building high-end user experiences combined with powerful AI scaffolding capabilities. 

---
<div align="center">
  Built with ❤️ for creators, developers, and visionaries.
</div>
