// Club management service for Firestore operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Club,
  ClubMember,
  CreateClubData,
  UpdateClubData,
  ClubSearchParams,
  ClubListResponse,
  ClubMemberResponse,
  ClubRole,
  DEFAULT_CLUB_SETTINGS,
  DEFAULT_PERMISSIONS,
  ClubStats,
} from '@/types/club';

// Collection references
const CLUBS_COLLECTION = 'clubs';
const CLUB_MEMBERS_COLLECTION = 'clubMembers';
const CLUB_STATS_COLLECTION = 'clubStats';

/**
 * Generate unique club ID
 */
const generateClubId = (): string => {
  return `club_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new club
 */
export const createClub = async (
  ownerUid: string,
  clubData: CreateClubData
): Promise<Club> => {
  const clubId = generateClubId();
  const now = new Date();
  
  const club: Club = {
    clubId,
    clubName: clubData.clubName,
    description: clubData.description,
    ownerUid,
    createdAt: now,
    updatedAt: now,
    status: 'active',
    settings: { ...DEFAULT_CLUB_SETTINGS, ...clubData.settings },
    memberCount: 1,
    maxMembers: clubData.maxMembers,
    tags: clubData.tags,
    isPublic: clubData.isPublic,
  };

  const clubMember: ClubMember = {
    clubId,
    uid: ownerUid,
    role: 'owner',
    joinedAt: now,
    status: 'active',
    lastActivityAt: now,
    permissions: DEFAULT_PERMISSIONS.owner,
  };

  const clubStats: ClubStats = {
    clubId,
    totalMembers: 1,
    activeMembers: 1,
    totalEvents: 0,
    upcomingEvents: 0,
    totalPosts: 0,
    lastActivityAt: now,
    updatedAt: now,
  };

  try {
    const batch = writeBatch(db);

    // Create club document
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    batch.set(clubRef, {
      ...club,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create club member document
    const memberRef = doc(db, CLUB_MEMBERS_COLLECTION, `${clubId}_${ownerUid}`);
    batch.set(memberRef, {
      ...clubMember,
      joinedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });

    // Create club stats document
    const statsRef = doc(db, CLUB_STATS_COLLECTION, clubId);
    batch.set(statsRef, {
      ...clubStats,
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return club;
  } catch (error) {
    console.error('Error creating club:', error);
    throw new Error('Failed to create club');
  }
};

/**
 * Get club by ID
 */
export const getClub = async (clubId: string): Promise<Club | null> => {
  try {
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const clubSnap = await getDoc(clubRef);

    if (clubSnap.exists()) {
      const data = clubSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Club;
    }

    return null;
  } catch (error) {
    console.error('Error fetching club:', error);
    return null;
  }
};

/**
 * Update club information
 */
export const updateClub = async (
  clubId: string,
  updates: UpdateClubData
): Promise<void> => {
  try {
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    await updateDoc(clubRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating club:', error);
    throw new Error('Failed to update club');
  }
};

/**
 * Delete club (soft delete by setting status to archived)
 */
export const deleteClub = async (clubId: string): Promise<void> => {
  try {
    await updateClub(clubId, {
      status: 'archived',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting club:', error);
    throw new Error('Failed to delete club');
  }
};

/**
 * Get clubs for a user
 */
export const getUserClubs = async (uid: string): Promise<Club[]> => {
  try {
    // Get club IDs where user is a member
    const membersQuery = query(
      collection(db, CLUB_MEMBERS_COLLECTION),
      where('uid', '==', uid),
      where('status', '==', 'active')
    );

    const memberSnaps = await getDocs(membersQuery);
    const clubIds = memberSnaps.docs.map(doc => doc.data().clubId);

    if (clubIds.length === 0) {
      return [];
    }

    // Get clubs information
    const clubs: Club[] = [];
    for (const clubId of clubIds) {
      const club = await getClub(clubId);
      if (club && club.status === 'active') {
        clubs.push(club);
      }
    }

    return clubs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    return [];
  }
};

/**
 * Search and list clubs with pagination
 */
export const searchClubs = async (
  searchParams: ClubSearchParams = {}
): Promise<ClubListResponse> => {
  try {
    let clubQuery = query(collection(db, CLUBS_COLLECTION));

    // Apply filters
    clubQuery = query(clubQuery, where('status', '==', 'active'));

    if (searchParams.isPublic !== undefined) {
      clubQuery = query(clubQuery, where('isPublic', '==', searchParams.isPublic));
    }

    // Apply sorting
    const sortField = searchParams.sortBy || 'updatedAt';
    const sortOrder = searchParams.sortOrder || 'desc';
    clubQuery = query(clubQuery, orderBy(sortField, sortOrder));

    // Apply pagination
    const pageLimit = searchParams.limit || 20;
    clubQuery = query(clubQuery, limit(pageLimit));

    const querySnapshot = await getDocs(clubQuery);
    const clubs: Club[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      clubs.push({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Club);
    });

    // Filter by text search if provided
    let filteredClubs = clubs;
    if (searchParams.query) {
      const searchTerm = searchParams.query.toLowerCase();
      filteredClubs = clubs.filter(club =>
        club.clubName.toLowerCase().includes(searchTerm) ||
        club.description.toLowerCase().includes(searchTerm) ||
        club.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by tags if provided
    if (searchParams.tags && searchParams.tags.length > 0) {
      filteredClubs = filteredClubs.filter(club =>
        searchParams.tags!.some(tag => club.tags.includes(tag))
      );
    }

    return {
      clubs: filteredClubs,
      totalCount: filteredClubs.length,
      hasMore: querySnapshot.docs.length === pageLimit,
    };
  } catch (error) {
    console.error('Error searching clubs:', error);
    return {
      clubs: [],
      totalCount: 0,
      hasMore: false,
    };
  }
};

/**
 * Join a club
 */
export const joinClub = async (
  clubId: string,
  uid: string,
  role: ClubRole = 'member'
): Promise<void> => {
  try {
    const club = await getClub(clubId);
    if (!club) {
      throw new Error('Club not found');
    }

    if (club.maxMembers && club.memberCount >= club.maxMembers) {
      throw new Error('Club is full');
    }

    const memberRef = doc(db, CLUB_MEMBERS_COLLECTION, `${clubId}_${uid}`);
    const clubMember: ClubMember = {
      clubId,
      uid,
      role,
      joinedAt: new Date(),
      status: 'active',
      lastActivityAt: new Date(),
      permissions: DEFAULT_PERMISSIONS[role],
    };

    const batch = writeBatch(db);

    // Add member
    batch.set(memberRef, {
      ...clubMember,
      joinedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });

    // Update club member count
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    batch.update(clubRef, {
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Update club stats
    const statsRef = doc(db, CLUB_STATS_COLLECTION, clubId);
    batch.update(statsRef, {
      totalMembers: increment(1),
      activeMembers: increment(1),
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error joining club:', error);
    throw new Error('Failed to join club');
  }
};

/**
 * Leave a club
 */
export const leaveClub = async (clubId: string, uid: string): Promise<void> => {
  try {
    const memberRef = doc(db, CLUB_MEMBERS_COLLECTION, `${clubId}_${uid}`);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      throw new Error('Membership not found');
    }

    const memberData = memberSnap.data() as ClubMember;
    if (memberData.role === 'owner') {
      throw new Error('Owner cannot leave club');
    }

    const batch = writeBatch(db);

    // Remove member
    batch.delete(memberRef);

    // Update club member count
    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    batch.update(clubRef, {
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });

    // Update club stats
    const statsRef = doc(db, CLUB_STATS_COLLECTION, clubId);
    batch.update(statsRef, {
      totalMembers: increment(-1),
      activeMembers: increment(-1),
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error leaving club:', error);
    throw new Error('Failed to leave club');
  }
};

/**
 * Get club members
 */
export const getClubMembers = async (
  clubId: string,
  page: number = 1,
  pageLimit: number = 50
): Promise<ClubMemberResponse> => {
  try {
    const membersQuery = query(
      collection(db, CLUB_MEMBERS_COLLECTION),
      where('clubId', '==', clubId),
      where('status', '==', 'active'),
      orderBy('joinedAt', 'asc'),
      limit(pageLimit)
    );

    const querySnapshot = await getDocs(membersQuery);
    const members: ClubMember[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
      } as ClubMember);
    });

    return {
      members,
      totalCount: members.length,
    };
  } catch (error) {
    console.error('Error fetching club members:', error);
    return {
      members: [],
      totalCount: 0,
    };
  }
};

/**
 * Get user's role in a club
 */
export const getUserClubRole = async (
  clubId: string,
  uid: string
): Promise<ClubRole | null> => {
  try {
    const memberRef = doc(db, CLUB_MEMBERS_COLLECTION, `${clubId}_${uid}`);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      return memberSnap.data().role as ClubRole;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user club role:', error);
    return null;
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  clubId: string,
  uid: string,
  newRole: ClubRole
): Promise<void> => {
  try {
    const memberRef = doc(db, CLUB_MEMBERS_COLLECTION, `${clubId}_${uid}`);
    await updateDoc(memberRef, {
      role: newRole,
      permissions: DEFAULT_PERMISSIONS[newRole],
      lastActivityAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    throw new Error('Failed to update member role');
  }
};

/**
 * Subscribe to club updates (real-time)
 */
export const subscribeToClub = (
  clubId: string,
  callback: (club: Club | null) => void
): (() => void) => {
  const clubRef = doc(db, CLUBS_COLLECTION, clubId);

  return onSnapshot(
    clubRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const club: Club = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Club;
        callback(club);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to club:', error);
      callback(null);
    }
  );
};

/**
 * Subscribe to user's clubs (real-time)
 */
export const subscribeToUserClubs = (
  uid: string,
  callback: (clubs: Club[]) => void
): (() => void) => {
  const membersQuery = query(
    collection(db, CLUB_MEMBERS_COLLECTION),
    where('uid', '==', uid),
    where('status', '==', 'active')
  );

  return onSnapshot(
    membersQuery,
    async (snapshot) => {
      try {
        const clubIds = snapshot.docs.map(doc => doc.data().clubId);
        
        if (clubIds.length === 0) {
          callback([]);
          return;
        }

        // Get clubs information
        const clubs: Club[] = [];
        for (const clubId of clubIds) {
          const club = await getClub(clubId);
          if (club && club.status === 'active') {
            clubs.push(club);
          }
        }

        clubs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        callback(clubs);
      } catch (error) {
        console.error('Error in user clubs subscription:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('Error subscribing to user clubs:', error);
      callback([]);
    }
  );
};