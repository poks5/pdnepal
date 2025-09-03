
import React from 'react';
import { Doctor } from '@/types/doctor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock, Users, Star, Phone, Mail } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
  isSelected?: boolean;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect, isSelected = false }) => {
  const availabilityColor = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800'
  };

  const availabilityText = {
    available: 'Available',
    busy: 'Busy',
    unavailable: 'Unavailable'
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{doctor.name}</CardTitle>
              <CardDescription className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{doctor.hospital}</span>
              </CardDescription>
            </div>
          </div>
          <Badge className={availabilityColor[doctor.availability]}>
            {availabilityText[doctor.availability]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Specializations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-1">
            {doctor.specialization.map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience and Patient Load */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{doctor.experience} years exp.</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{doctor.currentPatients}/{doctor.maxPatients} patients</span>
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Languages</h4>
          <p className="text-sm text-gray-600">{doctor.languages.join(', ')}</p>
        </div>

        {/* Bio */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
        </div>

        {/* Contact Info */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{doctor.phone}</span>
            </div>
          </div>
          {doctor.consultationFee && (
            <span className="text-sm font-medium text-green-600">
              Rs. {doctor.consultationFee}
            </span>
          )}
        </div>

        {/* Select Button */}
        <Button 
          onClick={() => onSelect(doctor)}
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          disabled={doctor.availability === 'unavailable'}
        >
          {isSelected ? 'Selected' : 'Select Doctor'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
