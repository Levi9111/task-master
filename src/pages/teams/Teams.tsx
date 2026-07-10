import { useState, useEffect, useRef } from 'react';
import { useMyTeamsQuery, useCreateTeamMutation } from '../../queries/useTeamQueries';
import { Plus, Users, Shield, Loader2, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../app/hooks.useAuth';
import gsap from 'gsap';

export default function TeamsPage() {
  const { data: teamsData, isLoading } = useMyTeamsQuery();
  const createTeamMutation = useCreateTeamMutation();
  const { user } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const teams = teamsData?.data || [];

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

  // GSAP animations for the teams list load
  useEffect(() => {
    if (isLoading || teams.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.animate-team-card',
        { opacity: 0, scale: 0.96, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading, teams.length]);

  // GSAP animation for Modal opening
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, [isModalOpen]);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Teams</h1>
          <p className="text-text-secondary mt-1">Collaborate and manage workflow permissions across your workspace.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:brightness-105 text-white font-bold py-2.5 px-5 shadow-lg shadow-accent-primary/15 transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Loading your team spaces...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-border-default border-dashed bg-bg-surface/30 p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-12 space-y-4 shadow-xl">
          <div className="p-3 bg-bg-overlay rounded-2xl border border-border-default text-text-muted">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">No Teams Created</h3>
            <p className="text-text-secondary text-sm mt-1">
              You are not a member of any teams yet. Set up your workspace team to invite coworkers.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary font-bold py-2.5 px-5 border border-accent-primary/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const myRole = team.members.find(
              (m) => (typeof m.userId === 'string' ? m.userId : m.userId._id) === user?._id
            )?.role;

            const isLead = myRole === 'TeamLead';

            return (
              <div
                key={team._id}
                className={`animate-team-card group relative rounded-2xl border bg-bg-surface p-6 shadow-xl flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ${
                  isLead
                    ? 'border-border-default hover:border-accent-warning/35 shadow-accent-warning/[0.02]'
                    : 'border-border-default hover:border-accent-secondary/35 shadow-accent-secondary/[0.02]'
                }`}
              >
                {/* Visual glow element inside card */}
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/[0.01] pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`text-lg font-extrabold text-text-primary transition-colors ${
                      isLead ? 'group-hover:text-accent-warning' : 'group-hover:text-accent-secondary'
                    }`}>
                      {team.name}
                    </h3>
                    {myRole && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-3xs font-extrabold uppercase border ${
                          isLead
                            ? 'bg-accent-warning/15 text-accent-warning border-accent-warning/20'
                            : 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/20'
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {isLead ? 'Lead' : 'Member'}
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs mt-2.5 line-clamp-2 min-h-[35px] leading-relaxed">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-border-default/50 mt-6 pt-4 flex items-center justify-between text-2xs text-text-muted font-semibold">
                  <div className="flex items-center gap-1.5 bg-bg-base/50 border border-border-subtle px-2.5 py-1 rounded-full">
                    <Users className="h-3.5 w-3.5 text-text-secondary" />
                    <span>{team.members.length} Member{team.members.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent-success bg-accent-success/10 border border-accent-success/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-3xs font-extrabold">
                    <Sparkles className="h-3 w-3" />
                    Active Space
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Create Team */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl overflow-hidden"
          >
            {/* Ambient neon line */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent-primary to-accent-secondary" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-text-primary mb-1">Create New Team</h3>
            <p className="text-text-secondary text-xs mb-6">Establish a collaborative workspace partition.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">Team Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border-default bg-bg-base p-3.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:bg-bg-base/70 transition-all"
                  placeholder="e.g. Frontend Core, Cloud Operations"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border-default bg-bg-base p-3.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:bg-bg-base/70 h-24 resize-none transition-all leading-relaxed"
                  placeholder="Summarize the project responsibilities..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-border-default bg-transparent hover:bg-bg-overlay py-3 font-semibold text-text-primary text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  className="flex-1 rounded-xl bg-accent-primary hover:bg-opacity-95 py-3 font-bold text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
