# FixFlow System Design

FixFlow shifts society maintenance tracking from traditional status transitions (`Open → In Progress → Resolved`) to a complete accountability chain:

$$\text{Complaint} \longrightarrow \text{Owner} \longrightarrow \text{Deadline} \longrightarrow \text{Evidence} \longrightarrow \text{Resolution}$$

---

## 1. Strict Finite State Machine

Transitions are strictly validated server-side:

```
[ OPEN ] ───────────────> [ IN_PROGRESS ] ───────────────> [ RESOLVED ]
                                ^                               │
                                │                               │ (Resident Reopen)
                                └─────── [ REOPENED ] <─────────┘
```

1. **`OPEN → IN_PROGRESS`**: Triggered when staff is assigned or work begins.
2. **`IN_PROGRESS → RESOLVED`**: Triggered upon completion with required resolution photo evidence.
3. **`RESOLVED → REOPENED`**: Exclusive to the reporting resident if the issue persists. Requires a mandatory reason note.
4. **`REOPENED → IN_PROGRESS`**: Handled as an escalated priority by the society admin team.

---

## 2. Dynamic Overdue Logic

- **Never Stored as a Boolean**: Storing `isOverdue: true/false` invites stale records.
- **Evaluated at Read Time**:
$$\text{isOverdue} = \text{status} \in \{\text{OPEN}, \text{IN\_PROGRESS}, \text{REOPENED}\} \land \text{now} > \text{dueAt}$$

---

## 3. Recurring Issue Pattern Detection

Rather than relying on vague ML claims, FixFlow uses a transparent MongoDB aggregation pipeline:
1. Filters complaints within the active lookback window (e.g., past 30 days).
2. Groups by `{ category, building }`.
3. Filters groups with count $\ge 3$.
4. Projects actionable recommendations (e.g., *"7 complaints · 4 flats · Tower B · Plumbing → Inspect main riser and common drainage line"*).
