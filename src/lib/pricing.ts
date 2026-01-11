// Centralized pricing logic for ThaiDriveSecure

export interface PricingBreakdownItem {
  label: string;
  description?: string;
  amount: number;
}

export interface PricingResult {
  items: PricingBreakdownItem[];
  totalPrice: number;
  isValid: boolean;
  validationError?: string;
}

// Package pricing by vehicle type (TM2/3 Form RM10 is included in these prices)
const COMPULSORY_PRICES: Record<string, number> = {
  sedan: 29,
  pickup_suv: 35,
  mpv: 45,
  motorcycle: 59,
};

const COMPULSORY_VOLUNTARY_PRICES: Record<string, number> = {
  sedan: 120,
  pickup_suv: 130,
  mpv: 165,
  motorcycle: 220,
};

// TM2/3 Form is included in packages but shown separately
const TM23_FORM_PRICE = 10;

// TDAC pricing per person
const TDAC_PRICE_PER_PERSON = 2;

// Motorcycle minimum duration in months
const MOTORCYCLE_MIN_MONTHS = 3;

export const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  mpv: "MPV",
  pickup_suv: "SUV / Pickup",
  motorcycle: "Motorcycle",
};

export const packageTypeLabels: Record<string, string> = {
  compulsory: "Compulsory Package",
  compulsory_voluntary: "Compulsory + Voluntary Package",
};

/**
 * Get the base package price (without TM2/3)
 */
export const getPackageBasePrice = (packageType: string, vehicleType: string): number => {
  const prices = packageType === "compulsory_voluntary" 
    ? COMPULSORY_VOLUNTARY_PRICES 
    : COMPULSORY_PRICES;
  return prices[vehicleType] || 0;
};

/**
 * Calculate TDAC price based on passenger count
 */
export const getTdacPrice = (passengerCount: number): number => {
  return passengerCount * TDAC_PRICE_PER_PERSON;
};

/**
 * Validate motorcycle minimum duration
 */
export const validateMotorcycleDuration = (
  vehicleType: string, 
  durationDays: number
): { isValid: boolean; error?: string } => {
  if (vehicleType === "motorcycle") {
    const minDays = MOTORCYCLE_MIN_MONTHS * 30; // Approximately 90 days
    if (durationDays < minDays) {
      return {
        isValid: false,
        error: `Motorcycle insurance requires a minimum duration of ${MOTORCYCLE_MIN_MONTHS} months`,
      };
    }
  }
  return { isValid: true };
};

/**
 * Calculate complete pricing breakdown
 */
export const calculatePricingBreakdown = (
  packageType: string,
  vehicleType: string,
  passengerCount: number = 1,
  addons: string[] = [],
  durationDays: number = 7
): PricingResult => {
  const items: PricingBreakdownItem[] = [];
  let totalPrice = 0;

  // Validate motorcycle duration
  const motorcycleValidation = validateMotorcycleDuration(vehicleType, durationDays);
  if (!motorcycleValidation.isValid) {
    return {
      items: [],
      totalPrice: 0,
      isValid: false,
      validationError: motorcycleValidation.error,
    };
  }

  // Package price (includes TM2/3)
  const packagePrice = getPackageBasePrice(packageType, vehicleType);
  const vehicleLabel = vehicleTypeLabels[vehicleType] || vehicleType;
  const packageLabel = packageTypeLabels[packageType] || packageType;
  
  items.push({
    label: `${packageLabel} (${vehicleLabel})`,
    amount: packagePrice,
  });

  // TM2/3 Form - shown separately for transparency (included in package)
  items.push({
    label: "TM2/3 Form",
    description: "Included in package",
    amount: TM23_FORM_PRICE,
  });

  totalPrice = packagePrice + TM23_FORM_PRICE;

  // TDAC add-on (priced per person)
  if (addons.includes("TDAC")) {
    const tdacPrice = getTdacPrice(passengerCount);
    items.push({
      label: `TDAC (${passengerCount} passenger${passengerCount > 1 ? "s" : ""} × RM ${TDAC_PRICE_PER_PERSON})`,
      amount: tdacPrice,
    });
    totalPrice += tdacPrice;
  }

  return {
    items,
    totalPrice,
    isValid: true,
  };
};

/**
 * Format price in RM currency
 */
export const formatPrice = (amount: number): string => {
  return `RM ${amount.toFixed(2)}`;
};
