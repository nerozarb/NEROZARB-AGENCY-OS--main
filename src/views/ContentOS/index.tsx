import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { Calendar as CalendarIcon, KanbanSquare, CalendarDays, List, Plus, ClipboardList } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Post } from '../../utils/storage';
import MonthlyView from './MonthlyView';
import WeeklyView from './WeeklyView';
import PostListView from './PostListView';
import PostPipelineView from './PostPipelineView';
import NewPostModal from './NewPostModal';
import PostDetailModal from './PostDetailModal';
import MonthlyPlannerModal from './MonthlyPlannerModal';

type ViewMode = 'monthly' | 'weekly' | 'list' | 'pipeline';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function ContentOS({ onNavigate }: { onNavigate?: (view: string, id?: string) => void }) {
  const { data } = useAppData();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [clientFilter, setClientFilter] = useState<number | 'all'>('all');

  // Separate states for new post modal and detail modal
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  // Open new post form, optionally with a pre-filled date
  const handleOpenNewPost = (date: string | null = null) => {
    setPrefilledDate(date);
    setIsNewPostModalOpen(true);
  };

  // Open post detail modal
  const handleOpenPostDetail = (post: Post) => {
    setSelectedPost(post);
  };

  // Filter posts based on client selection
  const viewPosts = useMemo(() => {
    return data.posts.filter(p => clientFilter === 'all' || p.clientId === clientFilter);
  }, [data.posts, clientFilter]);

  // Only show active sprint or retainer clients in the dropdown
  const activeClients = useMemo(() => {
    return data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer');
  }, [data.clients]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="p-4 md:p-8 w-full max-w-[1800px] mx-auto space-y-4 md:space-y-8 min-h-full flex flex-col"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 flex-shrink-0">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl tracking-tighter text-text-primary">CONTENT OS</h2>
          <p className="font-mono text-[10px] md:text-xs tracking-widest text-text-muted mt-1 uppercase">Global Content Engine</p>
        </div>

        <div className="flex items-center gap-2 md:gap-6 overflow-x-auto pb-1 scroll-touch">
          {/* Client Selector */}
          <div className="flex bg-card  rounded-sm p-1 text-sm">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-text-muted border-none outline-none cursor-pointer py-1 px-2 hover:text-text-primary transition-colors"
            >
              <option value="all">ALL CLIENTS</option>
              {activeClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {clientFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setIsPlannerModalOpen(true)} className="whitespace-nowrap">
              <ClipboardList size={14} />
              <span className="hidden sm:inline">PLAN MONTH</span>
              <span className="sm:hidden">PLAN</span>
            </Button>
          )}

          {/* View Toggles */}
          <div className="flex bg-card  rounded-sm p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'monthly' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="Monthly View"
            >
              <CalendarIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'weekly' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="Weekly View"
            >
              <CalendarDays size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'pipeline' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="Pipeline View"
            >
              <KanbanSquare size={16} />
            </button>
          </div>

          <Button size="sm" onClick={() => handleOpenNewPost()} className="whitespace-nowrap">
            <Plus size={14} />
            <span className="hidden sm:inline">NEW POST</span>
            <span className="sm:hidden">+ NEW</span>
          </Button>
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 flex flex-col">
        {viewMode === 'monthly' && (
          <MonthlyView
            posts={viewPosts}
            clients={data.clients}
            onPostClick={handleOpenPostDetail}
            onAddPost={(date) => handleOpenNewPost(date)}
          />
        )}
        {viewMode === 'weekly' && (
          <WeeklyView
            posts={viewPosts}
            clients={data.clients}
            onPostClick={handleOpenPostDetail}
          />
        )}
        {viewMode === 'list' && (
          <PostListView
            posts={viewPosts}
            clients={data.clients}
            onPostClick={handleOpenPostDetail}
          />
        )}
        {viewMode === 'pipeline' && (
          <PostPipelineView
            posts={viewPosts}
            clients={data.clients}
            onPostClick={handleOpenPostDetail}
          />
        )}
      </motion.div>

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        prefilledDate={prefilledDate}
      />

      {/* Monthly Planner Modal */}
      <MonthlyPlannerModal
        isOpen={isPlannerModalOpen}
        onClose={() => setIsPlannerModalOpen(false)}
        clientId={clientFilter !== 'all' ? clientFilter : null}
        onNavigate={onNavigate}
      />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onNavigate={onNavigate}
        />
      )}

    </motion.div>
  );
}
