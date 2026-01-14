import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: 'blue' | 'green' | 'red' | 'gold' | 'orange' | 'purple';
    description?: string;
    trend?: string;
    className?: string;
  }

  export function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    variant = 'blue', 
    description,
    trend,
    className 
  }: StatCardProps) {
    const variantClasses = {
      blue: 'stat-card-blue text-secondary',
      green: 'stat-card-green text-success',
      red: 'stat-card-red text-dojo-red',
      gold: 'stat-card-gold text-neon-gold',
      orange: 'stat-card-orange text-neon-orange',
      purple: 'stat-card-purple text-dojo-purple',
    };

    const iconBgClasses = {
      blue: 'bg-secondary/10',
      green: 'bg-success/10',
      red: 'bg-dojo-red/10',
      gold: 'bg-neon-gold/10',
      orange: 'bg-neon-orange/10',
      purple: 'bg-dojo-purple/10',
    };

    return (
      <div className={cn('stat-card group', variantClasses[variant] || variantClasses.blue, className)}>
        <div className="flex justify-between items-start">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-[10px] sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
            </div>
              {description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{description}</p>
              )}
              {trend && (
                <p className={cn(
                  "text-[10px] sm:text-xs font-bold mt-1",
                  trend.toLowerCase().includes('action') || trend.toLowerCase().includes('low') ? "text-rose-500" : "text-emerald-500"
                )}>{trend}</p>
              )}
            </div>
          <div className={cn(
            "p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
            iconBgClasses[variant] || iconBgClasses.blue
          )}>
            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className={cn(
          "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-10",
          (iconBgClasses[variant] || iconBgClasses.blue).replace('/10', '/40')
        )} />
      </div>
    );
}
