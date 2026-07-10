import { useEffect, useRef } from 'react';
import { useAuth } from '../../app/hooks.useAuth';
import { useMyTeamsQuery } from '../../queries/useTeamQueries';
import { useTasksQuery } from '../../queries/useTaskQueries';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  CheckSquare, Users, Plus, Loader2, Calendar,
  TrendingUp, Clock, ChevronRight, Zap,
} from 'lucide-react';

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  Done:       { dot: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  InProgress: { dot: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  Todo:       { dot: '#7c6fff', text: '#7c6fff', bg: 'rgba(124,111,255,0.1)' },
  Cancelled:  { dot: '#f43f5e', text: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery();
  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery();
  const containerRef = useRef<HTMLDivElement>(null);

  const teams = teamsData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const myTasks = tasks.filter(
    (t) => (typeof t.assigneeId === 'string' ? t.assigneeId : t.assigneeId?._id) === user?._id
  );

  const counts = {
    total:      myTasks.length,
    todo:       myTasks.filter((t) => t.status === 'Todo').length,
    inProgress: myTasks.filter((t) => t.status === 'InProgress').length,
    done:       myTasks.filter((t) => t.status === 'Done').length,
  };

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const completionPct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
  const isLoading = teamsLoading || tasksLoading;

  useEffect(() => {
    if (isLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.dash-hero', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.dash-stat', { opacity: 0, scale: 0.93, y: 16 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'back.out(1.4)', delay: 0.2,
      });
      gsap.fromTo('.dash-panel', { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, [isLoading]);

  return (
    <div ref={containerRef} className="max-w-[1100px] mx-auto space-y-7 pb-16">

      {/* ── Welcome Hero ── */}
      <div
        className="dash-hero relative rounded-3xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, #0f0f1e 0%, #0d0d18 60%, #0a0a14 100%)',
          border: '1px solid rgba(124,111,255,0.15)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(124,111,255,0.12) 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)' }}
        />
        {/* Faint grid lines */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(124,111,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,111,255,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.2)', color: '#a08cff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Workspace Active
            </div>
            <h1 className="text-3xl font-black text-[#ededff] tracking-tight">
              Good {getGreeting()},{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a08cff 0%, #2dd4bf 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p className="text-[15px] text-[#606080] mt-1.5 max-w-lg">
              You have{' '}
              <span className="text-[#a08cff] font-semibold">{counts.inProgress} task{counts.inProgress !== 1 ? 's' : ''} in progress</span>
              {' '}and{' '}
              <span className="text-[#2dd4bf] font-semibold">{counts.todo} to start</span>
              {' '}today.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Link
              to="/tasks"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #7c6fff 0%, #5b54d4 100%)',
                boxShadow: '0 4px 16px rgba(124,111,255,0.35)',
              }}
            >
              <Plus size={15} /> New Task
            </Link>
            <Link
              to="/teams"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#ededff] transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Users size={15} /> Teams
            </Link>
          </div>
        </div>

        {/* Completion progress bar */}
        {counts.total > 0 && (
          <div className="relative z-10 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8080a0]">Overall completion</span>
              <span className="text-xs font-bold text-[#a08cff]">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${completionPct}%`,
                  background: 'linear-gradient(90deg, #7c6fff, #2dd4bf)',
                  boxShadow: '0 0 8px rgba(124,111,255,0.5)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="text-[#7c6fff] animate-spin" size={36} />
          <p className="text-[#606080] text-sm">Loading your workspace…</p>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Assigned" value={counts.total}
              icon={<CheckSquare size={16} />}
              color="#7c6fff" glow="rgba(124,111,255,0.15)"
            />
            <StatCard
              label="To Do" value={counts.todo}
              icon={<Clock size={16} />}
              color="#2dd4bf" glow="rgba(45,212,191,0.12)"
            />
            <StatCard
              label="In Progress" value={counts.inProgress}
              icon={<TrendingUp size={16} />}
              color="#f59e0b" glow="rgba(245,158,11,0.12)"
            />
            <StatCard
              label="Completed" value={counts.done}
              icon={<Zap size={16} />}
              color="#10b981" glow="rgba(16,185,129,0.12)"
            />
          </div>

          {/* ── Main Panels ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Recent tasks panel */}
            <div
              className="dash-panel lg:col-span-2 rounded-2xl overflow-hidden"
              style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(124,111,255,0.15)' }}
                  >
                    <CheckSquare size={14} style={{ color: '#7c6fff' }} />
                  </div>
                  <span className="font-bold text-[15px] text-[#ededff]">Recent Tasks</span>
                </div>
                <Link to="/tasks" className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: '#7c6fff' }}>
                  All tasks <ChevronRight size={13} />
                </Link>
              </div>

              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {recentTasks.length === 0 ? (
                  <div className="px-6 py-14 text-center text-sm text-[#44445a]">
                    No tasks assigned yet. Head to the taskboard to get started.
                  </div>
                ) : (
                  recentTasks.map((task) => {
                    const st = STATUS_STYLES[task.status] ?? STATUS_STYLES.Todo;
                    return (
                      <div
                        key={task._id}
                        className="px-6 py-4 flex items-center gap-4 group cursor-pointer transition-colors duration-150"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Status dot */}
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: st.dot, boxShadow: `0 0 6px ${st.dot}80` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#cccce0] truncate group-hover:text-[#ededff] transition-colors">
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <p className="text-xs text-[#44445a] mt-0.5 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <span
                          className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {task.status === 'InProgress' ? 'In Progress' : task.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Teams panel */}
            <div
              className="dash-panel rounded-2xl overflow-hidden flex flex-col"
              style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(45,212,191,0.12)' }}
                  >
                    <Users size={14} style={{ color: '#2dd4bf' }} />
                  </div>
                  <span className="font-bold text-[15px] text-[#ededff]">Teams</span>
                </div>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' }}
                >
                  {teams.length} active
                </span>
              </div>

              <div className="flex-1 p-4 space-y-2.5">
                {teams.length === 0 ? (
                  <div className="text-center py-10 text-sm text-[#44445a]">No teams yet.</div>
                ) : (
                  teams.slice(0, 5).map((team, i) => (
                    <div
                      key={team._id}
                      className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124,111,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(124,111,255,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${TEAM_COLORS[i % TEAM_COLORS.length][0]}, ${TEAM_COLORS[i % TEAM_COLORS.length][1]})`,
                        }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#cccce0] truncate">{team.name}</p>
                        <p className="text-[11px] text-[#44445a]">{team.members.length} members</p>
                      </div>
                      <ChevronRight size={14} className="text-[#44445a] flex-shrink-0" />
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 pt-0">
                <Link
                  to="/teams"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#8080a0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ededff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8080a0'; }}
                >
                  Manage all teams <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

const TEAM_COLORS = [
  ['#7c6fff', '#5b54d4'],
  ['#2dd4bf', '#059669'],
  ['#f59e0b', '#d97706'],
  ['#f43f5e', '#be123c'],
  ['#8b5cf6', '#6d28d9'],
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function StatCard({
  label, value, icon, color, glow,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  glow: string;
}) {
  return (
    <div
      className="dash-stat rounded-2xl p-5 transition-all duration-200 cursor-default relative overflow-hidden"
      style={{
        background: '#0d0d18',
        border: `1px solid ${glow.replace('0.15', '0.12').replace('0.12', '0.1')}`,
        boxShadow: `0 4px 24px ${glow}, 0 1px 3px rgba(0,0,0,0.3)`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${glow.replace('0.12','0.22')}, 0 1px 3px rgba(0,0,0,0.3)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px ${glow}, 0 1px 3px rgba(0,0,0,0.3)`; }}
    >
      {/* Subtle corner glow */}
      <div
        className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${glow.replace('0.12','0.35')}, transparent 70%)` }}
      />
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
        style={{ background: glow, color }}
      >
        {icon}
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-[#606080] mt-1">{label}</div>
    </div>
  );
}
