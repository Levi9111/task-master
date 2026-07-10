import { useEffect, useRef } from 'react';
import { useAuth } from '../../app/hooks.useAuth';
import { useMyTeamsQuery } from '../../queries/useTeamQueries';
import { useTasksQuery } from '../../queries/useTaskQueries';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  CheckSquare,
  Users,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery();
  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery();

  const containerRef = useRef<HTMLDivElement>(null);

  const teams = teamsData?.data || [];
  const tasks = tasksData?.data || [];

  const myTasks = tasks.filter(
    (t) => (typeof t.assigneeId === 'string' ? t.assigneeId : t.assigneeId?._id) === user?._id
  );

  const todoTasks = myTasks.filter((t) => t.status === 'Todo').length;
  const inProgressTasks = myTasks.filter((t) => t.status === 'InProgress').length;
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isLoading = teamsLoading || tasksLoading;

  // GSAP animations for the dashboard entrance
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Welcome banner entrance
      gsap.fromTo(
        '.animate-welcome-banner',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      // Stagger metric cards
      gsap.fromTo(
        '.animate-metric-card',
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.25 }
      );

      // Grid panels
      gsap.fromTo(
        '.animate-panel',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.55 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="animate-welcome-banner rounded-2xl border border-border-default bg-bg-surface p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft neon gradient overlay */}
        <div className="absolute right-0 top-0 h-full w-full md:w-1/2 bg-gradient-to-l from-accent-primary/10 via-accent-secondary/5 to-transparent pointer-events-none z-0" />
        
        {/* Embedded Premium Graphic illustration */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-80 h-32 opacity-25 md:opacity-40 hidden sm:block pointer-events-none z-0 rounded-xl overflow-hidden border border-border-default/20">
          <img src="/dashboard_hero.png" alt="Collaborative graphic" className="w-full h-full object-cover object-center" />
        </div>

        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-semibold bg-accent-primary/15 text-accent-primary border border-accent-primary/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            WORKSPACE HUB
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-text-secondary text-sm max-w-md">
            Here is the real-time status of your active teams, task boards, and overall milestone progress.
          </p>
        </div>

        <div className="flex gap-3 z-10 w-full sm:w-auto justify-center md:justify-end">
          <Link
            to="/tasks"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:brightness-105 hover:shadow-lg hover:shadow-accent-primary/20 text-white font-semibold py-3 px-5 transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Link>
          <Link
            to="/teams"
            className="flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-base hover:bg-bg-overlay text-text-primary font-semibold py-3 px-5 transition-all text-sm"
          >
            <Users className="h-4 w-4" />
            Manage Teams
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Synchronizing your dashboard workspace...</p>
        </div>
      ) : (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Assigned to Me"
              value={myTasks.length}
              desc="Total tasks currently assigned to you"
              color="text-accent-primary"
              glowColor="shadow-accent-primary/5 border-accent-primary/15"
            />
            <MetricCard
              label="To Do"
              value={todoTasks}
              desc="Tasks ready to begin work"
              color="text-accent-secondary"
              glowColor="shadow-accent-secondary/5 border-accent-secondary/15"
            />
            <MetricCard
              label="In Progress"
              value={inProgressTasks}
              desc="Active development sprints"
              color="text-accent-warning"
              glowColor="shadow-accent-warning/5 border-accent-warning/15"
            />
            <MetricCard
              label="Completed"
              value={completedTasks}
              desc="Tasks successfully verified"
              color="text-accent-success"
              glowColor="shadow-accent-success/5 border-accent-success/15"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks List */}
            <div className="animate-panel lg:col-span-2 rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-accent-primary" />
                    Recent Assignments
                  </h3>
                  <span className="text-xs text-text-secondary font-semibold">
                    {myTasks.length} Assigned Task{myTasks.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-border-default/35">
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-12 text-sm text-text-muted">
                      No tasks assigned to you. Go to the taskboard to assign or create one.
                    </div>
                  ) : (
                    recentTasks.map((task) => (
                      <div
                        key={task._id}
                        className="py-3.5 flex items-center justify-between gap-4 group cursor-pointer"
                      >
                        <div className="truncate flex-grow">
                          <p className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-text-muted text-xs truncate max-w-[360px]">
                              {task.description || 'No description provided.'}
                            </p>
                            {task.dueDate && (
                              <span className="text-3xs text-text-secondary bg-bg-base px-2 py-0.5 rounded border border-border-default flex items-center gap-1 font-semibold">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-2xs font-bold px-2.5 py-0.5 rounded-full capitalize border flex-shrink-0 ${
                            task.status === 'Done'
                              ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                              : task.status === 'InProgress'
                              ? 'bg-accent-warning/10 text-accent-warning border-accent-warning/20'
                              : task.status === 'Cancelled'
                              ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                              : 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20'
                          }`}
                        >
                          {task.status === 'InProgress' ? 'In Progress' : task.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {recentTasks.length > 0 && (
                <Link
                  to="/tasks"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-bg-overlay border border-border-default hover:border-accent-primary/20 hover:text-accent-primary text-text-primary font-bold text-xs transition-all mt-4"
                >
                  Open Taskboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Teams Sidebar panel */}
            <div className="animate-panel lg:col-span-1 rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent-secondary" />
                    Active Teams
                  </h3>
                  <span className="text-xs text-text-secondary font-semibold">
                    {teams.length} Workspace{teams.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {teams.length === 0 ? (
                    <div className="text-center py-12 text-sm text-text-muted">
                      You are not a member of any teams yet. Create one to get started.
                    </div>
                  ) : (
                    teams.slice(0, 4).map((team) => (
                      <div
                        key={team._id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-bg-base/40 border border-border-subtle hover:border-accent-secondary/20 hover:bg-bg-base/70 transition-all cursor-pointer group"
                      >
                        <div className="truncate">
                          <p className="font-bold text-text-primary text-sm group-hover:text-accent-secondary transition-colors truncate">
                            {team.name}
                          </p>
                          <p className="text-text-muted text-xs mt-0.5">
                            {team.members.length} member{team.members.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent-secondary transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                to="/teams"
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-bg-overlay border border-border-default hover:border-accent-secondary/20 hover:text-accent-secondary text-text-primary font-bold text-xs transition-all"
              >
                View All Teams
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  desc,
  color,
  glowColor,
}: {
  label: string;
  value: number;
  desc: string;
  color: string;
  glowColor: string;
}) {
  return (
    <div className={`animate-metric-card rounded-2xl border bg-bg-surface p-5.5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[135px] relative overflow-hidden ${glowColor}`}>
      {/* Subtle card glow overlay */}
      <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/3 opacity-[0.02] pointer-events-none" />
      <div>
        <span className="text-2xs font-bold text-text-muted uppercase tracking-widest">{label}</span>
        <h4 className={`text-4xl font-black mt-2 tracking-tight ${color}`}>{value}</h4>
      </div>
      <p className="text-text-secondary text-2xs mt-3.5 leading-relaxed">{desc}</p>
    </div>
  );
}
