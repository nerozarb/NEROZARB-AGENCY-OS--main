import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Zap, Save, ClipboardList } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Platform, PostType, NodeRole } from '../../utils/storage';

interface MonthlyPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
    onNavigate?: (view: string, id?: string) => void;
}

interface PlannerRow {
    id: string;
    date: string;
    platform: Platform;
    postType: PostType;
    pillar: string;
    hookIdea: string;
    assignedTo: NodeRole;
}

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter'];
const POST_TYPES: PostType[] = ['Reel / Short Video', 'Static Post', 'Carousel', 'Story', 'Text Post', 'Event Post'];

export default function MonthlyPlannerModal({ isOpen, onClose, clientId, onNavigate }: MonthlyPlannerModalProps) {
    const { data, generateMonthlyPosts } = useAppData();

    const client = useMemo(() => data.clients.find(c => c.id === clientId), [data.clients, clientId]);
    const pillars = client?.contentPillars || [];

    const [rows, setRows] = useState<PlannerRow[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize with some blank rows when opened
    useEffect(() => {
        if (isOpen && rows.length === 0) {
            handleAddRow(3);
        }
    }, [isOpen]);

    const handleAddRow = (count = 1) => {
        const newRows = Array.from({ length: count }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            platform: 'instagram' as Platform,
            postType: 'Static Post' as PostType,
            pillar: pillars[0] || 'Other',
            hookIdea: '',
            assignedTo: 'Art Director' as NodeRole,
        }));
        setRows(prev => [...prev, ...newRows]);
    };

    const updateRow = (id: string, field: keyof PlannerRow, value: any) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeRow = (id: string) => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const handleGenerate = async () => {
        if (!clientId || rows.length === 0) return;

        setIsGenerating(true);

        // Filter out empty rows (at least hook idea must be somewhat filled, or keep all if user wants blanks)
        const validRows = rows.filter(r => r.date);

        // Simulate network request
        await new Promise(res => setTimeout(res, 800));

        // Pass rows using field names that match AppDataContext.generateMonthlyPosts expectations
        generateMonthlyPosts(clientId, validRows.map(r => ({
            platform: r.platform,   // singular — matches context's row.platform
            postType: r.postType,
            pillar: r.pillar,       // matches context's row.pillar
            hookIdea: r.hookIdea,   // matches context's row.hookIdea
            date: r.date,           // matches context's row.date
            assignedTo: r.assignedTo
        })));

        setIsGenerating(false);
        onClose();
        // Reset rows for next open
        setRows([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[90vw] h-[90vh] bg-card  rounded-sm shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border-dark flex justify-between items-center bg-card-alt shrink-0">
                            <div className="flex flex-col">
                                <h3 className="font-heading text-xl text-text-primary tracking-tight uppercase flex items-center gap-2">
                                    <ClipboardList className="text-primary" />
                                    MONTHLY CONTENT PLANNER
                                </h3>
                                <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-widest">
                                    CLIENT: <span className="text-text-primary font-bold">{client?.name || 'NONE SELECTED'}</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content / Table */}
                        <div className="flex-1 overflow-auto custom-scrollbar relative bg-background">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="sticky top-0 bg-card border-b border-border-dark z-10">
                                    <tr className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
                                        <th className="p-3 w-12 text-center">#</th>
                                        <th className="p-3 w-40">Date</th>
                                        <th className="p-3 w-40">Platform</th>
                                        <th className="p-3 w-48">Format</th>
                                        <th className="p-3 w-48">Pillar</th>
                                        <th className="p-3">Hook Idea / Concept</th>
                                        <th className="p-3 w-48">Assignee</th>
                                        <th className="p-3 w-16 text-center">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className="border-b border-border-dark/30 hover:bg-card-alt/30 transition-colors group">
                                            <td className="p-3 text-center text-xs text-text-muted font-mono">{index + 1}</td>
                                            <td className="p-3">
                                                <input
                                                    type="date"
                                                    value={row.date}
                                                    onChange={e => updateRow(row.id, 'date', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={row.platform}
                                                    onChange={e => updateRow(row.id, 'platform', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none capitalize"
                                                >
                                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={row.postType}
                                                    onChange={e => updateRow(row.id, 'postType', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none"
                                                >
                                                    {POST_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={row.pillar}
                                                    onChange={e => updateRow(row.id, 'pillar', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none"
                                                >
                                                    {pillars.map(p => <option key={p} value={p}>{p}</option>)}
                                                    <option value="Other">Other</option>
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    value={row.hookIdea}
                                                    placeholder="Rough idea or scroll-stopping hook..."
                                                    onChange={e => updateRow(row.id, 'hookIdea', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={row.assignedTo}
                                                    onChange={e => updateRow(row.id, 'assignedTo', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent group-hover:border-border-dark focus:border-primary rounded-sm p-1 text-xs text-text-primary outline-none"
                                                >
                                                    <option value="Art Director">Art Director</option>
                                                    <option value="Video Editor">Video Editor</option>
                                                    <option value="Social Media Manager">SM Manager</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => removeRow(row.id)}
                                                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="p-6">
                                <Button variant="outline" onClick={() => handleAddRow(1)}>
                                    <Plus size={16} /> ADD ROW
                                </Button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border-dark flex justify-between items-center bg-card-alt shrink-0">
                            <div className="text-xs font-mono text-text-muted">
                                Total Posts Planned: <span className="text-primary font-bold">{rows.length}</span>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={onClose}>CANCEL</Button>
                                <Button onClick={handleGenerate} disabled={isGenerating || rows.length === 0 || !clientId}>
                                    {isGenerating ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2" />
                                    ) : (
                                        <Zap size={16} />
                                    )}
                                    BATCH GENERATE POSTS
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
