import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';

const COLUMNS = [
  'BRIEFED',
  'IN PRODUCTION',
  'REVIEW',
  'CEO APPROVAL',
  'CLIENT APPROVAL',
  'DEPLOYED'
];

export default function KanbanView({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 border border-dashed border-border-dark/50 rounded-sm bg-card-alt/20">
        <div className="w-16 h-16 rounded-full bg-surface  flex items-center justify-center mb-4">
          <Calendar className="text-text-muted" size={24} />
        </div>
        <h3 className="font-heading font-black text-lg text-text-primary tracking-tight uppercase mb-2">No Active Tasks</h3>
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest max-w-sm text-center">
          Your sprint pipeline is clear. Generate a sprint or initialize tasks to populate this view.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-x-auto gap-3 md:gap-4 min-h-0 pb-2 snap-scroll-x scroll-touch"
      style={{ WebkitOverflowScrolling: 'touch' }}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.status === col);

        return (
          <div key={col}
            className="flex flex-col min-h-0 bg-card-alt/30 /30 rounded-sm p-3
                          flex-shrink-0 w-[80vw] md:w-auto md:flex-1 snap-child">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-medium text-text-muted truncate pr-2">{col}</h3>
              <Badge variant="outline" className="bg-card-alt shrink-0">{colTasks.length}</Badge>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {colTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={`task-${task.id}`}
                  onClick={() => onTaskClick(task)}
                  className="cursor-pointer group"
                >
                  <Card className="p-3 hover:border-primary/50 transition-colors" accentTop={task.priority === 'high'}>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-card-alt truncate max-w-[100px]">{task.client}</Badge>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'
                        }`} />
                    </div>

                    <h4 className="text-sm text-text-primary font-medium mb-3 group-hover:text-primary transition-colors leading-tight">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dark/50">
                      <div className="flex items-center gap-2 text-text-muted">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Paperclip size={10} />
                          <span className="font-mono">2</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <MessageSquare size={10} />
                          <span className="font-mono">5</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-text-muted" />
                        <span className="font-mono text-[9px] text-text-secondary uppercase">{task.deadline}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {colTasks.length === 0 && (
                <div className="h-20 border border-dashed border-border-dark/50 rounded-sm flex items-center justify-center">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Empty</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
