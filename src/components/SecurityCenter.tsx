
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, Lock, Activity, UserX, Clock, Globe } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login_failed' | 'login_success' | 'password_change' | 'account_locked' | 'suspicious_activity';
  user: string;
  email: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

const SecurityCenter: React.FC = () => {
  const { toast } = useToast();
  
  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login_failed',
      user: 'Unknown',
      email: 'admin@test.com',
      timestamp: new Date('2024-01-15T10:30:00'),
      ipAddress: '192.168.1.100',
      location: 'Kathmandu, Nepal',
      severity: 'medium',
      details: 'Multiple failed login attempts'
    },
    {
      id: '2',
      type: 'login_success',
      user: 'Dr. Pramod Sharma',
      email: 'pramod@hospital.com',
      timestamp: new Date('2024-01-15T09:15:00'),
      ipAddress: '10.0.0.50',
      location: 'Kathmandu, Nepal',
      severity: 'low',
      details: 'Successful login from new device'
    },
    {
      id: '3',
      type: 'suspicious_activity',
      user: 'Maya Thapa',
      email: 'maya@email.com',
      timestamp: new Date('2024-01-15T08:45:00'),
      ipAddress: '203.100.15.20',
      location: 'Unknown',
      severity: 'high',
      details: 'Access attempt from unusual location'
    },
    {
      id: '4',
      type: 'password_change',
      user: 'Ram Bahadur',
      email: 'ram@email.com',
      timestamp: new Date('2024-01-14T16:20:00'),
      ipAddress: '192.168.1.25',
      location: 'Pokhara, Nepal',
      severity: 'low',
      details: 'Password changed successfully'
    }
  ]);

  const securityStats = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    highSeverity: securityEvents.filter(e => e.severity === 'high').length,
    failedLogins: securityEvents.filter(e => e.type === 'login_failed').length,
    activeUsers: 24,
    lockedAccounts: 2
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login_failed': return <UserX className="w-4 h-4 text-red-500" />;
      case 'login_success': return <Eye className="w-4 h-4 text-green-500" />;
      case 'password_change': return <Lock className="w-4 h-4 text-blue-500" />;
      case 'account_locked': return <Lock className="w-4 h-4 text-orange-500" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBlockIP = (ipAddress: string) => {
    toast({
      title: "IP Address Blocked",
      description: `IP address ${ipAddress} has been added to the blocklist`
    });
  };

  const handleUnlockAccount = (email: string) => {
    toast({
      title: "Account Unlocked",
      description: `Account for ${email} has been unlocked`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Center</h2>
          <p className="text-gray-600">Monitor security events and manage system security</p>
        </div>
        <Button variant="outline">
          <Shield className="w-4 h-4 mr-2" />
          Security Report
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-xl font-bold">{securityStats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Critical Events</p>
                <p className="text-xl font-bold text-red-600">{securityStats.criticalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-xl font-bold text-orange-600">{securityStats.highSeverity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-xl font-bold text-red-600">{securityStats.failedLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-bold text-green-600">{securityStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Locked Accounts</p>
                <p className="text-xl font-bold text-orange-600">{securityStats.lockedAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Monitor and respond to security events in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <div>
                            <p className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{event.details}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.user}</p>
                          <p className="text-sm text-gray-600">{event.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{event.timestamp.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{event.location}</p>
                            <p className="text-xs text-gray-500">{event.ipAddress}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {event.type === 'login_failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockIP(event.ipAddress)}
                            >
                              Block IP
                            </Button>
                          )}
                          {event.type === 'account_locked' && (
                            <Button
                              size="sm"
                              onClick={() => handleUnlockAccount(event.email)}
                            >
                              Unlock
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Current password requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Minimum 8 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one lowercase letter</li>
                  <li>• At least one number</li>
                  <li>• At least one special character</li>
                  <li>• Cannot reuse last 5 passwords</li>
                  <li>• Must change every 90 days</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Policy</CardTitle>
                <CardDescription>Session management settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Session timeout: 30 minutes</li>
                  <li>• Maximum concurrent sessions: 3</li>
                  <li>• Require re-authentication for sensitive actions</li>
                  <li>• Auto-logout on browser close</li>
                  <li>• IP address binding enabled</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Role-based access settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Role-based permissions enforced</li>
                  <li>• Principle of least privilege</li>
                  <li>• Regular access reviews required</li>
                  <li>• Temporary access expiration</li>
                  <li>• Admin actions logged</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>Data security measures</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• End-to-end encryption</li>
                  <li>• Data anonymization for reports</li>
                  <li>• Regular security backups</li>
                  <li>• HIPAA compliance maintained</li>
                  <li>• Audit trails for all access</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Server Status</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup Status</span>
                    <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SSL Certificate</span>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Threats</CardTitle>
                <CardDescription>Current security threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Brute Force Attempts</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2 Blocked</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Suspicious IPs</span>
                    <Badge className="bg-orange-100 text-orange-800">1 Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Authentications</span>
                    <Badge className="bg-red-100 text-red-800">5 Today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Malware Scans</span>
                    <Badge className="bg-green-100 text-green-800">Clean</Badge>
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

export default SecurityCenter;
