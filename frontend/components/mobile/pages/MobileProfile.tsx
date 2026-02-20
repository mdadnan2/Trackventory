'use client';

import { useAuth } from '@/hooks/useAuth';
import MobilePageContainer from '../MobilePageContainer';
import MobileCard from '../MobileCard';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function MobileProfile() {
  const { user, signOut } = useAuth();

  return (
    <MobilePageContainer title="Profile">
      <div className="space-y-4">
        <MobileCard>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.role}</div>
            </div>
          </div>
        </MobileCard>

        <div className="space-y-2">
          <MobileCard>
            <div className="flex items-center gap-3">
              <Mail className="text-slate-400" size={20} />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-medium text-slate-900">{user?.email}</div>
              </div>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="flex items-center gap-3">
              <Shield className="text-slate-400" size={20} />
              <div>
                <div className="text-xs text-slate-500">Role</div>
                <div className="font-medium text-slate-900">{user?.role}</div>
              </div>
            </div>
          </MobileCard>
        </div>

        <button
          onClick={signOut}
          className="w-full h-14 bg-red-50 text-red-600 font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </MobilePageContainer>
  );
}
