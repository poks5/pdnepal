
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Thermometer, Heart, Activity } from 'lucide-react';

interface SymptomEntry {
  id: string;
  timestamp: string;
  symptoms: {
    pain: number;
    nausea: number;
    fatigue: number;
    breathlessness: number;
    fever: boolean;
    temperature?: number;
  };
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

const SymptomTracker: React.FC = () => {
  const { toast } = useToast();
  const [currentSymptoms, setCurrentSymptoms] = useState({
    pain: 0,
    nausea: 0,
    fatigue: 0,
    breathlessness: 0,
    fever: false,
    temperature: 0
  });
  const [notes, setNotes] = useState('');
  const [symptomHistory, setSymptomHistory] = useState<SymptomEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      symptoms: { pain: 3, nausea: 1, fatigue: 4, breathlessness: 2, fever: false },
      severity: 'mild',
      notes: 'Mild discomfort after morning exchange'
    }
  ]);

  const calculateOverallSeverity = (symptoms: typeof currentSymptoms): 'mild' | 'moderate' | 'severe' => {
    const maxScore = Math.max(symptoms.pain, symptoms.nausea, symptoms.fatigue, symptoms.breathlessness);
    const avgScore = (symptoms.pain + symptoms.nausea + symptoms.fatigue + symptoms.breathlessness) / 4;
    
    if (symptoms.fever || maxScore >= 8 || avgScore >= 6) return 'severe';
    if (maxScore >= 5 || avgScore >= 3) return 'moderate';
    return 'mild';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const logSymptoms = () => {
    const entry: SymptomEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      symptoms: { ...currentSymptoms },
      severity: calculateOverallSeverity(currentSymptoms),
      notes
    };

    setSymptomHistory(prev => [entry, ...prev]);
    
    // Reset form
    setCurrentSymptoms({
      pain: 0,
      nausea: 0,
      fatigue: 0,
      breathlessness: 0,
      fever: false,
      temperature: 0
    });
    setNotes('');

    const severity = entry.severity;
    toast({
      title: "Symptoms Logged",
      description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} symptoms recorded.`,
      variant: severity === 'severe' ? 'destructive' : 'default'
    });

    // Alert for severe symptoms
    if (severity === 'severe') {
      toast({
        title: "High Severity Alert",
        description: "Consider contacting your healthcare provider.",
        variant: "destructive"
      });
    }
  };

  const getRecommendation = (severity: string, symptoms: typeof currentSymptoms) => {
    if (severity === 'severe' || symptoms.fever) {
      return "Contact your healthcare provider immediately. These symptoms may indicate a serious complication.";
    }
    if (severity === 'moderate') {
      return "Monitor symptoms closely. Consider contacting your healthcare provider if symptoms persist or worsen.";
    }
    return "Continue normal care routine. Log any changes in symptoms.";
  };

  const currentSeverity = calculateOverallSeverity(currentSymptoms);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Symptom Tracker</h2>
        <p className="text-gray-600">Track and score symptoms with visual severity indicators</p>
      </div>

      {/* Current Symptom Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Symptom Assessment</CardTitle>
            <Badge className={getSeverityColor(currentSeverity)}>
              {currentSeverity.charAt(0).toUpperCase() + currentSeverity.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pain Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Abdominal Pain</label>
                <span className={`text-lg font-bold ${getScoreColor(currentSymptoms.pain)}`}>
                  {currentSymptoms.pain}/10
                </span>
              </div>
              <Slider
                value={[currentSymptoms.pain]}
                onValueChange={(value) => setCurrentSymptoms(prev => ({ ...prev, pain: value[0] }))}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>No Pain</span>
                <span>Severe Pain</span>
              </div>
            </div>

            {/* Nausea Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Nausea</label>
                <span className={`text-lg font-bold ${getScoreColor(currentSymptoms.nausea)}`}>
                  {currentSymptoms.nausea}/10
                </span>
              </div>
              <Slider
                value={[currentSymptoms.nausea]}
                onValueChange={(value) => setCurrentSymptoms(prev => ({ ...prev, nausea: value[0] }))}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fatigue Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Fatigue</label>
                <span className={`text-lg font-bold ${getScoreColor(currentSymptoms.fatigue)}`}>
                  {currentSymptoms.fatigue}/10
                </span>
              </div>
              <Slider
                value={[currentSymptoms.fatigue]}
                onValueChange={(value) => setCurrentSymptoms(prev => ({ ...prev, fatigue: value[0] }))}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Breathlessness Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Shortness of Breath</label>
                <span className={`text-lg font-bold ${getScoreColor(currentSymptoms.breathlessness)}`}>
                  {currentSymptoms.breathlessness}/10
                </span>
              </div>
              <Slider
                value={[currentSymptoms.breathlessness]}
                onValueChange={(value) => setCurrentSymptoms(prev => ({ ...prev, breathlessness: value[0] }))}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fever Check */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fever"
                  checked={currentSymptoms.fever}
                  onChange={(e) => setCurrentSymptoms(prev => ({ ...prev, fever: e.target.checked }))}
                />
                <label htmlFor="fever" className="text-sm font-medium">Fever</label>
              </div>
              {currentSymptoms.fever && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temperature °F"
                    value={currentSymptoms.temperature}
                    onChange={(e) => setCurrentSymptoms(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-32 p-1 border rounded"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any additional symptoms or observations..."
                rows={3}
              />
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Recommendation</h4>
              <p className="text-sm text-blue-700">{getRecommendation(currentSeverity, currentSymptoms)}</p>
            </div>

            <Button onClick={logSymptoms} className="w-full">
              Log Symptoms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Symptom History */}
      <Card>
        <CardHeader>
          <CardTitle>Symptom History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {symptomHistory.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <Badge className={getSeverityColor(entry.severity)}>
                    {entry.severity}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Pain: {entry.symptoms.pain}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Nausea: {entry.symptoms.nausea}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Fatigue: {entry.symptoms.fatigue}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Breathless: {entry.symptoms.breathlessness}/10</span>
                  </div>
                </div>
                
                {entry.symptoms.fever && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Fever reported</span>
                    {entry.symptoms.temperature && (
                      <span className="text-sm">({entry.symptoms.temperature}°F)</span>
                    )}
                  </div>
                )}
                
                {entry.notes && (
                  <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
