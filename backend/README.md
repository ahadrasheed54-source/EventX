# EventX Backend (NestJS + MongoDB)



## Setup


cd eventx-backend
npm install






## Admin account



node seed-admin.js


This creates:
- Email: `admin@eventx.com`
- Password: `admin123`



## Run the server


npm run start:dev


- API base URL: `http://localhost:5000/api`
- Swagger docs (interactive API testing): `http://localhost:5000/api/docs`


## Folder structure

```
src/
  auth/          -> register, login, JWT strategy
  users/         -> profile + admin user management
  categories/    -> event categories (admin managed)
  events/        -> event CRUD + image upload (organizer/admin)
  tickets/       -> booking, attendance (participant/organizer)
  common/        -> guards, decorators, exception filter (shared)
  config/        -> multer (image upload) config
```

## API Overview

### Auth
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public (role: organizer/participant only) |
| POST | /api/auth/login | Public |

### Users
| Method | Route | Access |
|---|---|---|
| GET | /api/users/me | Logged-in user |
| PATCH | /api/users/me | Logged-in user |
| GET | /api/users | Admin |
| GET | /api/users/:id | Admin |
| PATCH | /api/users/:id | Admin |
| DELETE | /api/users/:id | Admin |

### Categories
| Method | Route | Access |
|---|---|---|
| GET | /api/categories | Public |
| GET | /api/categories/:id | Public |
| POST | /api/categories | Admin |
| PATCH | /api/categories/:id | Admin |
| DELETE | /api/categories/:id | Admin |

### Events
| Method | Route | Access |
|---|---|---|
| GET | /api/events | Public (search/filter/pagination via query params) |
| GET | /api/events/:id | Public |
| GET | /api/events/organizer/mine | Organizer/Admin |
| POST | /api/events | Organizer/Admin (multipart/form-data, field `image`) |
| PATCH | /api/events/:id | Owner Organizer/Admin |
| DELETE | /api/events/:id | Owner Organizer/Admin |


### Tickets
| Method | Route | Access |
|---|---|---|
| POST | /api/tickets | Participant (book a ticket) |
| GET | /api/tickets/mine | Participant |
| DELETE | /api/tickets/:id | Participant (cancel) |
| GET | /api/tickets/event/:eventId | Organizer/Admin (registrations list) |
| PATCH | /api/tickets/:id/attendance | Organizer/Admin (mark attended) |

### Favorites
| Method | Route | Access |
|---|---|---|
| GET | /api/favorites/mine | Participant |
| POST | /api/favorites/:eventId | Participant (toggles save/unsave) |

### Reviews
| Method | Route | Access |
|---|---|---|
| GET | /api/reviews/event/:eventId | Public (paginated, includes averageRating) |
| GET | /api/reviews/mine | Participant |
| POST | /api/reviews | Participant (one review per event) |
| DELETE | /api/reviews/:id | Owner Participant/Admin |

### Notifications
| Method | Route | Access |
|---|---|---|
| GET | /api/notifications/mine | Logged-in user (paginated, includes unreadCount) |
| PATCH | /api/notifications/:id/read | Logged-in user |
| PATCH | /api/notifications/read-all | Logged-in user |
| POST | /api/notifications/announce | Organizer/Admin (notifies every ticket holder of an event) |


### Dashboard
| Method | Route | Access |
|---|---|---|
| GET | /api/dashboard/admin | Admin — totals, revenue, recent events |
| GET | /api/dashboard/organizer | Organizer/Admin — their events, sales, attendance, revenue |
| GET | /api/dashboard/participant | Participant — registered/upcoming/favorite counts |

## Notes

- Passwords are hashed with bcrypt, never stored in plain text.
- All protected routes require `Authorization: Bearer <token>` header.
- Every response uses a consistent error shape via the global exception filter.
- Verified: project builds cleanly (`npx nest build` — zero errors).
