import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Tag } from '../../components/ui/Tag';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';
import RevenueGateModal from './RevenueGateModal';

const LIFECYCLE_STATUSES = ['Lead', 'Discovery', 'Active Sprint', 'Retainer', 'Closed'] as const;

export default function RosterView({ onSelectClient }: { onSelectClient: (id: string) => void }) {
  const { data, deleteClient } = useAppData();
  const authLevel = sessionStorage.getItem('authLevel') || 'team';

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'ltv'>('name');

  // Calculates health dynamically 
  const calculateHealth = (client: Client) => {
    const clientTasks = data.tasks.filter(t => t.clientId === client.id);
    const overdueTasks = clientTasks.filter(t =>
      t.status !== 'Deployed' &&
      t.deadline &&
      new Date(t.deadline) < new Date()
    );

    const daysSinceActivity = clientTasks.length > 0
      ? Math.floor((Date.now() - Math.max(...clientTasks.map(t => new Date(t.updatedAt).getTime()))) / 86400000)
      : Infinity;

    if (overdueTasks.length >= 3 || daysSinceActivity > 14) return 'critical';
    if (overdueTasks.length >= 1 || daysSinceActivity > 7 || clientTasks.length === 0) return 'at-risk';
    return 'healthy';
  };

  const calculateLastActivity = (client: Client) => {
    const clientTasks = data.tasks.filter(t => t.clientId === client.id);
    if (clientTasks.length === 0) return 'No activity';
    const lastDate = new Date(Math.max(...clientTasks.map(t => new Date(t.updatedAt).getTime())));
    const days = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  // Filter and Sort Clients
  let processedClients = data.clients.filter(c => {
    if (activeFilter !== 'All' && c.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.niche.toLowerCase().includes(q) && !(c.contactName || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  processedClients.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'startDate') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (sortBy === 'ltv') return b.ltv - a.ltv;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-8 h-full flex flex-col"
    >
      {/* Top Row */}
      <div className="flex justify-between items-center gap-3">
        <SectionHeader module="02" title="CLIENT OS" />
        <Button onClick={() => setIsInstallModalOpen(true)} size="sm" className="bg-primary hover:bg-accent-mid text-text-primary whitespace-nowrap">
          <Plus size={14} />
          <span className="hidden sm:inline">[ + INSTALL CLIENT ]</span>
          <span className="sm:hidden">+ NEW</span>
        </Button>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 border-b border-border-dark scroll-touch">
        <button
          onClick={() => setActiveFilter('All')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${activeFilter === 'All' ? 'border-primary bg-primary/10 text-primary' : 'border-border-dark bg-card hover:border-text-muted text-text-primary'
            }`}
        >
          <span className="font-heading font-bold text-[10px] uppercase tracking-wider">All</span>
          <span className="font-mono text-[10px] opacity-70">[{data.clients.length}]</span>
        </button>
        {LIFECYCLE_STATUSES.map(status => {
          const count = data.clients.filter(c => c.status === status).length;
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isActive ? 'border-primary bg-primary/10' : 'border-border-dark bg-card hover:border-text-muted'
                }`}
            >
              <Badge status={status === 'Active Sprint' || status === 'Retainer' ? 'healthy' : 'review'}>{status}</Badge>
              <span className="font-mono text-[10px] text-text-muted">[{count}]</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
        <div className="relative group w-full md:w-[400px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card  pl-10 pr-4 py-2 font-mono text-[11px] tracking-widest text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <div className="flex items-center gap-2  bg-card px-3 py-2">
            <Filter size={12} className="text-text-muted" />
            <select className="bg-transparent border-none text-text-primary font-mono text-[10px] tracking-wider focus:outline-none appearance-none pr-4">
              <option value="all">Filters: All</option>
            </select>
          </div>
          <div className="flex items-center gap-2  bg-card px-3 py-2">
            <ArrowUpDown size={12} className="text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-text-primary font-mono text-[10px] tracking-wider focus:outline-none appearance-none pr-4"
            >
              <option value="name">Sort: Name A-Z</option>
              <option value="startDate">Sort: Start Date</option>
              {authLevel === 'ceo' && <option value="ltv">Sort: LTV</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table Content */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border-dark bg-card">
        {processedClients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase mb-4">[ NO CLIENTS INSTALLED ]</span>
            <p className="font-sans text-sm text-text-secondary mb-6 max-w-sm">Run the Revenue Gate to install your first client.</p>
            <Button onClick={() => setIsInstallModalOpen(true)} className="bg-primary hover:bg-accent-mid text-text-primary">
              + INSTALL FIRST CLIENT
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar scroll-touch">

            {/* ===== MOBILE CARD LIST ===== */}
            <div className="md:hidden divide-y divide-border-dark">
              <AnimatePresence>
                {processedClients.map((client) => {
                  const health = calculateHealth(client);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={client.id}
                      className="p-4 active:bg-card-alt/50 transition-colors cursor-pointer"
                      onClick={() => onSelectClient(client.id.toString())}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-heading font-bold text-[13px] text-text-primary tracking-tight uppercase truncate">{client.name}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                            <span className="font-sans text-[11px] text-accent-light">{client.tier}</span>
                          </div>
                          <p className="font-mono text-[10px] text-text-muted mt-1 ml-4 uppercase">{calculateLastActivity(client)}</p>
                        </div>
                        <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ===== DESKTOP TABLE ===== */}
            <table className="hidden md:table w-full text-left whitespace-nowrap">
              <thead className="sticky top-0 z-20 bg-card-alt border-b border-border-dark">
                <tr>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Client Name</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Status</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Tier</th>
                  {authLevel === 'ceo' ? (
                    <>
                      <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Revenue Gate</th>
                      <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">LTV</th>
                    </>
                  ) : (
                    <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Niche</th>
                  )}
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Health</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em]">Last Activity</th>
                  <th className="p-4 font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                <AnimatePresence>
                  {processedClients.map((client) => {
                    const health = calculateHealth(client);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={client.id}
                        className="hover:bg-card-alt/50 transition-colors group cursor-pointer"
                        onClick={() => onSelectClient(client.id.toString())}
                      >
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-[13px] text-text-primary tracking-tight uppercase">{client.name}</span>
                            <span className="font-sans text-[11px] text-text-muted mt-0.5">{client.contactName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-sans text-[12px] text-accent-light">{client.tier}</span>
                        </td>

                        {authLevel === 'ceo' ? (
                          <>
                            <td className="p-4">
                              <span className="font-mono text-[10px] px-2 py-1  bg-card-alt text-text-secondary">{client.revenueGate}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-[12px] text-text-primary">{formatCurrency(client.ltv)}</span>
                            </td>
                          </>
                        ) : (
                          <td className="p-4">
                            <span className="font-sans text-[12px] text-text-secondary">{client.niche}</span>
                          </td>
                        )}

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${health === 'healthy' ? 'bg-primary' : health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-mono text-[10px] uppercase text-text-secondary">{health}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[10px] text-text-muted uppercase">{calculateLastActivity(client)}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button className="font-mono text-[9px] text-xs font-medium text-text-muted hover:text-text-primary transition-colors" onClick={(e) => { e.stopPropagation(); /* edit logic */ }}>Edit</button>
                            {authLevel === 'ceo' && (
                              <button className="font-mono text-[9px] text-xs font-medium text-text-muted hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); setClientToDelete(client); }}>Delete</button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RevenueGateModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onClientCreated={(clientId) => {
          onSelectClient(clientId.toString());
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-red-500/50 shadow-2xl relative z-10 p-6"
            >
              <h2 className="font-heading font-black text-xl text-red-500 uppercase mb-4">Confirm Deletion</h2>
              <p className="text-sm text-text-secondary mb-4">
                Are you sure you want to delete <strong className="text-text-primary">{clientToDelete.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="bg-card-alt p-4 border border-red-500/20 mb-6">
                <p className="text-xs text-red-400 font-mono uppercase tracking-wider mb-2">This will also delete logically bound assets:</p>
                <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
                  <li>{data.tasks.filter(t => t.clientId === clientToDelete.id).length} Active/Completed Tasks</li>
                  <li>{data.posts.filter(p => p.clientId === clientToDelete.id).length} Content Posts</li>
                  <li>{data.protocols.filter(p => p.clientId === clientToDelete.id).length} Knowledge Vault Protocols</li>
                </ul>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setClientToDelete(null)}>CANCEL</Button>
                <Button className="bg-red-500 hover:bg-red-600 text-text-primary px-6" onClick={() => {
                  deleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }}>CONFIRM DELETE</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
