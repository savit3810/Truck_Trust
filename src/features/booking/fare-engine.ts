import { TruckType } from "@/features/trucks/models/truck.model";

export interface FareCalculationInput {
  truckType: TruckType;
  distanceKm: number;
  isPerishable?: boolean;
  isReturnLoad?: boolean;
  isPooled?: boolean;
  waitingHours?: number;
  tollEstimatePaise?: number;
}

export interface FareBreakdown {
  baseFarePaise: number;
  distanceFarePaise: number;
  handlingFarePaise: number;
  waitingFarePaise: number;
  tollEstimatePaise: number;
  perishableSurchargePaise: number;
  discountPaise: number;
  subtotalFarePaise: number;
  platformFeePaise: number; // 7.5% platform commission
  gstTaxPaise: number; // 5% GST on GTA (Goods Transport Agency)
  totalFarePaise: number; // Total gross fare to pay
  advance50Paise: number; // 50% advance due now
  delivery50Paise: number; // 50% held in escrow due on confirmed delivery
  driverGrossEarningsPaise: number; // Gross amount driver receives before platform commission
}

// Commercial rates per truck type in Maharashtra freight corridors (all stored as integer paise)
export const TRUCK_PRICING: Record<
  TruckType,
  {
    baseFarePaise: number; // Flat base fare
    includedKm: number; // Distance included in base
    perKmPaise: number; // Rate per additional km
    handlingPaise: number; // Standard loading/unloading assistance
    waitingHourPaise: number; // Rate per waiting hour
    fareFloorPaise: number; // Minimum booking fare
    fareCapPaise: number; // Maximum single trip ceiling
  }
> = {
  tata_ace: {
    baseFarePaise: 35000, // ₹350
    includedKm: 3,
    perKmPaise: 1800, // ₹18/km
    handlingPaise: 15000, // ₹150
    waitingHourPaise: 10000, // ₹100/hr
    fareFloorPaise: 50000, // ₹500 min
    fareCapPaise: 1500000, // ₹15,000 max
  },
  pickup: {
    baseFarePaise: 55000, // ₹550
    includedKm: 3,
    perKmPaise: 2400, // ₹24/km
    handlingPaise: 25000, // ₹250
    waitingHourPaise: 15000, // ₹150/hr
    fareFloorPaise: 80000, // ₹800 min
    fareCapPaise: 2500000, // ₹25,000 max
  },
  truck_14ft: {
    baseFarePaise: 120000, // ₹1,200
    includedKm: 5,
    perKmPaise: 3800, // ₹38/km
    handlingPaise: 45000, // ₹450
    waitingHourPaise: 25000, // ₹250/hr
    fareFloorPaise: 180000, // ₹1,800 min
    fareCapPaise: 5000000, // ₹50,000 max
  },
  truck_17ft: {
    baseFarePaise: 180000, // ₹1,800
    includedKm: 5,
    perKmPaise: 4800, // ₹48/km
    handlingPaise: 60000, // ₹600
    waitingHourPaise: 35000, // ₹350/hr
    fareFloorPaise: 250000, // ₹2,500 min
    fareCapPaise: 7500000, // ₹75,000 max
  },
  truck_20ft: {
    baseFarePaise: 250000, // ₹2,500
    includedKm: 5,
    perKmPaise: 6500, // ₹65/km
    handlingPaise: 80000, // ₹800
    waitingHourPaise: 45000, // ₹450/hr
    fareFloorPaise: 350000, // ₹3,500 min
    fareCapPaise: 10000000, // ₹1,00,000 max
  },
  truck_32ft: {
    baseFarePaise: 400000, // ₹4,000
    includedKm: 10,
    perKmPaise: 9500, // ₹95/km
    handlingPaise: 120000, // ₹1,200
    waitingHourPaise: 60000, // ₹600/hr
    fareFloorPaise: 600000, // ₹6,000 min
    fareCapPaise: 20000000, // ₹2,00,000 max
  },
};

export function calculateFare(input: FareCalculationInput): FareBreakdown {
  const pricing = TRUCK_PRICING[input.truckType] || TRUCK_PRICING.pickup;

  const baseFarePaise = pricing.baseFarePaise;
  const billableDistanceKm = Math.max(0, input.distanceKm - pricing.includedKm);
  const distanceFarePaise = Math.round(billableDistanceKm * pricing.perKmPaise);
  const handlingFarePaise = pricing.handlingPaise;
  const waitingFarePaise = Math.round((input.waitingHours || 0) * pricing.waitingHourPaise);
  const tollEstimatePaise = input.tollEstimatePaise || 0;

  const rawSubtotal = baseFarePaise + distanceFarePaise + handlingFarePaise + waitingFarePaise;

  // Modifiers
  let perishableSurchargePaise = 0;
  if (input.isPerishable) {
    // 10% surcharge for priority perishable dispatch (chiku, grapes, milk)
    perishableSurchargePaise = Math.round(rawSubtotal * 0.1);
  }

  let discountPaise = 0;
  if (input.isReturnLoad) {
    // 20% discount on driver return / backhaul loads
    discountPaise += Math.round(rawSubtotal * 0.2);
  } else if (input.isPooled) {
    // 25% discount for shared / pooled load
    discountPaise += Math.round(rawSubtotal * 0.25);
  }

  let subtotalFarePaise = rawSubtotal + perishableSurchargePaise - discountPaise + tollEstimatePaise;

  // Apply floor and cap
  subtotalFarePaise = Math.max(pricing.fareFloorPaise, Math.min(pricing.fareCapPaise, subtotalFarePaise));

  // Platform Commission (7.5%)
  const platformFeePaise = Math.round(subtotalFarePaise * 0.075);
  // GST 5% on GTA road transport
  const gstTaxPaise = Math.round(subtotalFarePaise * 0.05);

  const totalFarePaise = subtotalFarePaise + gstTaxPaise;

  // 50-50 Split calculation (ensures integer paise sum equals total exactly)
  const advance50Paise = Math.floor(totalFarePaise / 2);
  const delivery50Paise = totalFarePaise - advance50Paise;

  // Driver receives gross subtotal (minus platform fee at payout)
  const driverGrossEarningsPaise = subtotalFarePaise;

  return {
    baseFarePaise,
    distanceFarePaise,
    handlingFarePaise,
    waitingFarePaise,
    tollEstimatePaise,
    perishableSurchargePaise,
    discountPaise,
    subtotalFarePaise,
    platformFeePaise,
    gstTaxPaise,
    totalFarePaise,
    advance50Paise,
    delivery50Paise,
    driverGrossEarningsPaise,
  };
}
