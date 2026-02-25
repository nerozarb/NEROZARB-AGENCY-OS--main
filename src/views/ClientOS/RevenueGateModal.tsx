import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';

interface RevenueGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientCreated?: (clientId: number) => void;
}

export default function RevenueGateModal({ isOpen, onClose, onClientCreated }: RevenueGateModalProps) {
    const { addClient } = useAppData();

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        niche: '',
        revenueGate: '',
        tier: '',
        contractValue: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-calculate LTV based on initial contract value
        const cValue = parseFloat(formData.contractValue) || 0;

        const newClientObj: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
            name: formData.name,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            niche: formData.niche,
            revenueGate: formData.revenueGate,
            tier: formData.tier,
            contractValue: cValue,
            ltv: cValue,
            status: 'Lead',
            startDate: new Date().toISOString().split('T')[0],
            shadowAvatar: '',
            bleedingNeck: '',
            contentPillars: [],
            relationshipHealth: 'healthy',
            onboardingStatus: 'not-started',
            notes: '',
            timeline: [{
                id: Date.now(),
                date: new Date().toISOString(),
                event: 'Client Installed via Revenue Gate',
                type: 'system'
            }]
        };

        const newId = addClient(newClientObj);
        if (onClientCreated) {
            onClientCreated(newId);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
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
                    className="w-full max-w-2xl bg-surface border border-border-dark shadow-2xl flex flex-col max-h-[90vh] relative z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border-dark">
                        <div>
                            <h2 className="font-heading font-black text-xl text-text-primary tracking-tight">INSTALL NEW CLIENT</h2>
                            <p className="text-text-muted text-sm mt-1">Revenue Gate & Initial Profiling</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <form id="revenue-gate-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-text-muted">01.</span> Entity Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Client/Company Name"
                                        placeholder="e.g. Mozart House"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Industry / Niche"
                                        placeholder="e.g. Cultural Hub"
                                        required
                                        value={formData.niche}
                                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Point of Contact */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-text-muted">02.</span> Point of Contact
                                </h3>
                                <Input
                                    label="Contact Name & Role"
                                    placeholder="e.g. Ahmed (Creative Director)"
                                    required
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="hello@company.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Input
                                        label="Phone Number"
                                        placeholder="+92 300 1234567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Revenue & Tier */}
                            <div className="space-y-4">
                                <h3 className="font-heading font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-text-muted">03.</span> Revenue & Service Tier
                                </h3>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                        Revenue Gate Qualification
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['<1M PKR', '1M–5M PKR', '>5M PKR'].map(gate => (
                                            <button
                                                key={gate}
                                                type="button"
                                                onClick={() => {
                                                    let autoTier = formData.tier;
                                                    let autoVal = formData.contractValue;
                                                    if (gate === '<1M PKR') { autoTier = 'Tier 1: Active Presence'; autoVal = '100000'; }
                                                    else if (gate === '1M–5M PKR') { autoTier = 'Tier 2: 60-Day Sprint'; autoVal = '250000'; }
                                                    else if (gate === '>5M PKR') { autoTier = 'Tier 3: Market Dominance'; autoVal = '500000'; }
                                                    setFormData({ ...formData, revenueGate: gate, tier: autoTier, contractValue: autoVal });
                                                }}
                                                className={`p-3 text-sm border transition-all ${formData.revenueGate === gate
                                                    ? 'border-primary bg-primary/10 text-primary font-bold'
                                                    : 'border-border-dark text-text-secondary hover:border-text-muted hover:text-text-primary hover:bg-surface-hover'
                                                    }`}
                                            >
                                                {gate}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                        Service Tier
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Tier 1: Active Presence', 'Tier 2: 60-Day Sprint', 'Tier 3: Market Dominance'].map(tier => (
                                            <button
                                                key={tier}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, tier: tier })}
                                                className={`p-4 text-left border transition-all flex justify-between items-center ${formData.tier === tier
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border-dark hover:border-text-muted hover:bg-surface-hover'
                                                    }`}
                                            >
                                                <span className={`font-medium ${formData.tier === tier ? 'text-primary' : 'text-text-primary'}`}>
                                                    {tier}
                                                </span>
                                                {formData.tier === tier && (
                                                    <span className="text-primary text-[10px] tracking-[0.2em] uppercase font-black">Selected</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Input
                                        label="Initial Contract Value (PKR)"
                                        type="number"
                                        placeholder="150000"
                                        required
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border-dark flex justify-end gap-4 bg-surface-hover">
                        <Button variant="outline" onClick={onClose} className="h-12 px-6 border-border-dark hover:border-text-muted">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="revenue-gate-form"
                            className="h-12 px-8 bg-primary hover:bg-accent-mid text-text-primary font-bold tracking-wide"
                            disabled={!formData.name || !formData.revenueGate || !formData.tier}
                        >
                            CREATE CLIENT PROFILE
                        </Button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
