
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingSteps } from "./BookingSteps";
import { VehicleSelection } from "./VehicleSelection";
import { DriverSelection } from "./DriverSelection";
import { TripDetails } from "./TripDetails";
import { PaymentForm } from "./PaymentForm";
import { BookingSuccessMessage } from "./BookingSuccessMessage";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { FleetRecommendation } from "@/pages/LandingPage";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: FleetRecommendation;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  passengerCount: string;
  additionalInfo: string;
}

export function BookingModal({
  isOpen,
  onClose,
  recommendation,
  departureLocation,
  destinationLocation,
  departureDate,
  passengerCount,
  additionalInfo
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [tripDetails, setTripDetails] = useState({
    duration: "",
    arrivalTime: "",
    price: 0
  });
  
  const steps = ["Véhicule", "Chauffeur", "Détails", "Paiement"];
  
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };
  
  const handleContinueToDrivers = () => {
    setCurrentStep(1);
  };
  
  const handleContinueToTripDetails = () => {
    setCurrentStep(2);
  };
  
  const handleContinueToPayment = (details: {
    duration: string;
    arrivalTime: string;
    price: number;
  }) => {
    setTripDetails(details);
    setCurrentStep(3);
  };
  
  const handleBookingSuccess = () => {
    setCurrentStep(4);
  };
  
  const handleClose = () => {
    onClose();
    // Reset state after a short delay to allow the closing animation
    setTimeout(() => {
      setCurrentStep(0);
      setSelectedVehicle(null);
      setSelectedDriver(null);
    }, 300);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VehicleSelection
            vehicles={recommendation.availableVehicles}
            onVehicleSelect={handleVehicleSelect}
            selectedVehicleId={selectedVehicle?.id || null}
            onContinue={handleContinueToDrivers}
          />
        );
      case 1:
        return (
          <DriverSelection
            drivers={recommendation.availableDrivers}
            onDriverSelect={handleDriverSelect}
            selectedDriverId={selectedDriver?.id || null}
            onContinue={handleContinueToTripDetails}
            onBack={() => setCurrentStep(0)}
          />
        );
      case 2:
        if (selectedVehicle && selectedDriver) {
          return (
            <TripDetails
              vehicle={selectedVehicle}
              driver={selectedDriver}
              departureLocation={departureLocation}
              destinationLocation={destinationLocation}
              departureDate={departureDate}
              passengerCount={passengerCount}
              onContinue={handleContinueToPayment}
              onBack={() => setCurrentStep(1)}
            />
          );
        }
        return null;
      case 3:
        if (selectedVehicle && selectedDriver) {
          return (
            <PaymentForm
              price={tripDetails.price}
              vehicle={selectedVehicle}
              driver={selectedDriver}
              departureLocation={departureLocation}
              destinationLocation={destinationLocation}
              departureDate={departureDate}
              arrivalTime={tripDetails.arrivalTime}
              passengerCount={passengerCount}
              additionalInfo={additionalInfo}
              onBack={() => setCurrentStep(2)}
              onSuccess={handleBookingSuccess}
            />
          );
        }
        return null;
      case 4:
        return (
          <BookingSuccessMessage
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {currentStep < steps.length && (
          <BookingSteps currentStep={currentStep} steps={steps} />
        )}
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
