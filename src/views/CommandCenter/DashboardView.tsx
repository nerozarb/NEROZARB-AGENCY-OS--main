import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Activity, AlertTriangle, DollarSign, Target, ChevronRight } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';

export default function DashboardView({ onNavigate }: { onNavigate?: (view: string, id?: string) => void }) {
  const { data } = useAppData();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // KPI Calculations
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const activeClients = data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer');
  const cashCollected = activeClients.reduce((sum, client) => sum + (client.ltv || 0), 0);

  const pipelineLeads = data.clients.filter(c => c.status === 'Lead' || c.status === 'Discovery').length;

  const todayDate = new Date().toISOString().split('T')[0];
  const frictionAlerts = data.tasks.filter(t => t.deadline && t.deadline < todayDate && t.status !== 'Deployed').length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-6"
    >
      {/* Header */}
      <motion.header variants={item} className="flex justify-between items-end mb-4 md:mb-12">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl tracking-tighter text-text-primary">COMMAND CENTER</h2>
          <p className="font-mono text-[10px] md:text-xs tracking-widest text-text-muted mt-1 uppercase">Global Operations Overview</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="font-mono text-xs tracking-widest text-text-secondary">DATE</p>
          <p className="font-sans text-sm text-text-primary mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </motion.header>

      {/* KPI Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard title="Cash Collected" value={formatCurrency(cashCollected)} icon={DollarSign} trend="Active" />
        <KpiCard title="Active Sprints" value={activeClients.length.toString()} icon={Activity} trend="On Track" onClick={() => onNavigate?.('client')} />
        <KpiCard title="Pipeline Leads" value={pipelineLeads.toString()} icon={Target} trend="Pending" onClick={() => onNavigate?.('client')} />
        <KpiCard title="Friction Alerts" value={frictionAlerts.toString()} icon={AlertTriangle} trend={frictionAlerts > 0 ? "Action Needed" : "Clear"} alert={frictionAlerts > 0} onClick={() => onNavigate?.('client')} />
      </motion.div>

      {/* Distribution & Operations */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-1 space-y-3 md:space-y-4">
          <h3 className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-4">Tier Distribution</h3>
          <Card className="p-5">
            <div className="space-y-4">
              <DistributionRow label="Tier 1 (Enterprise)" value="0" percentage={0} />
              <DistributionRow label="Tier 2 (Growth)" value={data.clients.filter(c => c.tier?.includes('Tier 2')).length} percentage={100} />
              <DistributionRow label="Tier 3 (Incubator)" value="0" percentage={0} />
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-3 md:space-y-4">
          <h3 className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-4">Live Operations</h3>
          <Card className="p-0">
            <div className="divide-y divide-border-dark">
              {data.tasks.slice(0, 4).map((task, idx) => {
                const client = data.clients.find(c => c.id === task.clientId);
                return (
                  <OperationRow
                    key={idx}
                    client={client?.name || 'Unknown'}
                    task={task.name}
                    status={task.status}
                    time="Active"
                    onClick={() => onNavigate?.('fulfillment', client?.id.toString())}
                  />
                );
              })}
              {data.tasks.length === 0 && (
                <div className="p-4 text-center text-sm text-text-muted font-mono">No active operations.</div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Health Matrix & Weekly Snapshot */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4">
          <h3 className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-3 md:mb-4">Health Matrix</h3>
          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card-alt border-b border-border-dark font-mono text-[10px] text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-normal">Client</th>
                  <th className="p-4 font-normal">Health</th>
                  <th className="p-4 font-normal">Last Touch</th>
                  <th className="p-4 font-normal text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {activeClients.map((client, idx) => (
                  <HealthRow
                    key={idx}
                    client={client.name}
                    health={client.relationshipHealth || 'healthy'}
                    touch="Recent"
                    onClick={() => onNavigate?.('client', client.id.toString())}
                  />
                ))}
                {activeClients.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-sm text-text-muted font-mono">No active clients.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[11px] tracking-widest text-text-muted uppercase mb-4">Weekly Snapshot</h3>
          <Card className="p-4 md:p-5 flex gap-6 md:gap-8">
            <div className="flex-1">
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">Content Due</p>
              <p className="font-heading text-4xl text-text-primary">{data.posts.filter(p => p.status !== 'Published').length}</p>
              <p className="text-xs text-text-secondary mt-2">Across active clients</p>
            </div>
            <div className="w-[1px] bg-border-dark" />
            <div className="flex-1">
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">Tasks Due</p>
              <p className="font-heading text-4xl text-text-primary">{data.tasks.filter(t => t.status !== 'Deployed').length}</p>
              <p className="text-xs text-text-secondary mt-2">Pending completion</p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Section 5: System Status Footer */}
      <motion.div variants={item} className="flex flex-wrap gap-4 justify-between items-center pt-6 mt-8 border-t border-border-dark/50">
        <div className="flex gap-6 md:gap-8">
          <div>
            <p className="font-mono text-[9px] text-text-muted tracking-widest uppercase mb-1">Database Integrity</p>
            <p className="font-sans text-xs text-primary font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              100% SECURE
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-text-muted tracking-widest uppercase mb-1">Last Data Sync</p>
            <p className="font-sans text-xs text-text-secondary font-medium">Auto-Saving...</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] text-text-muted tracking-widest uppercase mb-1">Access Level</p>
          <p className="font-sans text-xs text-accent-light font-medium tracking-wide uppercase">CEO FOUNDER</p>
        </div>
      </motion.div>

    </motion.div>
  );
}

// Sub-components for Dashboard

function KpiCard({ title, value, icon: Icon, trend, alert = false, onClick }: any) {
  return (
    <Card accentTop className={`p-4 md:p-5 group ${onClick ? 'cursor-pointer hover:bg-card-alt transition-colors active:scale-[0.98]' : 'cursor-default'}`} onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <p className="font-mono text-[10px] tracking-widest text-text-muted uppercase">{title}</p>
        <Icon size={14} className={`transition-transform duration-300 group-hover:scale-110 ${alert ? 'text-red-500' : 'text-primary'}`} />
      </div>
      <p className="font-heading text-2xl md:text-3xl text-text-primary mb-2">{value}</p>
      <Badge status={alert ? 'critical' : 'healthy'}>{trend}</Badge>
    </Card>
  );
}

function DistributionRow({ label, value, percentage }: any) {
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
        <span className="font-mono text-text-primary">{value}</span>
      </div>
      <div className="h-1 w-full bg-card-alt rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
}

function OperationRow({ client, task, status, time, onClick }: any) {
  return (
    <div
      className="p-4 flex items-center justify-between hover:bg-card-alt transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors shadow-[0_0_8px_rgba(63,106,36,0)] group-hover:shadow-[0_0_8px_rgba(63,106,36,0.8)]" />
        <div>
          <p className="text-sm text-text-primary font-medium group-hover:text-primary transition-colors">{task}</p>
          <p className="text-xs text-text-muted mt-0.5">{client}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge status={status} />
        <span className="font-mono text-[10px] text-text-muted w-16 text-right">{time}</span>
        <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function HealthRow({ client, health, touch, onClick }: any) {
  const healthColors = {
    'healthy': 'bg-primary',
    'at-risk': 'bg-yellow-500',
    'critical': 'bg-red-500'
  };

  return (
    <tr className="hover:bg-card-alt transition-colors group cursor-pointer" onClick={onClick}>
      <td className="p-4 text-sm text-text-primary font-medium group-hover:text-primary transition-colors">{client}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0)] group-hover:shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-shadow ${healthColors[health as keyof typeof healthColors]}`} />
          <span className="text-xs text-text-secondary capitalize">{health.replace('-', ' ')}</span>
        </div>
      </td>
      <td className="p-4 font-mono text-[10px] text-text-muted">{touch}</td>
      <td className="p-4 text-right">
        <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all inline-block" />
      </td>
    </tr>
  );
}
