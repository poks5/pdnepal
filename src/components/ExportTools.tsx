
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Calendar, Users, Droplets, AlertTriangle } from 'lucide-react';

const ExportTools: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: string, description: string) => {
    setIsExporting(type);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would generate and download the actual file
    const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    toast({
      title: "Export Complete",
      description: `${description} has been exported as ${filename}`
    });
    
    setIsExporting(null);
  };

  const exportOptions = [
    {
      id: 'patient_data',
      title: 'Patient Data Export',
      description: 'Complete patient information including demographics, treatment plans, and contact details',
      icon: <Users className="w-5 h-5" />,
      badge: 'Demographics',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'exchange_logs',
      title: 'Exchange Logs Export',
      description: 'Detailed dialysis exchange records including volumes, UF rates, and fluid clarity',
      icon: <Droplets className="w-5 h-5" />,
      badge: 'Exchanges',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'lab_results',
      title: 'Laboratory Results Export',
      description: 'Comprehensive lab data including blood chemistry, hematology, and hormone levels',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Lab Data',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'complications',
      title: 'Complications & Alerts Export',
      description: 'Medical complications, alerts, and adverse events with severity levels',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: 'Clinical',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'adherence_report',
      title: 'Adherence Report Export',
      description: 'Patient compliance metrics, missed exchanges, and treatment adherence statistics',
      icon: <Calendar className="w-5 h-5" />,
      badge: 'Adherence',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'monthly_summary',
      title: 'Monthly Summary Report',
      description: 'Comprehensive monthly report including all patient metrics and clinical outcomes',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Summary',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Tools</h2>
        <p className="text-gray-600">Export patient data and reports for analysis and documentation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => (
          <Card key={option.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
                <Badge className={option.color}>
                  {option.badge}
                </Badge>
              </div>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleExport(option.id, option.title)}
                disabled={isExporting === option.id}
                className="w-full"
              >
                {isExporting === option.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
          <CardDescription>Common export formats for immediate use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExport('all_patients', 'All Patient Data')}
              disabled={isExporting === 'all_patients'}
            >
              {isExporting === 'all_patients' ? 'Exporting...' : 'All Patients (CSV)'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('recent_labs', 'Recent Lab Results')}
              disabled={isExporting === 'recent_labs'}
            >
              {isExporting === 'recent_labs' ? 'Exporting...' : 'Recent Labs (CSV)'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('active_alerts', 'Active Alerts')}
              disabled={isExporting === 'active_alerts'}
            >
              {isExporting === 'active_alerts' ? 'Exporting...' : 'Active Alerts (PDF)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Configure export preferences and formatting options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last 6 months</option>
                  <option>Last year</option>
                  <option>All time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File Format</label>
                <select className="w-full p-2 border rounded-md">
                  <option>CSV (Comma Separated)</option>
                  <option>Excel (.xlsx)</option>
                  <option>PDF Report</option>
                  <option>JSON Data</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Include patient identifiers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Include lab reference ranges</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span className="text-sm">Anonymize patient data</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportTools;
