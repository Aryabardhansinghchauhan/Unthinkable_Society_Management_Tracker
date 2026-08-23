# FixFlow API Reference

All API responses follow a uniform structure:
```json
// Success
{ "data": { ... }, "error": null }

// Error
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Description is required" } }
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Resident self-registration.
- **Body**: `{ name, email, password, phone?, flatNumber?, building? }`
- **Response**: `{ user, token }`

### `POST /api/auth/login`
Authenticate resident or admin.
- **Body**: `{ email, password }`
- **Response**: `{ user, token }`

### `GET /api/auth/me`
Retrieve currently logged-in user profile.
- **Header**: `Authorization: Bearer <token>`
- **Response**: `{ user }`

---

## 2. Complaints (`/api/complaints`)

### `GET /api/complaints`
Retrieve complaints list. Residents receive only their complaints; Admins receive society-wide complaints with filtering.
- **Query Params**: `status`, `priority`, `category`, `tower`, `assignedTo`, `search`, `overdueOnly`, `page`, `limit`, `sortBy`, `sortOrder`

### `POST /api/complaints`
Create a new maintenance issue (Resident). Generates `FF-XXXX` public ID and calculates dynamic `dueAt`.
- **Body**: `{ category, title, description, priority? }`

### `POST /api/complaints/suggest-priority`
Evaluate keyword and safety heuristics to suggest a priority and explanation.
- **Body**: `{ category, title, description }`
- **Response**: `{ priority, reason, confidenceScore }`

### `GET /api/complaints/:id`
Get full complaint record including populated resident, assigned staff, vertical history timeline, and attachments.

### `PATCH /api/complaints/:id` (Admin)
Update priority or target resolution due date.
- **Body**: `{ priority?, dueAt?, note? }`

### `POST /api/complaints/:id/status` (Admin)
Transition complaint status through the strict state machine (`OPEN -> IN_PROGRESS -> RESOLVED`).
- **Body**: `{ status, note? }`

### `POST /api/complaints/:id/assign` (Admin)
Assign technician and record history.
- **Body**: `{ staffId, note? }`

### `POST /api/complaints/:id/attachments`
Upload photo evidence (Multer multipart/form-data).
- **Body**: `file`, `type` (`BEFORE` | `RESOLUTION` | `OTHER`)

### `POST /api/complaints/:id/reopen` (Resident)
Reopen a previously resolved issue if unresolved. Requires reason note.
- **Body**: `{ note }`

### `POST /api/complaints/:id/confirm-resolution` (Resident)
Confirm complete fix and close feedback loop.
- **Body**: `{ feedback? }`

---

## 3. Notices (`/api/notices`)
- `GET /api/notices`: Fetch society notices (important notices sorted first).
- `POST /api/notices`: Publish notice (Admin).
- `PATCH /api/notices/:id`: Update notice (Admin).
- `DELETE /api/notices/:id`: Delete notice (Admin).

---

## 4. Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve current user's alerts and unread count.
- `POST /api/notifications/:id/read`: Mark single notification read.
- `POST /api/notifications/read-all`: Mark all notifications read.

---

## 5. Admin Insights & KPIs (`/api/admin`)
- `GET /api/admin/dashboard`: On-time %, avg response hours, avg resolution hours, overdue counts, attention queue.
- `GET /api/admin/insights`: Problem map / category & tower concentrations.
- `GET /api/admin/recurring-issues`: MongoDB aggregation pattern detector for repeat issue clusters.
- `GET /api/admin/settings`: Get overdue thresholds & SLA hours.
- `PATCH /api/admin/settings`: Update SLA hours & overdue settings.
