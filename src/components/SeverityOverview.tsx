import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { ScanResult } from '../scanner/types';

interface SeverityOverviewProps {
  counts: ScanResult['counts'];
}

export const SeverityOverview: React.FC<SeverityOverviewProps> = ({ counts }) => {
  const cards = [
    {
      title: 'Critical',
      count: counts.critical,
      color: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      icon: AlertOctagon,
    },
    {
      title: 'High',
      count: counts.high,
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      icon: ShieldAlert,
    },
    {
      title: 'Medium',
      count: counts.medium,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      icon: AlertTriangle,
    },
    {
      title: 'Low / Info',
      count: counts.low + counts.info,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      icon: Info,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`p-5 rounded-2xl border ${card.color} flex items-center justify-between shadow-lg backdrop-blur-md`}>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider opacity-80">{card.title}</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{card.count}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/20">
              <Icon className="w-6 h-6 opacity-90" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
