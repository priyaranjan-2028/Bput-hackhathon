import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode | LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  badgeText?: string;
  badgeColor?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'text-navy-600',
  iconBg = 'bg-navy-50',
  trend,
  badgeText,
  badgeColor = 'info',
  className = ''
}: KPICardProps) {
  // Render icon whether passed as component or JSX element
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      const IconComp = icon as LucideIcon;
      return <IconComp size={20} className={iconColor} />;
    }
    return null;
  };

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'danger':
        return 'bg-rose-100 text-rose-800';
      case 'info':
      default:
        return 'bg-navy-100 text-navy-800';
    }
  };

  return (
    <div className={`kpi-card p-5 bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">{title}</p>
            {badgeText && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeClass()}`}>
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-navy-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-esg-600' : 'text-red-600'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-navy-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 text-navy-700`}>
          {renderIcon()}
        </div>
      </div>
    </div>
  );
}
