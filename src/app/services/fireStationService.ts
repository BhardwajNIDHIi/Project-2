export type NearbyFireStation = {
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

export const getNearbyFireStations = async (
  latitude: number,
  longitude: number
): Promise<NearbyFireStation[]> => {

  const query = `
    [out:json][timeout:15];

    node["amenity"="fire_station"]
      (around:10000,${latitude},${longitude});

    out tags;
  `;

  const servers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const server of servers) {

    try {

      console.log(
        "Trying fire station API:",
        server
      );

      const url =
        `${server}?data=${encodeURIComponent(query)}`;

      const response =
        await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

      console.log(
        "Fire Station API status:",
        response.status
      );

      if (!response.ok) {
        continue;
      }

      const data =
        await response.json();

      const stations: NearbyFireStation[] =
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
                "Fire Station",

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
              item: NearbyFireStation | null
            ): item is NearbyFireStation =>
              item !== null
          )
          .sort(
            (
              a: NearbyFireStation,
              b: NearbyFireStation
            ) =>
              a.distance - b.distance
          )
          .slice(0, 15);

      console.log(
        "FIRE STATIONS FOUND:",
        stations.length
      );

      return stations;

    } catch (error) {

      console.log(
        "Fire station server failed:",
        error
      );

    }
  }

  throw new Error(
    "Fire station service temporarily unavailable"
  );
};