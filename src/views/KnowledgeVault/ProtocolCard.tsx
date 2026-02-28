import React from 'react';
import { Protocol } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';
import { MoreVertical } from 'lucide-react';

interface ProtocolCardProps {
    protocol: Protocol;
    onClick: () => void;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

const pillarColors: Record<string, string> = {
    'Market Truth': 'bg-blue-500',
    'Psychological Warfare': 'bg-purple-500',
    'Conversion Mechanic': 'bg-orange-500',
    'Viral Engine': 'bg-red-500',
    'Growth Math': 'bg-green-500',
    'Operations': 'bg-zinc-500',
    'Client Management': 'bg-sky-500'
};

export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, onClick, onEdit, onDuplicate, onDelete }) => {
    const accentColor = pillarColors[protocol.pillar] || 'bg-primary';

    return (
        <div
            onClick={onClick}
            className="group relative bg-card  rounded-sm overflow-hidden hover:border-border-dark/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all cursor-pointer flex flex-col h-full"
        >
            {/* Top Accent Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />

            <div className="p-4 pt-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 items-center flex-wrap">
                        <span className="font-mono text-[10px] text-primary/70 uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-sm">
                            [ {protocol.category.replace(/-/g, ' ')} ]
                        </span>
                        <Badge variant="outline" className="opacity-70">{protocol.pillar}</Badge>
                    </div>
                </div>

                <h3 className="font-heading text-sm text-text-primary uppercase mb-2 line-clamp-2">
                    {protocol.title}
                </h3>

                <p className="text-xs text-text-secondary line-clamp-3 mb-4 flex-1">
                    {protocol.content.replace(/[#*`\n]/g, ' ').substring(0, 100)}...
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-dark/50">
                    <span className="font-mono text-[9px] text-text-muted">
                        UPDATED: {new Date(protocol.updatedAt).toLocaleDateString()}
                    </span>
                    {(protocol.linkedClientId || protocol.linkedTaskTypes.length > 0) && (
                        <div className="flex gap-1">
                            {protocol.linkedClientId && (
                                <span className="w-1.5 h-1.5 rounded-full bg-olive-500" title="Client Linked" />
                            )}
                            {protocol.linkedTaskTypes.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" title="Task Linked" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Menu (simplified for now, full dropdown later) */}
            <div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    // Open menu logic here
                }}
            >
                <MoreVertical className="w-4 h-4 text-text-secondary" />
            </div>
        </div>
    );
}
