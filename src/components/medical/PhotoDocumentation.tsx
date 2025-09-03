
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Eye, Calendar, AlertTriangle } from 'lucide-react';

interface PhotoEntry {
  id: string;
  timestamp: string;
  type: 'catheter_site' | 'fluid_clarity' | 'skin_condition' | 'other';
  imageUrl: string;
  notes: string;
  flagged: boolean;
}

const PhotoDocumentation: React.FC = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'catheter_site',
      imageUrl: '/placeholder.svg',
      notes: 'Exit site looks clean, no signs of infection',
      flagged: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      type: 'fluid_clarity',
      imageUrl: '/placeholder.svg',
      notes: 'Slightly cloudy effluent - monitoring closely',
      flagged: true
    }
  ]);
  
  const [selectedType, setSelectedType] = useState<PhotoEntry['type']>('catheter_site');
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const photoTypes = [
    { value: 'catheter_site', label: 'Catheter Exit Site', icon: '🩹' },
    { value: 'fluid_clarity', label: 'Fluid Clarity', icon: '💧' },
    { value: 'skin_condition', label: 'Skin Condition', icon: '🫴' },
    { value: 'other', label: 'Other', icon: '📷' }
  ];

  const handlePhotoCapture = (file: File) => {
    // In a real app, you would upload the file to a server
    const imageUrl = URL.createObjectURL(file);
    
    const newPhoto: PhotoEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: selectedType,
      imageUrl,
      notes,
      flagged: false
    };

    setPhotos(prev => [newPhoto, ...prev]);
    setNotes('');
    setShowCamera(false);

    toast({
      title: "Photo Documented",
      description: `${photoTypes.find(t => t.value === selectedType)?.label} photo saved successfully.`
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoCapture(file);
    }
  };

  const toggleFlag = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, flagged: !photo.flagged } : photo
    ));
  };

  const getTypeColor = (type: PhotoEntry['type']) => {
    switch (type) {
      case 'catheter_site': return 'bg-blue-100 text-blue-800';
      case 'fluid_clarity': return 'bg-cyan-100 text-cyan-800';
      case 'skin_condition': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const flaggedPhotos = photos.filter(photo => photo.flagged);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Photo Documentation</h2>
        <p className="text-gray-600">Document catheter site, fluid clarity, and other important visual observations</p>
      </div>

      {/* Flagged Photos Alert */}
      {flaggedPhotos.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Flagged Photos Requiring Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {flaggedPhotos.length} photo(s) have been flagged for review. Consider sharing with your healthcare provider.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flaggedPhotos.map(photo => (
                <div key={photo.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                  <img src={photo.imageUrl} alt="Flagged" className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{photoTypes.find(t => t.value === photo.type)?.label}</p>
                    <p className="text-xs text-gray-500">{new Date(photo.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Capture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Add New Photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Photo Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photoTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as PhotoEntry['type'])}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedType === type.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add observations, concerns, or context for this photo..."
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowCamera(true)}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              
              <label className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Photo History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={photoTypes.find(t => t.value === photo.type)?.label}
                    className="w-full h-48 object-cover"
                  />
                  {photo.flagged && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500 bg-white rounded-full p-1" />
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getTypeColor(photo.type)}>
                      {photoTypes.find(t => t.value === photo.type)?.label}
                    </Badge>
                    <button
                      onClick={() => toggleFlag(photo.id)}
                      className={`text-sm ${photo.flagged ? 'text-orange-600' : 'text-gray-400'}`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(photo.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {photo.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2">{photo.notes}</p>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Eye className="w-4 h-4 mr-1" />
                    View Full Size
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {photos.length === 0 && (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-600">Start documenting with your first photo above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoDocumentation;
