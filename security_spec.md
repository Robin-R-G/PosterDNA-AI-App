# Security Specification for PosterDNA AI

## 1. Data Invariants
- A project must belong to a valid user.
- A brand identity must belong to a valid user.
- Users can only access their own data.
- Status fields for projects are constrained to specific enums.
- Timestamps must be server-generated.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a project with another user's `userId`.
2. Updating a project's `userId` after creation.
3. Injecting a 2MB string into a project title.
4. Setting a project's `status` to an invalid value (e.g., "HACKED").
5. Deleting a project that the user does not own.
6. Reading projects without being signed in.
7. Creating a brand identity with an array of 500 tags (Denial of Wallet).
8. Setting `createdAt` to a date in the past from the client.
9. Updating `imageUrl` to a non-string value.
10. Listing projects without filtering by the user's own `userId`.
11. Injecting special characters into document IDs (ID poisoning).
12. Attempting to update a project's `createdAt` timestamp.

## 3. The Test Runner (Plan)
We will use `DRAFT_firestore.rules` and verify against these logic gates.
