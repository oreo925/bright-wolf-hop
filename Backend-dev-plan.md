# 1️⃣ Executive Summary
This document outlines the backend development plan for the "Bright Wolf Hop" application. The backend will be built using FastAPI (Python 3.13) and MongoDB Atlas, providing a scalable and robust API for the existing frontend. The development process will follow a dynamic sprint plan, with manual testing after each task to ensure quality. This plan adheres to specific constraints, including no Docker, a single-branch Git workflow (`main`), and a focus on features visible in the frontend.

# 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
    - User authentication (signup, login, logout).
    - Herd management (create, view, update, delete, add/remove members, leave herd).
    - Reflection management (create, view history, view details).
    - Reaction system for reflections.
- **Success Criteria:**
    - All frontend features are fully functional and connected to the live backend.
    - All manual test steps for each task pass successfully through the UI.
    - Each sprint's code is committed and pushed to the `main` branch after successful verification.

# 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

---
### Authentication
- **`POST /api/v1/auth/signup`**
  - **Purpose:** Register a new user.
  - **Request:** `{ "displayName": "string", "email": "string", "password": "string" }`
  - **Response:** `{ "token": "jwt_token" }`
  - **Validation:** `displayName`, `email`, and `password` are required. Email must be unique.
- **`POST /api/v1/auth/login`**
  - **Purpose:** Log in an existing user.
  - **Request:** `{ "email": "string", "password": "string" }`
  - **Response:** `{ "token": "jwt_token" }`
  - **Validation:** `email` and `password` are required.
- **`POST /api/v1/auth/logout`**
  - **Purpose:** Log out a user (future use, token is managed client-side).
  - **Request:** `{}`
  - **Response:** `{ "message": "Logged out successfully" }`
- **`GET /api/v1/auth/me`**
  - **Purpose:** Get the current logged-in user's details.
  - **Request:** (Requires JWT in header)
  - **Response:** `{ "id": "string", "displayName": "string", "email": "string" }`

---
### Herds
- **`POST /api/v1/herds`**
  - **Purpose:** Create a new herd.
  - **Request:** `{ "name": "string", "memberIds": ["user_id_1", "user_id_2"] }`
  - **Response:** The created herd object.
- **`GET /api/v1/herds`**
  - **Purpose:** Get all herds for the current user.
  - **Request:** (Requires JWT in header)
  - **Response:** `[ { "id": "string", "name": "string", "ownerId": "string", "memberIds": [...] } ]`
- **`GET /api/v1/herds/{herdId}`**
  - **Purpose:** Get details of a specific herd.
  - **Request:** (Requires JWT in header)
  - **Response:** A single herd object.
- **`PUT /api/v1/herds/{herdId}`**
  - **Purpose:** Update a herd's name or members.
  - **Request:** `{ "name": "string" }` or `{ "memberIds": [...] }`
  - **Response:** The updated herd object.
- **`DELETE /api/v1/herds/{herdId}`**
  - **Purpose:** Delete a herd (owner only).
  - **Request:** (Requires JWT in header)
  - **Response:** `{ "message": "Herd deleted" }`
- **`POST /api/v1/herds/{herdId}/leave`**
  - **Purpose:** Allow a member to leave a herd.
  - **Request:** (Requires JWT in header)
  - **Response:** `{ "message": "You have left the herd" }`

---
### Reflections
- **`POST /api/v1/reflections`**
  - **Purpose:** Create a new reflection.
  - **Request:** `{ "highText": "string", "lowText": "string", "buffaloText": "string", "sharedWithType": "string", "sharedWithId": "string" }`
  - **Response:** The created reflection object.
- **`GET /api/v1/reflections`**
  - **Purpose:** Get the reflection history for the current user.
  - **Request:** (Requires JWT in header)
  - **Response:** `[ { ...reflection_object... } ]`
- **`GET /api/v1/reflections/{reflectionId}`**
  - **Purpose:** Get a single reflection's details.
  - **Request:** (Requires JWT in header)
  - **Response:** A single reflection object with reactions.
- **`POST /api/v1/reflections/{reflectionId}/react`**
  - **Purpose:** Add a reaction to a reflection.
  - **Request:** `{ "reactionType": "tell_me_more" }`
  - **Response:** The new reaction object.

# 4️⃣ Data Model (MongoDB Atlas)
- **`users` collection:**
  - `_id`: ObjectId (auto-generated)
  - `displayName`: string, required
  - `email`: string, required, unique
  - `password`: string (hashed), required
  - `createdAt`: datetime, default: now
  - *Example:* `{ "_id": "...", "displayName": "John Doe", "email": "john@example.com", "password": "...", "createdAt": "..." }`
- **`herds` collection:**
  - `_id`: ObjectId (auto-generated)
  - `name`: string, required
  - `ownerId`: ObjectId, ref: 'users'
  - `memberIds`: [ObjectId], ref: 'users'
  - `createdAt`: datetime, default: now
  - *Example:* `{ "_id": "...", "name": "My Herd", "ownerId": "user_id_1", "memberIds": ["user_id_1", "user_id_2"], "createdAt": "..." }`
- **`reflections` collection:**
  - `_id`: ObjectId (auto-generated)
  - `userId`: ObjectId, ref: 'users'
  - `highText`: string, required
  - `lowText`: string, required
  - `buffaloText`: string, required
  - `sharedWithType`: string ('self', 'friend', 'herd'), required
  - `sharedWithId`: string (can be user ID or herd ID), optional
  - `createdAt`: datetime, default: now
  - *Example:* `{ "_id": "...", "userId": "...", "highText": "...", "lowText": "...", "buffaloText": "...", "sharedWithType": "herd", "sharedWithId": "herd_id_1", "createdAt": "..." }`
- **`reactions` collection:**
  - `_id`: ObjectId (auto-generated)
  - `reflectionId`: ObjectId, ref: 'reflections'
  - `userId`: ObjectId, ref: 'users'
  - `reactionType`: string, default: "tell_me_more"
  - `createdAt`: datetime, default: now
  - *Example:* `{ "_id": "...", "reflectionId": "...", "userId": "...", "reactionType": "tell_me_more", "createdAt": "..." }`

# 5️⃣ Frontend Audit & Feature Map
- **`AuthPage.tsx`**
    - **Purpose:** User registration and login.
    - **Endpoints:** `POST /auth/signup`, `POST /auth/login`.
    - **Models:** `User`.
- **`HerdsPage.tsx` & `CreateHerdPage.tsx`**
    - **Purpose:** Display, create, and manage herds.
    - **Endpoints:** `GET /herds`, `POST /herds`.
    - **Models:** `Herd`, `User`.
- **`HerdDetailPage.tsx`**
    - **Purpose:** View and manage a single herd's details, including members.
    - **Endpoints:** `GET /herds/{id}`, `PUT /herds/{id}`, `DELETE /herds/{id}`, `POST /herds/{id}/leave`.
    - **Models:** `Herd`, `User`.
- **`CreateReflectionPage.tsx` & `HistoryPage.tsx`**
    - **Purpose:** Create new reflections and view past ones.
    - **Endpoints:** `POST /reflections`, `GET /reflections`.
    - **Models:** `Reflection`.
- **`ReflectionDetailPage.tsx`**
    - **Purpose:** View a single reflection and its reactions.
    - **Endpoints:** `GET /reflections/{id}`, `POST /reflections/{id}/react`.
    - **Models:** `Reflection`, `Reaction`, `User`.

# 6️⃣ Configuration & ENV Vars
- `APP_ENV`: "development" or "production"
- `PORT`: 8000
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for signing JWTs.
- `JWT_EXPIRES_IN`: 3600 (in seconds, for 1 hour).
- `CORS_ORIGINS`: Frontend URL (e.g., "http://localhost:5173").

# 7️⃣ Background Work
- None required based on the current frontend.

# 8️⃣ Integrations
- None required based on the current frontend.

# 9️⃣ Testing Strategy (Manual via Frontend)
- All testing will be performed manually through the frontend UI.
- Every task in the sprint plan includes a **Manual Test Step** and a **User Test Prompt**.
- After all tasks in a sprint are completed and tested, the code will be committed and pushed to the `main` branch.

# 🔟 Dynamic Sprint Plan & Backlog
---
## S0 – Environment Setup & Frontend Connection
- **Objectives:**
    - Create a basic FastAPI application with `/api/v1` base path and a `/healthz` endpoint.
    - Connect to MongoDB Atlas.
    - The `/healthz` endpoint should ping the database.
    - Configure CORS to allow requests from the frontend.
    - Replace dummy API calls in the frontend with the actual backend URLs.
    - Initialize a Git repository, set the default branch to `main`, and create a `.gitignore` file.
- **Definition of Done:**
    - Backend runs locally and connects to MongoDB Atlas.
    - `/healthz` returns a success status.
    - Frontend is able to communicate with the backend.
    - Code is pushed to the `main` branch on GitHub.
- **Manual Test Step:**
    - Run the backend server. Open the browser's developer tools on the frontend, go to the Network tab, and verify that a request to `/api/v1/healthz` returns a 200 OK status.
- **User Test Prompt:**
    > "Start the backend and refresh the app. Confirm that the status shows a successful DB connection."

---
## S1 – Basic Auth (Signup / Login / Logout)
- **Objectives:**
    - Implement JWT-based signup, login, and logout.
    - Protect at least one backend route and one frontend page.
- **User Stories:**
    - As a new user, I want to create an account so I can use the app.
    - As an existing user, I want to log in to access my herds and reflections.
- **Tasks:**
    - **1. Implement User Model and Signup:**
        - Create the `User` Pydantic model and MongoDB collection.
        - Implement password hashing (e.g., with `passlib`).
        - Create the `POST /api/v1/auth/signup` endpoint.
        - **Manual Test Step:** Use the signup form in the UI. A new user should be created in the database.
        - **User Test Prompt:** "Create a new account and verify you are logged in and redirected to the home page."
    - **2. Implement Login:**
        - Create the `POST /api/v1/auth/login` endpoint that returns a JWT.
        - **Manual Test Step:** Use the login form. The user should receive a token and be redirected.
        - **User Test Prompt:** "Log in with the account you created. You should be redirected to the dashboard."
    - **3. Implement Route Protection:**
        - Create a dependency to verify JWTs.
        - Protect the `/api/v1/herds` endpoint.
        - Update the frontend to store the JWT and send it with authenticated requests.
        - **Manual Test Step:** Try to access the "Herds" page without being logged in. You should be redirected to the login page.
        - **User Test Prompt:** "Log out, then try to go to the herds page directly. You should be forced to log in."
- **Definition of Done:**
    - The full authentication flow (signup, login, protected routes) works end-to-end from the frontend.
- **Post-sprint:** Commit and push to `main`.

---
## S2 – Herd Management
- **Objectives:**
    - Implement all CRUD operations for herds.
    - Allow users to manage herd members.
- **User Stories:**
    - As a user, I want to create a herd and invite my friends.
    - As a herd owner, I want to be able to rename or delete my herd.
    - As a herd member, I want to be able to leave a herd.
- **Tasks:**
    - **1. Create and View Herds:**
        - Implement `POST /api/v1/herds` and `GET /api/v1/herds`.
        - **Manual Test Step:** Create a new herd from the UI. It should appear on the "Your Herds" page.
        - **User Test Prompt:** "Create a new herd and confirm it shows up in your list of herds."
    - **2. Herd Details and Member Management:**
        - Implement `GET /api/v1/herds/{herdId}` and `PUT /api/v1/herds/{herdId}`.
        - Allow adding/removing members.
        - **Manual Test Step:** From the herd detail page, add a new member by email. The member should appear in the list. Then, remove them.
        - **User Test Prompt:** "Go to a herd's detail page and add another registered user to it. Then, remove them."
    - **3. Delete and Leave Herd:**
        - Implement `DELETE /api/v1/herds/{herdId}` and `POST /api/v1/herds/{herdId}/leave`.
        - **Manual Test Step:** As the owner, delete a herd. It should be removed from the list. As a member, leave a herd.
        - **User Test Prompt:** "As a herd owner, delete a herd. As a member of a different herd, leave it."
- **Definition of Done:**
    - All herd management features are working correctly from the UI.
- **Post-sprint:** Commit and push to `main`.

---
## S3 – Reflections and Reactions
- **Objectives:**
    - Implement the creation and viewing of reflections.
    - Allow users to react to reflections.
- **User Stories:**
    - As a user, I want to create a reflection and share it with a herd or a friend.
    - As a user, I want to see reflections shared with me and react to them.
- **Tasks:**
    - **1. Create and View Reflections:**
        - Implement `POST /api/v1/reflections` and `GET /api/v1/reflections`.
        - **Manual Test Step:** Create a new reflection from the UI. It should appear in your history.
        - **User Test Prompt:** "Create a new reflection and share it with a herd. Confirm it appears in your history."
    - **2. Reflection Details and Reactions:**
        - Implement `GET /api/v1/reflections/{reflectionId}`.
        - Implement `POST /api/v1/reflections/{reflectionId}/react`.
        - **Manual Test Step:** View a reflection that was shared with you. Add a "Tell me more" reaction. The reaction should appear.
        - **User Test Prompt:** "As a member of the herd you shared the reflection with, view the reflection and add a reaction."
- **Definition of Done:**
    - Users can create, view, and react to reflections as expected.
- **Post-sprint:** Commit and push to `main`.