
import React from 'react';
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'panel' | 'transparent' | 'subtle';
  glowEffect?: boolean;
  className?: string;
}

export const GlassCard = ({
  children,
  variant = 'default',
  glowEffect = false,
  className,
  ...props
}: GlassCardProps) => {
  const baseStyles = "rounded-xl transition-all duration-300";
  
  const variantStyles = {
    default: "bg-white/50 backdrop-blur-md border border-white/40 shadow-md",
    panel: "bg-white/30 backdrop-blur-lg border border-white/30 shadow-sm",
    transparent: "bg-white/10 backdrop-blur-md border border-white/20",
    subtle: "bg-white/20 backdrop-blur-sm border border-white/10",
  };
  
  const glowClass = glowEffect ? "glow-sm" : "";
  
  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], glowClass, className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardHeader = ({
  children,
  className,
  ...props
}: GlassCardHeaderProps) => {
  return (
    <div 
      className={cn("px-6 py-4 border-b border-white/20", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardContent = ({
  children,
  className,
  ...props
}: GlassCardContentProps) => {
  return (
    <div 
      className={cn("px-6 py-4", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardFooter = ({
  children,
  className,
  ...props
}: GlassCardFooterProps) => {
  return (
    <div 
      className={cn("px-6 py-4 border-t border-white/20", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
