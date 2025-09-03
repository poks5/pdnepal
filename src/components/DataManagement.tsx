
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Trash2, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersistence } from '@/hooks/usePersistence';

const DataManagement: React.FC = () => {
  const { toast } = useToast();
  const { loadData, clearData, exportData, importData } = usePersistence();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const persistedData = loadData();
  const dataSize = JSON.stringify(persistedData).length;
  const formattedSize = (dataSize / 1024).toFixed(2) + ' KB';

  const handleExport = () => {
    try {
      const dataString = exportData();
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pd-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Data exported successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        if (success) {
          toast({
            title: "Import Successful",
            description: "Data imported successfully. Please refresh the page."
          });
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    try {
      clearData();
      setShowClearConfirm(false);
      toast({
        title: "Data Cleared",
        description: "All local data has been cleared. Please refresh the page."
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data",
        variant: "destructive"
      });
    }
  };

  const getDataStats = () => {
    const stats = {
      patients: persistedData.patientData ? 1 : 0,
      exchanges: persistedData.exchangeLogs?.length || 0,
      labResults: persistedData.labData?.length || 0,
      plans: persistedData.exchangePlans?.length || 0
    };
    return stats;
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Management</h2>
        <p className="text-gray-600">Manage your application data and backups</p>
      </div>

      {/* Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Status</span>
          </CardTitle>
          <CardDescription>Current local data storage information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.patients}</p>
              <p className="text-sm text-gray-600">Patient Profiles</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.exchanges}</p>
              <p className="text-sm text-gray-600">Exchange Logs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.labResults}</p>
              <p className="text-sm text-gray-600">Lab Results</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.plans}</p>
              <p className="text-sm text-gray-600">Exchange Plans</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Data Size: {formattedSize}</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Local Storage Active
            </Badge>
          </div>
          
          {persistedData.lastSaved && (
            <p className="text-xs text-gray-500 mt-2">
              Last saved: {new Date(persistedData.lastSaved).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Data Actions</CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button 
                variant="outline" 
                className="w-full flex items-center space-x-2"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </Button>
            </div>
            
            {!showClearConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">Confirm deletion?</p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleClearData}
                  >
                    Yes, Clear
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Migration Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <span>Future Database Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            Currently using local storage for data persistence. When you're ready to scale, 
            this data can be easily migrated to a cloud database like Supabase for multi-device 
            sync and better reliability.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
