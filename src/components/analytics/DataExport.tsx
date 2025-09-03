
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Mail, Share2, Calendar } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';

const DataExport: React.FC = () => {
  const { exportPatientData } = usePatient();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const generateCSVData = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (exportType: string, description: string) => {
    setIsExporting(exportType);
    
    try {
      const patientData = exportPatientData();
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (exportType) {
        case 'exchanges_csv':
          const exchangeHeaders = ['timestamp', 'drainVolume', 'fillVolume', 'ultrafiltration', 'clarity', 'painLevel', 'exchangeType'];
          const csvContent = generateCSVData(patientData.exchangeLogs || [], exchangeHeaders);
          downloadFile(csvContent, `exchanges_${timestamp}.csv`, 'text/csv');
          break;
          
        case 'monthly_report':
          const reportData = {
            patient: patientData.patientProfile,
            summary: {
              totalExchanges: patientData.exchangeLogs?.length || 0,
              averageUF: patientData.exchangeLogs?.reduce((sum: number, log: any) => sum + log.ultrafiltration, 0) / (patientData.exchangeLogs?.length || 1),
              exportDate: new Date().toISOString()
            },
            exchanges: patientData.exchangeLogs
          };
          downloadFile(JSON.stringify(reportData, null, 2), `monthly_report_${timestamp}.json`, 'application/json');
          break;
          
        case 'healthcare_summary':
          const healthcareSummary = {
            patientInfo: {
              name: patientData.patientProfile?.name,
              dateOfBirth: patientData.patientProfile?.dateOfBirth,
              diagnosis: patientData.patientProfile?.diagnosis
            },
            treatmentSummary: {
              mode: patientData.pdSettings?.mode,
              exchangesPerDay: patientData.pdSettings?.exchangesPerDay,
              lastMonth: patientData.exchangeLogs?.slice(0, 30)
            },
            complications: [], // Would be populated from actual complications data
            recommendations: ['Regular monitoring of UF trends', 'Maintain aseptic technique']
          };
          downloadFile(JSON.stringify(healthcareSummary, null, 2), `healthcare_summary_${timestamp}.json`, 'application/json');
          break;
      }
      
      toast({
        title: "Export Complete",
        description: `${description} has been downloaded successfully.`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(null);
    }
  };

  const shareViaEmail = () => {
    const patientData = exportPatientData();
    const subject = "PD Treatment Data Summary";
    const body = `Please find my peritoneal dialysis treatment summary:

Patient: ${patientData.patientProfile?.name}
Total Exchanges Recorded: ${patientData.exchangeLogs?.length || 0}
Date Range: Last 30 days

This data was exported from my PD tracking application.`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const exportOptions = [
    {
      id: 'exchanges_csv',
      title: 'Exchange Logs (CSV)',
      description: 'Detailed exchange data for analysis',
      icon: <FileText className="w-5 h-5" />,
      badge: 'CSV',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'monthly_report',
      title: 'Monthly Report',
      description: 'Comprehensive monthly summary',
      icon: <Calendar className="w-5 h-5" />,
      badge: 'JSON',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'healthcare_summary',
      title: 'Healthcare Provider Summary',
      description: 'Clinical summary for medical consultations',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Medical',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Export</h2>
        <p className="text-gray-600">Export your treatment data for healthcare providers and analysis</p>
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
              <p className="text-sm text-gray-600">{option.description}</p>
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
                    Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Share</CardTitle>
          <p className="text-sm text-gray-600">Share data summary with healthcare providers</p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email Summary
            </Button>
            <Button variant="outline" onClick={() => {
              navigator.share?.({
                title: 'PD Treatment Data',
                text: 'Sharing my peritoneal dialysis treatment summary'
              }).catch(() => {
                toast({
                  title: "Share not supported",
                  description: "Use the email option to share your data."
                });
              });
            }}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;
