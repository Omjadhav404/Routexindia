import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'cyan' | 'purple' | 'none';
  hoverable?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  hoverable = false,
  onClick,
}) => {
  const glowStyles = {
    blue: 'shadow-[0_0_20px_rgba(37,99,235,0.08)] border-blue-900/30',
    cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.08)] border-cyan-900/30',
    purple: 'shadow-[0_0_20px_rgba(139,92,246,0.08)] border-purple-900/30',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 border border-border/60 overflow-hidden relative ${
        glowStyles[glowColor]
      } ${
        hoverable ? 'glass-panel-hover cursor-pointer' : ''
      } ${className}`}
    >
      {/* Background radial glows for visual flair */}
      {glowColor === 'blue' && (
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
      )}
      {glowColor === 'cyan' && (
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
      )}
      {glowColor === 'purple' && (
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
