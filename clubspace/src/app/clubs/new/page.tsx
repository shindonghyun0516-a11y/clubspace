'use client';

import { AuthGuard } from '@/components/auth';
import CreateClubForm from '@/components/club/CreateClubForm';

export default function NewClubPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <CreateClubForm />
      </div>
    </AuthGuard>
  );
}