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

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        Alert.alert(
          "Location Permission",
          "Clinic find karne ke liye location permission required hai."
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(coords);

      const result =
        await getNearbyClinics(
          coords.latitude,
          coords.longitude
        );

      setClinics(result);

    } catch (error) {

      console.log("CLINIC ERROR:", error);

      Alert.alert(
        "Error",
        "Clinics load nahi ho paayi."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadClinics();
  }, []);


  const openDirections = (
    clinic: NearbyClinic
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;

    Linking.openURL(url);
  };


  const callClinic = (
    phone: string | null
  ) => {

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
          style={styles.back}
          onPress={() => router.back()}
        >

          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />

        </TouchableOpacity>

        <View>

          <Text style={styles.title}>
            Nearby Clinics
          </Text>

          <Text style={styles.subtitle}>
            Clinics near your location
          </Text>

        </View>

      </View>


      {/* MAP */}

      {location && (

        <View style={styles.mapContainer}>

          <MapView
            style={styles.map}
            showsUserLocation
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >

            <Marker
              coordinate={location}
              title="Your Location"
            />

            {clinics.map((clinic) => (

              <Marker
                key={clinic.id}
                coordinate={{
                  latitude: clinic.latitude,
                  longitude: clinic.longitude,
                }}
                title={clinic.name}
                description={`${clinic.distance} km away`}
              >

                <View style={styles.marker}>

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


      {/* LIST */}

      <View style={styles.list}>

        <Text style={styles.listTitle}>
          Nearby Clinics
        </Text>

        <Text style={styles.count}>
          {clinics.length} clinics found
        </Text>


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
          contentContainerStyle={{
            paddingTop: 15,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
        />

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
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    marginTop: 15,
  },

  header: {
    height: 90,
    paddingTop: 35,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#151A2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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

  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  list: {
    flex: 1,
    marginTop: 15,
    paddingHorizontal: 15,
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

});