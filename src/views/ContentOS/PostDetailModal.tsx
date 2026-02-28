import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Activity, ArrowRight, Clock, User, BarChart, Trash2, BrainCircuit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Post, PostStage, PerformanceLog } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onNavigate?: (view: string, id?: string) => void;
}

const STAGES: PostStage[] = [
  'PLANNED',
  'BRIEF WRITTEN',
  'IN PRODUCTION',
  'REVIEW',
  'CEO APPROVAL',
  'CLIENT APPROVAL',
  'SCHEDULED',
  'PUBLISHED'
];

const CEO_GATED_STAGES: PostStage[] = ['CEO APPROVAL', 'CLIENT APPROVAL', 'SCHEDULED', 'PUBLISHED'];

export default function PostDetailModal({ isOpen, onClose, post, onNavigate }: PostDetailModalProps) {
  const { data, updatePost, advancePostStage } = useAppData();

  const client = useMemo(() => data.clients.find(c => c.id === post.clientId), [data.clients, post.clientId]);
  const linkedTask = useMemo(() => data.tasks.find(t => t.id === post.linkedTaskId), [data.tasks, post.linkedTaskId]);

  const currentStageIndex = STAGES.indexOf(post.status);
  const nextStage = STAGES[currentStageIndex + 1] as PostStage | undefined;

  // Performance log state
  const [showPerformanceInput, setShowPerformanceInput] = useState(false);
  const [metrics, setMetrics] = useState<Partial<PerformanceLog>>(post.performance || {
    reach: 0,
    impressions: 0,
    saves: 0,
    shares: 0,
    comments: 0,
    likes: 0,
    ceoRating: '🟡 Performed',
    notes: ''
  });

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    // Simulate CEO gate — in prod this would check auth
    advancePostStage(post.id, nextStage, 'ceo');
  };

  const handleSavePerformance = () => {
    const reach = Number(metrics.reach) || 0;
    const saves = Number(metrics.saves) || 0;
    const shares = Number(metrics.shares) || 0;

    const perf: PerformanceLog = {
      reach,
      impressions: Number(metrics.impressions) || 0,
      saves,
      shares,
      comments: Number(metrics.comments) || 0,
      likes: Number(metrics.likes) || 0,
      saveRate: reach > 0 ? Number(((saves / reach) * 100).toFixed(2)) : 0,
      shareRate: reach > 0 ? Number(((shares / reach) * 100).toFixed(2)) : 0,
      ceoRating: metrics.ceoRating || '🟡 Performed',
      notes: metrics.notes || ''
    };

    updatePost(post.id, { performance: perf });
    setShowPerformanceInput(false);
  };

  const isCeoGated = nextStage ? CEO_GATED_STAGES.includes(nextStage) : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[95vh] bg-card  rounded-sm shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border-dark flex justify-between items-center bg-card-alt shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-heading text-xl text-text-primary tracking-tight uppercase">[ POST DETAIL ]</h3>
                {client && (
                  <span className="px-2 py-1 text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded-sm uppercase tracking-wider">
                    {client.name}
                  </span>
                )}
                <div className="flex gap-1.5">
                  {post.platforms.map(p => (
                    <span key={p} className="text-[10px] uppercase font-mono tracking-widest text-text-muted bg-background px-2 py-1  rounded-sm capitalize">
                      {p}
                    </span>
                  ))}
                </div>
                <Badge status={post.status}>{post.status}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('vault', post.clientId.toString());
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-primary hover:text-accent-light hover:bg-primary/10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-primary/30 hover:border-primary/50 rounded-sm transition-all"
                >
                  <BrainCircuit size={14} />
                  OPEN VAULT
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

              {/* LEFT: Pipeline + Content + Activity */}
              <div className="flex-1 border-r border-border-dark flex flex-col overflow-y-auto custom-scrollbar p-8 space-y-10">

                {/* Stage Pipeline */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-mono text-sm tracking-widest text-text-primary">STAGE PIPELINE</h4>
                    {nextStage && (
                      <Button size="sm" onClick={handleAdvanceStage}>
                        {isCeoGated && <span className="mr-1 text-[10px]">CEO:</span>}
                        ADVANCE TO {nextStage}
                        <ArrowRight size={14} className="ml-2" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between relative pt-2 overflow-x-auto">
                    <div className="absolute top-[18px] left-0 right-0 h-px bg-border-dark -z-10" />
                    {STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2 bg-card px-1 shrink-0">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isCurrent ? 'border-primary bg-background ring-2 ring-primary/30' : isCompleted ? 'border-primary bg-primary' : 'border-border-dark bg-background'}`} />
                          <span className={`text-[9px] font-mono tracking-wider max-w-[56px] text-center uppercase leading-tight ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Content Preview */}
                <section className="space-y-6">
                  <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">CONTENT PREVIEW</h4>

                  <div className="bg-background /50 rounded-sm p-6 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/50" />

                    {/* Hook */}
                    <div>
                      <h5 className="text-[10px] font-mono text-text-muted uppercase mb-2 flex justify-between">
                        <span>[ HOOK ]</span>
                        {post.triggerUsed && <span className="text-secondary/80">Trigger: {post.triggerUsed}</span>}
                      </h5>
                      <p className="text-xl font-heading text-text-primary leading-tight">
                        {post.hook || <span className="text-text-muted italic text-base">No hook written yet...</span>}
                      </p>
                    </div>

                    {/* Body */}
                    <div>
                      <h5 className="text-[10px] font-mono text-text-muted uppercase mb-2">[ CAPTION BODY ]</h5>
                      <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                        {post.captionBody || 'No caption body written yet.'}
                      </p>
                    </div>

                    {/* CTA + Hashtags */}
                    <div className="pt-4 border-t border-border-dark/30 flex flex-wrap gap-x-8 gap-y-3">
                      <div>
                        <h5 className="text-[10px] font-mono text-text-muted uppercase mb-1">[ CTA ]</h5>
                        <p className="text-xs text-primary font-mono">{post.cta || '—'}</p>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-mono text-text-muted uppercase mb-1">[ HASHTAGS ]</h5>
                        <p className="text-xs text-text-primary">{post.hashtags || '—'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Visual Brief */}
                <section className="space-y-4">
                  <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">VISUAL BRIEF</h4>
                  <div className="p-4 bg-card-alt  rounded-sm">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline">{post.templateType || 'Custom'}</Badge>
                      <span className="text-[10px] font-mono uppercase text-text-muted">{post.postType}</span>
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed pl-3 border-l-2 border-primary/30">
                      {post.visualBrief || 'No visual brief provided.'}
                    </p>
                  </div>
                </section>

                {/* Activity Log */}
                <section className="space-y-4">
                  <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2 flex items-center gap-2">
                    <Activity size={14} />
                    ACTIVITY LOG
                  </h4>
                  <div className="space-y-3">
                    {post.activityLog.slice().reverse().map((log, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-border-dark mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm text-text-primary">{log.text}</div>
                          <div className="text-[10px] text-text-muted font-mono mt-0.5">
                            {new Date(log.timestamp).toLocaleString()} · {log.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* RIGHT: Meta + Assets + Client Context + Performance */}
              <div className="w-full md:w-96 bg-card-alt flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-8">

                {/* Metadata */}
                <section className="space-y-4">
                  <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">POST INFO</h4>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Platforms', value: post.platforms.map(p => <span key={p} className="capitalize">{p}</span>).reduce((a, b) => <>{a}, {b}</>) },
                      { label: 'Post Type', value: post.postType },
                      { label: 'Content Pillar', value: post.contentPillar || '—' },
                      { label: 'Template', value: post.templateType || 'Custom' },
                      { label: 'Scheduled', value: <span className="text-primary font-mono">{post.scheduledDate} @ {post.scheduledTime}</span> },
                      { label: 'Assigned', value: post.assignedTo },
                      { label: 'Priority', value: <span className={post.priority === 'urgent' ? 'text-red-400' : post.priority === 'high' ? 'text-orange-400' : 'text-text-muted'}>{post.priority.toUpperCase()}</span> },
                      { label: 'Created', value: new Date(post.createdAt).toLocaleDateString() },
                      { label: 'Updated', value: new Date(post.updatedAt).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-text-muted font-mono uppercase text-[10px] flex items-center gap-1 shrink-0">
                          {label}
                        </span>
                        <span className="text-text-primary text-right">{value}</span>
                      </div>
                    ))}

                    {linkedTask && (
                      <div className="pt-3 mt-3 border-t border-border-dark">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[10px] text-text-muted uppercase font-mono">Linked Task</div>
                          <button
                            onClick={() => {
                              if (onNavigate) {
                                onNavigate('fulfillment', post.clientId.toString());
                                onClose();
                              }
                            }}
                            className="text-[10px] text-primary hover:text-accent-light uppercase font-mono underline tracking-widest"
                          >
                            OPEN TASK
                          </button>
                        </div>
                        <div className="text-sm text-text-primary">{linkedTask.name}</div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Assets */}
                {(post.assetLinks.length > 0 || post.referencePost) && (
                  <section className="space-y-4">
                    <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">ASSETS & LINKS</h4>
                    <div className="space-y-2">
                      {post.assetLinks.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline truncate">
                          <ExternalLink size={12} className="shrink-0 text-text-muted" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                      {post.referencePost && (
                        <a href={post.referencePost} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-text-muted hover:text-primary">
                          <ExternalLink size={12} className="shrink-0" />
                          Reference post
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* Client Context */}
                {client && (
                  <section className="space-y-4">
                    <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">CLIENT CONTEXT</h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono mb-1">Shadow Avatar</div>
                        <p className="text-text-primary leading-relaxed">{client.shadowAvatar?.slice(0, 120) || 'Not set.'}{(client.shadowAvatar?.length || 0) > 120 ? '...' : ''}</p>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono mb-1">Content Pillars</div>
                        <div className="flex flex-wrap gap-1">
                          {(client.contentPillars || []).map(p => (
                            <span key={p} className="px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary rounded-sm">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Performance Log */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border-dark pb-2">
                    <h4 className="font-mono text-sm tracking-widest text-primary flex items-center gap-2">
                      <BarChart size={14} />
                      PERFORMANCE LOG
                    </h4>
                    {post.status === 'PUBLISHED' && !showPerformanceInput && (
                      <button
                        className="text-[10px] uppercase text-text-muted hover:text-primary font-mono transition-colors"
                        onClick={() => setShowPerformanceInput(true)}
                      >
                        {post.performance ? 'Update' : 'Add Metrics'}
                      </button>
                    )}
                  </div>

                  {post.status !== 'PUBLISHED' ? (
                    <div className="p-4 border border-dashed border-border-dark/50 text-center rounded-sm">
                      <p className="text-xs text-text-muted/50">Metrics available after publishing.</p>
                    </div>
                  ) : showPerformanceInput ? (
                    <div className="bg-background border border-primary/30 p-4 rounded-sm space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {(['reach', 'impressions', 'saves', 'shares', 'comments', 'likes'] as const).map(field => (
                          <div key={field} className="space-y-1">
                            <label className="text-[10px] text-text-muted uppercase">{field}</label>
                            <input
                              type="number"
                              value={metrics[field] ?? 0}
                              onChange={e => setMetrics({ ...metrics, [field]: Number(e.target.value) })}
                              className="w-full bg-card p-1.5 text-xs text-text-primary  rounded-sm outline-none focus:border-primary"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-text-muted uppercase">CEO Rating</label>
                        <select
                          value={metrics.ceoRating}
                          onChange={e => setMetrics({ ...metrics, ceoRating: e.target.value as PerformanceLog['ceoRating'] })}
                          className="w-full bg-card p-2 text-sm text-text-primary  rounded-sm outline-none focus:border-primary"
                        >
                          <option value="🔴 Underperformed">🔴 Underperformed</option>
                          <option value="🟡 Performed">🟡 Performed</option>
                          <option value="🟢 Overperformed">🟢 Overperformed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-text-muted uppercase">Why it worked / didn't work</label>
                        <textarea
                          value={metrics.notes ?? ''}
                          onChange={e => setMetrics({ ...metrics, notes: e.target.value })}
                          placeholder="Notes for the Knowledge Vault..."
                          rows={3}
                          className="w-full bg-card p-2 text-xs text-text-primary  rounded-sm outline-none focus:border-primary resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowPerformanceInput(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSavePerformance}>Save Performance Data</Button>
                      </div>
                    </div>
                  ) : post.performance ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background  p-3 rounded-sm">
                          <div className="text-[10px] uppercase text-text-muted mb-1">Save Rate</div>
                          <div className="text-2xl font-heading text-primary">{post.performance.saveRate}%</div>
                          <div className="text-[10px] mt-1 opacity-60">{post.performance.saves} saves / {post.performance.reach?.toLocaleString?.()} reach</div>
                        </div>
                        <div className="bg-background  p-3 rounded-sm">
                          <div className="text-[10px] uppercase text-text-muted mb-1">Share Rate</div>
                          <div className="text-2xl font-heading text-secondary">{post.performance.shareRate}%</div>
                          <div className="text-[10px] mt-1 opacity-60">{post.performance.shares} shares</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          { k: 'Reach', v: post.performance.reach },
                          { k: 'Impr', v: post.performance.impressions },
                          { k: 'Likes', v: post.performance.likes },
                          { k: 'Comments', v: post.performance.comments },
                        ].map(({ k, v }) => (
                          <span key={k} className="bg-background px-2 py-1 rounded-sm  text-text-muted">
                            {k}: {(v || 0).toLocaleString()}
                          </span>
                        ))}
                      </div>
                      <div className="p-3 bg-background  rounded-sm">
                        <div className="text-[10px] text-text-muted mb-1">CEO Rating</div>
                        <div className="text-sm">{post.performance.ceoRating}</div>
                        {post.performance.notes && (
                          <p className="text-xs text-text-muted mt-2 leading-relaxed">{post.performance.notes}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-border-dark/50 text-center rounded-sm">
                      <p className="text-xs text-text-muted mb-3">No performance data logged yet.</p>
                      <Button size="sm" onClick={() => setShowPerformanceInput(true)}>Add Metrics</Button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
