export const VEHICLE_IMAGES = [
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80', // Red Car
  'https://images.unsplash.com/photo-1503376712351-d0076a928929?auto=format&fit=crop&w=800&q=80', // Audi White
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', // Blue BMW
  'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80', // Porsche
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80', // Black Mercedes
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=800&q=80', // White SUV
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Blue Chevrolet
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80', // Silver Sedan
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80', // Yellow sports car
  'https://images.unsplash.com/photo-1557165038-f9d2d88dbce0?auto=format&fit=crop&w=800&q=80', // Grey SUV
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', // Classic Mini
  'https://images.unsplash.com/photo-1502877338535-346ce140cfa8?auto=format&fit=crop&w=800&q=80', // Green Vintage
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80', // Mustang White
  'https://images.unsplash.com/photo-1606016159991-dde688b1fc50?auto=format&fit=crop&w=800&q=80', // Grey Audi
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'  // Blue Truck
];

/**
 * Returns a consistent image URL for a given license plate.
 * Uses a simple string hash to deterministically pick from the VEHICLE_IMAGES array.
 */
export function getVehicleImageByPlate(plate) {
  if (!plate || plate.trim() === '') {
    // Default image if no plate provided
    return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80';
  }
  
  // Specific override for common VIP plate in demo
  if (plate === '51F-123.45') {
    return 'https://images.unsplash.com/photo-1503376712351-d0076a928929?auto=format&fit=crop&w=800&q=80'; // Audi White
  }

  // Hash the plate string
  let hash = 0;
  for (let i = 0; i < plate.length; i++) {
    hash = plate.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Ensure positive modulo
  const index = Math.abs(hash) % VEHICLE_IMAGES.length;
  return VEHICLE_IMAGES[index];
}
