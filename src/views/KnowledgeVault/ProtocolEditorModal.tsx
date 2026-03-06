import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Type, Tag, Link as LinkIcon, Bot, Heading1, Heading2, Bold, Italic, Code } from 'lucide-react';
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
    const { addProtocol, updateProtocol, showToast } = useAppData();

    const [formData, setFormData] = useState<{
        title: string;
        category: ProtocolCategory;
        pillar: PillarType;
        status: ProtocolStatus;
        content: string;
        tags: string[];
        tagInput: string;
        externalRefsStr: string;
        promptTool: 'gemini' | 'claude' | 'both' | undefined;
    }>({
        title: '',
        category: 'sop',
        pillar: 'Market Truth',
        status: 'draft',
        content: '',
        tags: [],
        tagInput: '',
        externalRefsStr: '',
        promptTool: undefined
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            if (editProtocol) {
                setFormData({
                    title: editProtocol.title,
                    category: editProtocol.category,
                    pillar: editProtocol.pillar,
                    status: editProtocol.status,
                    content: editProtocol.content,
                    tags: editProtocol.tags,
                    tagInput: '',
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
                    tags: [],
                    tagInput: '',
                    externalRefsStr: '',
                    promptTool: undefined
                });
            }
        }
    }, [isOpen, editProtocol]);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = formData.content;
        const selectedText = currentContent.substring(start, end);
        const newText = currentContent.substring(0, start) + before + selectedText + after + currentContent.substring(end);

        setFormData(prev => ({ ...prev, content: newText }));

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newCursorStart = start + before.length;
            const newCursorEnd = end + before.length;
            textarea.setSelectionRange(newCursorStart, newCursorEnd);
        }, 0);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            showToast('Title is required', 'error');
            return;
        }

        if (!formData.content.trim()) {
            showToast('Content cannot be empty — add your protocol body before saving', 'error');
            return;
        }

        setIsSaving(true);
        const externalReferences = formData.externalRefsStr.split(',').map(s => s.trim()).filter(Boolean);

        setTimeout(() => {
            if (editProtocol) {
                updateProtocol(editProtocol.id, {
                    title: formData.title,
                    category: formData.category,
                    pillar: formData.pillar,
                    status: formData.status,
                    content: formData.content,
                    tags: formData.tags,
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
                    tags: formData.tags,
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

            setIsSaving(false);
            setSaved(true);

            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 800);
        }, 600);
    };

    const addTag = () => {
        const tag = formData.tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
                tagInput: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, tagInput: '' }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#0C0F14] rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border-dark"
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
                                        label="Protocol Title"
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
                                        className="w-full bg-card rounded-sm px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as ProtocolCategory })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase().replace(/-/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Pillar</label>
                                    <select
                                        className="w-full bg-card rounded-sm px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
                                        value={formData.pillar}
                                        onChange={e => setFormData({ ...formData, pillar: e.target.value as PillarType })}
                                    >
                                        {PILLARS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Status</label>
                                    <select
                                        className="w-full bg-card rounded-sm px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
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
                                            className="w-full bg-card rounded-sm px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
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
                        <div className="space-y-4 flex-1 flex flex-col min-h-[400px]">
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2">
                                <span className="bg-primary/20 p-1 rounded-sm"><Type className="w-3 h-3" /></span>
                                Content Definition
                            </h3>
                            <div className="flex-1 rounded-sm overflow-hidden flex flex-col bg-card relative border border-border-dark">
                                {/* Toolbar */}
                                <div className="h-10 bg-black/20 border-b border-border-dark flex items-center px-2 gap-1 overflow-x-auto">
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('# ', '')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <Heading1 size={12} /> H1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('## ', '')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <Heading2 size={12} /> H2
                                    </button>
                                    <div className="w-px h-4 bg-border-dark mx-1" />
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('**', '**')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <Bold size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('*', '*')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <Italic size={12} />
                                    </button>
                                    <div className="w-px h-4 bg-border-dark mx-1" />
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('`', '`')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <Code size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertMarkdown('[', '](url)')}
                                        className="p-1 px-1.5 text-[10px] font-mono text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1"
                                    >
                                        <LinkIcon size={12} />
                                    </button>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-text-primary focus:outline-none leading-relaxed resize-none custom-scrollbar min-h-[300px]"
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
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">Tags (Enter to add)</label>
                                    <div className="min-h-[42px] p-1.5 flex flex-wrap gap-2 bg-card rounded-sm border border-border-dark focus-within:border-primary transition-colors">
                                        {formData.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1.5 bg-primary/20 text-primary font-mono text-[10px] uppercase px-2 py-1 rounded-sm border border-primary/30 group animate-fade-in"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-text-primary transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            className="bg-transparent border-none outline-none text-sm font-mono text-text-primary flex-1 min-w-[120px]"
                                            placeholder={formData.tags.length === 0 ? "e.g. sales, strategy" : ""}
                                            value={formData.tagInput}
                                            onChange={e => setFormData({ ...formData, tagInput: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                } else if (e.key === 'Backspace' && !formData.tagInput && formData.tags.length > 0) {
                                                    removeTag(formData.tags[formData.tags.length - 1]);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-[10px] uppercase text-text-secondary tracking-widest pl-1">External Links (URLs, Comma Sep)</label>
                                    <Input
                                        label="External Links"
                                        placeholder="https://docs.link, https://figma.."
                                        value={formData.externalRefsStr}
                                        onChange={e => setFormData({ ...formData, externalRefsStr: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border-dark bg-[#0A0D12] flex justify-end gap-3 items-center">
                        {saved && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-primary font-mono text-[10px] uppercase tracking-widest mr-4"
                            >
                                [ TERMINAL_SUCCESS: PROTOCOL_SAVED ]
                            </motion.span>
                        )}
                        <Button variant="ghost" onClick={onClose} disabled={isSaving || saved} className="font-mono text-xs uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || saved} className="font-mono text-xs uppercase tracking-widest min-w-[160px]">
                            {isSaving ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <Bot className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {editProtocol ? 'Update Protocol' : 'Save Protocol'}
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
