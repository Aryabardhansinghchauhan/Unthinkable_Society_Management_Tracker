# FIXFLOW — Society Maintenance Platform

> *"Maintenance that doesn't get forgotten — Complaint → Owner → Deadline → Evidence → Resolution."*

FixFlow is a comprehensive Society Maintenance Tracker built with the MERN stack (MongoDB, Express, React, Node.js + TypeScript). It shifts maintenance from a generic status-tracker into a high-accountability system with ownership, automated SLA deadline tracking, before/after photo evidence, recurring issue pattern detection, and resident sign-off.

---

## ⚡ Quick Start (Zero Setup Database)

The backend features an automatic in-memory MongoDB fallback (`mongodb-memory-server`), enabling instant local execution without installing MongoDB.

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm install --prefix server
npm install --prefix client
```

### 2. Seed Database with Realistic Demo Data
```bash
npm run seed --prefix server
```
*Seeds realistic demo accounts (`resident@example.com` / `admin@example.com`), recurring Tower B plumbing cluster, overdue tickets, and full timeline history.*

### 3. Run Development Servers
```bash
# Run server (port 5000) & client (port 5173) concurrently:
npm run dev --prefix server
# In another terminal:
npm run dev --prefix client
```

Open your browser at **`http://localhost:5173`**.

---

## 🎭 1-Click Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Resident** | `resident@example.com` | `password123` | Aarav Patel, Flat B-204 (Tower B) |
| **Admin** | `admin@example.com` | `password123` | Sanjay Verma (Estate Manager) |

*(A floating demo switcher is also available in the app header for instant role switching without logging out.)*

---

## ⏱️ 90-Second Demo Presentation Script

1. **Resident Report**:
   - Log in as `resident@example.com`.
   - Click **"+ Report an issue"**, select **Plumbing**, and type *"Water leaking from ceiling in B-204"*.
   - Notice the **Smart Priority Suggestion** badge dynamically evaluates the text and suggests **`HIGH`** with explanation.
   - Attach a photo and submit. Observe the confirmation microcopy: *"We've got it. 👍 Your maintenance request has been sent to the society team."*
2. **Admin Attention Queue**:
   - Switch persona to **Admin** via the top switcher.
   - The new high-priority complaint immediately surfaces in the **Attention Queue** on the executive dashboard.
3. **Staff Assignment & SLA**:
   - Open the complaint detail, assign **Rajesh Sharma (Plumbing)**.
   - Notice the SLA target dynamically computes the 6-hour deadline.
   - Click **"Start Work"** to move status to `IN_PROGRESS`.
4. **Resolution & Evidence**:
   - Mark as **Resolved** and attach an after-repair photo.
5. **Resident Sign-Off Loop**:
   - Switch back to **Resident**.
   - Notice the banner: *"Looks like this is fixed 🎉 Was this actually fixed?"*
   - Click **"No, Still Happening"** to test the re-open flow, enter a reason, and observe the ticket transition to `REOPENED` with audit history.
6. **Executive Intelligence & Problem Map**:
   - Switch to **Admin** to inspect the **Recurring Issue Detector** (identifying the 5+ plumbing clusters in Tower B) and story-driven KPIs (On-Time Resolution %, Avg Response Time).

---

## 🏗️ Architecture & Documentation

- [`docs/API.md`](./docs/API.md) — Comprehensive REST API endpoint reference.
- [`docs/DATABASE.md`](./docs/DATABASE.md) — Mongoose schemas, relations, and indexes.
- [`docs/SYSTEM_DESIGN.md`](./docs/SYSTEM_DESIGN.md) — State machine transitions, overdue calculation, and aggregation logic.

---

## 🧪 Automated Testing

Run the integration and lifecycle test suite:
```bash
npm test --prefix server
```
