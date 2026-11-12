import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Mail,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Avatar } from '../components/shared/CommonAtoms';
import { PERMISSION_MATRIX } from '../data/seedData';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES } from '../themes/conceptTokens';
import { Role } from '../types/mavericks';
import { canPerform } from '../utils/permissions';

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: 'Full organization control, billing, and member management.',
  ADMIN: 'Create projects, customize board columns, connect GitHub, manage sprints.',
  MEMBER: 'Create tasks, move tasks, log working hours, write comments.',
  GUEST: 'View tasks and write comments only. Cannot move tasks or edit settings.',
};

export const TeamPermissionsScreen: React.FC = () => {
  const {
    concept,
    activeWorkspace,
    members,
    activeRole,
    inviteMember,
    updateMemberRole,
    acceptPendingInvite,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = members.filter((m) => m.status === 'PENDING').length;
  const isOwner = canPerform(activeRole, 'manage_members');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const res = inviteMember(inviteEmail, inviteRole);
    if (!res.ok) {
      setInviteError(res.error ?? 'Unable to invite member.');
      return;
    }
    setInviteError(null);
    setInviteEmail('');
  };

  return (
    <div className="space-y-5">
      {/* Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl ${theme.headingStyle} ${theme.textPrimary}`}>
            Team Management & Permissions — {activeWorkspace.name}
          </h1>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            {members.length} total members · {activeCount} active · {pendingCount} pending invitations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border ${theme.border} ${theme.panelBg} ${theme.buttonRadius} ${theme.textSecondary}`}
          >
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            <span>{activeWorkspace.plan} Plan</span>
          </span>
        </div>
      </div>

      {/* Invite Member Card */}
      <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className={`h-4 w-4 ${theme.accentText}`} />
            <h2 className={`text-sm font-semibold ${theme.textPrimary}`}>Invite a Teammate</h2>
          </div>
          {!isOwner && (
            <span className="text-[11px] text-amber-500 font-medium">
              Owner role required to send invites (switch Role in Studio Bar to test OWNER)
            </span>
          )}
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Mail className={`h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@acmetech.io"
              className={`w-full pl-8 pr-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
            />
          </div>

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className={`sm:w-40 px-3 py-2 text-xs font-medium border ${theme.buttonRadius} ${theme.inputBg}`}
          >
            <option value="OWNER">OWNER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MEMBER">MEMBER</option>
            <option value="GUEST">GUEST</option>
          </select>

          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium transition ${theme.buttonRadius} ${theme.primaryBtn}`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Send Invite</span>
          </button>
        </form>

        {inviteError && (
          <div className="flex items-center gap-2 text-xs text-rose-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{inviteError}</span>
          </div>
        )}
      </div>

      {/* Members Directory */}
      <div className={`border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} overflow-hidden`}>
        <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${theme.textPrimary}`}>Workspace Members</h2>
          <span className={`text-xs ${theme.textMuted}`}>
            Active ({activeCount}) · Pending ({pendingCount})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${theme.border} ${theme.tableHeaderBg} text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Invitation Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {members.map((m) => (
                <tr key={m.id} className={theme.tableRowHover}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar member={m} size="md" conceptId={concept} showPresence />
                      <div>
                        <p className={`text-xs font-semibold ${theme.textPrimary}`}>{m.name}</p>
                        <p className={`text-[11px] ${theme.textMuted}`}>{m.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-4 text-xs font-mono ${theme.textSecondary}`}>{m.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={m.role}
                      disabled={!isOwner}
                      onChange={(e) => updateMemberRole(m.id, e.target.value as Role)}
                      className={`px-2.5 py-1 text-xs font-semibold border disabled:opacity-75 ${theme.buttonRadius} ${theme.inputBg}`}
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="GUEST">GUEST</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {m.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Active · {m.lastActive}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 text-[11px] font-medium">
                        Pending Invite
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {m.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => acceptPendingInvite(m.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
                      >
                        <UserCheck className="h-3 w-3 text-emerald-500" />
                        Accept Invite
                      </button>
                    ) : (
                      <span className={`text-[11px] ${theme.textMuted}`}>Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Cards + Clear Permissions Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'] as Role[]).map((r) => (
          <div
            key={r}
            className={`p-4 border ${
              activeRole === r ? 'border-indigo-500 ring-1 ring-indigo-500/30' : theme.border
            } ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold tracking-wide ${theme.textPrimary}`}>{r}</span>
              {activeRole === r && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${theme.accentBgSoft}`}>
                  Current View
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-relaxed ${theme.textMuted}`}>{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      <div className={`border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} overflow-hidden`}>
        <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center gap-2`}>
          <Shield className={`h-4 w-4 ${theme.accentText}`} />
          <h2 className={`text-sm font-semibold ${theme.textPrimary}`}>Role Permissions Matrix</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${theme.border} ${theme.tableHeaderBg} text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                <th className="py-2.5 px-4">Capability</th>
                <th className="py-2.5 px-4">Scope</th>
                <th className="py-2.5 px-4 text-center">OWNER</th>
                <th className="py-2.5 px-4 text-center">ADMIN</th>
                <th className="py-2.5 px-4 text-center">MEMBER</th>
                <th className="py-2.5 px-4 text-center">GUEST</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {PERMISSION_MATRIX.map((row) => (
                <tr key={row.capability} className={theme.tableRowHover}>
                  <td className={`py-2.5 px-4 text-xs font-medium ${theme.textPrimary}`}>
                    {row.capability}
                  </td>
                  <td className={`py-2.5 px-4 text-[11px] ${theme.textMuted}`}>{row.category}</td>
                  {(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'] as Role[]).map((r) => (
                    <td key={r} className="py-2.5 px-4 text-center">
                      {row[r] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-500/10 text-slate-400">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

