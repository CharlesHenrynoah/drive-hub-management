
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
      <h3 className="font-medium">Coordonnées du réservant</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactName">Nom et prénom</Label>
          <Input 
            id="contactName" 
            value={contactInfo.name} 
            onChange={(e) => handleChange("name", e.target.value)} 
            placeholder="Jean Dupont"
          />
        </div>
        
        <div>
          <Label htmlFor="contactCompany">Entreprise</Label>
          <Input 
            id="contactCompany" 
            value={contactInfo.company} 
            onChange={(e) => handleChange("company", e.target.value)} 
            placeholder="Nom de votre entreprise"
          />
        </div>
        
        <div>
          <Label htmlFor="contactEmail">Email</Label>
          <Input 
            id="contactEmail" 
            type="email" 
            value={contactInfo.email} 
            onChange={(e) => handleChange("email", e.target.value)} 
            placeholder="email@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="contactPhone">Téléphone</Label>
          <Input 
            id="contactPhone" 
            value={contactInfo.phone} 
            onChange={(e) => handleChange("phone", e.target.value)} 
            placeholder="0601020304"
          />
        </div>
      </div>
    </div>
  );
}
