export type NearbyPharmacy = {
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

export const getNearbyPharmacies = async (
  latitude: number,
  longitude: number
): Promise<NearbyPharmacy[]> => {

  const query = `
    [out:json][timeout:20];

    (
      node["amenity"="pharmacy"](around:10000,${latitude},${longitude});
      way["amenity"="pharmacy"](around:10000,${latitude},${longitude});
      relation["amenity"="pharmacy"](around:10000,${latitude},${longitude});
    );

    out center tags;
  `;

  const servers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  let response: Response | null = null;

  for (const server of servers) {

    try {

      console.log("Trying pharmacy server:", server);

      const currentResponse = await fetch(server, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          `data=${encodeURIComponent(query)}`,
      });

      console.log(
        "Pharmacy API status:",
        currentResponse.status
      );

      if (currentResponse.ok) {

        response = currentResponse;

        break;
      }

      const errorText =
        await currentResponse.text();

      console.log(
        "Pharmacy server error:",
        errorText
      );

    } catch (error) {

      console.log(
        "Pharmacy server failed:",
        error
      );

    }
  }

  if (!response) {

    throw new Error(
      "Pharmacy service temporarily unavailable"
    );
  }

  const data =
    await response.json();

  const pharmacies: NearbyPharmacy[] =
    (data.elements || [])
      .map((item: any) => {

        const lat =
          item.lat ??
          item.center?.lat;

        const lon =
          item.lon ??
          item.center?.lon;

        if (
          lat == null ||
          lon == null
        ) {
          return null;
        }

        return {

          id:
            String(item.id),

          name:
            item.tags?.name ||
            item.tags?.["name:en"] ||
            "Nearby Pharmacy",

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
          item: NearbyPharmacy | null
        ): item is NearbyPharmacy =>
          item !== null
      )
      .sort(
        (
          a: NearbyPharmacy,
          b: NearbyPharmacy
        ) =>
          a.distance - b.distance
      )
      .slice(0, 15);

  console.log(
    "PHARMACIES FOUND:",
    pharmacies.length
  );

  return pharmacies;
};