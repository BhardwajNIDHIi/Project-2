export type NearbyFuelStation = {
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


export const getNearbyFuelStations = async (
  latitude: number,
  longitude: number
): Promise<NearbyFuelStation[]> => {

  const query = `
    [out:json][timeout:15];

    (
      node["amenity"="fuel"](around:15000,${latitude},${longitude});
      way["amenity"="fuel"](around:15000,${latitude},${longitude});
      relation["amenity"="fuel"](around:15000,${latitude},${longitude});

      node["amenity"="fuel_station"](around:15000,${latitude},${longitude});
      way["amenity"="fuel_station"](around:15000,${latitude},${longitude});

      node["shop"="fuel"](around:15000,${latitude},${longitude});
      way["shop"="fuel"](around:15000,${latitude},${longitude});
    );

    out center tags;
  `;


  const servers = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];


  for (const server of servers) {

    try {

      console.log(
        "Trying fuel server:",
        server
      );


      const response = await fetch(
        `${server}?data=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );


      console.log(
        "Fuel API status:",
        response.status
      );


      if (!response.ok) {
        continue;
      }


      const data =
        await response.json();


      console.log(
        "Fuel raw places:",
        data.elements?.length || 0
      );


      const stations: NearbyFuelStation[] =
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


            const latitudeNumber =
              Number(lat);

            const longitudeNumber =
              Number(lon);


            return {

              id:
                `${item.type}-${item.id}`,

              name:
                item.tags?.name ||
                item.tags?.brand ||
                item.tags?.operator ||
                "Fuel Station",

              latitude:
                latitudeNumber,

              longitude:
                longitudeNumber,

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
                  latitudeNumber,
                  longitudeNumber
                ),

            };

          })

          .filter(
            (
              station: NearbyFuelStation | null
            ): station is NearbyFuelStation =>
              station !== null
          )

          .sort(
            (
              a: NearbyFuelStation,
              b: NearbyFuelStation
            ) =>
              a.distance - b.distance
          )

          .slice(0, 15);


      console.log(
        "FUEL STATIONS FOUND:",
        stations.length
      );


      return stations;

    } catch (error) {

      console.log(
        "Fuel server failed:",
        error
      );

    }

  }


  throw new Error(
    "Fuel station service temporarily unavailable"
  );
};