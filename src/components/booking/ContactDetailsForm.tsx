
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building, Mail, Phone } from "lucide-react";

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
          <Label htmlFor="contactName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nom et prénom *
          </Label>
          <Input 
            id="contactName" 
            value={contactInfo.name} 
            onChange={(e) => handleChange("name", e.target.value)} 
            placeholder="Jean Dupont"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="contactCompany" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Entreprise
          </Label>
          <Input 
            id="contactCompany" 
            value={contactInfo.company} 
            onChange={(e) => handleChange("company", e.target.value)} 
            placeholder="Nom de votre entreprise"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="contactEmail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input 
            id="contactEmail" 
            type="email" 
            value={contactInfo.email} 
            onChange={(e) => handleChange("email", e.target.value)} 
            placeholder="email@example.com"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="contactPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone *
          </Label>
          <Input 
            id="contactPhone" 
            value={contactInfo.phone} 
            onChange={(e) => handleChange("phone", e.target.value)} 
            placeholder="0601020304"
            required
            className="mt-1"
          />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
    </div>
  );
}
