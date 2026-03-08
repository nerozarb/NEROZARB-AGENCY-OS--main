import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

interface LoginViewProps {
  onLogin: (level: 'ceo' | 'team') => void;
  onReset: () => void;
}

export default function LoginView({ onLogin, onReset }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetClicks, setResetClicks] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If invalid credentials, attempt to sign up automatically
      if (authResponse.error && authResponse.error.message === 'Invalid login credentials') {
        setError('Account not found, creating new secure instance...');
        authResponse = await supabase.auth.signUp({
          email,
          password
        });

        if (!authResponse.error && authResponse.data.user) {
          setError('Instance created. Awaiting manual activation if email confirmation is enabled, otherwise logging in...');
        }
      }

      if (authResponse.error) throw authResponse.error;

      if (authResponse.data.user) {
        onLogin('ceo'); // Could be mapped based on user metadata later
      }

    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <div className="text-center mb-16 select-none" onClick={() => setResetClicks(prev => prev + 1)}>
          <h1 className="font-heading text-6xl tracking-[-0.05em] text-text-primary mb-4 font-black cursor-pointer">NEROZARB</h1>
          <div className="flex items-center justify-center gap-4 text-text-muted font-mono text-[9px] tracking-[0.4em] uppercase">
            <span>[ EST. 2026 ]</span>
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
            <span>[ SECURE SYSTEM ]</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs relative flex flex-col items-center space-y-4">
          <motion.div
            animate={error && !error.includes('creating') ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 }
            } : {}}
            className="relative w-full"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS"
              className={`w-full bg-transparent border-b ${error && !error.includes('creating') ? 'border-red-500' : 'border-border-dark'} py-4 text-center font-mono text-sm tracking-[0.2em] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary transition-colors`}
              required
              autoFocus
            />
          </motion.div>

          <motion.div
            animate={error && !error.includes('creating') ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 }
            } : {}}
            className="relative w-full"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              className={`w-full bg-transparent border-b ${error && !error.includes('creating') ? 'border-red-500' : 'border-border-dark'} py-4 text-center font-mono text-sm tracking-[0.2em] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary transition-colors`}
              required
            />
          </motion.div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full bg-primary hover:bg-accent-mid disabled:opacity-50 text-text-primary font-mono text-xs py-3 tracking-[0.2em] transition-colors uppercase disabled:cursor-not-allowed"
          >
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute -bottom-10 left-0 right-0 text-center font-mono text-[10px] tracking-widest uppercase line-clamp-2 ${error.includes('creating') || error.includes('created') ? 'text-primary' : 'text-red-500'}`}
              >
                [ {error} ]
              </motion.p>
            )}
          </AnimatePresence>

          {resetClicks >= 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              type="button"
              onClick={onReset}
              className="mt-12 text-[10px] font-mono text-primary hover:text-white transition-colors tracking-[0.3em] uppercase underline underline-offset-4"
            >
              [ EMERGENCY SYSTEM RESET ]
            </motion.button>
          )}
        </form>
      </motion.div>
    </div>
  );
}

