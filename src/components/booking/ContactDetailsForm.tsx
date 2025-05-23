
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactDetailsFormProps {
  contactInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  setContactInfo: (info: {
    name: string;
    company: string;
    email: string;
    phone: string;
  }) => void;
}

export function ContactDetailsForm({ contactInfo, setContactInfo }: ContactDetailsFormProps) {
  const handleChange = (field: string, value: string) => {
    setContactInfo({
      ...contactInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-xl mb-6 border-b pb-2">Coordonnées du réservant</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-gray-800 font-medium flex items-center">
            Nom et prénom <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="contactName" 
            value={contactInfo.name} 
            onChange={(e) => handleChange("name", e.target.value)} 
            placeholder="Jean Dupont"
            className="border-gray-300 focus:ring-2 focus:ring-blue-500 h-10 bg-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactCompany" className="text-gray-800 font-medium flex items-center">
            Entreprise <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="contactCompany" 
            value={contactInfo.company} 
            onChange={(e) => handleChange("company", e.target.value)} 
            placeholder="Nom de votre entreprise"
            className="border-gray-300 focus:ring-2 focus:ring-blue-500 h-10 bg-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="text-gray-800 font-medium flex items-center">
            Email <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="contactEmail" 
            type="email" 
            value={contactInfo.email} 
            onChange={(e) => handleChange("email", e.target.value)} 
            placeholder="email@example.com"
            className="border-gray-300 focus:ring-2 focus:ring-blue-500 h-10 bg-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="text-gray-800 font-medium flex items-center">
            Téléphone <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="contactPhone" 
            value={contactInfo.phone} 
            onChange={(e) => handleChange("phone", e.target.value)} 
            placeholder="0601020304"
            className="border-gray-300 focus:ring-2 focus:ring-blue-500 h-10 bg-white"
            required
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 italic mt-4">
        <span className="text-red-500">*</span> champs obligatoires
      </p>
    </div>
  );
}
