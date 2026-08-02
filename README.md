# SmartStore Navigator

A mini full-stack project built to demonstrate **Data Structures & Algorithms (DSA)** and
**Object-Oriented Programming (OOP)** in C++, with a web app (React + Node/Express + MongoDB +
Socket.IO) used purely as a **visualization layer** on top of that logic.

> The DSA/OOP is the point of this project. The web stack exists to show it off, not the other
> way around.

---

## 1. Architecture

```
Browser (React)  ───HTTP/JWT───▶  Express API  ───spawns───▶  C++ engine (route_engine)
      ▲                               │
      └────────Socket.IO (live)───────┘                         MongoDB Atlas
```

- **C++ (`/cpp`)** contains all the real DSA/OOP: a custom `Graph`, a hand-rolled `Queue<T>`,
  a binary-heap `PriorityQueue`, `Dijkstra's algorithm`, `BFS`, `Binary Search`, and an OOP
  class hierarchy (`Item` → `Product` → `DiscountedProduct`) with encapsulation, inheritance,
  polymorphism, abstraction and composition.
- **`route_engine`** is a small CLI executable (`cpp/src/engine_cli.cpp`) built from the same
  `Graph`/`RoutePlanner`/`QueueManager` classes. The Node backend spawns it as a child process
  and gets JSON back — so the *actual* Dijkstra/Priority-Queue computation happens in C++, not
  JavaScript.
- **Node/Express (`/backend`)** handles auth (JWT), MongoDB persistence for users/products,
  REST APIs, and Socket.IO for real-time updates (inventory changes, queue status, generated
  routes). If `route_engine` hasn't been compiled yet, the backend automatically falls back to
  an equivalent JS re-implementation (`backend/utils/routeEngine.js`) so the app still runs —
  but for the DSA project itself, always run `npm run build:cpp` first so the real C++ engine
  is used.
- **React + Vite (`/frontend`)** is a deliberately simple UI: Login/Signup, Dashboard, Route
  Planner (product picker → visual path), Inventory (CRUD + search).

---

## 2. Project Structure

```
SmartStore-Navigator/
├── cpp/
│   ├── include/          # Product.h, Graph.h, RoutePlanner.h, InventoryManager.h, QueueManager.h
│   └── src/               # Graph.cpp, RoutePlanner.cpp, InventoryManager.cpp, QueueManager.cpp,
│                           # main.cpp (standalone demo), engine_cli.cpp (Node bridge)
├── backend/
│   ├── server.js
│   ├── config/            # db.js, storeLayout.js
│   ├── models/             # User.js, Product.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── utils/routeEngine.js  # spawns the C++ binary
└── frontend/
    └── src/
        ├── pages/          # Login, Signup, Dashboard, RoutePlanner, Inventory
        ├── services/       # api.js (axios), socket.js (socket.io-client)
        ├── context/        # AuthContext
        └── components/     # Navbar, ProtectedRoute
```

---

## 3. Setup & Run

### Prerequisites
- Node.js 18+
- g++ with C++17 support
- A MongoDB Atlas cluster (or local MongoDB)

### Step 1 — Build the C++ DSA engine

```bash
cd cpp
g++ -std=c++17 -O2 src/Graph.cpp src/RoutePlanner.cpp src/QueueManager.cpp src/engine_cli.cpp -o route_engine
```

You can also run the standalone demo, which prints all DSA/OOP behavior to the console
(inventory, Dijkstra route, BFS, binary search, priority-queue checkout recommendation):

```bash
g++ -std=c++17 src/Graph.cpp src/RoutePlanner.cpp src/InventoryManager.cpp src/QueueManager.cpp src/main.cpp -o smartstore_demo
./smartstore_demo
```

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # or: npm start
```

The backend runs on `http://localhost:5000` and expects `route_engine` to exist at
`../cpp/route_engine` relative to `backend/` (configurable via `ROUTE_ENGINE_PATH` in `.env`).

### Step 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env    # defaults already point at localhost:5000
npm run dev
```

Visit `http://localhost:5173`, sign up, then explore the Dashboard, Route Planner, and
Inventory pages.

---

## 4. REST API

| Method | Endpoint              | Description                          | Auth |
|--------|------------------------|---------------------------------------|------|
| POST   | `/api/auth/register`   | Create a new user                     | No   |
| POST   | `/api/auth/login`      | Login, returns JWT                    | No   |
| GET    | `/api/products`        | List/search products                  | Yes  |
| POST   | `/api/products`        | Add product                           | Yes  |
| PUT    | `/api/products/:id`    | Update product / stock                | Yes  |
| DELETE | `/api/products/:id`    | Delete product                        | Yes  |
| POST   | `/api/route`           | Compute shortest route (Dijkstra)     | Yes  |
| GET    | `/api/queue`           | Get checkout queue + recommendation   | Yes  |
| GET    | `/api/stats`           | Dashboard stats                       | Yes  |

`POST /api/route` body: `{ "productIds": ["<id1>", "<id2>", ...] }`

---

## 5. DSA Concepts Demonstrated (all in C++)

| Concept          | Where |
|-------------------|-------|
| Graph (adjacency list) | `Graph.h/.cpp` |
| Queue (custom, array-backed) | `QueueManager.h`, used in `Graph::bfs` |
| Priority Queue (manual binary min-heap) | `QueueManager.h` |
| Hash Map (`unordered_map`) | `InventoryManager`, `Graph` adjacency storage |
| Vector / STL | throughout |
| Dijkstra's Algorithm | `RoutePlanner::shortestPath` |
| BFS | `Graph::bfs` |
| Binary Search | `RoutePlanner::binarySearchAisle` |

## 6. OOP Concepts Demonstrated

| Concept | Where |
|---------|-------|
| Encapsulation | private fields + getters/setters in `Product`, `InventoryManager` |
| Abstraction | `Item` abstract base class with pure virtual methods |
| Inheritance | `Product : Item`, `DiscountedProduct : Product` |
| Polymorphism | overridden `display()` / `getPrice()`, called via base pointer in `main.cpp` |
| Composition | `RoutePlanner` has-a `Graph`; `QueueManager` has-a `PriorityQueue` |

---

## 7. Notes

- The store layout graph is defined once in `backend/config/storeLayout.js` and mirrored
  conceptually in `cpp/src/main.cpp`'s demo — aisle numbers on products map directly to graph
  node IDs.
- Socket.IO broadcasts `inventoryUpdated`, `queueUpdated`, `routeGenerated`, and
  `activeCustomers` events so the Dashboard updates live across browser tabs.
- This is intentionally a teaching/demo project: the JS fallback in `routeEngine.js` exists so
  grading/demoing doesn't break if the C++ binary isn't built, but the real deliverable is the
  C++ engine being invoked as a subprocess.
