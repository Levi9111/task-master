import { useState, useEffect, useRef } from 'react';
import { useMyTeamsQuery, useCreateTeamMutation, useAddMemberMutation } from '../../queries/useTeamQueries';
import { Plus, Users, Loader2, X, Crown, UserCheck } from 'lucide-react';
import { useAuth } from '../../app/hooks.useAuth';
import gsap from 'gsap';

const TEAM_GRADIENTS = [
  ['#7c6fff', '#5b54d4'],
  ['#2dd4bf', '#059669'],
  ['#f59e0b', '#d97706'],
  ['#f43f5e', '#be123c'],
  ['#8b5cf6', '#6d28d9'],
  ['#ec4899', '#be185d'],
];

export default function TeamsPage() {
  const { data: teamsData, isLoading } = useMyTeamsQuery();
  const createTeamMutation = useCreateTeamMutation();
  const addMemberMutation = useAddMemberMutation();
  const { user } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inviteModalRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Add Member Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTeamIdForInvite, setSelectedTeamIdForInvite] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const teams = teamsData?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTeamMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setName('');
          setDescription('');
        },
      }
    );
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedTeamIdForInvite) return;
    addMemberMutation.mutate(
      { teamId: selectedTeamIdForInvite, email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setIsInviteModalOpen(false);
          setInviteEmail('');
          setInviteRole('Member');
        },
      }
    );
  };

  useEffect(() => {
    if (isLoading || teams.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.team-card', { opacity: 0, scale: 0.95, y: 18 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, [isLoading, teams.length]);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(modalRef.current, { scale: 0.92, opacity: 0, y: 12 }, {
        scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.6)',
      });
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isInviteModalOpen && inviteModalRef.current) {
      gsap.fromTo(inviteModalRef.current, { scale: 0.92, opacity: 0, y: 12 }, {
        scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.6)',
      });
    }
  }, [isInviteModalOpen]);

  return (
    <div ref={containerRef} className="max-w-[1100px] mx-auto space-y-7 pb-16">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#ededff] tracking-tight">Teams</h1>
          <p className="text-sm text-[#606080] mt-0.5">Collaborative workspaces and member management.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)',
            boxShadow: '0 4px 16px rgba(124,111,255,0.35)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,111,255,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,111,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
        >
          <Plus size={16} /> Create Team
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="text-[#7c6fff] animate-spin" size={36} />
          <p className="text-[#606080] text-sm">Loading team workspaces…</p>
        </div>
      ) : teams.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-3xl"
          style={{ background: '#0d0d18', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.15)' }}
          >
            <Users size={28} style={{ color: '#7c6fff' }} />
          </div>
          <h3 className="text-lg font-bold text-[#ededff] mb-1">No teams yet</h3>
          <p className="text-sm text-[#606080] mb-6 text-center max-w-xs">
            Create your first team workspace to start collaborating on tasks.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.2)', color: '#a08cff' }}
          >
            <Plus size={15} /> Create your first team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teams.map((team, i) => {
            const grad = TEAM_GRADIENTS[i % TEAM_GRADIENTS.length];
            const myRole = team.members.find(
              (m) => (typeof m.userId === 'string' ? m.userId : m.userId?._id) === user?._id
            )?.role;
            const isLead = myRole === 'TeamLead';

            return (
              <div
                key={team._id}
                className="team-card group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer relative"
                style={{
                  background: '#0d0d18',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${grad[0]}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
                }}
              >
                {/* Color header bar */}
                <div
                  className="h-1.5"
                  style={{ background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})` }}
                />

                <div className="p-6">
                  {/* Team icon + name */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 4px 12px ${grad[0]}40` }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] text-[#ededff] leading-tight">{team.name}</h3>
                        <p className="text-[11px] text-[#44445a] mt-0.5">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {myRole && (
                        <span
                          className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={
                            isLead
                              ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }
                              : { background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.18)', color: '#2dd4bf' }
                          }
                        >
                          {isLead ? <Crown size={9} /> : <UserCheck size={9} />}
                          {isLead ? 'Lead' : 'Member'}
                        </span>
                      )}
                      {isLead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeamIdForInvite(team._id);
                            setIsInviteModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-[#7c6fff] hover:text-[#a08cff] transition-colors"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#606080] leading-relaxed min-h-[40px] line-clamp-2">
                    {team.description || 'No description provided.'}
                  </p>

                  {/* Member avatars */}
                  {team.members.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((m, mi) => {
                          const memberUser = typeof m.userId === 'object' ? m.userId : null;
                          const nameInitial = memberUser?.name?.charAt(0) ?? '?';
                          return (
                            <div
                              key={mi}
                              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white relative group/avatar"
                              style={{
                                borderColor: '#0d0d18',
                                background: `linear-gradient(135deg, ${TEAM_GRADIENTS[mi % TEAM_GRADIENTS.length][0]}, ${TEAM_GRADIENTS[mi % TEAM_GRADIENTS.length][1]})`,
                              }}
                            >
                              {nameInitial}
                              {/* Small tooltips for avatar names */}
                              {memberUser?.name && (
                                <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-[#06060c] border border-white/10 whitespace-nowrap z-50">
                                  {memberUser.name}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {team.members.length > 4 && (
                          <div
                            className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                            style={{ borderColor: '#0d0d18', background: 'rgba(255,255,255,0.1)', color: '#8080a0' }}
                          >
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#44445a] ml-1">
                        {team.members.length} collaborator{team.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Team Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-[440px] rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(13,13,24,0.97)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,111,255,0.1)',
            }}
          >
            {/* Top gradient line */}
            <div
              className="h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,111,255,0.7), rgba(45,212,191,0.5), transparent)' }}
            />

            <div className="p-7">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-[#44445a] hover:text-[#ededff] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X size={16} />
              </button>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.2)' }}
              >
                <Users size={20} style={{ color: '#7c6fff' }} />
              </div>

              <h3 className="text-xl font-extrabold text-[#ededff] mb-1">Create Team</h3>
              <p className="text-sm text-[#606080] mb-6">Set up a new collaborative workspace for your team.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8080a0] uppercase tracking-wider">Team name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Frontend Core, Cloud Ops"
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,111,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,111,255,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8080a0] uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this team work on?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none resize-none transition-all duration-200 leading-relaxed"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,111,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,111,255,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm text-[#8080a0] hover:text-[#ededff] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTeamMutation.isPending}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)', boxShadow: '0 4px 16px rgba(124,111,255,0.35)' }}
                  >
                    {createTeamMutation.isPending ? 'Creating…' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Member Modal ── */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsInviteModalOpen(false); }}
        >
          <div
            ref={inviteModalRef}
            className="relative w-full max-w-[440px] rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(13,13,24,0.97)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,111,255,0.1)',
            }}
          >
            {/* Top gradient line */}
            <div
              className="h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,111,255,0.7), rgba(45,212,191,0.5), transparent)' }}
            />

            <div className="p-7">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-[#44445a] hover:text-[#ededff] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X size={16} />
              </button>

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.2)' }}
              >
                <Users size={20} style={{ color: '#2dd4bf' }} />
              </div>

              <h3 className="text-xl font-extrabold text-[#ededff] mb-1">Add Team Member</h3>
              <p className="text-sm text-[#606080] mb-6">Invite a registered collaborator to join this team workspace.</p>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8080a0] uppercase tracking-wider">User Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@taskflow.com"
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#ededff] placeholder-[#44445a] outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,111,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,111,255,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8080a0] uppercase tracking-wider">Role in Team</label>
                  <div
                    className="relative flex items-center px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#ededff] outline-none cursor-pointer"
                    >
                      <option value="Member" style={{ background: '#0d0d18' }}>Member (Default)</option>
                      <option value="TeamLead" style={{ background: '#0d0d18' }}>Team Lead</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm text-[#8080a0] hover:text-[#ededff] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberMutation.isPending}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)', boxShadow: '0 4px 16px rgba(124,111,255,0.35)' }}
                  >
                    {addMemberMutation.isPending ? 'Adding…' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
