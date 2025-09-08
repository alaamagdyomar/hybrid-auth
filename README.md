
---

## 🔹 Backend Cycle

### 1. **Login (`/api/auth/login`)**
- Validate input with `zod`.
- Look up user in DB (`prisma`).
- Verify password (`bcrypt`).
- Create session in Redis (`session.ts`).
- Set session ID in `HttpOnly` cookie (`cookies.ts`).
- Return **access token** (JWT, short-lived).

### 2. **Authenticated Request**
- Client sends `Authorization: Bearer <accessToken>`.
- API verifies token (`jwt.ts`).
- If valid → return protected data.
- If expired → client silently calls `/api/auth/refresh`.

### 3. **Refresh (`/api/auth/refresh`)**
- Reads session cookie (`sid`).
- Validates session in Redis.
- Rotates session (old sid revoked, new sid issued).
- Sets new cookie, returns new access token.

### 4. **Logout (`/api/auth/logout`)**
- Deletes session in Redis.
- Clears cookie.

### 5. **Check session (`/api/auth/me`)**
- Reads cookie, verifies session.
- Returns `{ user }` if valid.

---

## 🔹 Frontend Cycle

### 1. **AuthProvider**
- Wraps app, manages in-memory token state.
- On app load: calls `/api/auth/refresh` to try session restore.
- Exposes `user`, `token`, and `login/logout` actions.

### 2. **Login**
- User submits form.
- Call `/api/auth/login` → receive `{ user, accessToken }`.
- Save access token in memory state.
- Redirect to `/dashboard`.

### 3. **Protected Routes**
- `ProtectedRoute` checks `isAuthenticated`.
- If not → redirect to `/login`.
- If yes → render page.

### 4. **API Calls**
- Use `apiFetch` wrapper:
  - Adds `Authorization: Bearer <token>`.
  - If response = `401`, silently call `/api/auth/refresh`.
  - Retry request with new token.

### 5. **Logout**
- Call `/api/auth/logout`.
- Clear in-memory token.
- Redirect to `/login`.

---

## 🔹 Runtime Timeline

1. User visits site with no token → AuthProvider tries `/api/auth/refresh`.
   - If session valid → gets new token → logged in.
   - If invalid → redirected to `/login`.

2. User logs in → session created, cookie set, token returned.

3. User browses protected pages → token used in headers.

4. Token expires → API returns `401` → client calls `/api/auth/refresh`.
   - Session rotated, cookie updated, new token issued.

5. User logs out → cookie cleared, session revoked.

---

## 🔹 Security Notes

- **Access tokens** live only in memory (never `localStorage`).
- **Refresh sessions** live in Redis with rotation to prevent replay.
- **Cookies**: `HttpOnly`, `Secure` (in prod), `SameSite=strict`.
- **JWT** payload kept minimal (`sub`, `role`, `iat`, `exp`).
- Rate-limit `/login` and `/refresh` endpoints to prevent brute-force.

---

## 🔹 Testing Checklist

- [ ] Prisma migrations applied (`npx prisma migrate dev`).
- [ ] Seed user created (`npx prisma db seed`).
- [ ] Redis running (local docker or Upstash).
- [ ] `POST /api/auth/login` returns access token + sets cookie.
- [ ] `GET /api/secret` works with valid token, fails with expired one.
- [ ] `POST /api/auth/refresh` rotates session + issues new token.
- [ ] `POST /api/auth/logout` clears cookie + deletes session.
- [ ] Login page works → redirects to dashboard.
- [ ] Logout clears state → redirects to login.
- [ ] Refresh persists session across page reloads.

---

## 🔹 Getting Started

```bash
# Install deps
npm install

# Setup database
npx prisma migrate dev --name init
npx prisma db seed

# Start Redis (if local)
docker run -d --name local-redis -p 6379:6379 redis:7

# Start app
npm run dev
