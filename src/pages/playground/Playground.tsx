import { useState, useRef, useEffect } from 'react';
import { api } from '../../services/axios';
import { useAuth } from '../../app/hooks.useAuth';
import { useAppDispatch } from '../../app/store';
import { addToast } from '../../app/slices/notificationSlice';
import { getSocket } from '../../utils/socket';
import gsap from 'gsap';
import {
  Play,
  Terminal,
  Cpu,
  Wifi,
  Sparkles,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
  defaultParams?: string;
}

const API_ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/users/me',
    description: 'Get current logged-in user profile details',
  },
  {
    method: 'GET',
    path: '/users',
    description: 'List all users in the system (requires Admin role)',
  },
  {
    method: 'GET',
    path: '/teams',
    description: 'Fetch all teams where current user is a member',
  },
  {
    method: 'POST',
    path: '/teams',
    description: 'Create a new team',
    defaultBody: JSON.stringify({ name: 'Alpha Squad', description: 'Cross-functional engineering team' }, null, 2),
  },
  {
    method: 'GET',
    path: '/tasks',
    description: 'List and search tasks',
    defaultParams: 'limit=5',
  },
  {
    method: 'POST',
    path: '/tasks',
    description: 'Create a new task under a team',
    defaultBody: JSON.stringify(
      {
        title: 'Implement OAuth Login Flow',
        description: 'Set up login and register handlers',
        priority: 'High',
        teamId: '',
      },
      null,
      2
    ),
  },
];

export default function PlaygroundPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // API Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(API_ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody || '');
  const [queryParams, setQueryParams] = useState(selectedEndpoint.defaultParams || '');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // WebSocket State
  const [socketConnected, setSocketConnected] = useState(false);
  const [simulatedTaskId, setSimulatedTaskId] = useState('');
  const [socketChannelLogs, setSocketChannelLogs] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('This is a simulated real-time websocket update!');

  // Animation playground state
  const demoCardRef = useRef<HTMLDivElement>(null);

  // Initialize socket status
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      setSocketConnected(socket.connected);
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
    }
  }, []);

  // Update request input boxes when changing endpoint selection
  const handleSelectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.defaultBody || '');
    setQueryParams(endpoint.defaultParams || '');
    setApiResponse(null);
    setResponseStatus(null);
    setLatency(null);
  };

  // Run selected API request
  const handleExecuteRequest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setResponseStatus(null);
    setLatency(null);

    const startTime = performance.now();
    const finalPath = queryParams ? `${selectedEndpoint.path}?${queryParams}` : selectedEndpoint.path;

    try {
      let response;
      if (selectedEndpoint.method === 'GET') {
        response = await api.get(finalPath);
      } else if (selectedEndpoint.method === 'POST') {
        const parsedBody = requestBody ? JSON.parse(requestBody) : {};
        response = await api.post(finalPath, parsedBody);
      } else if (selectedEndpoint.method === 'PATCH') {
        const parsedBody = requestBody ? JSON.parse(requestBody) : {};
        response = await api.patch(finalPath, parsedBody);
      } else {
        response = await api.delete(finalPath);
      }

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(response.status);
      setApiResponse(response.data);
    } catch (error: any) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(error.response?.status || 500);
      setApiResponse(error.response?.data || { error: 'Unknown server response' });
    } finally {
      setApiLoading(false);
    }
  };

  // Simulate comment event over websockets
  const handleTriggerSocketEvent = () => {
    if (!simulatedTaskId.trim()) {
      dispatch(addToast({ message: 'Please specify a target Task ID first', type: 'warning' }));
      return;
    }

    const socket = getSocket();
    const channel = `task-${simulatedTaskId}-new-comment`;
    
    // Log the emission locally
    const timestamp = new Date().toLocaleTimeString();
    setSocketChannelLogs((prev) => [
      `[${timestamp}] Emitting comment event on: ${channel}`,
      ...prev,
    ]);

    // Emit the notification payload to local sockets
    socket.emit('newComment', {
      taskId: simulatedTaskId,
      commentData: {
        content: commentText,
        authorId: { _id: user?._id || 'mock-id', name: user?.name || 'Playground User' },
        createdAt: new Date().toISOString(),
      },
    });

    // Also trigger local event hook manually for immediate visual confirmation
    socket.emit(`task-${simulatedTaskId}-new-comment`, {
      content: commentText,
      authorId: user?._id || 'mock-id',
    });

    dispatch(
      addToast({
        message: 'Socket event sent. Check Taskboard or topbar notifications!',
        type: 'success',
      })
    );
  };

  // Run custom GSAP demo animations on the sandbox card
  const runGSAPAnimation = (type: 'flyIn' | 'pulse' | 'glassReveal' | 'bounce') => {
    if (!demoCardRef.current) return;

    if (type === 'flyIn') {
      gsap.fromTo(
        demoCardRef.current,
        { x: -100, opacity: 0, rotate: -5 },
        { x: 0, opacity: 1, rotate: 0, duration: 0.65, ease: 'back.out(1.7)' }
      );
    } else if (type === 'pulse') {
      gsap.to(demoCardRef.current, {
        scale: 1.05,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    } else if (type === 'glassReveal') {
      gsap.fromTo(
        demoCardRef.current,
        { backdropFilter: 'blur(0px)', backgroundColor: 'rgba(255, 255, 255, 0)' },
        { backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255, 255, 255, 0.03)', duration: 0.8, ease: 'power3.out' }
      );
    } else {
      gsap.fromTo(
        demoCardRef.current,
        { y: -30 },
        { y: 0, duration: 0.8, ease: 'bounce.out' }
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-2">
          <Cpu className="h-8 w-8 text-accent-primary animate-pulse" />
          TaskFlow Playground
        </h1>
        <p className="text-text-secondary mt-1">
          Interactive developer playground to inspect REST endpoints, WebSocket event bindings, and GSAP micro-animations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: REST API PLAYGROUND */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Terminal className="h-5 w-5 text-accent-secondary" />
              REST API Explorer
            </h3>

            {/* Select Endpoint Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Select Endpoint
                </label>
                <div className="flex flex-col gap-2">
                  {API_ENDPOINTS.map((endpoint, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectEndpoint(endpoint)}
                      className={`flex items-center justify-between text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedEndpoint.path === endpoint.path && selectedEndpoint.method === endpoint.method
                          ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                          : 'border-border-default bg-bg-base/30 text-text-secondary hover:border-border-default hover:text-text-primary'
                      }`}
                    >
                      <span>{endpoint.path}</span>
                      <span
                        className={`text-3xs px-2 py-0.5 rounded-full font-extrabold uppercase ${
                          endpoint.method === 'GET'
                            ? 'bg-accent-success/10 text-accent-success'
                            : 'bg-accent-primary/10 text-accent-primary'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint configuration panel */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                    Query Parameters
                  </label>
                  <input
                    type="text"
                    value={queryParams}
                    onChange={(e) => setQueryParams(e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-xl p-3 text-text-primary text-xs font-mono focus:outline-none"
                    placeholder="e.g. limit=10&page=1"
                  />
                </div>

                {selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE' && (
                  <div>
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                      JSON Payload
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full bg-bg-base border border-border-default rounded-xl p-3 text-text-primary text-xs font-mono h-24 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-text-secondary italic mb-4 leading-relaxed">
                    {selectedEndpoint.description}
                  </p>
                  <button
                    onClick={handleExecuteRequest}
                    disabled={apiLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-primary hover:bg-opacity-95 text-white font-semibold py-3 shadow-lg shadow-accent-primary/10 transition-all duration-200 text-sm"
                  >
                    {apiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Execute Request
                  </button>
                </div>
              </div>
            </div>

            {/* Response Console Display */}
            <div className="border border-border-default rounded-2xl bg-bg-base overflow-hidden">
              <div className="bg-bg-elevated px-4 py-3 border-b border-border-default/50 flex items-center justify-between text-xs text-text-secondary font-mono">
                <span>Server Response Console</span>
                <div className="flex gap-4">
                  {responseStatus && (
                    <span className="flex items-center gap-1.5 font-bold">
                      {responseStatus >= 200 && responseStatus < 300 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-accent-success" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-accent-danger" />
                      )}
                      Status: {responseStatus}
                    </span>
                  )}
                  {latency && (
                    <span className="font-semibold">Latency: {latency}ms</span>
                  )}
                </div>
              </div>

              <div className="p-4 overflow-x-auto font-mono text-xs text-accent-secondary max-h-[300px] min-h-[160px] scrollbar-thin">
                {apiLoading ? (
                  <div className="flex flex-col items-center justify-center h-28 gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
                    <span>Resolving secure endpoint pipeline...</span>
                  </div>
                ) : apiResponse ? (
                  <pre className="text-left text-accent-secondary leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-28 text-text-muted">
                    <span>Press Execute Request to view the payload output.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WS NOTIFICATIONS & GSAP ANIMATIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* WEBSOCKET SIMULATOR */}
          <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent-success" />
                WebSocket Control
              </h3>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  socketConnected ? 'bg-accent-success animate-pulse' : 'bg-accent-danger'
                }`}
                title={socketConnected ? 'Connected' : 'Disconnected'}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Target Task ID
                </label>
                <input
                  type="text"
                  value={simulatedTaskId}
                  onChange={(e) => setSimulatedTaskId(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl p-3 text-text-primary text-xs font-mono focus:outline-none"
                  placeholder="Paste a Task ID from Taskboard"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Comment Payload
                </label>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl p-3 text-text-primary text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={handleTriggerSocketEvent}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-accent-success/20 hover:bg-accent-success/15 text-accent-success font-semibold py-3 transition-colors text-sm"
              >
                <Send className="h-4 w-4" />
                Broadcast Event
              </button>

              {/* Socket event console logs */}
              <div className="border border-border-default rounded-xl bg-bg-base p-3 font-mono text-3xs text-text-muted space-y-1.5 h-24 overflow-y-auto scrollbar-thin">
                <p className="text-accent-success font-bold">--- Local Events logs ---</p>
                {socketChannelLogs.length === 0 ? (
                  <p className="italic">Waiting for message broadcast events...</p>
                ) : (
                  socketChannelLogs.map((log, index) => <p key={index}>{log}</p>)
                )}
              </div>
            </div>
          </div>

          {/* GSAP ANIMATION SANDBOX */}
          <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-warning" />
              GSAP Animation Sandbox
            </h3>

            {/* Floating Card Target */}
            <div className="flex justify-center py-4 bg-bg-base border border-border-subtle rounded-2xl">
              <div
                ref={demoCardRef}
                className="w-40 rounded-xl border border-border-default bg-bg-surface p-4 text-center shadow-lg cursor-pointer flex flex-col items-center justify-center gap-2 select-none"
              >
                <div className="h-8 w-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-sm">
                  TF
                </div>
                <div>
                  <p className="font-extrabold text-xs text-text-primary">Sandbox Card</p>
                  <p className="text-3xs text-text-muted mt-0.5">Micro-animation target</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <button
                onClick={() => runGSAPAnimation('flyIn')}
                className="py-2.5 rounded-xl border border-border-default hover:bg-bg-overlay text-text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Fly In
              </button>
              <button
                onClick={() => runGSAPAnimation('pulse')}
                className="py-2.5 rounded-xl border border-border-default hover:bg-bg-overlay text-text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Pulse
              </button>
              <button
                onClick={() => runGSAPAnimation('glassReveal')}
                className="py-2.5 rounded-xl border border-border-default hover:bg-bg-overlay text-text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Glass Blur
              </button>
              <button
                onClick={() => runGSAPAnimation('bounce')}
                className="py-2.5 rounded-xl border border-border-default hover:bg-bg-overlay text-text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Bounce
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
