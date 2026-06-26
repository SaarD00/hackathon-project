# Samsaar: Complete Redux Architecture

The Redux store in Samsaar is structured to handle everything from user authentication to real-time infinite canvas manipulations and robust history tracking. 

It is divided into **four main slices** and utilizes **RTK Query** for API management and data fetching middleware.

## The Global State Tree

```mermaid
graph TD
    classDef store fill:#111,stroke:#333,stroke-width:2px,color:#fff
    classDef slice fill:#000,stroke:#f97316,stroke-width:2px,color:#fff
    classDef state fill:#222,stroke:#555,stroke-width:1px,color:#ddd
    classDef api fill:#000,stroke:#10b981,stroke-width:2px,color:#fff
    classDef action fill:#fff,stroke:#000,stroke-width:1px,color:#000

    RootStore["Root Redux Store <br> (configureStore)"]:::store

    RootStore --> ProfileSlice["Profile Slice"]:::slice
    RootStore --> ProjectsSlice["Projects Slice"]:::slice
    RootStore --> ViewportSlice["Viewport Slice"]:::slice
    RootStore --> ShapesSlice["Shapes Slice <br>(with History)"]:::slice
    RootStore --> RTKQuery["RTK Query APIs <br>(Middleware)"]:::api

    subgraph Profile ["👤 Profile State"]
        P_User["user: Profile | null"]:::state
    end
    ProfileSlice --> Profile

    subgraph Projects ["📂 Projects State"]
        P_List["projects: ProjectSummary[]"]:::state
        P_Load["isLoading / error"]:::state
        P_Create["isCreating / createError"]:::state
    end
    ProjectsSlice --> Projects

    subgraph Viewport ["🔎 Viewport State"]
        V_Trans["translate: {x, y}"]:::state
        V_Scale["scale (min, max)"]:::state
        V_Mode["mode: idle | panning | shiftPanning"]:::state
        V_Pan["pan tracking (startScreen/Translate)"]:::state
    end
    ViewportSlice --> Viewport

    subgraph Shapes ["✏️ Shapes State"]
        S_Tool["tool: select | rect | text..."]:::state
        S_Ent["shapes (EntityState via createEntityAdapter)"]:::state
        S_Sel["selected: Record<string, true>"]:::state
        S_Hist["past / future / lastSaved (Undo/Redo)"]:::state
    end
    ShapesSlice --> Shapes

    subgraph CoreActions ["Key Action Dispatchers"]
        A_VP["panMove(), zoomBy(), centerOnWorld()"]:::action
        A_SH["addRect(), updateShape(), commitHistory()"]:::action
        A_PR["fetchProjectsSuccess(), createProjectStart()"]:::action
    end
    
    A_VP -.-> ViewportSlice
    A_SH -.-> ShapesSlice
    A_PR -.-> ProjectsSlice
```

## Slice Breakdown

### 1. `shapes` Slice
The powerhouse of the application. It manages the infinite canvas elements using Redux Toolkit's `createEntityAdapter` for O(1) performance when looking up, updating, or deleting shapes (rectangles, text, AI-generated UI, etc.). It also uniquely implements its own Undo/Redo stack arrays (`past` and `future`) that take snapshots of the canvas.

### 2. `viewport` Slice
Handles the camera math for the infinite canvas. It stores the zoom `scale`, XY `translate` offsets, and current interaction `mode` (like panning vs. idle). Complex actions like `zoomAroundScreenPoint` calculate exactly how to shift the translation offsets so the screen zooms directly into where the user's mouse pointer is resting.

### 3. `projects` Slice
Manages the user's dashboard of projects. It controls pagination (`total`), caching timelines (`lastFetched`), and the UI loading states (`isLoading`, `isCreating`) ensuring that fetching from the backend (Convex) is represented smoothly in the UI without race conditions.

### 4. `profile` Slice
A lightweight slice simply holding the authenticated user's `Profile` object to make session data easily accessible anywhere in the component tree.

### 5. `api` Middleware
The root `store.ts` injects RTK Query APIs. It reduces the API endpoints into the root reducer map and concats their custom middleware, allowing Samsaar to handle caching, invalidation, and server-side querying elegantly.
