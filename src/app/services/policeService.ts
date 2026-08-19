export type NearbyPolice = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  distance: number;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    "name:en"?: string;
    "addr:full"?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    phone?: string;
    "contact:phone"?: string;
  };
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

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

export const getNearbyPolice = async (
  latitude: number,
  longitude: number
): Promise<NearbyPolice[]> => {

  const query = `
    [out:json][timeout:20];

    (
      node["amenity"="police"](around:5000,${latitude},${longitude});
      way["amenity"="police"](around:5000,${latitude},${longitude});
      relation["amenity"="police"](around:5000,${latitude},${longitude});
    );

    out center tags;
  `;

  const servers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let response: Response | null = null;

  for (const server of servers) {

    try {

      const currentResponse =
        await fetch(
          `${server}?data=${encodeURIComponent(query)}`
        );

      console.log(
        "Police API status:",
        currentResponse.status
      );

      if (currentResponse.ok) {

        response = currentResponse;

        break;
      }

    } catch (error) {

      console.log(
        "Police server failed:",
        error
      );

    }
  }

  if (!response) {

    throw new Error(
      "Police service temporarily unavailable"
    );
  }

  const data =
    await response.json();

  const elements: OverpassElement[] =
    data.elements || [];

  const police: NearbyPolice[] =
    elements
      .map(
        (
          item: OverpassElement
        ): NearbyPolice | null => {

          const lat =
            item.lat ??
            item.center?.lat;

          const lon =
            item.lon ??
            item.center?.lon;

          if (
            lat === undefined ||
            lon === undefined
          ) {
            return null;
          }

          const distance =
            calculateDistance(
              latitude,
              longitude,
              Number(lat),
              Number(lon)
            );

          return {

            id:
              String(item.id),

            name:
              item.tags?.name ||
              item.tags?.["name:en"] ||
              "Police Station",

            latitude:
              Number(lat),

            longitude:
              Number(lon),

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
              distance,
          };
        }
      )
      .filter(
        (
          item: NearbyPolice | null
        ): item is NearbyPolice => {
          return item !== null;
        }
      )
      .sort(
        (
          a: NearbyPolice,
          b: NearbyPolice
        ): number => {
          return a.distance - b.distance;
        }
      )
      .slice(0, 15);

  console.log(
    "Police stations found:",
    police.length
  );

  return police;
};