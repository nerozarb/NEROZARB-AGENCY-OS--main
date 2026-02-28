import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';

interface ClientEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
}

export default function ClientEditModal({ isOpen, onClose, client }: ClientEditModalProps) {
    const { updateClient, data, setData } = useAppData();
    const authLevel = sessionStorage.getItem('authLevel') || 'team';

    const [formData, setFormData] = useState({
        name: client.name,
        contactName: client.contactName,
        email: client.email,
        phone: client.phone,
        niche: client.niche,
        tier: client.tier,
        shadowAvatar: client.shadowAvatar,
        bleedingNeck: client.bleedingNeck,
        relationshipHealth: client.relationshipHealth,
        newLogEvent: ''
    });

    useEffect(() => {
        setFormData({
            name: client.name,
            contactName: client.contactName,
            email: client.email,
            phone: client.phone,
            niche: client.niche,
            tier: client.tier,
            shadowAvatar: client.shadowAvatar,
            bleedingNeck: client.bleedingNeck,
            relationshipHealth: client.relationshipHealth,
            newLogEvent: ''
        });
    }, [client]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<Client> = {
            name: formData.name,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            niche: formData.niche,
            tier: formData.tier,
            shadowAvatar: formData.shadowAvatar,
            bleedingNeck: formData.bleedingNeck,
            relationshipHealth: formData.relationshipHealth as 'healthy' | 'at-risk' | 'critical',
        };

        if (formData.newLogEvent.trim()) {
            setData(prev => ({
                ...prev,
                clients: prev.clients.map(c => {
                    if (c.id === client.id) {
                        return {
                            ...c,
                            ...updates,
                            updatedAt: new Date().toISOString(),
                            timeline: [
                                ...c.timeline,
                                {
                                    id: Date.now(),
                                    date: new Date().toISOString(),
                                    event: formData.newLogEvent,
                                    type: 'manual'
                                }
                            ]
                        };
                    }
                    return c;
                })
            }));
        } else {
            updateClient(client.id, updates);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-surface  shadow-2xl flex flex-col max-h-[90vh] relative z-10"
                >
                    <div className="flex items-center justify-between p-6 border-b border-border-dark">
                        <div>
                            <h2 className="font-heading font-black text-xl text-text-primary tracking-tight uppercase">UPDATE CLIENT PROFILE</h2>
                            <p className="font-mono text-[9px] text-text-muted mt-2 tracking-widest">{client.name.toUpperCase()}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-8">

                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-xs text-primary uppercase tracking-wider">Entity Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Client Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Industry / Niche"
                                        required
                                        value={formData.niche}
                                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-xs text-primary uppercase tracking-wider">Point of Contact</h3>
                                <Input
                                    label="Contact Name & Role"
                                    required
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-xs text-primary uppercase tracking-wider">Strategic Intelligence</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black tracking-widest text-text-muted uppercase">Shadow Avatar</label>
                                        <textarea
                                            value={formData.shadowAvatar}
                                            onChange={(e) => setFormData({ ...formData, shadowAvatar: e.target.value })}
                                            className="w-full bg-card  px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black tracking-widest text-text-muted uppercase">Bleeding Neck (Core Pain)</label>
                                        <textarea
                                            value={formData.bleedingNeck}
                                            onChange={(e) => setFormData({ ...formData, bleedingNeck: e.target.value })}
                                            className="w-full bg-card  px-4 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {authLevel === 'ceo' && (
                                <div className="space-y-4 pt-4 border-t border-border-dark">
                                    <h3 className="font-heading font-bold text-xs text-yellow-500 uppercase tracking-wider">Relationship Management</h3>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Manual Health Override</label>
                                        <div className="flex gap-4">
                                            {['healthy', 'at-risk', 'critical'].map(health => (
                                                <label key={health} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="health"
                                                        value={health}
                                                        checked={formData.relationshipHealth === health}
                                                        onChange={(e) => setFormData({ ...formData, relationshipHealth: e.target.value })}
                                                        className="accent-primary"
                                                    />
                                                    <span className="font-mono text-xs text-text-secondary uppercase">{health}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-4">
                                        <label className="block text-[10px] font-black tracking-widest text-text-muted uppercase">Log Event / Key Win</label>
                                        <Input
                                            label=""
                                            placeholder="Append manually to timeline (e.g., 'Secured big brand deal')"
                                            value={formData.newLogEvent}
                                            onChange={(e) => setFormData({ ...formData, newLogEvent: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    <div className="p-6 border-t border-border-dark flex justify-end gap-4 bg-surface-hover">
                        <Button variant="outline" onClick={onClose} className="border-border-dark hover:border-text-muted">
                            CANCEL
                        </Button>
                        <Button type="submit" form="edit-client-form" className="bg-primary hover:bg-accent-mid text-text-primary px-8">
                            SAVE CHANGES
                        </Button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
