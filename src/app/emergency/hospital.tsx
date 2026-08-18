import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";

import * as Location from "expo-location";

import MapView, { Marker } from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import {
  getNearbyHospitals,
  NearbyHospital,
} from "../services/hospitalService";


// ========================================
// TYPES
// ========================================

type Coordinates = {
  latitude: number;
  longitude: number;
};


// ========================================
// SCREEN
// ========================================

export default function HospitalScreen() {
  const [location, setLocation] =
    useState<Coordinates | null>(null);

  const [hospitals, setHospitals] =
    useState<NearbyHospital[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);


  // ========================================
  // LOAD HOSPITALS
  // ========================================

  const loadHospitals = async (): Promise<void> => {
    try {
      setLoading(true);

      // LOCATION PERMISSION
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Hospital find karne ke liye location permission required hai."
        );

        return;
      }


      // CURRENT LOCATION
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });


      const coords: Coordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };


      console.log("CURRENT LOCATION:", coords);

      setLocation(coords);


      // ========================================
      // GET HOSPITALS
      // ========================================

      console.log("Finding hospitals...");


      const result =
        await getNearbyHospitals(
          coords.latitude,
          coords.longitude
        );


      console.log(
        "HOSPITALS RECEIVED:",
        result.length
      );


      setHospitals(result);

    } catch (error) {
      console.log(
        "Hospital Error:",
        error
      );

      Alert.alert(
        "Hospital Error",
        "Nearby hospitals load nahi ho paaye. Please try again."
      );

      setHospitals([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadHospitals();
  }, []);


  // ========================================
  // REFRESH
  // ========================================

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadHospitals();
  };


  // ========================================
  // DIRECTIONS
  // ========================================

  const openDirections = (
    hospital: NearbyHospital
  ): void => {

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${hospital.latitude},${hospital.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;

    Linking.openURL(url);
  };


  // ========================================
  // CALL HOSPITAL
  // ========================================

  const callHospital = (
    phone: string | null
  ): void => {

    if (!phone) {
      Alert.alert(
        "Phone unavailable",
        "Is hospital ka phone number available nahi hai."
      );

      return;
    }


    const cleanedPhone =
      phone.replace(/[^0-9+]/g, "");


    Linking.openURL(
      `tel:${cleanedPhone}`
    );
  };


  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#6C63FF"
        />

        <Text style={styles.loadingText}>
          Finding nearby hospitals...
        </Text>

      </View>
    );
  }


  // ========================================
  // MAIN UI
  // ========================================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>


        <View style={styles.headerText}>

          <Text style={styles.title}>
            Emergency Hospital
          </Text>

          <Text style={styles.subtitle}>
            Hospitals near your location
          </Text>

        </View>


        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons
            name="refresh"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>

      </View>


      {/* MAP */}

      {location && (
        <View style={styles.mapContainer}>

          <MapView
            style={styles.map}

            showsUserLocation={true}

            showsMyLocationButton={true}

            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,

              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >

            {/* USER LOCATION */}

            <Marker
              coordinate={location}
              title="Your Location"
            >

              <View style={styles.userMarker}>

                <Ionicons
                  name="person"
                  size={18}
                  color="#FFFFFF"
                />

              </View>

            </Marker>


            {/* HOSPITAL MARKERS */}

            {hospitals.map((hospital) => (

              <Marker
                key={hospital.id}

                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}

                title={hospital.name}

                description={
                  hospital.address
                }
              >

                <View style={styles.hospitalMarker}>

                  <Ionicons
                    name="medical"
                    size={18}
                    color="#FFFFFF"
                  />

                </View>

              </Marker>

            ))}

          </MapView>

        </View>
      )}


      {/* LIST */}

      <View style={styles.listContainer}>

        <View style={styles.listHeader}>

          <View>

            <Text style={styles.nearbyTitle}>
              Nearby Hospitals
            </Text>

            <Text style={styles.countText}>
              {hospitals.length} hospitals found
            </Text>

          </View>


          <View style={styles.radiusBadge}>

            <Ionicons
              name="location"
              size={14}
              color="#6C63FF"
            />

            <Text style={styles.radiusText}>
              Nearby
            </Text>

          </View>

        </View>


        {/* NO HOSPITALS */}

        {hospitals.length === 0 ? (

          <View style={styles.emptyContainer}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="medical-outline"
                size={40}
                color="#6C63FF"
              />

            </View>


            <Text style={styles.emptyTitle}>
              No hospitals found
            </Text>


            <Text style={styles.emptyText}>
              Nearby area mein{"\n"}
              hospital nahi mila.
            </Text>


            <TouchableOpacity
              style={styles.refreshLargeButton}
              onPress={handleRefresh}
            >

              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.refreshLargeText}>
                Search Again
              </Text>

            </TouchableOpacity>

          </View>

        ) : (

          /* HOSPITAL LIST */

          <FlatList
            data={hospitals}

            keyExtractor={(item) =>
              item.id
            }

            renderItem={({ item }) => (

              <View style={styles.hospitalCard}>

                {/* HOSPITAL INFO */}

                <View style={styles.hospitalInfo}>

                  <View style={styles.hospitalIcon}>

                    <Ionicons
                      name="medical"
                      size={22}
                      color="#FFFFFF"
                    />

                  </View>


                  <View style={styles.hospitalDetails}>

                    <Text
                      style={styles.hospitalName}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>


                    <Text style={styles.hospitalAddress}>
                      {item.address}
                    </Text>

                  </View>

                </View>


                {/* ACTION BUTTONS */}

                <View style={styles.actionRow}>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      openDirections(item)
                    }
                  >

                    <Ionicons
                      name="navigate"
                      size={18}
                      color="#00D4FF"
                    />

                    <Text style={styles.actionText}>
                      Directions
                    </Text>

                  </TouchableOpacity>


                  {item.phone && (

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        callHospital(item.phone)
                      }
                    >

                      <Ionicons
                        name="call"
                        size={18}
                        color="#22C55E"
                      />

                      <Text style={styles.actionText}>
                        Call
                      </Text>

                    </TouchableOpacity>

                  )}

                </View>

              </View>

            )}

            contentContainerStyle={
              styles.listContent
            }

            showsVerticalScrollIndicator={false}

            refreshing={refreshing}

            onRefresh={handleRefresh}
          />

        )}

      </View>

    </View>
  );
}


// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },


  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1020",
    justifyContent: "center",
    alignItems: "center",
  },


  loadingText: {
    color: "#FFFFFF",
    marginTop: 15,
    fontSize: 14,
  },


  header: {
    height: 90,
    paddingHorizontal: 18,
    paddingTop: 38,
    flexDirection: "row",
    alignItems: "center",
  },


  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#151A2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },


  headerText: {
    flex: 1,
  },


  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },


  subtitle: {
    color: "#777D91",
    fontSize: 12,
    marginTop: 3,
  },


  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#151A2E",
    alignItems: "center",
    justifyContent: "center",
  },


  mapContainer: {
    height: 300,
    marginHorizontal: 15,
    borderRadius: 22,
    overflow: "hidden",
  },


  map: {
    width: "100%",
    height: "100%",
  },


  userMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#00D4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },


  hospitalMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },


  listContainer: {
    flex: 1,
    marginTop: 18,
  },


  listHeader: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },


  nearbyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },


  countText: {
    color: "#777D91",
    fontSize: 12,
    marginTop: 3,
  },


  radiusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171936",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },


  radiusText: {
    color: "#A8ACBC",
    fontSize: 11,
    marginLeft: 4,
  },


  listContent: {
    padding: 15,
    paddingBottom: 30,
  },


  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },


  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 22,
    backgroundColor: "#171936",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },


  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },


  emptyText: {
    color: "#777D91",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 19,
    fontSize: 12,
  },


  refreshLargeButton: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  refreshLargeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },


  hospitalCard: {
    backgroundColor: "#0F1426",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#202640",
  },


  hospitalInfo: {
    flexDirection: "row",
  },


  hospitalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },


  hospitalDetails: {
    flex: 1,
    marginLeft: 12,
  },


  hospitalName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },


  hospitalAddress: {
    color: "#8A8FA3",
    fontSize: 11,
    marginTop: 6,
  },


  actionRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },


  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#171D35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  actionText: {
    color: "#D9DBE5",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },

});