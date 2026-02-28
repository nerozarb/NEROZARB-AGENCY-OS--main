import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { TaskCategory, NodeRole, Stage } from '../../utils/storage';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const { data, addTask } = useAppData();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [category, setCategory] = useState<TaskCategory>('Other');
  const [phase, setPhase] = useState<'phase1' | 'phase2' | 'phase3' | 'ongoing'>('ongoing');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [assignedNode, setAssignedNode] = useState<NodeRole>('CEO');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [brief, setBrief] = useState('');

  const handleSubmit = () => {
    if (!name || clientId === '') return;

    // Default standard pipeline
    const pipeline: Stage[] = ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'];

    addTask({
      clientId: Number(clientId),
      name,
      category,
      phase,
      stagePipeline: pipeline,
      currentStage: 'BRIEFED',
      assignedNode,
      priority,
      status: 'active',
      deadline: deadline || new Date().toISOString().split('T')[0],
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      brief,
      assetLinks: [],
      sopReference: null,
      notes: '',
      deliveredOnTime: null,
      linkedPostId: null
    });

    // Reset form
    setName('');
    setClientId('');
    setCategory('Other');
    setPhase('ongoing');
    setPriority('normal');
    setAssignedNode('CEO');
    setDeadline('');
    setEstimatedHours('');
    setBrief('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="INITIALIZE NEW TASK">
      <div className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Task Name"
            placeholder="e.g. Q4 Strategy Deck"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block font-mono text-xs font-medium text-text-muted">
              Client
            </label>
            <select
              value={clientId}
              onChange={e => setClientId(Number(e.target.value))}
              className="w-full bg-card-alt  text-text-primary px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors hover:border-text-muted"
            >
              <option value="" disabled>Select Client</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-mono text-xs font-medium text-text-muted">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-card-alt  text-text-primary px-4 py-3 text-sm focus:outline-none focus:border-primary"
              >
                {['Content Production', 'Ad Creative', 'Website', 'Strategy', 'Video Production', 'Brand Design', 'Analytics', 'Automation', 'Client Communication', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs font-medium text-text-muted">
                Assignee Node
              </label>
              <select
                value={assignedNode}
                onChange={e => setAssignedNode(e.target.value as NodeRole)}
                className="w-full bg-card-alt  text-text-primary px-4 py-3 text-sm focus:outline-none focus:border-primary"
              >
                {['CEO', 'Art Director', 'Video Editor', 'Operations Builder', 'Social Media Manager', 'Documentation Manager'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs font-medium text-text-muted">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPriority('normal')}
                className={`py-2 text-xs font-mono uppercase tracking-widest border rounded-sm transition-colors ${priority === 'normal' ? 'bg-primary/20 border-primary text-primary' : 'bg-card-alt border-border-dark text-text-muted hover:border-text-muted'
                  }`}
              >
                Normal
              </button>
              <button
                onClick={() => setPriority('high')}
                className={`py-2 text-xs font-mono uppercase tracking-widest border rounded-sm transition-colors ${priority === 'high' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-card-alt border-border-dark text-text-muted hover:border-text-muted'
                  }`}
              >
                High
              </button>
              <button
                onClick={() => setPriority('critical')}
                className={`py-2 text-xs font-mono uppercase tracking-widest border rounded-sm transition-colors ${priority === 'critical' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-card-alt border-border-dark text-text-muted hover:border-text-muted'
                  }`}
              >
                Critical
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phase"
              placeholder="e.g. phase1 (Optional)"
              value={phase}
              onChange={e => setPhase(e.target.value as any)}
            />
            <Input
              label="Deadline (YYYY-MM-DD)"
              placeholder="e.g. 2024-10-25"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Est. Hours"
              placeholder="e.g. 4"
              type="number"
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs font-medium text-text-muted">
              Task Brief
            </label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              className="w-full bg-card-alt  text-text-primary px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors hover:border-text-muted rounded-none"
              rows={3}
              placeholder="Describe the objective and deliverables..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border-dark flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>CANCEL</Button>
          <Button onClick={handleSubmit}>CREATE TASK</Button>
        </div>
      </div>
    </Modal>
  );
}
