
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Database, HardDrive, Download, Upload, RefreshCw, Trash2, Archive, AlertTriangle } from 'lucide-react';

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastUpdated: Date;
  status: 'healthy' | 'warning' | 'error';
}

interface BackupInfo {
  id: string;
  date: Date;
  size: string;
  type: 'full' | 'incremental' | 'manual';
  status: 'completed' | 'running' | 'failed';
}

const DatabaseAdmin: React.FC = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  const [tables] = useState<DatabaseTable[]>([
    {
      name: 'users',
      rows: 1247,
      size: '2.4 MB',
      lastUpdated: new Date('2024-01-15T10:30:00'),
      status: 'healthy'
    },
    {
      name: 'patients',
      rows: 856,
      size: '15.2 MB',
      lastUpdated: new Date('2024-01-15T10:25:00'),
      status: 'healthy'
    },
    {
      name: 'exchanges',
      rows: 12456,
      size: '45.8 MB',
      lastUpdated: new Date('2024-01-15T10:35:00'),
      status: 'healthy'
    },
    {
      name: 'lab_results',
      rows: 3421,
      size: '8.7 MB',
      lastUpdated: new Date('2024-01-15T09:45:00'),
      status: 'warning'
    },
    {
      name: 'alerts',
      rows: 789,
      size: '1.2 MB',
      lastUpdated: new Date('2024-01-15T10:40:00'),
      status: 'healthy'
    }
  ]);

  const [backups] = useState<BackupInfo[]>([
    {
      id: '1',
      date: new Date('2024-01-15T02:00:00'),
      size: '156.2 MB',
      type: 'full',
      status: 'completed'
    },
    {
      id: '2',
      date: new Date('2024-01-14T02:00:00'),
      size: '145.8 MB',
      type: 'full',
      status: 'completed'
    },
    {
      id: '3',
      date: new Date('2024-01-13T14:30:00'),
      size: '12.4 MB',
      type: 'incremental',
      status: 'completed'
    },
    {
      id: '4',
      date: new Date('2024-01-12T02:00:00'),
      size: '142.1 MB',
      type: 'full',
      status: 'completed'
    }
  ]);

  const databaseStats = {
    totalSize: '234.5 MB',
    totalRows: tables.reduce((sum, table) => sum + table.rows, 0),
    lastBackup: backups[0]?.date,
    storageUsed: 67, // percentage
    performance: 'excellent'
  };

  const handleBackup = async (type: 'full' | 'incremental') => {
    setIsBackingUp(true);
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Backup Completed",
      description: `${type === 'full' ? 'Full' : 'Incremental'} backup has been completed successfully`
    });
    
    setIsBackingUp(false);
  };

  const handleOptimize = async (tableName: string) => {
    toast({
      title: "Table Optimization Started",
      description: `Optimizing table ${tableName}...`
    });
    
    // Simulate optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Table Optimized",
      description: `Table ${tableName} has been optimized successfully`
    });
  };

  const getStatusColor = (status: DatabaseTable['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackupStatusColor = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Administration</h2>
          <p className="text-gray-600">Manage database operations, backups, and maintenance</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => handleBackup('incremental')}
            disabled={isBackingUp}
          >
            <Archive className="w-4 h-4 mr-2" />
            Quick Backup
          </Button>
          <Button 
            onClick={() => handleBackup('full')}
            disabled={isBackingUp}
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Backing up...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Full Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">{databaseStats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{databaseStats.totalRows.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Archive className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-lg font-bold">
                  {databaseStats.lastBackup?.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-sm font-medium">{databaseStats.storageUsed}%</p>
              </div>
              <Progress value={databaseStats.storageUsed} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">Database Tables</TabsTrigger>
          <TabsTrigger value="backups">Backup Management</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="monitoring">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Overview of all database tables and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>{table.rows.toLocaleString()}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{table.lastUpdated.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(table.status)}>
                          {table.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOptimize(table.name)}
                          >
                            Optimize
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <div className="space-y-6">
            {/* Backup Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Backup Operations</CardTitle>
                <CardDescription>Create and manage database backups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button onClick={() => handleBackup('full')} disabled={isBackingUp}>
                    <Database className="w-4 h-4 mr-2" />
                    Full Backup
                  </Button>
                  <Button variant="outline" onClick={() => handleBackup('incremental')} disabled={isBackingUp}>
                    <Archive className="w-4 h-4 mr-2" />
                    Incremental Backup
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>Recent database backups</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>{backup.date.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {backup.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          <Badge className={getBackupStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              Restore
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
                <CardDescription>Automated maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Daily Backup</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekly Optimization</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Cleanup</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Index Rebuild</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Maintenance</CardTitle>
                <CardDescription>On-demand maintenance operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rebuild Indexes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Temp Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Analyze Tables
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Old Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Database performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Query Performance</span>
                      <span className="text-sm font-medium">Excellent</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Connection Pool</span>
                      <span className="text-sm font-medium">45/100</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Cache Hit Ratio</span>
                      <span className="text-sm font-medium">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Database health alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">lab_results table needs optimization</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-sm">All connections healthy</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <Archive className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Backup completed successfully</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseAdmin;
