
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '@/types/user';

interface PendingApprovalScreenProps {
  user: UserType;
  onLogout: () => void;
}

const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ user, onLogout }) => {
  const { language } = useLanguage();

  const getStatusMessage = () => {
    switch (user.status) {
      case 'pending':
        return language === 'en' 
          ? 'Your account is being reviewed by our team.'
          : 'तपाईंको खाता हाम्रो टोलीले समीक्षा गरिरहेको छ।';
      case 'pending_approval':
        if (user.role === 'caregiver') {
          return language === 'en'
            ? 'Waiting for doctor approval to access patient records.'
            : 'बिरामीको रेकर्ड पहुँच गर्न डाक्टरको अनुमोदनको प्रतीक्षा गर्दै।';
        }
        return language === 'en'
          ? 'Your connection request is pending approval.'
          : 'तपाईंको जडान अनुरोध अनुमोदनको पर्खाइमा छ।';
      case 'invited':
        return language === 'en'
          ? 'You were invited to join. Please complete your registration.'
          : 'तपाईंलाई सामेल हुन निमन्त्रणा गरिएको थियो। कृपया आफ्नो दर्ता पूरा गर्नुहोस्।';
      default:
        return language === 'en'
          ? 'Your account status is being updated.'
          : 'तपाईंको खाता स्थिति अद्यावधिक गरिँदै छ।';
    }
  };

  const getActionMessage = () => {
    if (user.status === 'pending_approval' && user.pendingConnections?.length) {
      const pendingDoctor = user.pendingConnections.find(c => c.type === 'doctor');
      if (pendingDoctor) {
        return language === 'en'
          ? `Waiting for approval from Dr. ${pendingDoctor.name}`
          : `डा. ${pendingDoctor.name} बाट अनुमोदनको प्रतीक्षा गर्दै`;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">PD</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {language === 'en' ? 'Account Pending' : 'खाता पेन्डिङ'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'en' ? `Welcome, ${user.name}!` : `स्वागत छ, ${user.name}!`}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {getStatusMessage()}
            </p>

            {getActionMessage() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 text-blue-800">
                  <Stethoscope className="w-5 h-5" />
                  <span className="font-medium">{getActionMessage()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {language === 'en' ? 'Role:' : 'भूमिका:'} 
              </span>
              <span className="font-medium capitalize">{user.role}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {language === 'en' ? 'Email:' : 'इमेल:'} 
              </span>
              <span className="font-medium">{user.email}</span>
            </div>
          </div>

          {/* Pending Connections */}
          {user.pendingConnections && user.pendingConnections.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                {language === 'en' ? 'Pending Connections:' : 'पेन्डिङ जडानहरू:'}
              </h4>
              {user.pendingConnections.map((connection, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-800">{connection.name}</p>
                      <p className="text-sm text-yellow-600 capitalize">{connection.type}</p>
                    </div>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {connection.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              {language === 'en'
                ? 'You will receive a notification once your account is approved.'
                : 'तपाईंको खाता अनुमोदन भएपछि तपाईंले सूचना प्राप्त गर्नुहुनेछ।'}
            </p>
            
            <Button variant="outline" onClick={onLogout} className="w-full">
              {language === 'en' ? 'Sign Out' : 'साइन आउट'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalScreen;
