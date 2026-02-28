import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Type, Tag, Link as LinkIcon, Bot } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Protocol, ProtocolCategory, PillarType, ProtocolStatus } from '../../utils/storage';
import { useAppData } from '../../contexts/AppDataContext';

interface ProtocolEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    editProtocol?: Protocol; // If provided, we are in edit mode
}

const CATEGORIES: ProtocolCategory[] = ['sop', 'ai-prompt', 'client-knowledge-base', 'brand-standard'];
const PILLARS: PillarType[] = ['Market Truth', 'Psychological Warfare', 'Conversion Mechanic', 'Viral Engine', 'Growth Math', 'Operations', 'Client Management'];
const STATUSES: ProtocolStatus[] = ['active', 'draft', 'archived'];

export function ProtocolEditorModal({ isOpen, onClose, editProtocol }: ProtocolEditorModalProps) {
    const { addProtocol, updateProtocol } = useAppData();

    const [formData, setFormData] = useState<{
        title: string;
        category: ProtocolCategory;
        pillar: PillarType;
        status: ProtocolStatus;
        content: string;
        tagsStr: string;
        externalRefsStr: string;
        promptTool: 'gemini' | 'claude' | 'both' | undefined;
    }>({
        title: '',
        category: 'sop',
        pillar: 'Market Truth',
        status: 'draft',
        content: '',
        tagsStr: '',
        externalRefsStr: '',
        promptTool: undefined
    });

    useEffect(() => {
        if (isOpen) {
            if (editProtocol) {
                setFormData({
                    title: editProtocol.title,
                    category: editProtocol.category,
                    pillar: editProtocol.pillar,
                    status: editProtocol.status,
                    content: editProtocol.content,
                    tagsStr: editProtocol.tags.join(', '),
                    externalRefsStr: editProtocol.externalReferences.join(', '),
                    promptTool: editProtocol.promptTool
                });
            } else {
                setFormData({
                    title: '',
                    category: 'sop',
                    pillar: 'Market Truth',
                    status: 'draft',
                    content: '',
                    tagsStr: '',
                    externalRefsStr: '',
                    promptTool: undefined
                });
            }
        }
    }, [isOpen, editProtocol]);

    const handleSave = () => {
        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }

        const tags = formData.tagsStr.split(',').map(s => s.trim()).filter(Boolean);
        const externalReferences = formData.externalRefsStr.split(',').map(s => s.trim()).filter(Boolean);

        if (editProtocol) {
            updateProtocol(editProtocol.id, {
                title: formData.title,
                category: formData.category,
                pillar: formData.pillar,
                status: formData.status,
                content: formData.content,
                tags,
                externalReferences,
                promptTool: formData.category === 'ai-prompt' ? (formData.promptTool || 'both') : undefined
            });
        } else {
            addProtocol({
                title: formData.title,
                category: formData.category,
                pillar: formData.pillar,
                status: formData.status,
                content: formData.content,
                tags,
                externalReferences,
                promptTool: formData.category === 'ai-prompt' ? (formData.promptTool || 'both') : undefined,
                promptVariables: [],
                usageNotes: '',
                exampleOutput: '',
                linkedTaskTypes: [],
                linkedClientId: null,
                relatedProtocolIds: []
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-bg-main  rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border-dark bg-card">
                        <div>
                            <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider">
                                {editProtocol ? 'Edit Protocol' : 'New Protocol'}
                            </h2>
                            <p className="font-mono text-[10px] text-text-muted mt-1 tracking-widest uppercase">
                                Knowledge Vault Entry
                            </p>
                        </div>
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-white/5 rounded-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Section 1: Classification */}
                        <div className="space-y-4">
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2">
                                <span className="bg-primary/20 p-1 rounded-sm"><Tag className="w-3 h-3" /></span>
                                Classification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Protocol Title</label>
                                    <Input
                                        className="font-heading text-lg"
                                        placeholder="E.g. Automated Onboarding Sequence"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Category</label>
                                    <select
                                        className="w-full bg-card  rounded-sm px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as ProtocolCategory })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase().replace(/-/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Pillar</label>
                                    <select
                                        className="w-full bg-card  rounded-sm px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none"
                                        value={formData.pillar}
                                        onChange={e => setFormData({ ...formData, pillar: e.target.value as PillarType })}
                                    >
                                        {PILLARS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Status</label>
                                    <select
                                        className="w-full bg-card  rounded-sm px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as ProtocolStatus })}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                {formData.category === 'ai-prompt' && (
                                    <div className="space-y-1.5">
                                        <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1 flex items-center gap-2">
                                            <Bot className="w-3 h-3" /> Target Tool
                                        </label>
                                        <select
                                            className="w-full bg-card  rounded-sm px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none"
                                            value={formData.promptTool || 'both'}
                                            onChange={e => setFormData({ ...formData, promptTool: e.target.value as any })}
                                        >
                                            <option value="both">AGNOSTIC (BOTH)</option>
                                            <option value="claude">CLAUDE ONLY</option>
                                            <option value="gemini">GEMINI ONLY</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Content */}
                        <div className="space-y-4 flex-1 flex flex-col min-h-[300px]">
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2">
                                <span className="bg-primary/20 p-1 rounded-sm"><Type className="w-3 h-3" /></span>
                                Content Definition
                            </h3>
                            <div className="flex-1  rounded-sm overflow-hidden flex flex-col bg-card relative">
                                {/* Simple Toolbar Mock */}
                                <div className="h-10 bg-black/20 border-b border-border-dark flex items-center px-2 gap-1 overflow-x-auto">
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">H1</Button>
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">H2</Button>
                                    <div className="w-px h-4 bg-border-dark mx-1" />
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">**B**</Button>
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">*I*</Button>
                                    <div className="w-px h-4 bg-border-dark mx-1" />
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">`code`</Button>
                                    <Button variant="ghost" className="h-6 px-2 text-[10px] font-mono hover:bg-white/10 opacity-70">[🔗]</Button>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-text-primary focus:outline-none leading-relaxed resize-none custom-scrollbar"
                                    placeholder={formData.category === 'ai-prompt' ? "Enter your prompt template here. Use [[VARIABLE_NAME]] for dynamic inputs." : "Write your SOP in Markdown here..."}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Section 3: Metadata */}
                        <div className="space-y-4 pb-4">
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2">
                                <span className="bg-primary/20 p-1 rounded-sm"><LinkIcon className="w-3 h-3" /></span>
                                References & Metadata
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Tags (Comma Separated)</label>
                                    <Input
                                        placeholder="e.g. sales, strategy, 2026"
                                        value={formData.tagsStr}
                                        onChange={e => setFormData({ ...formData, tagsStr: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">External Links (URLs, Comma Sep)</label>
                                    <Input
                                        placeholder="https://docs.link, https://figma.. "
                                        value={formData.externalRefsStr}
                                        onChange={e => setFormData({ ...formData, externalRefsStr: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border-dark bg-[#0A0A0A] flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} className="font-mono text-xs uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="font-mono text-xs uppercase tracking-widest">
                            <Save className="w-4 h-4 mr-2" />
                            {editProtocol ? 'Update Protocol' : 'Save Protocol'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
