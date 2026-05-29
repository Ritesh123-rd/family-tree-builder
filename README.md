# 🌳 Family Tree Builder

A full-stack **Mini Family Tree Application** built with the **MERN stack** (MongoDB, Express.js, React, Node.js). This application allows users to create, manage, and visualize family relationships in an interactive tree structure.

## ✨ Features

### Core Features
- **Add Family Members** — Name (required), Gender, Date of Birth (optional), Father & Mother selection
- **Edit & Delete Members** — Full CRUD operations with cascade delete (children references auto-cleaned)
- **Family Tree Visualization** — Interactive hierarchical tree with gender-colored cards and connecting lines
- **Member Detail View** — Click any member to view Parents, Children & Siblings
- **Add Sibling** — Quick "Add Sibling" button that auto-fills parents for easy sibling creation

### Optional Enhancements (Implemented)
- 🔍 **Search Functionality** — Filter members by name in real-time
- 🎨 **Visual Representation** — Premium UI with warm gradient color scheme, avatar initials, and animated cards

### Security Features
- 🛡️ **Helmet** — HTTP security headers (XSS, clickjacking, MIME sniffing protection)
- ⏱️ **Rate Limiting** — 100 requests per 15 minutes per IP
- 🔒 **CORS Restriction** — Only frontend origin allowed
- 🧹 **NoSQL Injection Prevention** — `express-mongo-sanitize` strips malicious operators
- ✅ **Input Validation** — Name regex, max length (100 chars), future DOB prevention
- 🔑 **ObjectId Validation** — Prevents CastError crashes from invalid IDs
- 🧱 **Mass Assignment Prevention** — Only whitelisted fields accepted on update
- 📦 **Body Size Limit** — 1MB max JSON payload

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize |
| **Styling** | Vanilla CSS (Glassmorphism, Gradients, Animations) |

## 📁 Project Structure

```
family-tree-builder/
├── Backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/memberController.js  # Business logic & validation
│   ├── models/Member.js        # Mongoose schema (self-referencing)
│   ├── routes/memberRoutes.js  # API routes
│   ├── server.js               # Express app with security middleware
│   ├── package.json
│   └── .env                    # Environment variables
│
└── Frontend/frontend/
    ├── src/
    │   ├── api.js              # Axios API service
    │   ├── App.jsx             # Router & Navbar
    │   ├── main.jsx            # Entry point
    │   ├── index.css           # Design system & global styles
    │   ├── pages/
    │   │   ├── TreePage.jsx    # Family tree visualization
    │   │   └── MembersPage.jsx # CRUD table with search
    │   └── components/
    │       ├── MemberForm.jsx        # Add/Edit form modal
    │       └── MemberDetailModal.jsx # Detail view + Add Sibling
    ├── index.html
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally on port 27017)

### 1. Clone the repository
```bash
git clone https://github.com/Ritesh123-rd/family-tree-builder.git
cd family-tree-builder
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/familyTreeDB
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd Frontend/frontend
npm install
npm run dev
```

### 4. Open in browser
Visit: **http://localhost:5173**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/members` | Create a new family member |
| `GET` | `/api/members` | Get all members (with parents populated) |
| `GET` | `/api/members/tree` | Get the full family tree hierarchy |
| `GET` | `/api/members/:id` | Get member details + children + siblings |
| `PUT` | `/api/members/:id` | Update a member (with field whitelisting) |
| `DELETE` | `/api/members/:id` | Delete a member (cascade cleans children) |

## 🧠 Design Decisions

1. **Self-Referencing Schema** — The `Member` model references itself for `father` and `mother` fields. This eliminates redundant relationship tables and allows MongoDB to naturally model parent-child-sibling relationships.

2. **Siblings are Derived, Not Stored** — Instead of explicitly storing sibling relationships, they are computed at query time by finding members who share the same parent(s). This ensures data consistency.

3. **Cascade Delete** — When a parent is deleted, all children's `father`/`mother` references are set to `null` to prevent orphaned ObjectId references.

4. **Tree Built Recursively** — The `/tree` endpoint recursively traverses from root members (those with no parents) downward, building a nested JSON structure.

## 📸 Screenshots

### Family Tree View
Interactive tree with gender-colored cards, avatar initials, and connecting lines.

### Manage Members
Table with search, edit/delete actions, and animated row entry.

### Member Detail Modal
Gradient header showing Parents, Children, and Siblings with "Add Sibling" feature.

---

**Built with ❤️ by Ritesh**
