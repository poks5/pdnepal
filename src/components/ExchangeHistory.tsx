
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Droplets, AlertTriangle, Filter } from 'lucide-react';

interface Exchange {
  id: string;
  date: string;
  time: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  drainVolume: number;
  fillVolume: number;
  ultrafiltration: number;
  clarity: 'clear' | 'cloudy';
  color: 'normal' | 'yellow' | 'red' | 'brown';
  pain: number;
  notes?: string;
}

interface ExchangeHistoryProps {
  exchanges?: Exchange[];
}

const ExchangeHistory: React.FC<ExchangeHistoryProps> = ({ exchanges = [] }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'concerns'>('all');

  console.log('ExchangeHistory: exchanges prop:', exchanges);

  const getExchangeTypeColor = (type: string) => {
    switch (type) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-orange-100 text-orange-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      case 'night': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getColorIndicator = (color: string) => {
    switch (color) {
      case 'normal': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'brown': return 'bg-amber-800';
      default: return 'bg-gray-500';
    }
  };

  const hasConcerns = (exchange: Exchange) => {
    return exchange.clarity === 'cloudy' || 
           exchange.color !== 'normal' || 
           exchange.pain > 3 ||
           exchange.ultrafiltration < -100; // Poor UF
  };

  const filteredExchanges = exchanges.filter(exchange => {
    if (filter === 'concerns') {
      return hasConcerns(exchange);
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Exchange History</span>
            </CardTitle>
            <CardDescription>Your recent dialysis exchanges</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'concerns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('concerns')}
              className="flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Concerns</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredExchanges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'concerns' ? 'No concerning exchanges found' : 'No exchanges recorded yet'}
            </div>
          ) : (
            filteredExchanges.map((exchange) => (
              <div
                key={exchange.id}
                className={`p-4 rounded-lg border-2 ${
                  hasConcerns(exchange) ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge className={getExchangeTypeColor(exchange.type)}>
                      {t(exchange.type)}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{exchange.time}</span>
                    </div>
                    <span className="text-sm text-gray-500">{exchange.date}</span>
                  </div>
                  {hasConcerns(exchange) && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Drain:</span>
                    <span className="ml-1 font-medium">{exchange.drainVolume}ml</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Fill:</span>
                    <span className="ml-1 font-medium">{exchange.fillVolume}ml</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">UF:</span>
                    <span className={`ml-1 font-medium ${exchange.ultrafiltration >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {exchange.ultrafiltration > 0 ? '+' : ''}{exchange.ultrafiltration}ml
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Pain:</span>
                    <span className={`ml-1 font-medium ${exchange.pain > 3 ? 'text-red-600' : 'text-green-600'}`}>
                      {exchange.pain}/10
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Clarity:</span>
                    <Badge variant={exchange.clarity === 'clear' ? 'default' : 'destructive'}>
                      {t(exchange.clarity)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Color:</span>
                    <div className={`w-3 h-3 rounded-full ${getColorIndicator(exchange.color)}`} />
                    <span className="text-sm">{exchange.color}</span>
                  </div>
                </div>

                {exchange.notes && (
                  <div className="mt-2 p-2 bg-white rounded text-sm">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1">{exchange.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeHistory;
