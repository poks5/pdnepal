import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Droplets, Apple, Moon } from 'lucide-react';
import healthIcons from '@/assets/health-icons.png';

const tips = [
  { icon: '💧', title: 'Stay Hydrated', desc: 'Monitor your fluid intake daily', color: 'bg-[hsl(var(--sky))]/10 border-[hsl(var(--sky))]/20' },
  { icon: '🍎', title: 'Low Potassium', desc: 'Choose low-potassium fruits', color: 'bg-[hsl(var(--mint))]/10 border-[hsl(var(--mint))]/20' },
  { icon: '🌙', title: 'Night Dwell', desc: 'Keep dwell time consistent', color: 'bg-[hsl(var(--lavender))]/10 border-[hsl(var(--lavender))]/20' },
  { icon: '🧼', title: 'Hand Hygiene', desc: 'Wash 20s before exchanges', color: 'bg-[hsl(var(--coral))]/10 border-[hsl(var(--coral))]/20' },
];

const HealthTips: React.FC = () => {
  // Rotate tip based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = tips[dayOfYear % tips.length];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-foreground px-1">💡 Daily Health Tip</h3>
      <Card className={`border ${todayTip.color} shadow-sm`}>
        <CardContent className="p-4 flex items-center gap-4">
          <span className="text-3xl">{todayTip.icon}</span>
          <div>
            <p className="text-sm font-bold text-foreground">{todayTip.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{todayTip.desc}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTips;
