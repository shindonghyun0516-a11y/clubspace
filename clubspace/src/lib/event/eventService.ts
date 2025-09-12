// Event management service for Firebase integration
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Event, 
  RSVP, 
  CreateEventData, 
  UpdateEventData, 
  EventSearchParams,
  RSVPSummary,
  EVENT_VALIDATION 
} from '@/types/event';
import { validateEventData, validateUpdateEventData, validateRSVPData } from './validation';

// Collection names
const EVENTS_COLLECTION = 'events';
const RSVPS_COLLECTION = 'rsvps';

// Event service functions
export const createEvent = async (eventData: CreateEventData, creatorUid: string): Promise<Event> => {
  try {
    console.log('🎉 [eventService] Creating new event:', { eventData, creatorUid });

    // Validate event data
    const validation = validateEventData(eventData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const eventRef = collection(db, EVENTS_COLLECTION);
    const newEventData = {
      ...eventData,
      creatorUid,
      currentAttendees: 0,
      status: 'active' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('✅ [eventService] Event data prepared for Firestore:', newEventData);

    const docRef = await addDoc(eventRef, newEventData);
    
    // Return the created event with generated ID
    const createdEvent: Event = {
      ...eventData,
      eventId: docRef.id,
      creatorUid,
      currentAttendees: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('🎉 [eventService] Event created successfully:', createdEvent.eventId);
    return createdEvent;

  } catch (error) {
    console.error('❌ [eventService] Error creating event:', error);
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    console.log('🔍 [eventService] Fetching event by ID:', eventId);

    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      console.log('❌ [eventService] Event not found:', eventId);
      return null;
    }

    const data = eventSnap.data();
    const event: Event = {
      eventId: eventSnap.id,
      clubId: data.clubId,
      title: data.title,
      description: data.description,
      dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate() : data.dateTime,
      location: data.location,
      creatorUid: data.creatorUid,
      maxAttendees: data.maxAttendees,
      currentAttendees: data.currentAttendees || 0,
      status: data.status,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    };

    console.log('✅ [eventService] Event fetched successfully:', event.title);
    return event;

  } catch (error) {
    console.error('❌ [eventService] Error fetching event:', error);
    throw error;
  }
};

export const getClubEvents = async (clubId: string, searchParams?: EventSearchParams): Promise<Event[]> => {
  try {
    console.log('📋 [eventService] Fetching events for club:', clubId);

    // Use simple query without orderBy to avoid composite index requirement
    // We'll sort in JavaScript instead
    let eventQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('clubId', '==', clubId)
    );

    // Add limit if specified
    if (searchParams?.limit) {
      eventQuery = query(eventQuery, limit(searchParams.limit));
    }

    const querySnapshot = await getDocs(eventQuery);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        eventId: doc.id,
        clubId: data.clubId,
        title: data.title,
        description: data.description,
        dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate() : data.dateTime,
        location: data.location,
        creatorUid: data.creatorUid,
        maxAttendees: data.maxAttendees,
        currentAttendees: data.currentAttendees || 0,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
      
      // Apply status filter manually if specified to avoid composite index requirement
      if (!searchParams?.status || event.status === searchParams.status) {
        events.push(event);
      }
    });

    // Sort events by dateTime in descending order (newest first)
    events.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
    
    console.log(`✅ [eventService] Fetched ${events.length} events for club ${clubId}`);
    return events;

  } catch (error) {
    console.error('❌ [eventService] Error fetching club events:', error);
    throw error;
  }
};

export const updateRSVP = async (eventId: string, uid: string, status: 'going' | 'not_going'): Promise<RSVP> => {
  try {
    console.log('📝 [eventService] Updating RSVP:', { eventId, uid, status });

    // Validate RSVP data
    const validation = validateRSVPData(eventId, uid, status);
    if (!validation.isValid) {
      throw new Error(`RSVP validation failed: ${validation.errors.join(', ')}`);
    }

    const batch = writeBatch(db);

    // Check if RSVP already exists (use simple query to avoid composite index)
    const rsvpQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId)
    );

    const allEventRSVPs = await getDocs(rsvpQuery);
    const existingRSVPs = { 
      empty: !allEventRSVPs.docs.some(doc => doc.data().uid === uid),
      docs: allEventRSVPs.docs.filter(doc => doc.data().uid === uid)
    };
    const now = new Date();

    let rsvp: RSVP;

    if (!existingRSVPs.empty) {
      // Update existing RSVP
      const existingRSVP = existingRSVPs.docs[0];
      const rsvpRef = doc(db, RSVPS_COLLECTION, existingRSVP.id);
      
      batch.update(rsvpRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      rsvp = {
        eventId,
        uid,
        status,
        createdAt: existingRSVP.data().createdAt instanceof Timestamp 
          ? existingRSVP.data().createdAt.toDate() 
          : existingRSVP.data().createdAt,
        updatedAt: now,
      };
    } else {
      // Create new RSVP
      const rsvpRef = doc(collection(db, RSVPS_COLLECTION));
      
      batch.set(rsvpRef, {
        eventId,
        uid,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      rsvp = {
        eventId,
        uid,
        status,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Update event attendee count
    await updateEventAttendeeCount(eventId, batch);

    await batch.commit();

    console.log('✅ [eventService] RSVP updated successfully');
    return rsvp;

  } catch (error) {
    console.error('❌ [eventService] Error updating RSVP:', error);
    throw error;
  }
};

export const getEventRSVPs = async (eventId: string): Promise<RSVP[]> => {
  try {
    console.log('📊 [eventService] Fetching RSVPs for event:', eventId);

    // Use simple query without orderBy to avoid composite index requirement
    const rsvpQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(rsvpQuery);
    const rsvps: RSVP[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const rsvp: RSVP = {
        eventId: data.eventId,
        uid: data.uid,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
      rsvps.push(rsvp);
    });

    // Sort RSVPs by createdAt in descending order (newest first)
    rsvps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log(`✅ [eventService] Fetched ${rsvps.length} RSVPs for event ${eventId}`);
    return rsvps;

  } catch (error) {
    console.error('❌ [eventService] Error fetching event RSVPs:', error);
    throw error;
  }
};

export const getUserRSVP = async (eventId: string, uid: string): Promise<RSVP | null> => {
  try {
    console.log('👤 [eventService] Fetching user RSVP:', { eventId, uid });

    // Use simple query to avoid potential composite index requirement
    const rsvpQuery = query(
      collection(db, RSVPS_COLLECTION),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(rsvpQuery);

    // Find RSVP for specific user (filter in JavaScript)
    const userDoc = querySnapshot.docs.find(doc => doc.data().uid === uid);
    
    if (!userDoc) {
      console.log('❌ [eventService] No RSVP found for user');
      return null;
    }

    const doc = userDoc;
    const data = doc.data();
    const rsvp: RSVP = {
      eventId: data.eventId,
      uid: data.uid,
      status: data.status,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    };

    console.log('✅ [eventService] User RSVP fetched successfully:', rsvp.status);
    return rsvp;

  } catch (error) {
    console.error('❌ [eventService] Error fetching user RSVP:', error);
    throw error;
  }
};

export const getRSVPSummary = async (eventId: string): Promise<RSVPSummary> => {
  try {
    console.log('📈 [eventService] Getting RSVP summary for event:', eventId);

    const rsvps = await getEventRSVPs(eventId);
    
    const going = rsvps.filter(rsvp => rsvp.status === 'going').length;
    const not_going = rsvps.filter(rsvp => rsvp.status === 'not_going').length;
    const total = rsvps.length;

    const summary: RSVPSummary = {
      going,
      not_going,
      total,
    };

    console.log('✅ [eventService] RSVP summary:', summary);
    return summary;

  } catch (error) {
    console.error('❌ [eventService] Error getting RSVP summary:', error);
    throw error;
  }
};

// Helper function to update event attendee count
const updateEventAttendeeCount = async (eventId: string, batch?: any) => {
  try {
    const rsvps = await getEventRSVPs(eventId);
    const goingCount = rsvps.filter(rsvp => rsvp.status === 'going').length;
    
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    if (batch) {
      batch.update(eventRef, {
        currentAttendees: goingCount,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(eventRef, {
        currentAttendees: goingCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('❌ [eventService] Error updating attendee count:', error);
    throw error;
  }
};

// Real-time listener for events
export const subscribeToClubEvents = (clubId: string, callback: (events: Event[]) => void) => {
  console.log('🔔 [eventService] Setting up real-time listener for club events:', clubId);

  // Use simple query without orderBy to avoid composite index requirement
  // We'll sort in JavaScript instead
  const eventQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('clubId', '==', clubId),
    limit(50)
  );

  return onSnapshot(eventQuery, (snapshot) => {
    const events: Event[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        eventId: doc.id,
        clubId: data.clubId,
        title: data.title,
        description: data.description,
        dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate() : data.dateTime,
        location: data.location,
        creatorUid: data.creatorUid,
        maxAttendees: data.maxAttendees,
        currentAttendees: data.currentAttendees || 0,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
      events.push(event);
    });

    // Sort events by dateTime in ascending order for real-time subscription
    events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    console.log(`🔔 [eventService] Real-time update: ${events.length} events`);
    callback(events);
  }, (error) => {
    console.error('❌ [eventService] Real-time listener error:', error);
  });
};