import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  className?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-mono text-[10px] tracking-widest text-text-muted uppercase">
        {label}
      </label>
      <input
        className="w-full bg-card-alt border border-border-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(63,106,36,0.15)] transition-all duration-300 rounded-sm"
        {...props}
      />
    </div>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  className?: string;
};

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-mono text-[10px] tracking-widest text-text-muted uppercase">
        {label}
      </label>
      <textarea
        className="w-full bg-card-alt border border-border-dark px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(63,106,36,0.15)] transition-all duration-300 rounded-sm min-h-[100px] resize-y custom-scrollbar"
        {...props}
      />
    </div>
  );
}
