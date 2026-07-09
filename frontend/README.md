# EventX Frontend (Next.js 15 + TypeScript + Tailwind)

Frontend for the EventX Event Management Platform. Built to match the provided
`eventx-backend` NestJS API exactly (same routes, same field names).

## Setup

```bash
cd eventx-frontend
npm install
```

`.env.local` is already set to talk to the backend on `http://localhost:5000/api`.
Change it if your backend runs somewhere else:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000
```

## Run

Make sure the backend is running first (`npm run start:dev` inside `eventx-backend`),
then:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## What's included

- **Public**: Home, Events (search/filter/pagination), Event Details (book ticket,
  favorite, reviews), Login, Register, About, Contact, 404.
- **Participant dashboard**: Overview, My Tickets (cancel), Favorites, My Reviews,
  Notifications, Profile.
- **Organizer dashboard**: Overview, My Events (create/edit/delete, image upload),
  Registrations & Attendance per event, Announcements, Notifications, Profile.
- **Admin dashboard**: Overview (platform stats), Users (search/filter/role change/
  delete), Categories (create/edit/delete), Notifications, Profile.

## Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Redux Toolkit (auth/session state only — everything else is fetched per page,
  kept intentionally simple)
- Axios (with a token interceptor in `lib/axios.ts`)
- React Hook Form
- React Toastify

## Structure

```
app/            -> pages (route folders match the URLs)
components/     -> shared UI (Navbar, Sidebar, EventCard, EventForm, etc.)
redux/          -> store, authSlice, provider
lib/axios.ts    -> pre-configured API client + error helper
types/          -> TypeScript types matching backend schemas
```

## Notes

- Auth token + user are stored in `localStorage` and rehydrated into Redux on load.
- Only `organizer` and `participant` can self-register (matches backend). To log in
  as admin, run `node seed-admin.js` in the backend, then log in with
  `admin@eventx.com` / `admin123`.
- All API calls, field names, and response shapes were read directly from the
  uploaded backend source, so this should connect with zero changes.
