import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, TerminalSquare, AlertCircle, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Protocol } from '../../utils/storage';
import { useAppData } from '../../contexts/AppDataContext';

interface PromptDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocol: Protocol | null;
    onEdit: (protocol: Protocol) => void;
}

export function PromptDetailModal({ isOpen, onClose, protocol, onEdit }: PromptDetailModalProps) {
    const { recordPromptUsage } = useAppData();
    const [copied, setCopied] = useState(false);
    const [variables, setVariables] = useState<string[]>([]);

    useEffect(() => {
        if (protocol && protocol.category === 'ai-prompt') {
            const regex = /\[\[(.*?)\]\]/g;
            const matches = Array.from(protocol.content.matchAll(regex));
            const uniqueVars = Array.from(new Set(matches.map(m => m[1])));
            setVariables(uniqueVars);
        } else {
            setVariables([]);
        }
        setCopied(false);
    }, [protocol]);

    const handleCopy = () => {
        if (!protocol) return;
        navigator.clipboard.writeText(protocol.content);
        recordPromptUsage(protocol.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !protocol) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#0A0A0A] border border-border-dark rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    {/* Sticky Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border-dark bg-[#0A0A0A] sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-sm">
                                <TerminalSquare className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider flex items-center gap-2">
                                    {protocol.title}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-[10px] text-primary tracking-widest uppercase border border-primary/30 px-1.5 py-0.5 rounded-sm bg-primary/10">
                                        {protocol.pillar}
                                    </span>
                                    {protocol.promptTool && (
                                        <span className="font-mono text-[10px] text-text-secondary tracking-widest uppercase border border-border-dark px-1.5 py-0.5 rounded-sm">
                                            {protocol.promptTool === 'both' ? 'AGNOSTIC' : protocol.promptTool.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => onEdit(protocol)} className="font-mono text-xs px-3">
                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                EDIT
                            </Button>
                            <button
                                onClick={handleCopy}
                                disabled={copied}
                                className={`flex items-center justify-center gap-2 py-2 px-6 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm ${copied
                                        ? 'bg-primary/20 text-primary border border-primary/50'
                                        : 'bg-primary text-black hover:bg-primary-hover border border-primary'
                                    }`}
                            >
                                {copied ? (<><span>[ COPIED ]</span></>) : (<><Copy className="w-4 h-4" /> <span>COPY PROMPT</span></>)}
                            </button>
                            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-2 ml-2 hover:bg-white/5 rounded-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                        {/* Prompt Display (Left) */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-border-dark bg-black/40">
                            <div className="space-y-4">
                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">Raw Prompt Request</h3>
                                <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed bg-[#111] p-4 rounded-sm border border-border-dark select-all">
                                    <code>{protocol.content}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Variables Sidebar (Right) */}
                        <div className="w-full md:w-80 p-6 overflow-y-auto bg-card">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2 mb-4">
                                        <AlertCircle className="w-3 h-3" />
                                        Variables Detected
                                    </h3>

                                    {variables.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-xs text-text-secondary leading-relaxed mb-4">
                                                The following dynamic variables were detected in this prompt. Replace them before executing.
                                            </p>
                                            {variables.map((v, i) => (
                                                <div key={i} className="bg-bg-main border border-border-dark p-3 rounded-sm">
                                                    <span className="font-mono text-xs text-primary font-bold">[[{v}]]</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 border border-dashed border-border-dark rounded-sm">
                                            <p className="text-xs text-text-muted font-mono uppercase tracking-widest">No variables detected.</p>
                                        </div>
                                    )}
                                </div>

                                {protocol.usageNotes && (
                                    <div>
                                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-secondary flex items-center gap-2 border-b border-border-dark pb-2 mb-4">
                                            Usage Notes
                                        </h3>
                                        <p className="text-xs text-text-primary leading-relaxed">
                                            {protocol.usageNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
