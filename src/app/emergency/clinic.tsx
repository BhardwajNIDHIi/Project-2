import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from "react-native";

import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import ClinicCard from "../components/ClinicCard";

import {
  getNearbyClinics,
  NearbyClinic,
} from "../services/clinicService";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function ClinicScreen() {
  const [location, setLocation] =
    useState<Coordinates | null>(null);

  const [clinics, setClinics] =
    useState<NearbyClinic[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadClinics = async () => {
    try {
      setLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Clinic find karne ke liye location permission required hai."
        );

        setLoading(false);
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const coords: Coordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      console.log("USER LOCATION:", coords);

      setLocation(coords);

      console.log("Finding nearby clinics...");

      const result = await getNearbyClinics(
        coords.latitude,
        coords.longitude
      );

      console.log("CLINICS FOUND:", result.length);

      setClinics(result);
    } catch (error) {
      console.log("CLINIC ERROR:", error);

      Alert.alert(
        "Clinic Error",
        "Nearby clinics load nahi ho paayi."
      );

      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const openDirections = (clinic: NearbyClinic) => {
    const url =
      `https://www.google.com/maps/dir/?api=1&destination=` +
      `${clinic.latitude},${clinic.longitude}`;

    Linking.openURL(url);
  };

  const callClinic = (phone: string | null) => {
    if (!phone) {
      Alert.alert(
        "Phone unavailable",
        "Is clinic ka phone number available nahi hai."
      );
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#6C63FF"
        />

        <Text style={styles.loadingText}>
          Finding nearby clinics...
        </Text>
      </View>
    );
  }

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
            Nearby Clinics
          </Text>

          <Text style={styles.subtitle}>
            Clinics near your location
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadClinics}
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

            {/* CLINIC MARKERS */}

            {clinics.map((clinic) => (
              <Marker
                key={clinic.id}
                coordinate={{
                  latitude: clinic.latitude,
                  longitude: clinic.longitude,
                }}
                title={clinic.name}
                description={
                  `${clinic.distance.toFixed(1)} km away`
                }
              >
                <View style={styles.clinicMarker}>
                  <Ionicons
                    name="medkit"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </Marker>
            ))}

          </MapView>
        </View>
      )}

      {/* CLINIC LIST */}

      <View style={styles.listContainer}>

        <View style={styles.listHeader}>

          <View>
            <Text style={styles.listTitle}>
              Nearby Clinics
            </Text>

            <Text style={styles.count}>
              {clinics.length} clinics found
            </Text>
          </View>

          <View style={styles.badge}>
            <Ionicons
              name="location"
              size={14}
              color="#6C63FF"
            />

            <Text style={styles.badgeText}>
              Nearby
            </Text>
          </View>

        </View>

        {clinics.length === 0 ? (

          <View style={styles.empty}>

            <Ionicons
              name="medkit-outline"
              size={50}
              color="#6C63FF"
            />

            <Text style={styles.emptyTitle}>
              No clinics found
            </Text>

            <Text style={styles.emptyText}>
              Aapke nearby area mein{"\n"}
              koi clinic nahi mila.
            </Text>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={loadClinics}
            >
              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.searchText}>
                Search Again
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          <FlatList
            data={clinics}
            keyExtractor={(item) => item.id}

            renderItem={({ item }) => (
              <ClinicCard
                name={item.name}
                address={item.address}
                distance={item.distance}
                phone={item.phone}
                onDirections={() =>
                  openDirections(item)
                }
                onCall={() =>
                  callClinic(item.phone)
                }
              />
            )}

            contentContainerStyle={
              styles.listContent
            }

            showsVerticalScrollIndicator={false}
          />

        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },

  loading: {
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
    paddingTop: 35,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#151A2E",
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },

  mapContainer: {
    height: 280,
    marginHorizontal: 15,
    borderRadius: 20,
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  clinicMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  listContainer: {
    flex: 1,
    marginTop: 15,
    paddingHorizontal: 15,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  listTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  count: {
    color: "#777D91",
    fontSize: 12,
    marginTop: 3,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171936",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  badgeText: {
    color: "#A8ACBC",
    fontSize: 11,
    marginLeft: 4,
  },

  listContent: {
    paddingTop: 15,
    paddingBottom: 30,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 15,
  },

  emptyText: {
    color: "#777D91",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  searchButton: {
    marginTop: 20,
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  searchText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
  },

});