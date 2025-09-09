# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ClubSpace** - A unified club management platform built with Next.js and Firebase, designed for 10-100 member clubs to replace fragmented tools like KakaoTalk, Google Sheets, and BAND.

## Tech Stack & Architecture

- **Frontend**: Next.js (React) with Tailwind CSS
- **Backend**: Firebase Functions (serverless)
- **Database**: Firestore (real-time NoSQL)
- **Authentication**: Firebase Auth (multi-provider)
- **Storage**: Firebase Cloud Storage
- **State Management**: Zustand
- **Deployment**: Vercel (frontend) + Firebase (backend)
- **Notifications**: FCM (Firebase Cloud Messaging)

## Key Data Models

- **users**: uid, email, displayName, photoURL, createdAt, status
- **clubs**: clubId, clubName, description, createdAt, ownerUid
- **clubMembers**: role (organizer/member/guest), joinedAt
- **events**: title, description, eventTime, location, fee, maxAttendees, creatorUid
- **rsvps**: uid, status (going/not_going/undecided), updatedAt
- **posts**: boardType (notice/free/review), title, content, authorUid, attachments
- **chatMessages**: senderUid, message, timestamp

## Development Commands

Once the project is set up, common commands will be:

```bash
# Development
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server

# Firebase
firebase emulators:start  # Run local Firebase emulators
firebase deploy           # Deploy functions and rules
firebase deploy --only functions  # Deploy functions only

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## Core Features & Implementation Notes

### Real-time Features
- Use Firestore `onSnapshot` listeners for real-time chat and event updates
- FCM triggers for push notifications on new messages/posts

### Security Rules
- Firestore security rules: users edit own data, organizers manage events
- All API endpoints use `/api/v1` prefix with Firebase Auth token validation

### File Handling
- Direct upload to Cloud Storage via Firebase SDK
- Store file URLs in Firestore documents

### Performance Requirements
- Page load: <3 seconds
- Chat response: <1 second
- Mobile-first responsive design

## Project Structure (To Be Created)

```
/
├── pages/              # Next.js pages and API routes
├── components/         # React components
├── lib/               # Utilities and Firebase config
├── hooks/             # Custom React hooks
├── store/             # Zustand state management
├── styles/            # Tailwind CSS and global styles
├── functions/         # Firebase Cloud Functions
└── firestore.rules    # Firestore security rules
```

## Development Phases

1. **Phase 1 (Weeks 1-12)**: MVP with auth, events, chat, notifications
2. **Phase 2 (Weeks 13-16)**: Beta testing and performance optimization
3. **Phase 3 (Weeks 17-20)**: Launch preparation and scaling

## Key Considerations

- Target users: 25% organizers, 35% active members, 40% casual members
- Mobile-first approach with progressive web app features
- Real-time synchronization across all connected devices
- Role-based permissions (organizer/member/guest)
- Event RSVP tracking and automated reminders