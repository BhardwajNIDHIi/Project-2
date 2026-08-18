const OVERPASS_URL =
  "https://overpass-api.de/api/interpreter";

export type NearbyHospital = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  distance: number;
};

export async function getNearbyHospitals(
  latitude: number,
  longitude: number
): Promise<NearbyHospital[]> {

  const query = `
[out:json][timeout:25];
node["amenity"="hospital"]
(around:5000,${latitude},${longitude});
out;
`;

  try {

    const response = await fetch(
      `${OVERPASS_URL}?data=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(
        `Hospital server error: ${response.status}`
      );
    }

    const data =
      await response.json();

    const hospitals =
      data.elements || [];

    return hospitals
      .filter(
        (item: any) =>
          typeof item.lat === "number" &&
          typeof item.lon === "number"
      )
      .map(
        (item: any) => ({
          id:
            `${item.type}-${item.id}`,

          name:
            item.tags?.name ||
            "Hospital",

          latitude:
            item.lat,

          longitude:
            item.lon,

          address:
            item.tags?.["addr:full"] ||
            item.tags?.["addr:street"] ||
            "Address not available",

          phone:
            item.tags?.phone ||
            item.tags?.["contact:phone"] ||
            null,

          distance:
            calculateDistance(
              latitude,
              longitude,
              item.lat,
              item.lon
            ),
        })
      )
      .sort(
        (a: NearbyHospital, b: NearbyHospital) =>
          a.distance - b.distance
      )
      .slice(0, 15);

  } catch (error) {

    console.error(
      "Hospital API Error:",
      error
    );

    throw error;
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {

  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
    Math.cos(
      (lat2 * Math.PI) / 180
    ) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}