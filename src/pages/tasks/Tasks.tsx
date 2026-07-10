import { useState, useEffect } from 'react';
import { useMyTeamsQuery } from '../../queries/useTeamQueries';
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUploadAttachmentMutation,
} from '../../queries/useTaskQueries';
import { useCommentsQuery, useCreateCommentMutation } from '../../queries/useCommentQueries';
import { useUsersQuery } from '../../queries/useUserQueries';
import { initSocket, getSocket } from '../../utils/socket';
import type { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import { useAppDispatch } from '../../app/store';
import { addToast } from '../../app/slices/notificationSlice';
import {
  Plus,
  Loader2,
  Calendar,
  FileText,
  User,
  Paperclip,
  Trash2,
  X,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import gsap from 'gsap';

export default function TasksPage() {
  const { data: teamsData, isLoading: teamsLoading } = useMyTeamsQuery();
  const { data: usersData } = useUsersQuery();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  const teams = teamsData?.data || [];
  const allUsers = usersData?.data || [];

  // Set default team
  if (teams.length > 0 && !selectedTeamId) {
    setSelectedTeamId(teams[0]._id);
  }

  // Fetch tasks for the selected team
  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery(
    selectedTeamId
      ? {
          teamId: selectedTeamId,
          priority: selectedPriority || undefined,
          assigneeId: selectedAssignee || undefined,
          limit: 100,
        }
      : undefined
  );

  const tasks = tasksData?.data || [];

  // Mutations
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Create Task Form State
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPriority, setCreatePriority] = useState<TaskPriority>('Medium');
  const [createAssignee, setCreateAssignee] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');

  // Edit Task Form State (quick edits inside details modal)
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('Todo');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  // Socket setup for comments
  useEffect(() => {
    initSocket();
  }, []);

  // GSAP card stagger animations
  useEffect(() => {
    if (!tasksLoading && tasks.length > 0) {
      gsap.fromTo(
        '.animate-task-card',
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [tasksLoading, tasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !createTitle.trim()) return;

    createTaskMutation.mutate(
      {
        title: createTitle,
        description: createDesc || undefined,
        priority: createPriority,
        assigneeId: createAssignee || undefined,
        teamId: selectedTeamId,
        dueDate: createDueDate || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setCreateTitle('');
          setCreateDesc('');
          setCreatePriority('Medium');
          setCreateAssignee('');
          setCreateDueDate('');
        },
      }
    );
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(typeof task.assigneeId === 'string' ? task.assigneeId : task.assigneeId?._id || '');
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    updateTaskMutation.mutate(
      {
        taskId: selectedTask._id,
        payload: {
          title: editTitle,
          description: editDesc || undefined,
          status: editStatus,
          priority: editPriority,
          assigneeId: editAssignee || undefined,
          dueDate: editDueDate || undefined,
        },
      },
      {
        onSuccess: (updatedData) => {
          setSelectedTask(updatedData.data);
        },
      }
    );
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(selectedTask._id, {
        onSuccess: () => {
          setSelectedTask(null);
        },
      });
    }
  };

  // Group tasks by status for Kanban view
  const columns: { name: TaskStatus; label: string; color: string }[] = [
    { name: 'Todo', label: 'To Do', color: 'border-t-accent-secondary bg-bg-surface' },
    { name: 'InProgress', label: 'In Progress', color: 'border-t-accent-primary bg-bg-surface' },
    { name: 'Done', label: 'Completed', color: 'border-t-accent-success bg-bg-surface' },
    { name: 'Cancelled', label: 'Cancelled', color: 'border-t-accent-danger bg-bg-surface' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Taskboard</h1>
          <p className="text-text-secondary mt-1">Organize and assign workflows with ease.</p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {teams.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted uppercase">Team:</span>
              <select
                value={selectedTeamId || ''}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-bg-surface border border-border-default rounded-xl p-2.5 text-text-primary text-sm focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-bg-surface border border-border-default rounded-xl p-2.5 text-text-primary text-sm focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase">Assignee:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-bg-surface border border-border-default rounded-xl p-2.5 text-text-primary text-sm focus:outline-none"
            >
              <option value="">All Members</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeamId && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-accent-primary hover:bg-opacity-95 text-white font-semibold py-2.5 px-4 shadow-lg shadow-accent-primary/20 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {teamsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Loading task boards...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-border-default bg-bg-surface/30 p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-12 space-y-4">
          <div className="p-3 bg-bg-overlay rounded-2xl border border-border-default text-text-muted">
            <SlidersHorizontal className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">No Teams Ready</h3>
            <p className="text-text-secondary text-sm mt-1">
              You must create or join a team before organizing tasks.
            </p>
          </div>
        </div>
      ) : tasksLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Gathering tasks...</p>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.name);
            return (
              <div
                key={col.name}
                className={`rounded-2xl border-t-4 border border-border-default p-4 shadow-xl flex flex-col gap-4 min-h-[500px] ${col.color}`}
              >
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-text-primary text-sm tracking-wide uppercase">
                    {col.label}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bg-overlay border border-border-default text-text-secondary">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border-default rounded-xl bg-bg-base/30 text-xs text-text-muted">
                      No tasks in this column
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onClick={() => handleSelectTask(task)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Create Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl animate-scale-in">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-text-primary mb-1">Create Task</h3>
            <p className="text-text-secondary text-sm mb-6">Create a detailed work assignment.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Title</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Description</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:border-accent-primary focus:outline-none h-20 resize-none"
                  placeholder="Explain the scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">Due Date</label>
                  <input
                    type="date"
                    value={createDueDate}
                    onChange={(e) => setCreateDueDate(e.target.value)}
                    className="w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Assignee</label>
                <select
                  value={createAssignee}
                  onChange={(e) => setCreateAssignee(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-base p-3 text-text-primary focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-lg border border-border-default bg-transparent hover:bg-bg-overlay py-3 font-semibold text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="flex-1 rounded-lg bg-accent-primary hover:bg-opacity-95 py-3 font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {createTaskMutation.isPending ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Task Details (includes details + comments + attachments) */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          allUsers={allUsers}
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
          editFormState={{
            editTitle,
            setEditTitle,
            editDesc,
            setEditDesc,
            editStatus,
            setEditStatus,
            editPriority,
            setEditPriority,
            editAssignee,
            setEditAssignee,
            editDueDate,
            setEditDueDate,
          }}
          onSave={handleUpdateTask}
          isUpdating={updateTaskMutation.isPending}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// CHILD COMPONENT: Task Card (rendered inside column)
// -------------------------------------------------------------
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priorityColors = {
    Low: 'bg-accent-success/15 text-accent-success border-accent-success/20',
    Medium: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/20',
    High: 'bg-accent-warning/15 text-accent-warning border-accent-warning/20',
    Critical: 'bg-accent-danger/15 text-accent-danger border-accent-danger/20',
  };

  const assigneeName =
    typeof task.assigneeId === 'object' && task.assigneeId !== null
      ? task.assigneeId.name
      : 'Unassigned';

  return (
    <div
      onClick={onClick}
      className="animate-task-card group rounded-xl border border-border-default bg-bg-base/60 hover:bg-bg-overlay p-4.5 cursor-pointer hover:border-accent-primary/20 shadow-md hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-bold uppercase border ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-3xs text-text-muted flex items-center gap-1 font-semibold">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      <h4 className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="border-t border-border-default/50 mt-4 pt-3 flex items-center justify-between text-2xs text-text-muted font-semibold">
        <div className="flex items-center gap-1.5 bg-bg-surface border border-border-default px-2 py-0.5 rounded-full">
          <User className="h-3 w-3 text-text-secondary" />
          <span className="truncate max-w-[80px]">{assigneeName}</span>
        </div>

        <div className="flex items-center gap-3">
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CHILD COMPONENT: Task Details Modal (contains comments + files)
// -------------------------------------------------------------
interface EditFormState {
  editTitle: string;
  setEditTitle: (v: string) => void;
  editDesc: string;
  setEditDesc: (v: string) => void;
  editStatus: TaskStatus;
  setEditStatus: (v: TaskStatus) => void;
  editPriority: TaskPriority;
  setEditPriority: (v: TaskPriority) => void;
  editAssignee: string;
  setEditAssignee: (v: string) => void;
  editDueDate: string;
  setEditDueDate: (v: string) => void;
}

function TaskDetailsModal({
  task,
  allUsers,
  onClose,
  onDelete,
  editFormState,
  onSave,
  isUpdating,
}: {
  task: Task;
  allUsers: any[];
  onClose: () => void;
  onDelete: () => void;
  editFormState: EditFormState;
  onSave: () => void;
  isUpdating: boolean;
}) {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');

  // Comments Query & Mutation
  const { data: commentsData, isLoading: commentsLoading } = useCommentsQuery(task._id, activeTab === 'comments');
  const createCommentMutation = useCreateCommentMutation();
  const uploadAttachmentMutation = useUploadAttachmentMutation();

  const comments = commentsData?.data || [];
  const [commentContent, setCommentContent] = useState('');

  // Socket listener for new comments
  useEffect(() => {
    const socket = getSocket();
    const channel = `task-${task._id}-new-comment`;

    socket.on(channel, (data: any) => {
      // Invalidate comments query cache to pull down the new comment
      queryClient.invalidateQueries({ queryKey: ['comments', task._id] });
      // Notify current viewing user if the message isn't theirs
      if (data.authorId !== store.getState().auth.user?._id) {
        dispatch(addToast({ message: 'New comment posted!', type: 'info' }));
      }
    });

    return () => {
      socket.off(channel);
    };
  }, [task._id, queryClient, dispatch]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    createCommentMutation.mutate(
      {
        taskId: task._id,
        payload: { content: commentContent },
      },
      {
        onSuccess: () => {
          setCommentContent('');
        },
      }
    );
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAttachmentMutation.mutate({
      taskId: task._id,
      file,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border-default bg-bg-surface shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="border-b border-border-default p-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary truncate max-w-[80%]">
            {task.title}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onDelete}
              className="text-text-muted hover:text-accent-danger transition-colors p-1"
              title="Delete Task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border-default/50 bg-bg-base/30 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Comments ({task.attachments ? comments.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'attachments'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Files ({task.attachments?.length || 0})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {/* tab 1: Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Task Name</label>
                <input
                  type="text"
                  value={editFormState.editTitle}
                  onChange={(e) => editFormState.setEditTitle(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:border-accent-primary focus:outline-none text-text-primary text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Description</label>
                <textarea
                  value={editFormState.editDesc}
                  onChange={(e) => editFormState.setEditDesc(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:border-accent-primary focus:outline-none text-text-primary text-sm h-28 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase">Status</label>
                  <select
                    value={editFormState.editStatus}
                    onChange={(e) => editFormState.setEditStatus(e.target.value as TaskStatus)}
                    className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:outline-none text-text-primary text-sm"
                  >
                    <option value="Todo">To Do</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Done">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase">Priority</label>
                  <select
                    value={editFormState.editPriority}
                    onChange={(e) => editFormState.setEditPriority(e.target.value as TaskPriority)}
                    className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:outline-none text-text-primary text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase">Assignee</label>
                  <select
                    value={editFormState.editAssignee}
                    onChange={(e) => editFormState.setEditAssignee(e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:outline-none text-text-primary text-sm"
                  >
                    <option value="">Unassigned</option>
                    {allUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase">Due Date</label>
                  <input
                    type="date"
                    value={editFormState.editDueDate}
                    onChange={(e) => editFormState.setEditDueDate(e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl p-3 mt-1 focus:outline-none text-text-primary text-sm"
                  />
                </div>
              </div>

              <button
                onClick={onSave}
                disabled={isUpdating}
                className="w-full mt-4 bg-accent-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-95 transition-all duration-200 shadow-md shadow-accent-primary/10 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* tab 2: Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-6 flex flex-col h-full">
              {commentsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {comments.length === 0 ? (
                    <p className="text-center text-xs text-text-muted py-10">No comments posted yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="bg-bg-base/55 border border-border-subtle p-3.5 rounded-2xl space-y-1 shadow-sm">
                        <div className="flex justify-between text-2xs font-semibold">
                          <span className="text-accent-secondary">{comment.authorId.name}</span>
                          <span className="text-text-muted">
                            {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-text-primary text-xs leading-relaxed">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <form onSubmit={handlePostComment} className="flex gap-3 pt-4 border-t border-border-default/50">
                <input
                  type="text"
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-grow bg-bg-base border border-border-default rounded-xl p-3 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  placeholder="Share a status update..."
                />
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  className="p-3 bg-accent-primary hover:bg-opacity-95 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {/* tab 3: Attachments */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {task.attachments && task.attachments.length > 0 ? (
                  task.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-border-default rounded-xl bg-bg-base hover:bg-bg-overlay transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent-primary" />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-text-primary max-w-[300px] truncate">
                            {file.originalname}
                          </p>
                          <p className="text-3xs text-text-muted">
                            {Math.round(file.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-center text-xs text-text-muted py-10">No attachments uploaded yet.</p>
                )}
              </div>

              <div className="pt-4 border-t border-border-default/50">
                <label className="flex flex-col items-center justify-center border border-dashed border-border-default hover:border-accent-primary/50 hover:bg-accent-primary/5 rounded-2xl p-8 cursor-pointer transition-all duration-200">
                  <Paperclip className="h-8 w-8 text-text-muted mb-2" />
                  <span className="text-sm font-semibold text-text-primary">Click to upload file</span>
                  <span className="text-3xs text-text-muted mt-1">Attachments limit is 10MB</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUploadFile}
                    disabled={uploadAttachmentMutation.isPending}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Global TanStack Query imports for sub-components
import { useQueryClient } from '@tanstack/react-query';
import { store } from '../../app/store';
