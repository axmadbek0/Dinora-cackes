/**
 * DINORA Confectionery Store Location Coordinates (Sirdaryo tumani, M34 ko'chasi 9-uy)
 */
export const STORE_COORDINATES = {
  latitude: 40.814866,
  longitude: 68.680686,
  name: 'DINORA Pastry & Art',
  address: "Sirdaryo viloyati, Sirdaryo tumani, M34 ko'chasi 9-uy",
};

export const FREE_THRESHOLD_KM = 2.0;
export const RATE_PER_KM = 2500;

export interface DeliveryFeeResult {
  distanceKm: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  breakdownText: string;
}

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export const calculateDistanceKm = (
  lat1?: number | null,
  lon1?: number | null,
  lat2: number = STORE_COORDINATES.latitude,
  lon2: number = STORE_COORDINATES.longitude
): number => {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null || isNaN(lat1) || isNaN(lon1)) {
    return 0;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat1 - lat2) * Math.PI) / 180;
  const dLon = ((lon1 - lon2) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat2 * Math.PI) / 180) *
      Math.cos((lat1 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 3.5 km)
};

/**
 * Dynamic distance-based delivery fee calculation
 * - 0.0 km - 2.0 km: FREE (0 UZS)
 * - Above 2.0 km: 2,500 UZS per additional km
 */
export const calculateDeliveryFee = (distanceKm: number): DeliveryFeeResult => {
  const cleanDistance = Math.max(0, distanceKm || 0);

  if (cleanDistance <= FREE_THRESHOLD_KM) {
    return {
      distanceKm: cleanDistance,
      deliveryFee: 0,
      isFreeDelivery: true,
      breakdownText: `2.0 km gacha yetkazib berish bepul!`,
    };
  }

  const extraDistance = cleanDistance - FREE_THRESHOLD_KM;
  const fee = Math.ceil(extraDistance * RATE_PER_KM);

  return {
    distanceKm: cleanDistance,
    deliveryFee: fee,
    isFreeDelivery: false,
    breakdownText: `2.0 km bepul + ${extraDistance.toFixed(1)} km × 2,500 UZS`,
  };
};
