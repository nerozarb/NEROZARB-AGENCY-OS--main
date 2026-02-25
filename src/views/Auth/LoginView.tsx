import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hashPassphrase } from '../../utils/storage';

interface LoginViewProps {
  onLogin: (level: 'ceo' | 'team') => void;
  ceoHash: string;
  teamHash: string;
}

export default function LoginView({ onLogin, ceoHash, teamHash }: LoginViewProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hash = hashPassphrase(passphrase);

    if (hash === ceoHash) {
      onLogin('ceo');
    } else if (hash === teamHash) {
      onLogin('team');
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => setError(false), 800);
      setPassphrase('');
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
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl tracking-[-0.05em] text-text-primary mb-4 font-black">NEROZARB</h1>
          <div className="flex items-center justify-center gap-4 text-text-muted font-mono text-[9px] tracking-[0.4em] uppercase">
            <span>[ EST. 2026 ]</span>
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
            <span>[ SYSTEM: OFFLINE &rarr; INITIALIZING ]</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs relative flex flex-col items-center">
          <motion.div
            animate={error ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 }
            } : {}}
            className="relative w-full"
          >
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="ENTER PASSPHRASE"
              className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-border-dark'} py-4 text-center font-mono text-sm tracking-[0.5em] text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary transition-colors`}
              autoFocus
            />
          </motion.div>
          <button
            type="submit"
            className="mt-8 w-full bg-primary hover:bg-accent-mid text-text-primary font-mono text-xs py-3 tracking-[0.2em] transition-colors uppercase"
          >
            AUTHENTICATE
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-10 left-0 right-0 text-center font-mono text-[10px] text-red-500 tracking-widest uppercase"
              >
                [ ACCESS DENIED ]
              </motion.p>
            )}
          </AnimatePresence>

          {attempts >= 3 && !error && (
            <p className="absolute -bottom-10 left-0 right-0 text-center font-mono text-[10px] text-text-muted tracking-widest uppercase">
              Contact Lead System Architect
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

