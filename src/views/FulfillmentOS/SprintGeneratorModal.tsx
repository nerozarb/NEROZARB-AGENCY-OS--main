import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';

interface SprintGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SprintGeneratorModal({ isOpen, onClose }: SprintGeneratorModalProps) {
    const { data, generateSprintTasks } = useAppData();
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    const handleGenerate = () => {
        if (selectedClientId === '') return;

        generateSprintTasks(Number(selectedClientId));
        setSelectedClientId('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="INITIALIZE SPRINT 01 PROTOCOL">
            <div className="space-y-6">
                <div className="max-w-md text-sm text-text-secondary leading-relaxed">
                    This sequence automates the creation of the standard 7-task Phase 1 pipeline for a new client.
                    Tasks will be pre-assigned to respective primary nodes with automated deadlines relative to the
                    client's start date (+3 to +14 days).
                </div>

                <div className="space-y-2">
                    <label className="block font-mono text-[10px] tracking-widest text-text-muted uppercase">
                        Target Client
                    </label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                        className="w-full bg-card-alt border border-border-dark text-text-primary px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors hover:border-text-muted"
                    >
                        <option value="" disabled>Select Client</option>
                        {data.clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-card-alt/50 border border-border-dark p-4 rounded-sm">
                    <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase mb-3">
                        Injected Tasks
                    </h4>
                    <ul className="space-y-2 font-mono text-xs text-text-secondary">
                        <li>[1] Brand & Positioning Audit (Day 3)</li>
                        <li>[2] Competitor Analysis (Day 4)</li>
                        <li>[3] Website Critique (Day 5)</li>
                        <li>[4] Shadow Avatar Refinement (Day 6)</li>
                        <li>[5] Content Pillars & Month 1 Plan (Day 10)</li>
                        <li>[6] Brand Visual Direction (Day 12)</li>
                        <li>[7] Phase 1 Delivery + CEO Review (Day 14)</li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-border-dark flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>CANCEL</Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={selectedClientId === ''}
                        className="flex items-center gap-2"
                    >
                        EXECUTE PROTOCOL
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
