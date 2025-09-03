
import React, { useState } from 'react';
import { Doctor } from '@/types/doctor';
import { mockDoctors } from '@/data/doctors';
import DoctorCard from '@/components/DoctorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Stethoscope } from 'lucide-react';

interface DoctorSelectionProps {
  onDoctorSelect: (doctor: Doctor) => void;
  onCancel?: () => void;
  selectedDoctorId?: string;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ 
  onDoctorSelect, 
  onCancel, 
  selectedDoctorId 
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
    selectedDoctorId ? mockDoctors.find(d => d.id === selectedDoctorId) || null : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  // Filter doctors based on search and filters
  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === 'all' || doctor.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesAvailability = availabilityFilter === 'all' || doctor.availability === availabilityFilter;
    const matchesExperience = experienceFilter === 'all' || 
                             (experienceFilter === 'junior' && doctor.experience < 10) ||
                             (experienceFilter === 'senior' && doctor.experience >= 10 && doctor.experience < 15) ||
                             (experienceFilter === 'expert' && doctor.experience >= 15);

    return matchesSearch && matchesLocation && matchesAvailability && matchesExperience;
  });

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirmSelection = () => {
    if (selectedDoctor) {
      onDoctorSelect(selectedDoctor);
    }
  };

  const locations = ['all', 'kathmandu', 'lalitpur'];
  const availabilityOptions = ['all', 'available', 'busy'];
  const experienceOptions = [
    { value: 'all', label: 'All Experience' },
    { value: 'junior', label: 'Junior (< 10 years)' },
    { value: 'senior', label: 'Senior (10-15 years)' },
    { value: 'expert', label: 'Expert (15+ years)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Choose Your Nephrologist</span>
          </CardTitle>
          <CardDescription>
            Select a qualified nephrologist to manage your peritoneal dialysis treatment. 
            You can change your doctor later if needed.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, hospital, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.slice(1).map(location => (
                    <SelectItem key={location} value={location}>
                      {location.charAt(0).toUpperCase() + location.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  {availabilityOptions.slice(1).map(option => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchTerm || locationFilter !== 'all' || availabilityFilter !== 'all' || experienceFilter !== 'all') && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchTerm}
                  </Badge>
                )}
                {locationFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Location: {locationFilter}
                  </Badge>
                )}
                {availabilityFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {availabilityFilter}
                  </Badge>
                )}
                {experienceFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Experience: {experienceOptions.find(e => e.value === experienceFilter)?.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onSelect={handleDoctorSelect}
            isSelected={selectedDoctor?.id === doctor.id}
          />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No doctors found matching your criteria.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleConfirmSelection} 
          disabled={!selectedDoctor}
          className="flex-1"
        >
          {selectedDoctor ? `Confirm Selection: ${selectedDoctor.name}` : 'Select a Doctor'}
        </Button>
      </div>
    </div>
  );
};

export default DoctorSelection;
