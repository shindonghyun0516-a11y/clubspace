# ClubSpace TRD

## Tech Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js (React) | SEO optimization, SSR/SSG, Vercel deployment |
| **Backend** | Firebase Functions | Serverless, auto-scaling, event triggers |
| **Database** | Firestore | Real-time sync, NoSQL flexibility |
| **Auth** | Firebase Auth | Multi-provider, session management |
| **Storage** | Firebase Cloud Storage | File upload/management |
| **Deploy** | Vercel + Firebase | CI/CD pipeline |
| **State** | Zustand | Lightweight global state |
| **Styling** | Tailwind CSS | Rapid UI development |

## Architecture
```
[Next.js/Vercel] <--> [Firebase Backend]
       |                    |
       |                    +-- Auth
       |                    +-- Functions (API)
       |                    +-- Firestore (DB)
       |                    +-- Storage (Files)
       |                    +-- FCM (Push)
       |
[User Browser]
```

## Data Model
### users
- uid, email, displayName, photoURL, createdAt, status

### clubs  
- clubId, clubName, description, createdAt, ownerUid

### clubMembers
- role (organizer/member/guest), joinedAt

### events
- title, description, eventTime, location, fee, maxAttendees, creatorUid

### rsvps
- uid, status (going/not_going/undecided), updatedAt

### posts
- boardType (notice/free/review), title, content, authorUid, attachments

### chatMessages
- senderUid, message, timestamp

## API Endpoints
All endpoints use `/api/v1` prefix with Firebase Auth.

### Users
- `POST /users` - Create user
- `GET /users/me` - Get profile  
- `PUT /users/me` - Update profile

### Events
- `POST /clubs/{id}/events` - Create event
- `GET /clubs/{id}/events` - List events
- `GET /clubs/{id}/events/{id}` - Get event
- `PUT /clubs/{id}/events/{id}` - Update event
- `POST /clubs/{id}/events/{id}/rsvp` - RSVP

### Communication
- `POST /clubs/{id}/posts` - Create post
- `GET /clubs/{id}/posts` - List posts
- `POST /clubs/{id}/posts/{id}/comments` - Add comment

### Background Triggers
- onNewChatMessage → FCM notification
- onNewPost → Member notifications
- onRsvpDeadline → Reminder alerts

## Implementation
### Real-time Chat
- Firestore `onSnapshot` listeners for real-time updates
- FCM triggers on new messages

### Security  
- Firestore rules: users edit own data, organizers manage events
- Firebase Auth token validation on all API calls

### File Upload
1. Direct upload to Cloud Storage via Firebase SDK
2. Get file URL
3. Store URL in Firestore document

## Timeline
### Phase 1: MVP (12 weeks)
- Weeks 1-2: Firebase setup, Next.js environment, CI/CD
- Weeks 3-6: Auth, data modeling, event CRUD
- Weeks 7-10: Real-time chat, FCM notifications  
- Weeks 11-12: Testing, query optimization

### Phase 2: Beta (4 weeks)
- User feedback integration, performance optimization
- Firestore indexing, Functions cold start reduction

### Phase 3: Launch (4 weeks)
- Infrastructure scaling, monitoring enhancement
