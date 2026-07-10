import { useState, useEffect, useRef } from 'react';
import { useMyTeamsQuery } from '../../queries/useTeamQueries';
import { useTeamStatsQuery } from '../../queries/useAnalyticsQueries';
import { BarChart3, Users, Loader2, TrendingUp, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

const STAT_CONFIG = [
  { status: 'Todo',       color: '#7c6fff', glow: 'rgba(124,111,255,0.25)', bg: 'rgba(124,111,255,0.12)' },
  { status: 'InProgress', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)',  bg: 'rgba(245,158,11,0.12)'  },
  { status: 'Done',       color: '#10b981', glow: 'rgba(16,185,129,0.25)',  bg: 'rgba(16,185,129,0.12)'  },
  { status: 'Cancelled',  color: '#f43f5e', glow: 'rgba(244,63,94,0.25)',   bg: 'rgba(244,63,94,0.12)'   },
];

const MOCK_STATS = [
  { status: 'Todo',       count: 12 },
  { status: 'InProgress', count: 8  },
  { status: 'Done',       count: 18 },
  { status: 'Cancelled',  count: 3  },
];

export default function AnalyticsPage() {
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const teams = teamsData?.data ?? [];
  if (teams.length > 0 && !selectedTeamId) setSelectedTeamId(teams[0]._id);

  const { data: statsData, isLoading: statsLoading, error } = useTeamStatsQuery(
    selectedTeamId, !!selectedTeamId
  );

  const rawStats = statsData?.data ?? [];
  const isFallback = !!error || rawStats.length === 0;
  const stats = isFallback ? MOCK_STATS : rawStats;
  const total = stats.reduce((s, c) => s + c.count, 0);
  const completionRate = total > 0
    ? Math.round(((stats.find((s) => s.status === 'Done')?.count ?? 0) / total) * 100)
    : 0;

  const selectedTeam = teams.find((t) => t._id === selectedTeamId);

  useEffect(() => {
    if (statsLoading || teamsLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.analytics-bar', { scaleX: 0 }, {
        scaleX: 1, duration: 1.0, ease: 'power3.out', delay: 0.2, stagger: 0.1,
      });
      gsap.fromTo('.analytics-card', { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, [statsLoading, teamsLoading, selectedTeamId]);

  return (
    <div ref={containerRef} className="max-w-[1100px] mx-auto space-y-7 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#ededff] tracking-tight">Analytics</h1>
          <p className="text-sm text-[#606080] mt-0.5">Task distribution and performance insights.</p>
        </div>

        {teams.length > 0 && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Users size={14} style={{ color: '#7c6fff' }} />
            <select
              value={selectedTeamId ?? ''}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#ededff] outline-none cursor-pointer pr-2"
              style={{ appearance: 'none' }}
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id} style={{ background: '#0d0d18' }}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {teamsLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="text-[#7c6fff] animate-spin" size={36} />
          <p className="text-[#606080] text-sm">Loading analytics…</p>
        </div>
      ) : teams.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-3xl"
          style={{ background: '#0d0d18', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <BarChart3 size={36} className="text-[#44445a] mb-3" />
          <p className="text-[#606080] text-sm">Join or create a team to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main Chart Panel ── */}
          <div
            className="analytics-card lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.12)' }}>
                  <BarChart3 size={14} style={{ color: '#7c6fff' }} />
                </div>
                <span className="font-bold text-[15px] text-[#ededff]">Task Distribution</span>
                {isFallback && (
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}
                  >
                    Demo data
                  </span>
                )}
              </div>
              <span className="text-xs text-[#44445a]">{selectedTeam?.name}</span>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="text-[#7c6fff] animate-spin" size={28} />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {stats.map((item) => {
                  const cfg = STAT_CONFIG.find((c) => c.status === item.status) ?? STAT_CONFIG[0];
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }} />
                          <span className="font-semibold text-[#cccce0]">
                            {item.status === 'InProgress' ? 'In Progress' : item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold" style={{ color: cfg.color }}>{pct}%</span>
                          <span className="text-xs text-[#44445a]">{item.count} tasks</span>
                        </div>
                      </div>
                      {/* Track */}
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="analytics-bar h-full rounded-full origin-left"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`,
                            boxShadow: `0 0 8px ${cfg.glow}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total bar */}
            {!statsLoading && (
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs font-semibold text-[#44445a] uppercase tracking-wider">Total Tasks</span>
                <span className="text-2xl font-black text-[#ededff]">{total}</span>
              </div>
            )}
          </div>

          {/* ── Side Metric Cards ── */}
          <div className="flex flex-col gap-4">

            {/* Completion rate */}
            <div
              className="analytics-card rounded-2xl p-6 relative overflow-hidden"
              style={{ background: '#0d0d18', border: '1px solid rgba(16,185,129,0.12)', boxShadow: '0 4px 24px rgba(16,185,129,0.06)' }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(16,185,129,0.12), transparent 70%)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              </div>
              <div className="text-4xl font-black" style={{ color: '#10b981' }}>{completionRate}%</div>
              <div className="text-xs font-semibold text-[#606080] mt-1">Completion Rate</div>
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, #10b981, #059669)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div
              className="analytics-card rounded-2xl p-6 relative overflow-hidden"
              style={{ background: '#0d0d18', border: '1px solid rgba(245,158,11,0.1)', boxShadow: '0 4px 24px rgba(245,158,11,0.05)' }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.1), transparent 70%)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <TrendingUp size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div className="text-4xl font-black" style={{ color: '#f59e0b' }}>
                {stats.find((s) => s.status === 'InProgress')?.count ?? 0}
              </div>
              <div className="text-xs font-semibold text-[#606080] mt-1">In Progress</div>
            </div>

            {/* Cancelled */}
            <div
              className="analytics-card rounded-2xl p-6 relative overflow-hidden"
              style={{ background: '#0d0d18', border: '1px solid rgba(244,63,94,0.1)', boxShadow: '0 4px 24px rgba(244,63,94,0.05)' }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(244,63,94,0.08), transparent 70%)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(244,63,94,0.1)' }}>
                <AlertCircle size={18} style={{ color: '#f43f5e' }} />
              </div>
              <div className="text-4xl font-black" style={{ color: '#f43f5e' }}>
                {stats.find((s) => s.status === 'Cancelled')?.count ?? 0}
              </div>
              <div className="text-xs font-semibold text-[#606080] mt-1">Cancelled</div>
            </div>

            {/* Total velocity */}
            <div
              className="analytics-card rounded-2xl p-6 relative overflow-hidden"
              style={{ background: '#0d0d18', border: '1px solid rgba(124,111,255,0.12)', boxShadow: '0 4px 24px rgba(124,111,255,0.06)' }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(124,111,255,0.1), transparent 70%)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(124,111,255,0.1)' }}>
                <Zap size={18} style={{ color: '#7c6fff' }} />
              </div>
              <div className="text-4xl font-black" style={{ color: '#7c6fff' }}>{total}</div>
              <div className="text-xs font-semibold text-[#606080] mt-1">Total Tasks</div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
