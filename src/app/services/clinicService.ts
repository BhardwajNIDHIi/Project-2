export type NearbyClinic = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  distance: number;
};

export async function getNearbyClinics(
  latitude: number,
  longitude: number
): Promise<NearbyClinic[]> {

  // DEMO CLINIC DATA
  // API ke bina screen test karne ke liye

  return [
    {
      id: "1",
      name: "City Care Clinic",
      latitude: latitude + 0.012,
      longitude: longitude + 0.008,
      address: "Nearby Main Road",
      phone: "+911234567890",
      distance: 2.1,
    },

    {
      id: "2",
      name: "Life Care Clinic",
      latitude: latitude - 0.015,
      longitude: longitude + 0.006,
      address: "Central Market",
      phone: "+911234567891",
      distance: 2.4,
    },

    {
      id: "3",
      name: "Health Plus Clinic",
      latitude: latitude + 0.018,
      longitude: longitude - 0.009,
      address: "Station Road",
      phone: "+911234567892",
      distance: 2.7,
    },

    {
      id: "4",
      name: "Family Health Clinic",
      latitude: latitude - 0.019,
      longitude: longitude - 0.007,
      address: "Main Bazaar",
      phone: "+911234567893",
      distance: 2.9,
    },
  ];
}