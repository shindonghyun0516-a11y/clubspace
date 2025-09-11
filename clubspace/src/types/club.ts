// Club management related TypeScript types

export interface Club {
  clubId: string;
  clubName: string;
  description: string;
  ownerUid: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'archived';
  settings: ClubSettings;
  memberCount: number;
  maxMembers?: number;
  tags: string[];
  isPublic: boolean;
  inviteCode?: string;
}

export interface ClubSettings {
  allowMemberInvites: boolean;
  allowPublicEvents: boolean;
  defaultEventVisibility: 'public' | 'members_only' | 'organizers_only';
  allowMemberPosts: boolean;
  autoDeleteInactiveMembers: boolean;
  inactivityThresholdDays: number;
}

export interface ClubMember {
  clubId: string;
  uid: string;
  role: ClubRole;
  joinedAt: Date;
  status: 'active' | 'inactive' | 'banned';
  lastActivityAt: Date;
  permissions: ClubPermissions;
}

export type ClubRole = 'owner' | 'organizer' | 'member' | 'guest';

export interface ClubPermissions {
  canCreateEvents: boolean;
  canEditClub: boolean;
  canManageMembers: boolean;
  canDeletePosts: boolean;
  canSendAnnouncements: boolean;
  canAccessFinances: boolean;
}


export interface ClubStats {
  clubId: string;
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalPosts: number;
  lastActivityAt: Date;
  updatedAt: Date;
}

// Club creation and update forms
export interface CreateClubData {
  clubName: string;
  description: string;
  isPublic: boolean;
  maxMembers?: number;
  tags: string[];
  settings: Partial<ClubSettings>;
}

export type UpdateClubData = Partial<Omit<Club, 'clubId' | 'ownerUid' | 'createdAt' | 'memberCount'>>

// Club state management
export interface ClubState {
  clubs: Club[];
  currentClub: Club | null;
  clubMembers: ClubMember[];
  myClubs: Club[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// API response types
export interface ClubListResponse {
  clubs: Club[];
  totalCount: number;
  hasMore: boolean;
}

export interface ClubMemberResponse {
  members: ClubMember[];
  totalCount: number;
}

// Permission helpers
export interface ClubPermissionCheck {
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canCreateEvents: boolean;
  canViewMembers: boolean;
  isOwner: boolean;
  isOrganizer: boolean;
}

// Club search and filter types
export interface ClubSearchParams {
  query?: string;
  tags?: string[];
  isPublic?: boolean;
  sortBy?: 'name' | 'memberCount' | 'createdAt' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Default settings
export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  allowMemberInvites: true,
  allowPublicEvents: true,
  defaultEventVisibility: 'members_only',
  allowMemberPosts: true,
  autoDeleteInactiveMembers: false,
  inactivityThresholdDays: 180,
};

// Role-based default permissions
export const DEFAULT_PERMISSIONS: Record<ClubRole, ClubPermissions> = {
  owner: {
    canCreateEvents: true,
    canEditClub: true,
    canManageMembers: true,
    canDeletePosts: true,
    canSendAnnouncements: true,
    canAccessFinances: true,
  },
  organizer: {
    canCreateEvents: true,
    canEditClub: false,
    canManageMembers: true,
    canDeletePosts: true,
    canSendAnnouncements: true,
    canAccessFinances: false,
  },
  member: {
    canCreateEvents: false,
    canEditClub: false,
    canManageMembers: false,
    canDeletePosts: false,
    canSendAnnouncements: false,
    canAccessFinances: false,
  },
  guest: {
    canCreateEvents: false,
    canEditClub: false,
    canManageMembers: false,
    canDeletePosts: false,
    canSendAnnouncements: false,
    canAccessFinances: false,
  },
};

// Validation constants
export const CLUB_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_TAGS: 5,
  TAG_MAX_LENGTH: 20,
  MIN_MEMBERS: 1,
  MAX_MEMBERS_DEFAULT: 100,
  MAX_MEMBERS_LIMIT: 1000,
};