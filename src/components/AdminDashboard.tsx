import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, Settings, Database, Shield, TrendingUp } from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import SystemSettings from '@/components/SystemSettings';
import SecurityCenter from '@/components/SecurityCenter';
import DatabaseAdmin from '@/components/DatabaseAdmin';
import DataManagement from '@/components/DataManagement';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: language === 'en' ? 'Total Users' : 'कुल प्रयोगकर्ताहरू',
      value: '1,247',
      icon: Users,
      change: '+12%',
      color: 'text-blue-600'
    },
    {
      title: language === 'en' ? 'Active Sessions' : 'सक्रिय सत्रहरू',
      value: '89',
      icon: Activity,
      change: '+5%',
      color: 'text-green-600'
    },
    {
      title: language === 'en' ? 'System Health' : 'प्रणाली स्वास्थ्य',
      value: '98.5%',
      icon: TrendingUp,
      change: '+0.3%',
      color: 'text-purple-600'
    },
    {
      title: language === 'en' ? 'Database Size' : 'डाटाबेस आकार',
      value: '2.4 GB',
      icon: Database,
      change: '+156 MB',
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: language === 'en' ? 'User Management' : 'प्रयोगकर्ता व्यवस्थापन',
      description: language === 'en' ? 'Manage users, roles, and permissions' : 'प्रयोगकर्ता, भूमिका र अनुमतिहरू व्यवस्थापन गर्नुहोस्',
      icon: Users,
      tab: 'users'
    },
    {
      title: language === 'en' ? 'Data Management' : 'डाटा व्यवस्थापन',
      description: language === 'en' ? 'Manage data persistence and backups' : 'डाटा स्थिरता र ब्याकअप व्यवस्थापन गर्नुहोस्',
      icon: Database,
      tab: 'data'
    },
    {
      title: language === 'en' ? 'System Settings' : 'प्रणाली सेटिङहरू',
      description: language === 'en' ? 'Configure system-wide settings' : 'प्रणाली-व्यापी सेटिङहरू कन्फिगर गर्नुहोस्',
      icon: Settings,
      tab: 'settings'
    },
    {
      title: language === 'en' ? 'Security Center' : 'सुरक्षा केन्द्र',
      description: language === 'en' ? 'Monitor security events and policies' : 'सुरक्षा घटनाहरू र नीतिहरू निगरानी गर्नुहोस्',
      icon: Shield,
      tab: 'security'
    }
  ];

  if (activeTab !== 'overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setActiveTab('overview')}>
            ← Back to Dashboard
          </Button>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {language === 'en' ? 'Administrator' : 'प्रशासक'}
          </Badge>
        </div>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'data' && <DataManagement />}
        {activeTab === 'settings' && <SystemSettings />}
        {activeTab === 'security' && <SecurityCenter />}
        {activeTab === 'database' && <DatabaseAdmin />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Admin Dashboard' : 'प्रशासक ड्यासबोर्ड'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'en' 
              ? `Welcome back, ${user?.fullName}. System overview and management tools.`
              : `फिर्ता स्वागत छ, ${user?.fullName}। प्रणाली अवलोकन र व्यवस्थापन उपकरणहरू।`
            }
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {language === 'en' ? 'Administrator' : 'प्रशासक'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {language === 'en' ? 'Quick Actions' : 'द्रुत कार्यहरू'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <action.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab(action.tab)}
                  className="w-full"
                >
                  {language === 'en' ? 'Open' : 'खोल्नुहोस्'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{language === 'en' ? 'System Information' : 'प्रणाली जानकारी'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">{language === 'en' ? 'Server Status' : 'सर्भरको स्थिति'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">
                  {language === 'en' ? 'Online' : 'अनलाइन'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'en' ? 'Last Backup' : 'अन्तिम ब्याकअप'}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">2 hours ago</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'en' ? 'Version' : 'संस्करण'}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">v2.1.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
