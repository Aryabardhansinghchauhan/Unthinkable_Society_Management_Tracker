# FixFlow Database Schema Reference

Database: **MongoDB** using **Mongoose ODM**.

```mermaid
erDiagram
    USER ||--o{ COMPLAINT : reports
    USER ||--o{ COMPLAINT_HISTORY : acts_in
    USER ||--o{ COMPLAINT_ATTACHMENT : uploads
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ NOTICE : authors
    MAINTENANCE_STAFF ||--o{ COMPLAINT : assigned_to
    COMPLAINT ||--o{ COMPLAINT_HISTORY : logs
    COMPLAINT ||--o{ COMPLAINT_ATTACHMENT : has_evidence

    USER {
        ObjectId _id PK
        string name
        string email UK
        string phone
        string passwordHash
        enum role "RESIDENT | ADMIN"
        string flatNumber
        string building
        date createdAt
    }

    COMPLAINT {
        ObjectId _id PK
        string publicId UK "e.g. FF-1042"
        ObjectId resident FK
        enum category "Plumbing | Electrical | Lift | Cleaning | Security | Parking | Common Area | Other"
        string title
        string description
        enum status "OPEN | IN_PROGRESS | RESOLVED | REOPENED"
        enum priority "LOW | MEDIUM | HIGH"
        ObjectId assignedTo FK
        date dueAt
        date resolvedAt
        date reopenedAt
        date firstResponseAt
        date createdAt
    }

    COMPLAINT_HISTORY {
        ObjectId _id PK
        ObjectId complaint FK
        ObjectId actor FK
        string oldStatus
        string newStatus
        string eventType
        string note
        mixed metadata
        date createdAt
    }

    COMPLAINT_ATTACHMENT {
        ObjectId _id PK
        ObjectId complaint FK
        enum type "BEFORE | RESOLUTION | OTHER"
        string url
        string filename
        string mimeType
        number sizeBytes
        ObjectId createdBy FK
        date createdAt
    }
```

## Indexes
- `User`: `{ email: 1 }` (unique)
- `Complaint`: `{ publicId: 1 }` (unique), `{ resident: 1 }`, `{ status: 1, dueAt: 1 }`, `{ category: 1, createdAt: -1 }`
- `ComplaintHistory`: `{ complaint: 1, createdAt: 1 }`
- `Notification`: `{ user: 1, readAt: 1, createdAt: -1 }`
- `Counter`: `{ name: 1 }` (unique)
