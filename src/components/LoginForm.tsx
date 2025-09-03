import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Mail, Lock } from 'lucide-react';
import RegisterForm from './RegisterForm';
import { RegistrationData } from '@/types/user';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login, register } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegistrationData) => {
    try {
      await register(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </Button>
          </div>
          
          <RegisterForm 
            onRegister={handleRegister}
            onBack={() => setShowRegister(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            className="flex items-center space-x-2"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PD</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Dialyze Buddy</CardTitle>
            <CardDescription className="text-gray-600">
              {language === 'en' 
                ? 'Peritoneal Dialysis Companion' 
                : 'पेरिटोनियल डायलाइसिस साथी'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{t('email')}</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  placeholder={language === 'en' ? 'Enter your email' : 'आफ्नो इमेल प्रविष्ट गर्नुहोस्'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>{t('password')}</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  placeholder={language === 'en' ? 'Enter your password' : 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्'}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{language === 'en' ? 'Signing in...' : 'साइन इन गर्दै...'}</span>
                  </div>
                ) : (
                  t('login')
                )}
              </Button>
            </form>

            {/* Register Button */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                {language === 'en' ? "Don't have an account?" : 'खाता छैन?'}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowRegister(true)}
                className="w-full"
              >
                {language === 'en' ? 'Create Account' : 'खाता सिर्जना गर्नुहोस्'}
              </Button>
            </div>
            
            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Demo Credentials:' : 'डेमो क्रेडेन्शियलहरू:'}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin@example.com / password</p>
                <p><strong>Patient:</strong> patient@example.com / password</p>
                <p><strong>Doctor:</strong> doctor@example.com / password</p>
                <p><strong>Caregiver:</strong> caregiver@example.com / password</p>
                <p><strong>Coordinator:</strong> coordinator@example.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
