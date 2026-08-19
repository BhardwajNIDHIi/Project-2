export type NearbyClinic = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  distance: number;
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

export const getNearbyClinics = async (
  latitude: number,
  longitude: number
): Promise<NearbyClinic[]> => {

  // Simple query — only clinics
  const query = `
    [out:json][timeout:10];
    node["amenity"="clinic"]
      (around:3000,${latitude},${longitude});
    out;
  `;

  try {

    console.log("Calling clinic API...");

    const url =
      "https://overpass.kumi.systems/api/interpreter?data=" +
      encodeURIComponent(query);

    const response = await fetch(url);

    console.log(
      "Clinic API status:",
      response.status
    );

    if (!response.ok) {

      const errorText = await response.text();

      console.log(
        "Clinic API error:",
        errorText
      );

      throw new Error(
        `Clinic server error: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      "Clinic places received:",
      data.elements?.length || 0
    );

    const clinics: NearbyClinic[] =
      (data.elements || [])
        .map((item: any) => {

          const lat = item.lat;
          const lon = item.lon;

          if (
            lat == null ||
            lon == null
          ) {
            return null;
          }

          return {
            id: String(item.id),

            name:
              item.tags?.name ||
              item.tags?.["name:en"] ||
              "Nearby Clinic",

            latitude: Number(lat),

            longitude: Number(lon),

            address:
              item.tags?.["addr:full"] ||
              item.tags?.["addr:street"] ||
              item.tags?.["addr:city"] ||
              "Address not available",

            phone:
              item.tags?.phone ||
              item.tags?.["contact:phone"] ||
              null,

            distance:
              calculateDistance(
                latitude,
                longitude,
                Number(lat),
                Number(lon)
              ),
          };
        })
        .filter(
          (
            clinic: NearbyClinic | null
          ): clinic is NearbyClinic =>
            clinic !== null
        )
        .sort(
          (
            a: NearbyClinic,
            b: NearbyClinic
          ) =>
            a.distance - b.distance
        )
        .slice(0, 15);

    return clinics;

  } catch (error) {

    console.log(
      "CLINIC API ERROR:",
      error
    );

    throw error;
  }
};