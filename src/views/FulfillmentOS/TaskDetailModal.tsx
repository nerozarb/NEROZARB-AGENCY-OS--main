import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, MessageSquare, Paperclip, User, ChevronRight, PenLine, BookOpen } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Task, Stage } from '../../utils/storage';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onNavigate?: (view: string, id?: string) => void;
}

const PIPELINE_STEPS = [
  'BRIEFED',
  'IN PRODUCTION',
  'REVIEW',
  'CEO APPROVAL',
  'CLIENT APPROVAL',
  'DEPLOYED'
];

export default function TaskDetailModal({ isOpen, onClose, task: modalTask, onNavigate }: TaskDetailModalProps) {
  const { data, advanceTaskStage } = useAppData();
  const [newNote, setNewNote] = useState('');

  // Use live task data from context to ensure updates reflect immediately
  const task = modalTask ? data.tasks.find(t => t.id === modalTask.id) || modalTask : null;

  if (!task) return null;

  const PIPELINE_STEPS = task.stagePipeline;
  const currentStepIndex = PIPELINE_STEPS.indexOf(task.currentStage);
  const nextStage = PIPELINE_STEPS[currentStepIndex + 1];

  const authLevel = (sessionStorage.getItem('authLevel') as 'ceo' | 'team') || 'team';
  const clientName = data.clients.find(c => c.id === task.clientId)?.name || 'Unknown Client';

  const handleAdvanceStage = () => {
    if (nextStage && canAdvance) {
      advanceTaskStage(task.id, nextStage, authLevel);
    }
  };

  const canAdvance = authLevel === 'ceo' || (nextStage !== 'CEO APPROVAL' && nextStage !== 'DEPLOYED');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    advanceTaskStage(task.id, task.currentStage, authLevel, newNote);
    setNewNote('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="TASK PROTOCOL">
      <div className="space-y-8">

        {/* Header Meta */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-2xl text-text-primary">{task.name}</h3>
            <Badge status={task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'at-risk' : 'healthy'}>
              {task.priority} PRIORITY
            </Badge>
          </div>
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest flex items-center gap-2">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('client', task.clientId.toString());
                  onClose();
                }
              }}
              className="hover:text-primary transition-colors hover:underline"
            >
              {clientName}
            </button>
            <span className="text-border-dark">//</span>
            <span>ID: TSK-{task.id}</span>
            <span className="text-border-dark">//</span>
            <span>{task.category}</span>
          </div>
        </div>

        {/* Pipeline Tracker */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border-dark -translate-y-1/2 z-0" />
          <div className="relative z-10 flex justify-between">
            {PIPELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center gap-2 bg-card px-2">
                  <div className={`w-3 h-3 rounded-full border-2 transition-colors ${isCompleted ? 'bg-primary border-primary' :
                    isCurrent ? 'bg-card border-primary ring-4 ring-primary/20' :
                      'bg-card border-border-dark'
                    }`} />
                  <span className={`font-mono text-[9px] tracking-widest uppercase ${isCurrent ? 'text-primary' :
                    isCompleted ? 'text-text-secondary' :
                      'text-text-muted'
                    }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Split Content */}
        <div className="grid grid-cols-3 gap-6">

          {/* Left: Brief & Assets (66%) */}
          <div className="col-span-2 space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase flex items-center gap-2">
                <Paperclip size={14} />
                Strategic Brief
              </h4>
              <Card className="p-4 bg-card-alt border-border-dark whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed">
                {task.brief || 'No brief provided for this task.'}
              </Card>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-dark">
              <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase flex items-center gap-2">
                <MessageSquare size={14} />
                Activity Log
              </h4>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {[...task.activityLog].reverse().map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-sm shrink-0 flex items-center justify-center font-mono text-xs ${log.author === 'ceo' ? 'bg-primary/20 text-primary' : 'bg-card-alt text-text-muted'
                      }`}>
                      {log.author === 'ceo' ? 'CEO' : 'TM'}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-text-primary font-medium capitalize">
                          {log.author === 'ceo' ? 'Hamsa' : 'Team Member'}
                        </span>
                        <span className="font-mono text-[9px] text-text-muted">
                          {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-secondary mt-1">
                        {log.type === 'stage_advance' ? (
                          <span className="font-mono text-[10px] uppercase text-primary bg-primary/10 px-1 py-0.5 rounded-sm">
                            {log.from} → {log.to}
                          </span>
                        ) : null}
                        {log.type === 'note' && <span className="block mt-1">{log.text}</span>}
                        {log.type === 'created' && <span className="opacity-50">{log.text}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2 mt-4">
                <div className="flex-1 bg-card-alt border border-border-dark p-1 flex items-center focus-within:border-primary transition-colors">
                  <PenLine size={14} className="text-text-muted ml-2 shrink-0" />
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a note or update..."
                    className="w-full bg-transparent border-none text-sm text-text-primary px-3 py-2 outline-none placeholder:text-text-muted"
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  />
                </div>
                <Button variant="ghost" className="px-4 border border-border-dark shrink-0" onClick={handleAddNote}>
                  POST
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Details & Meta (33%) */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Metadata</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><User size={14} /> Assignee</span>
                  <span className="text-text-primary">{task.assignedNode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><Calendar size={14} /> Deadline</span>
                  <span className="text-text-primary">{task.deadline}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-2"><Clock size={14} /> Est. Hours</span>
                  <span className="text-text-primary font-mono">{task.estimatedHours ? `${task.estimatedHours}h` : 'TBD'}</span>
                </div>
                {task.sopReference && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border-dark mt-2">
                    <span className="text-text-muted flex items-center gap-2"><BookOpen size={14} /> SOP Protocol</span>
                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('vault', task.clientId.toString());
                          onClose();
                        }
                      }}
                      className="text-primary hover:text-accent-light font-mono text-[10px] tracking-widest underline uppercase text-right truncate max-w-[120px]"
                    >
                      OPEN VAULT
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border-dark space-y-3">
              {nextStage ? (
                <Button
                  className="w-full justify-center"
                  onClick={handleAdvanceStage}
                  disabled={!canAdvance}
                >
                  ADVANCE TO: {nextStage} <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <div className="p-3 bg-accent-light/10 border border-accent-light text-accent-light flex items-center justify-center text-sm font-mono tracking-widest mt-4">
                  FULLY DEPLOYED
                </div>
              )}
              {authLevel === 'ceo' && task.currentStage !== 'DEPLOYED' && (
                <Button variant="ghost" className="w-full justify-center text-red-500 hover:text-red-400 hover:bg-red-500/10">
                  MARK EXCEPTION / DELAY
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
}
