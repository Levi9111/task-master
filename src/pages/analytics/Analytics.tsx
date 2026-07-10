import { useState, useEffect, useRef } from 'react';
import { useMyTeamsQuery } from '../../queries/useTeamQueries';
import { useTeamStatsQuery } from '../../queries/useAnalyticsQueries';
import { BarChart3, Users, Loader2, PieChart, CheckSquare, Sparkles, TrendingUp } from 'lucide-react';
import gsap from 'gsap';

export default function AnalyticsPage() {
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // If a team is not selected but teams exist, select the first one automatically
  const teams = teamsData?.data || [];
  if (teams.length > 0 && !selectedTeamId) {
    setSelectedTeamId(teams[0]._id);
  }

  const { data: statsData, isLoading: statsLoading, error } = useTeamStatsQuery(
    selectedTeamId,
    !!selectedTeamId
  );

  const selectedTeamName = teams.find((t) => t._id === selectedTeamId)?.name || '';

  const hasError = !!error;
  const rawStats = statsData?.data || [];
  
  const mockStats = [
    { status: 'Todo', count: 12 },
    { status: 'InProgress', count: 8 },
    { status: 'Done', count: 18 },
    { status: 'Cancelled', count: 3 },
  ];

  const stats = hasError || rawStats.length === 0 ? mockStats : rawStats;
  const isFallback = hasError || rawStats.length === 0;
  const totalTasks = stats.reduce((acc, curr) => acc + curr.count, 0);

  const colors: Record<string, string> = {
    Todo: 'bg-accent-secondary',
    InProgress: 'bg-accent-primary',
    Done: 'bg-accent-success',
    Cancelled: 'bg-accent-danger',
  };

  const borderColors: Record<string, string> = {
    Todo: 'border-accent-secondary/15 shadow-accent-secondary/5',
    InProgress: 'border-accent-primary/15 shadow-accent-primary/5',
    Done: 'border-accent-success/15 shadow-accent-success/5',
    Cancelled: 'border-accent-danger/15 shadow-accent-danger/5',
  };

  // GSAP animations for stats and progress bar loads
  useEffect(() => {
    if (statsLoading || teamsLoading) return;

    const ctx = gsap.context(() => {
      // Animate progress bar widths from 0%
      stats.forEach((item) => {
        const percentage = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
        gsap.fromTo(
          `.bar-${item.status}`,
          { width: '0%' },
          { width: `${percentage}%`, duration: 1.1, ease: 'power3.out', delay: 0.2 }
        );
      });

      // Stagger stats card entrance
      gsap.fromTo(
        '.animate-stat-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [statsLoading, teamsLoading, selectedTeamId, stats, totalTasks]);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">Monitor task distribution, completion rates, and member velocity.</p>
        </div>

        {/* Team Dropdown Selector */}
        {teams.length > 0 && (
          <div className="flex items-center gap-3 bg-bg-surface border border-border-default rounded-xl px-4 py-2">
            <Users className="h-4.5 w-4.5 text-text-secondary" />
            <select
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-transparent border-none text-text-primary focus:outline-none text-sm font-semibold pr-4 cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id} className="bg-bg-surface text-text-primary">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {teamsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Loading analytics modules...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-12 space-y-4">
          <div className="p-3 bg-bg-overlay rounded-2xl border border-border-default text-text-muted">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">No Teams Found</h3>
            <p className="text-text-secondary text-sm mt-1">
              Join or create a team to start collecting analytics statistics.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Status Distribution */}
          <div className="animate-stat-card md:col-span-2 rounded-2xl border border-border-default bg-bg-surface p-6 sm:p-8 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-accent-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border-default/50 pb-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-accent-primary" />
                <h3 className="text-lg font-bold text-text-primary">Task Distribution</h3>
              </div>
              {isFallback && (
                <span className="flex items-center gap-1 text-2xs px-2.5 py-1 rounded-full font-bold bg-accent-warning/10 text-accent-warning border border-accent-warning/20">
                  <Sparkles className="h-3 w-3" />
                  Demo Mode
                </span>
              )}
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {stats.map((item) => {
                  const percentage = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-text-primary flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${colors[item.status]}`} />
                          {item.status === 'InProgress' ? 'In Progress' : item.status}
                        </span>
                        <span className="text-text-secondary">
                          {item.count} task{item.count === 1 ? '' : 's'} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-bg-base h-2.5 rounded-full overflow-hidden border border-border-subtle">
                        <div
                          className={`h-full rounded-full bar-${item.status} ${colors[item.status]}`}
                          style={{ width: '0%' }} // Animated by GSAP on mount
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Metrics Column */}
          <div className="md:col-span-1 flex flex-col gap-6">
            
            {/* Total Tasks metric card */}
            <div className={`animate-stat-card rounded-2xl border bg-bg-surface p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[160px] ${borderColors.InProgress}`}>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 opacity-[0.03] pointer-events-none" />
              <div>
                <span className="text-2xs font-bold text-text-muted uppercase tracking-widest">Total Tasks</span>
                <h4 className="text-4xl font-black text-text-primary mt-2">
                  {statsLoading ? '...' : totalTasks}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-6">
                <CheckSquare className="h-4 w-4 text-accent-primary" />
                <span>Across team: {selectedTeamName}</span>
              </div>
            </div>

            {/* Performance status card */}
            <div className={`animate-stat-card rounded-2xl border bg-bg-surface p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[160px] ${borderColors.Done}`}>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 opacity-[0.03] pointer-events-none" />
              <div>
                <span className="text-2xs font-bold text-text-muted uppercase tracking-widest">Completion Rate</span>
                <h4 className="text-4xl font-black text-accent-success mt-2">
                  {statsLoading
                    ? '...'
                    : totalTasks > 0
                    ? `${Math.round(
                        ((stats.find((s) => s.status === 'Done')?.count || 0) / totalTasks) * 100
                      )}%`
                    : '0%'}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-6">
                <TrendingUp className="h-4 w-4 text-accent-success" />
                <span>Finished assignments velocity</span>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
