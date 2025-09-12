// Zustand store for club state management
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Club,
  ClubMember,
  CreateClubData,
  UpdateClubData,
  ClubState,
  ClubSearchParams,
  ClubRole,
  ClubPermissionCheck,
} from '@/types/club';
import {
  createClub,
  getClub,
  updateClub,
  deleteClub,
  getUserClubs,
  searchClubs,
  joinClub,
  leaveClub,
  getClubMembers,
  getUserClubRole,
  updateMemberRole,
  subscribeToClub,
  subscribeToUserClubs,
} from '@/lib/club/clubService';
import {
  validateCreateClubData,
  validateUpdateClubData,
  sanitizeCreateClubData,
  sanitizeUpdateClubData,
} from '@/lib/club/validation';

interface ClubStore extends ClubState {
  // Core Actions
  createClub: (ownerUid: string, clubData: CreateClubData) => Promise<Club>;
  updateClub: (clubId: string, updates: UpdateClubData) => Promise<void>;
  deleteClub: (clubId: string) => Promise<void>;
  
  // Club Retrieval
  getClub: (clubId: string) => Promise<Club | null>;
  searchClubs: (params?: ClubSearchParams) => Promise<void>;
  loadUserClubs: (uid: string) => Promise<void>;
  
  // Membership Actions
  joinClub: (clubId: string, uid: string, role?: ClubRole) => Promise<void>;
  leaveClub: (clubId: string, uid: string) => Promise<void>;
  updateMemberRole: (clubId: string, uid: string, newRole: ClubRole) => Promise<void>;
  
  // Member Management
  loadClubMembers: (clubId: string) => Promise<void>;
  getUserClubRole: (clubId: string, uid: string) => Promise<ClubRole | null>;
  
  // Permission Helpers
  checkPermissions: (clubId: string, uid: string) => ClubPermissionCheck;
  
  // Real-time Subscriptions
  subscribeToClub: (clubId: string) => (() => void) | null;
  subscribeToUserClubs: (uid: string) => (() => void) | null;
  
  // State Management
  setCurrentClub: (club: Club | null) => void;
  setClubs: (clubs: Club[]) => void;
  setMyClubs: (clubs: Club[]) => void;
  setClubMembers: (members: ClubMember[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pagination
  nextPage: () => void;
  resetPagination: () => void;
  
  // Cleanup
  cleanup: () => void;
}

// Club error message mapping
const getClubErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

export const useClubStore = create<ClubStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        clubs: [],
        currentClub: null,
        clubMembers: [],
        myClubs: [],
        isLoading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 20,
          hasMore: true,
        },

        // Create club
        createClub: async (ownerUid: string, clubData: CreateClubData) => {
          try {
            set({ isLoading: true, error: null });
            
            // Validate and sanitize data
            const sanitizedData = sanitizeCreateClubData(clubData);
            const validation = validateCreateClubData(sanitizedData);
            
            if (!validation.isValid) {
              throw new Error(validation.errors[0]);
            }
            
            const newClub = await createClub(ownerUid, sanitizedData);
            
            // Add to user's clubs
            const { myClubs } = get();
            set({ 
              myClubs: [newClub, ...myClubs],
              currentClub: newClub,
              isLoading: false 
            });
            
            return newClub;
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Update club
        updateClub: async (clubId: string, updates: UpdateClubData) => {
          console.log('🏪 [clubStore] updateClub called - Version 2.0');
          console.log('🏪 [clubStore] Club ID:', clubId);
          console.log('🏪 [clubStore] Original updates:', updates);
          
          try {
            set({ isLoading: true, error: null });
            
            // Validate and sanitize data
            const sanitizedUpdates = sanitizeUpdateClubData(updates);
            console.log('🏪 [clubStore] Sanitized updates:', sanitizedUpdates);
            
            const validation = validateUpdateClubData(sanitizedUpdates);
            console.log('🏪 [clubStore] Validation result:', validation);
            
            if (!validation.isValid) {
              console.error('❌ [clubStore] Validation failed:', validation.errors);
              throw new Error(validation.errors[0]);
            }
            
            console.log('🏪 [clubStore] Calling service updateClub...');
            await updateClub(clubId, sanitizedUpdates);
            
            // Update local state
            const { clubs, myClubs, currentClub } = get();
            
            const updateClubInArray = (clubArray: Club[]) =>
              clubArray.map(club =>
                club.clubId === clubId
                  ? { ...club, ...sanitizedUpdates, updatedAt: new Date() }
                  : club
              );
            
            set({
              clubs: updateClubInArray(clubs),
              myClubs: updateClubInArray(myClubs),
              currentClub: currentClub?.clubId === clubId
                ? { ...currentClub, ...sanitizedUpdates, updatedAt: new Date() }
                : currentClub,
              isLoading: false,
            });
            console.log('🎉 [clubStore] State updated successfully');
          } catch (error) {
            console.error('❌ [clubStore] updateClub failed:', error);
            const errorMessage = getClubErrorMessage(error);
            console.log('🏪 [clubStore] Error message:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Delete club
        deleteClub: async (clubId: string) => {
          try {
            set({ isLoading: true, error: null });
            
            await deleteClub(clubId);
            
            // Remove from local state
            const { clubs, myClubs } = get();
            set({
              clubs: clubs.filter(club => club.clubId !== clubId),
              myClubs: myClubs.filter(club => club.clubId !== clubId),
              currentClub: null,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Get single club
        getClub: async (clubId: string) => {
          try {
            set({ error: null });
            
            const club = await getClub(clubId);
            
            if (club) {
              set({ currentClub: club });
            }
            
            return club;
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage });
            return null;
          }
        },

        // Search clubs
        searchClubs: async (params: ClubSearchParams = {}) => {
          try {
            set({ isLoading: true, error: null });
            
            const { pagination } = get();
            const searchParams = {
              ...params,
              page: params.page || pagination.page,
              limit: params.limit || pagination.limit,
            };
            
            const result = await searchClubs(searchParams);
            
            set({
              clubs: searchParams.page === 1 
                ? result.clubs 
                : [...get().clubs, ...result.clubs],
              pagination: {
                ...pagination,
                page: searchParams.page || 1,
                hasMore: result.hasMore,
              },
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
          }
        },

        // Load user clubs
        loadUserClubs: async (uid: string) => {
          try {
            set({ isLoading: true, error: null });
            
            const clubs = await getUserClubs(uid);
            
            set({ myClubs: clubs, isLoading: false });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
          }
        },

        // Join club
        joinClub: async (clubId: string, uid: string, role: ClubRole = 'member') => {
          try {
            set({ isLoading: true, error: null });
            
            await joinClub(clubId, uid, role);
            
            // Refresh user clubs
            await get().loadUserClubs(uid);
            
            set({ isLoading: false });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Leave club
        leaveClub: async (clubId: string, uid: string) => {
          try {
            set({ isLoading: true, error: null });
            
            await leaveClub(clubId, uid);
            
            // Remove from user clubs
            const { myClubs } = get();
            set({
              myClubs: myClubs.filter(club => club.clubId !== clubId),
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Update member role
        updateMemberRole: async (clubId: string, uid: string, newRole: ClubRole) => {
          try {
            set({ isLoading: true, error: null });
            
            await updateMemberRole(clubId, uid, newRole);
            
            // Update local club members
            const { clubMembers } = get();
            set({
              clubMembers: clubMembers.map(member =>
                member.clubId === clubId && member.uid === uid
                  ? { ...member, role: newRole }
                  : member
              ),
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Load club members
        loadClubMembers: async (clubId: string) => {
          try {
            set({ isLoading: true, error: null });
            
            const result = await getClubMembers(clubId);
            
            set({ 
              clubMembers: result.members,
              isLoading: false 
            });
          } catch (error) {
            const errorMessage = getClubErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
          }
        },

        // Get user club role
        getUserClubRole: async (clubId: string, uid: string) => {
          try {
            return await getUserClubRole(clubId, uid);
          } catch (error) {
            console.error('Error getting user club role:', error);
            return null;
          }
        },

        // Check permissions
        checkPermissions: (clubId: string, uid: string): ClubPermissionCheck => {
          const { clubMembers, currentClub } = get();
          
          const member = clubMembers.find(m => m.clubId === clubId && m.uid === uid);
          const isOwner = currentClub?.ownerUid === uid;
          const isOrganizer = member?.role === 'organizer' || isOwner;
          
          return {
            canEdit: isOwner || member?.permissions.canEditClub || false,
            canDelete: isOwner,
            canManageMembers: isOwner || member?.permissions.canManageMembers || false,
            canCreateEvents: isOwner || member?.permissions.canCreateEvents || false,
            canViewMembers: !!member,
            isOwner,
            isOrganizer,
          };
        },

        // Subscribe to club updates
        subscribeToClub: (clubId: string) => {
          try {
            return subscribeToClub(clubId, (club) => {
              if (club) {
                set({ currentClub: club });
              }
            });
          } catch (error) {
            console.error('Error subscribing to club:', error);
            return null;
          }
        },

        // Subscribe to user clubs
        subscribeToUserClubs: (uid: string) => {
          try {
            return subscribeToUserClubs(uid, (clubs) => {
              set({ myClubs: clubs });
            });
          } catch (error) {
            console.error('Error subscribing to user clubs:', error);
            return null;
          }
        },

        // State setters
        setCurrentClub: (club) => set({ currentClub: club }),
        setClubs: (clubs) => set({ clubs }),
        setMyClubs: (clubs) => set({ myClubs: clubs }),
        setClubMembers: (members) => set({ clubMembers: members }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Pagination
        nextPage: () => {
          const { pagination } = get();
          if (pagination.hasMore) {
            set({
              pagination: {
                ...pagination,
                page: pagination.page + 1,
              },
            });
          }
        },

        resetPagination: () => set({
          pagination: {
            page: 1,
            limit: 20,
            hasMore: true,
          },
        }),

        // Cleanup
        cleanup: () => {
          // Clean up any subscriptions if stored
          set({
            clubs: [],
            currentClub: null,
            clubMembers: [],
            error: null,
            isLoading: false,
          });
        },
      }),
      {
        name: 'club-storage',
        partialize: (state) => ({
          myClubs: state.myClubs,
          currentClub: state.currentClub,
        }),
        version: 1,
      }
    ),
    {
      name: 'club-store',
    }
  )
);