'use client';

import { useState } from 'react';
import { ClubMember, ClubRole } from '@/types/club';
import { removeMember, updateMemberRole } from '@/lib/club/clubService';

interface MemberManagementItemProps {
  member: ClubMember;
  clubId: string;
  currentUserUid: string;
  currentUserRole: ClubRole | null;
  onMemberUpdate: () => void;
}

export default function MemberManagementItem({
  member,
  clubId,
  currentUserUid,
  currentUserRole,
  onMemberUpdate,
}: MemberManagementItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Enhanced permission logic with detailed validation
  const canManageMembers = (() => {
    if (!currentUserRole) return false;
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'organizer') {
      // Organizers can only manage members and guests, not other organizers or owners
      return member.role !== 'owner' && member.role !== 'organizer';
    }
    return false;
  })();
  
  const canRemoveMember = (() => {
    if (!canManageMembers) return false;
    if (member.uid === currentUserUid) return false; // Can't remove self
    if (member.role === 'owner') return false; // Can't remove owner
    // Additional check: organizers can't remove other organizers
    if (currentUserRole === 'organizer' && member.role === 'organizer') return false;
    return true;
  })();
  
  const canChangeRole = (() => {
    if (!canManageMembers) return false;
    if (member.role === 'owner') return false; // Can't change owner role
    if (member.uid === currentUserUid) return false; // Can't change own role
    return true;
  })();

  const handleRoleChange = async (newRole: ClubRole) => {
    if (!canChangeRole || isUpdating) return;
    
    // Additional validation before role change
    if (currentUserRole === 'organizer' && newRole === 'organizer') {
      alert('운영진은 다른 멤버를 운영진으로 승격시킬 수 없습니다.');
      return;
    }
    
    if (currentUserRole === 'organizer' && newRole === 'owner') {
      alert('운영진은 소유자 권한을 부여할 수 없습니다.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateMemberRole(clubId, member.uid, newRole);
      onMemberUpdate();
      setShowRoleMenu(false);
    } catch (error) {
      console.error('Error updating member role:', error);
      const errorMessage = error instanceof Error ? error.message : '역할 변경에 실패했습니다.';
      alert(`역할 변경 실패: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!canRemoveMember || isUpdating) return;
    
    // Enhanced confirmation with member info
    const memberDisplayName = `멤버 ${member.uid.slice(0, 8)} (${getRoleDisplayName(member.role)})`;
    if (!confirm(`정말로 ${memberDisplayName}를 클럽에서 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await removeMember(clubId, member.uid, currentUserUid);
      onMemberUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMessage = error instanceof Error ? error.message : '멤버 제거에 실패했습니다.';
      alert(`멤버 제거 실패: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: ClubRole) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'organizer': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: ClubRole) => {
    switch (role) {
      case 'owner': return '소유자';
      case 'organizer': return '운영진';
      case 'member': return '멤버';
      case 'guest': return '게스트';
      default: return role;
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {member.uid.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            멤버 {member.uid.slice(0, 8)}
            {member.uid === currentUserUid && ' (나)'}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(member.joinedAt).toLocaleDateString('ko-KR')} 가입
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
          {getRoleDisplayName(member.role)}
        </span>
      </div>

      {(canManageMembers || canChangeRole || canRemoveMember) && (
        <div className="flex items-center space-x-2">
          {/* Role Change Dropdown */}
          {canChangeRole ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                disabled={isUpdating}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="역할 변경"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          ) : member.role !== 'owner' && member.uid !== currentUserUid && (
            <div className="relative">
              <button
                disabled
                className="p-1 text-gray-300 cursor-not-allowed"
                title={`${currentUserRole === 'organizer' ? '운영진은 이 멤버의 역할을 변경할 수 없습니다' : '역할 변경 권한이 없습니다'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {(['organizer', 'member', 'guest'] as ClubRole[])
                      .filter(role => {
                        // Owner can change any role except owner
                        if (currentUserRole === 'owner') return role !== 'owner';
                        // Organizer can only change to member or guest
                        return role === 'member' || role === 'guest';
                      })
                      .filter(role => role !== member.role)
                      .map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {getRoleDisplayName(role)}로 변경
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remove Member Button */}
          {canRemoveMember ? (
            <button
              onClick={handleRemoveMember}
              disabled={isUpdating}
              className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
              title="멤버 제거"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : member.uid !== currentUserUid && member.role !== 'owner' && (
            <button
              disabled
              className="p-1 text-gray-300 cursor-not-allowed"
              title={`${currentUserRole === 'organizer' ? '운영진은 이 멤버를 제거할 수 없습니다' : '멤버 제거 권한이 없습니다'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      {showRoleMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowRoleMenu(false)}
        />
      )}
    </div>
  );
}