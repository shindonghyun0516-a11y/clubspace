// Event state management with Zustand
import { create } from 'zustand';
import { 
  Event, 
  RSVP, 
  CreateEventData, 
  UpdateEventData, 
  EventSearchParams,
  RSVPSummary 
} from '@/types/event';
import {
  createEvent,
  getEventById,
  getClubEvents,
  updateRSVP,
  getEventRSVPs,
  getUserRSVP,
  getRSVPSummary,
  subscribeToClubEvents
} from '@/lib/event/eventService';

interface EventState {
  // Event data
  events: Event[];
  currentEvent: Event | null;
  userEvents: Event[];
  
  // RSVP data
  rsvps: RSVP[];
  userRSVPs: Map<string, RSVP>; // eventId -> RSVP
  rsvpSummaries: Map<string, RSVPSummary>; // eventId -> RSVPSummary
  
  // UI state
  isLoading: boolean;
  isCreating: boolean;
  isUpdatingRSVP: boolean;
  error: string | null;
  
  // Real-time subscription cleanup functions
  unsubscribes: Map<string, () => void>;
}

interface EventActions {
  // Event management
  createEvent: (eventData: CreateEventData, creatorUid: string) => Promise<Event>;
  fetchEventById: (eventId: string) => Promise<void>;
  fetchClubEvents: (clubId: string, searchParams?: EventSearchParams) => Promise<void>;
  clearEvents: () => void;
  
  // RSVP management  
  updateUserRSVP: (eventId: string, uid: string, status: 'going' | 'not_going') => Promise<void>;
  fetchEventRSVPs: (eventId: string) => Promise<void>;
  fetchUserRSVP: (eventId: string, uid: string) => Promise<void>;
  fetchRSVPSummary: (eventId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToEvents: (clubId: string) => () => void;
  unsubscribeFromEvents: (clubId: string) => void;
  unsubscribeAll: () => void;
  
  // UI state management
  setCurrentEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdatingRSVP: (updating: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type EventStore = EventState & EventActions;

export const useEventStore = create<EventStore>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  userEvents: [],
  rsvps: [],
  userRSVPs: new Map(),
  rsvpSummaries: new Map(),
  isLoading: false,
  isCreating: false,
  isUpdatingRSVP: false,
  error: null,
  unsubscribes: new Map(),

  // Event management actions
  createEvent: async (eventData: CreateEventData, creatorUid: string) => {
    try {
      console.log('🎉 [eventStore] Creating event:', eventData.title);
      set({ isCreating: true, error: null });

      const newEvent = await createEvent(eventData, creatorUid);
      
      set((state) => ({
        events: [newEvent, ...state.events],
        currentEvent: newEvent,
        isCreating: false,
      }));

      console.log('✅ [eventStore] Event created successfully');
      return newEvent;

    } catch (error) {
      console.error('❌ [eventStore] Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      set({ error: errorMessage, isCreating: false });
      throw error;
    }
  },

  fetchEventById: async (eventId: string) => {
    try {
      console.log('🔍 [eventStore] Fetching event by ID:', eventId);
      set({ isLoading: true, error: null });

      const event = await getEventById(eventId);
      
      set({
        currentEvent: event,
        isLoading: false,
      });

      // Also fetch RSVP summary for this event
      if (event) {
        get().fetchRSVPSummary(eventId);
      }

    } catch (error) {
      console.error('❌ [eventStore] Error fetching event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchClubEvents: async (clubId: string, searchParams?: EventSearchParams) => {
    try {
      console.log('📋 [eventStore] Fetching club events:', clubId);
      set({ isLoading: true, error: null });

      const events = await getClubEvents(clubId, searchParams);
      
      set({
        events,
        isLoading: false,
      });

      // Fetch RSVP summaries for all events
      const summaryPromises = events.map(event => 
        get().fetchRSVPSummary(event.eventId)
      );
      await Promise.all(summaryPromises);

    } catch (error) {
      console.error('❌ [eventStore] Error fetching club events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearEvents: () => {
    console.log('🧹 [eventStore] Clearing events');
    set({
      events: [],
      currentEvent: null,
      userEvents: [],
      rsvps: [],
      error: null,
    });
  },

  // RSVP management actions
  updateUserRSVP: async (eventId: string, uid: string, status: 'going' | 'not_going') => {
    try {
      console.log('📝 [eventStore] Updating RSVP:', { eventId, uid, status });
      set({ isUpdatingRSVP: true, error: null });

      const rsvp = await updateRSVP(eventId, uid, status);
      
      set((state) => {
        const newUserRSVPs = new Map(state.userRSVPs);
        newUserRSVPs.set(eventId, rsvp);
        
        return {
          userRSVPs: newUserRSVPs,
          isUpdatingRSVP: false,
        };
      });

      // Refresh RSVP summary and event data
      await Promise.all([
        get().fetchRSVPSummary(eventId),
        get().fetchEventById(eventId)
      ]);

      console.log('✅ [eventStore] RSVP updated successfully');

    } catch (error) {
      console.error('❌ [eventStore] Error updating RSVP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update RSVP';
      set({ error: errorMessage, isUpdatingRSVP: false });
      throw error;
    }
  },

  fetchEventRSVPs: async (eventId: string) => {
    try {
      console.log('📊 [eventStore] Fetching event RSVPs:', eventId);
      
      const rsvps = await getEventRSVPs(eventId);
      
      set((state) => ({
        rsvps: [...state.rsvps.filter(r => r.eventId !== eventId), ...rsvps],
      }));

    } catch (error) {
      console.error('❌ [eventStore] Error fetching event RSVPs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RSVPs';
      set({ error: errorMessage });
    }
  },

  fetchUserRSVP: async (eventId: string, uid: string) => {
    try {
      console.log('👤 [eventStore] Fetching user RSVP:', { eventId, uid });
      
      const rsvp = await getUserRSVP(eventId, uid);
      
      set((state) => {
        const newUserRSVPs = new Map(state.userRSVPs);
        if (rsvp) {
          newUserRSVPs.set(eventId, rsvp);
        } else {
          newUserRSVPs.delete(eventId);
        }
        
        return { userRSVPs: newUserRSVPs };
      });

    } catch (error) {
      console.error('❌ [eventStore] Error fetching user RSVP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user RSVP';
      set({ error: errorMessage });
    }
  },

  fetchRSVPSummary: async (eventId: string) => {
    try {
      console.log('📈 [eventStore] Fetching RSVP summary:', eventId);
      
      const summary = await getRSVPSummary(eventId);
      
      set((state) => {
        const newRSVPSummaries = new Map(state.rsvpSummaries);
        newRSVPSummaries.set(eventId, summary);
        
        return { rsvpSummaries: newRSVPSummaries };
      });

    } catch (error) {
      console.error('❌ [eventStore] Error fetching RSVP summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RSVP summary';
      set({ error: errorMessage });
    }
  },

  // Real-time subscription management
  subscribeToEvents: (clubId: string) => {
    console.log('🔔 [eventStore] Setting up real-time subscription for club:', clubId);
    
    // Clean up existing subscription for this club
    get().unsubscribeFromEvents(clubId);
    
    const unsubscribe = subscribeToClubEvents(clubId, (events) => {
      console.log('🔔 [eventStore] Real-time events update:', events.length);
      set({ events });
      
      // Update RSVP summaries for new events
      events.forEach(event => {
        get().fetchRSVPSummary(event.eventId);
      });
    });
    
    set((state) => {
      const newUnsubscribes = new Map(state.unsubscribes);
      newUnsubscribes.set(clubId, unsubscribe);
      return { unsubscribes: newUnsubscribes };
    });
    
    return unsubscribe;
  },

  unsubscribeFromEvents: (clubId: string) => {
    const { unsubscribes } = get();
    const unsubscribe = unsubscribes.get(clubId);
    
    if (unsubscribe) {
      console.log('🔕 [eventStore] Unsubscribing from club events:', clubId);
      unsubscribe();
      
      set((state) => {
        const newUnsubscribes = new Map(state.unsubscribes);
        newUnsubscribes.delete(clubId);
        return { unsubscribes: newUnsubscribes };
      });
    }
  },

  unsubscribeAll: () => {
    console.log('🔕 [eventStore] Unsubscribing from all event listeners');
    const { unsubscribes } = get();
    
    unsubscribes.forEach((unsubscribe) => {
      unsubscribe();
    });
    
    set({ unsubscribes: new Map() });
  },

  // UI state management
  setCurrentEvent: (event: Event | null) => {
    set({ currentEvent: event });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setCreating: (creating: boolean) => {
    set({ isCreating: creating });
  },

  setUpdatingRSVP: (updating: boolean) => {
    set({ isUpdatingRSVP: updating });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));