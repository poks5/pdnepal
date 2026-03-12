import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Weight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const WeightUFTracker: React.FC = () => {
  const { user } = useAuth();
  const [totalUF, setTotalUF] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightTrend, setWeightTrend] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const now = new Date();

      // 24hr UF: 6AM to 6AM cycle
      const endTime = new Date(now);
      endTime.setHours(6, 0, 0, 0);
      if (now.getHours() < 6) endTime.setDate(endTime.getDate() - 1);
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      // Fetch recent exchanges (last 14 days for trend)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: logs } = await supabase
        .from('exchange_logs')
        .select('created_at, ultrafiltration_ml, weight_after_kg, weight_before_kg')
        .eq('patient_id', user.id)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!logs?.length) return;

      // Calculate 24hr UF
      const uf24h = logs
        .filter(l => {
          const t = new Date(l.created_at);
          return t >= startTime && t < endTime;
        })
        .reduce((sum, l) => sum + (l.ultrafiltration_ml || 0), 0);
      setTotalUF(uf24h);

      // Get latest weight
      const latestWithWeight = logs.find(l => l.weight_after_kg != null);
      if (latestWithWeight?.weight_after_kg) {
        setCurrentWeight(Number(latestWithWeight.weight_after_kg));
      }

      // Calculate weekly weight trend
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const thisWeekWeights = logs
        .filter(l => new Date(l.created_at) >= sevenDaysAgo && l.weight_after_kg != null)
        .map(l => Number(l.weight_after_kg));

      const lastWeekWeights = logs
        .filter(l => {
          const d = new Date(l.created_at);
          return d < sevenDaysAgo && l.weight_after_kg != null;
        })
        .map(l => Number(l.weight_after_kg));

      if (thisWeekWeights.length > 0 && lastWeekWeights.length > 0) {
        const thisAvg = thisWeekWeights.reduce((a, b) => a + b, 0) / thisWeekWeights.length;
        const lastAvg = lastWeekWeights.reduce((a, b) => a + b, 0) / lastWeekWeights.length;
        setWeightTrend(Number((thisAvg - lastAvg).toFixed(1)));
      }
    };

    fetchData();

    // Listen for new exchange inserts to refresh
    const channel = supabase
      .channel('weight-uf-tracker')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'exchange_logs',
        filter: `patient_id=eq.${user.id}`,
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const TrendIcon = weightTrend === null || weightTrend === 0
    ? Minus
    : weightTrend < 0
      ? TrendingDown
      : TrendingUp;

  const trendLabel = weightTrend === null
    ? '—'
    : weightTrend === 0
      ? 'No change'
      : `${weightTrend > 0 ? '↑' : '↓'} ${Math.abs(weightTrend)} kg`;

  const items = [
    {
      label: '24hr UF Total',
      value: `${totalUF}ml`,
      sub: '6 AM to 6 AM',
      icon: Droplets,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Current Weight',
      value: currentWeight != null ? `${currentWeight} kg` : '— kg',
      sub: 'Weigh after draining',
      icon: Weight,
      iconBg: 'bg-[hsl(var(--mint))]/10',
      iconColor: 'text-[hsl(var(--mint))]',
    },
    {
      label: 'Trend',
      value: trendLabel,
      sub: 'This week',
      icon: TrendIcon,
      iconBg: 'bg-[hsl(var(--lavender))]/10',
      iconColor: 'text-[hsl(var(--lavender))]',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
        <Card key={label} className="border-border/50 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground/70">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeightUFTracker;
