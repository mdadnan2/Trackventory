'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import { User, Mail, Shield, LogOut, AlertTriangle, RotateCcw, XCircle, RefreshCw } from 'lucide-react';

export default function MobileMore() {
  const { user, signOut } = useAuth();
  const { queue, clearQueue } = useOfflineQueue();

  return (
    <ScreenContainer title="More">
      <div className="space-y-4">
        <ActionCard>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.role}</div>
            </div>
          </div>
        </ActionCard>

        <div className="space-y-2">
          <ActionCard>
            <div className="flex items-center gap-3">
              <Mail className="text-slate-400" size={20} />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-medium text-slate-900">{user?.email}</div>
              </div>
            </div>
          </ActionCard>

          <ActionCard>
            <div className="flex items-center gap-3">
              <Shield className="text-slate-400" size={20} />
              <div>
                <div className="text-xs text-slate-500">Role</div>
                <div className="font-medium text-slate-900">{user?.role}</div>
              </div>
            </div>
          </ActionCard>
        </div>

        {queue.length > 0 && (
          <div className="pt-2">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 px-1">Pending Actions</h2>
            <ActionCard className="bg-orange-50 border-orange-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <RefreshCw className="text-orange-600" size={20} />
                  <div>
                    <div className="font-semibold text-orange-900">
                      {queue.length} action{queue.length > 1 ? 's' : ''} waiting to sync
                    </div>
                    <div className="text-sm text-orange-700">Will retry automatically</div>
                  </div>
                </div>
                <button
                  onClick={clearQueue}
                  className="w-full h-12 bg-orange-600 text-white rounded-xl font-medium active:scale-98 transition-transform"
                >
                  Clear Queue
                </button>
              </div>
            </ActionCard>
          </div>
        )}

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 px-1">Quick Actions</h2>
          <div className="space-y-2">
            <ActionCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Report Damage</div>
                    <div className="text-sm text-slate-500">Damaged items</div>
                  </div>
                </div>
              </div>
            </ActionCard>

            <ActionCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <XCircle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Report Loss</div>
                    <div className="text-sm text-slate-500">Lost items</div>
                  </div>
                </div>
              </div>
            </ActionCard>

            <ActionCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <RotateCcw className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Return Items</div>
                    <div className="text-sm text-slate-500">Unused stock</div>
                  </div>
                </div>
              </div>
            </ActionCard>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full h-14 bg-red-50 text-red-600 font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </ScreenContainer>
  );
}
