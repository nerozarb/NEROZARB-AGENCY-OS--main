import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Image as ImageIcon, Video, AlignLeft, LayoutPanelLeft, ListPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Platform, PostType, TemplateType, CTAType, PostStage, NodeRole } from '../../utils/storage';

interface NewPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: any; // If editing
    prefilledDate?: string | null;
}

const PLATFORMS: { id: Platform, label: string }[] = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'twitter', label: 'Twitter/X' }
];

const POST_TYPES: PostType[] = ['Reel / Short Video', 'Static Post', 'Carousel', 'Story', 'Text Post', 'Event Post'];
const TEMPLATES: TemplateType[] = ['Template A', 'Template B', 'Template C', 'Custom'];
const CTA_TYPES: CTAType[] = ['Comment', 'Link in bio', 'DM for', 'Save this', 'Share this', 'Custom'];
const PSYCH_TRIGGERS = ['Loss Aversion', 'Social Proof', 'Identity', 'Pattern Interrupt'];

export default function NewPostModal({ isOpen, onClose, post, prefilledDate }: NewPostModalProps) {
    const { data, addPost } = useAppData();

    // Active sprint and retainer clients
    const clients = useMemo(() => data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer'), [data.clients]);

    // Section 1: Identification
    const [clientId, setClientId] = useState<number | ''>('');
    const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
    const [postType, setPostType] = useState<PostType>('Static Post');
    const [contentPillar, setContentPillar] = useState('');
    const [templateType, setTemplateType] = useState<TemplateType>('Template A');

    // Section 2: Content
    const [hook, setHook] = useState('');
    const [triggerUsed, setTriggerUsed] = useState<string | null>(null);
    const [captionBody, setCaptionBody] = useState('');
    const [ctaType, setCtaType] = useState<CTAType>('Link in bio');
    const [customCta, setCustomCta] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [visualBrief, setVisualBrief] = useState('');

    // Section 3: Scheduling
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('10:00');
    const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
    const [status, setStatus] = useState<PostStage>('PLANNED');

    // Section 4 & 5: Assignment & Assets
    const [assignedTo, setAssignedTo] = useState<NodeRole>('Art Director');
    const [linkedTaskId, setLinkedTaskId] = useState<number | ''>('');
    const [assetLinks, setAssetLinks] = useState('');
    const [referencePost, setReferencePost] = useState('');

    // Hydration effect
    useEffect(() => {
        if (isOpen) {
            if (prefilledDate) {
                setScheduledDate(prefilledDate);
            } else {
                setScheduledDate(new Date().toISOString().split('T')[0]);
            }

            // Auto-suggest role based on type
            if (postType === 'Reel / Short Video') setAssignedTo('Video Editor');
            else if (postType === 'Story' || postType === 'Text Post') setAssignedTo('Social Media Manager');
            else setAssignedTo('Art Director');
        }
    }, [isOpen, prefilledDate, postType]);

    const selectedClientPillars = useMemo(() => {
        if (clientId === '') return [];
        const c = clients.find(c => c.id === Number(clientId));
        return c ? c.contentPillars : [];
    }, [clientId, clients]);

    const handlePsychTrigger = (trigger: string) => {
        setTriggerUsed(trigger);
        setHook(prev => `${prev} (Trigger: ${trigger})`);
    };

    const togglePlatform = (p: Platform) => {
        if (platforms.includes(p)) {
            if (platforms.length > 1) setPlatforms(platforms.filter(x => x !== p));
        } else {
            setPlatforms([...platforms, p]);
        }
    };

    const handleSubmit = () => {
        if (clientId === '' || !scheduledDate) return;

        addPost({
            clientId: Number(clientId),
            platforms,
            postType,
            contentPillar,
            templateType,
            hook,
            triggerUsed,
            captionBody,
            cta: ctaType === 'Custom' ? customCta : ctaType,
            ctaType,
            hashtags,
            visualBrief,
            scheduledDate,
            scheduledTime,
            publishedDate: null,
            status,
            priority,
            assignedTo,
            linkedTaskId: linkedTaskId !== '' ? Number(linkedTaskId) : null,
            assetLinks: assetLinks ? assetLinks.split(',').map(s => s.trim()) : [],
            referencePost: referencePost || null,
            performance: null,
        });

        onClose();
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
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border-dark rounded-sm shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border-dark flex justify-between items-center bg-card-alt shrink-0">
                            <div>
                                <h3 className="font-heading text-2xl text-text-primary tracking-tight uppercase">
                                    [ NEW POST ] — CONTENT ENGINE
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content (Scrollable) */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">

                            {/* SECTION 1: IDENTIFICATION */}
                            <section className="space-y-6">
                                <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">SECTION 1: IDENTIFICATION</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Client *</label>
                                        <select
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            required
                                        >
                                            <option value="">Select a client...</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Platform(s)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PLATFORMS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => togglePlatform(p.id)}
                                                    className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${platforms.includes(p.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-border-dark text-text-muted hover:border-text-muted'}`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Post Type *</label>
                                        <select
                                            value={postType}
                                            onChange={(e) => setPostType(e.target.value as PostType)}
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                        >
                                            {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Content Pillar</label>
                                        <select
                                            value={contentPillar}
                                            onChange={(e) => setContentPillar(e.target.value)}
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                        >
                                            {clientId === '' && <option value="">Select client first</option>}
                                            {selectedClientPillars.map(pillar => <option key={pillar} value={pillar}>{pillar}</option>)}
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Template Type</label>
                                        <select
                                            value={templateType}
                                            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                        >
                                            {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: CONTENT */}
                            <section className="space-y-6">
                                <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">SECTION 2: CONTENT</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-text-muted uppercase">HOOK — First line only</label>
                                    <textarea
                                        value={hook}
                                        onChange={(e) => setHook(e.target.value)}
                                        placeholder="THE ONE LINE THAT STOPS THE SCROLL..."
                                        className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none resize-none font-bold"
                                        rows={2}
                                    />
                                    <div className="flex gap-2 pt-1 overflow-x-auto pb-2">
                                        {PSYCH_TRIGGERS.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => handlePsychTrigger(t)}
                                                className="shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono bg-card-alt border border-border-dark text-text-muted rounded-sm hover:text-primary transition-colors"
                                            >
                                                [ {t} ]
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-text-muted uppercase">BODY COPY</label>
                                    <textarea
                                        value={captionBody}
                                        onChange={(e) => setCaptionBody(e.target.value)}
                                        placeholder="2–4 sentences. What they realize. What they learn. First person but brand-first."
                                        className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Call To Action</label>
                                        <select
                                            value={ctaType}
                                            onChange={(e) => setCtaType(e.target.value as CTAType)}
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                        >
                                            {CTA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {ctaType === 'Custom' && (
                                            <input
                                                value={customCta}
                                                onChange={e => setCustomCta(e.target.value)}
                                                placeholder="Enter custom CTA phrasing..."
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 mt-2 text-sm text-text-primary focus:border-primary outline-none"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Hashtags</label>
                                        <textarea
                                            value={hashtags}
                                            onChange={(e) => setHashtags(e.target.value)}
                                            placeholder="#nerozarb #digitalgrowth ... (8–12 max)"
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-text-muted uppercase flex justify-between">
                                        <span>VISUAL BRIEF — FOR ART DIRECTOR / VIDEO EDITOR</span>
                                        <span className="text-primary/70">{templateType} applied</span>
                                    </label>
                                    <textarea
                                        value={visualBrief}
                                        onChange={(e) => setVisualBrief(e.target.value)}
                                        placeholder="Describe exactly what the visual should look like. Template used, key text, colors, elements, mood..."
                                        className="w-full bg-background border border-primary/30 rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none resize-none"
                                        rows={3}
                                    />
                                </div>
                            </section>

                            {/* SECTION 3, 4, 5 */}
                            <div className="grid grid-cols-2 gap-10">
                                <section className="space-y-6">
                                    <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">SECTION 3: SCHEDULING</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Date *</label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Time</label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Priority</label>
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value as any)}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">URGENT</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Status</label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value as PostStage)}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            >
                                                <option value="PLANNED">PLANNED</option>
                                                <option value="BRIEF WRITTEN">BRIEF WRITTEN</option>
                                                <option value="IN PRODUCTION">IN PRODUCTION</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">ASSIGNMENT & ASSETS</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Assigned To</label>
                                            <select
                                                value={assignedTo}
                                                onChange={(e) => setAssignedTo(e.target.value as NodeRole)}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            >
                                                <option value="Art Director">Art Director</option>
                                                <option value="Video Editor">Video Editor</option>
                                                <option value="Social Media Manager">Social Media Manager</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-muted uppercase">Link to Task</label>
                                            <select
                                                value={linkedTaskId}
                                                onChange={(e) => setLinkedTaskId(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                            >
                                                <option value="">None</option>
                                                {data.tasks.filter(t => t.status === 'active').map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-muted uppercase">Asset Links</label>
                                        <input
                                            value={assetLinks}
                                            onChange={(e) => setAssetLinks(e.target.value)}
                                            placeholder="Link to Canva file, Drive folder..."
                                            className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                        />
                                    </div>
                                </section>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border-dark flex justify-between bg-card-alt shrink-0">
                            <Button variant="ghost" onClick={onClose}>CANCEL</Button>
                            <Button onClick={handleSubmit} disabled={clientId === '' || !scheduledDate}>
                                <Save size={16} />
                                CREATE POST
                            </Button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
