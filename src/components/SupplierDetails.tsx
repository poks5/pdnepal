
import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Edit, Trash2, Phone, MapPin, Calendar, Plus } from 'lucide-react';
import { SupplierDetails as SupplierDetailsType } from '@/types/patient';

const SupplierDetails: React.FC = () => {
  const { toast } = useToast();
  const { suppliers, addSupplier, updateSupplier, removeSupplier, patientProfile } = usePatient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierDetailsType | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    representativeName: '',
    phone: '',
    whatsapp: '',
    address: '',
    suppliesChecklist: [] as { item: string; quantity: number; unit: string; inStock: boolean }[],
    deliveryFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    lastDeliveryDate: '',
    nextDeliveryDate: ''
  });

  const commonSupplies = [
    { item: 'Dialysate Solution 1.5%', unit: 'bags' },
    { item: 'Dialysate Solution 2.5%', unit: 'bags' },
    { item: 'Dialysate Solution 4.25%', unit: 'bags' },
    { item: 'Transfer Sets', unit: 'pieces' },
    { item: 'Disconnect Caps', unit: 'pieces' },
    { item: 'Catheter Exit Site Dressing', unit: 'pieces' },
    { item: 'Antiseptic Solution', unit: 'bottles' },
    { item: 'Drainage Bags', unit: 'pieces' }
  ];

  const resetForm = () => {
    setFormData({
      companyName: '',
      representativeName: '',
      phone: '',
      whatsapp: '',
      address: '',
      suppliesChecklist: commonSupplies.map(supply => ({ ...supply, quantity: 0, inStock: false })),
      deliveryFrequency: 'monthly',
      lastDeliveryDate: '',
      nextDeliveryDate: ''
    });
    setEditingSupplier(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSupplyChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      suppliesChecklist: prev.suppliesChecklist.map((supply, i) => 
        i === index ? { ...supply, [field]: value } : supply
      )
    }));
  };

  const addCustomSupply = () => {
    setFormData(prev => ({
      ...prev,
      suppliesChecklist: [...prev.suppliesChecklist, { item: '', quantity: 0, unit: '', inStock: false }]
    }));
  };

  const removeSupply = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suppliesChecklist: prev.suppliesChecklist.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.companyName || !formData.representativeName || !formData.phone) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in company name, representative name, and phone number.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!patientProfile?.id) {
      toast({
        title: "Error",
        description: "Please complete your patient profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    const supplierData: SupplierDetailsType = {
      id: editingSupplier?.id || Date.now().toString(),
      patientId: patientProfile.id,
      companyName: formData.companyName,
      representativeName: formData.representativeName,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      address: formData.address,
      suppliesChecklist: formData.suppliesChecklist.filter(supply => supply.item),
      deliveryFrequency: formData.deliveryFrequency,
      lastDeliveryDate: formData.lastDeliveryDate || undefined,
      nextDeliveryDate: formData.nextDeliveryDate || undefined
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
      toast({
        title: "Supplier Updated",
        description: "Supplier information has been updated successfully.",
      });
    } else {
      addSupplier(supplierData);
      toast({
        title: "Supplier Added",
        description: "New supplier has been added successfully.",
      });
    }

    resetForm();
    setShowAddDialog(false);
  };

  const handleEdit = (supplier: SupplierDetailsType) => {
    setFormData({
      companyName: supplier.companyName,
      representativeName: supplier.representativeName,
      phone: supplier.phone,
      whatsapp: supplier.whatsapp || '',
      address: supplier.address,
      suppliesChecklist: supplier.suppliesChecklist,
      deliveryFrequency: supplier.deliveryFrequency,
      lastDeliveryDate: supplier.lastDeliveryDate || '',
      nextDeliveryDate: supplier.nextDeliveryDate || ''
    });
    setEditingSupplier(supplier);
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    removeSupplier(id);
    toast({
      title: "Supplier Removed",
      description: "Supplier has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Details</h2>
          <p className="text-gray-600">Manage your medical supplies and delivery information</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Add Supplier</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription>
                Enter the supplier's contact information and supplies details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Medical supply company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representativeName">Representative Name *</Label>
                  <Input
                    id="representativeName"
                    value={formData.representativeName}
                    onChange={(e) => handleInputChange('representativeName', e.target.value)}
                    placeholder="Contact person's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Primary contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Supplier's address"
                  rows={2}
                />
              </div>

              {/* Delivery Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryFrequency">Delivery Frequency</Label>
                  <Select
                    value={formData.deliveryFrequency}
                    onValueChange={(value) => handleInputChange('deliveryFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastDeliveryDate">Last Delivery Date</Label>
                  <Input
                    id="lastDeliveryDate"
                    type="date"
                    value={formData.lastDeliveryDate}
                    onChange={(e) => handleInputChange('lastDeliveryDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDeliveryDate">Next Delivery Date</Label>
                  <Input
                    id="nextDeliveryDate"
                    type="date"
                    value={formData.nextDeliveryDate}
                    onChange={(e) => handleInputChange('nextDeliveryDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Supplies Checklist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Supplies Checklist</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomSupply}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Item
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {formData.suppliesChecklist.map((supply, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Input
                          value={supply.item}
                          onChange={(e) => handleSupplyChange(index, 'item', e.target.value)}
                          placeholder="Supply item name"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={supply.quantity}
                          onChange={(e) => handleSupplyChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="Qty"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={supply.unit}
                          onChange={(e) => handleSupplyChange(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Checkbox
                          checked={supply.inStock}
                          onCheckedChange={(checked) => handleSupplyChange(index, 'inStock', checked)}
                        />
                        <span className="text-sm">In Stock</span>
                      </div>
                      <div className="col-span-2">
                        {index >= commonSupplies.length && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSupply(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Suppliers Added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add suppliers who provide your dialysis supplies and equipment.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Add First Supplier</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{supplier.representativeName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                {supplier.whatsapp && (
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-green-500" />
                    <span className="text-sm">WhatsApp: {supplier.whatsapp}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{supplier.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Badge variant="secondary">
                    {supplier.deliveryFrequency.charAt(0).toUpperCase() + supplier.deliveryFrequency.slice(1)} delivery
                  </Badge>
                </div>
                {supplier.nextDeliveryDate && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    Next delivery: {new Date(supplier.nextDeliveryDate).toLocaleDateString()}
                  </div>
                )}
                {supplier.suppliesChecklist.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Supplies:</p>
                    <div className="text-sm text-gray-600">
                      {supplier.suppliesChecklist.filter(s => s.inStock).length} items in stock, {' '}
                      {supplier.suppliesChecklist.filter(s => !s.inStock).length} items needed
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierDetails;
