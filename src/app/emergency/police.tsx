import React, {
  useEffect,
  useState,
} from "react";

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

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import PoliceCard from "../components/PoliceCard";

import {
  getNearbyPolice,
  NearbyPolice,
} from "../services/policeService";


type Coordinates = {
  latitude: number;
  longitude: number;
};


export default function PoliceScreen() {

  const [police, setPolice] =
    useState<NearbyPolice[]>([]);

  const [loading, setLoading] =
    useState(true);


  const loadPolice = async () => {

    try {

      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        Alert.alert(
          "Location Permission",
          "Nearby police stations find karne ke liye location permission required hai."
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude =
        current.coords.latitude;

      const longitude =
        current.coords.longitude;

      console.log(
        "USER LOCATION:",
        latitude,
        longitude
      );

      console.log(
        "Finding nearby police stations..."
      );

      const result =
        await getNearbyPolice(
          latitude,
          longitude
        );

      console.log(
        "POLICE FOUND:",
        result.length
      );

      setPolice(result);

    } catch (error) {

      console.log(
        "POLICE ERROR:",
        error
      );

      Alert.alert(
        "Police Error",
        "Nearby police stations load nahi ho paaye."
      );

      setPolice([]);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadPolice();
  }, []);


  const openDirections = (
    station: NearbyPolice
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;

    Linking.openURL(url);
  };


  const callPolice = (
    phone: string | null
  ) => {

    if (!phone) {

      Alert.alert(
        "Phone unavailable",
        "Is police station ka phone number available nahi hai."
      );

      return;
    }

    Linking.openURL(
      `tel:${phone}`
    );
  };


  if (loading) {

    return (
      <View style={styles.loading}>

        <ActivityIndicator
          size="large"
          color="#6C63FF"
        />

        <Text style={styles.loadingText}>
          Finding nearby police stations...
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
            Nearby Police
          </Text>

          <Text style={styles.subtitle}>
            Police stations near your location
          </Text>

        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadPolice}
        >

          <Ionicons
            name="refresh"
            size={21}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>


      {/* LIST */}

      <View style={styles.listContainer}>

        <Text style={styles.listTitle}>
          Police Stations
        </Text>

        <Text style={styles.count}>
          {police.length} stations found
        </Text>


        {police.length === 0 ? (

          <View style={styles.empty}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="shield-outline"
                size={45}
                color="#6C63FF"
              />

            </View>

            <Text style={styles.emptyTitle}>
              No police station found
            </Text>

            <Text style={styles.emptyText}>
              Aapke nearby area mein
              {"\n"}
              police station nahi mila.
            </Text>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={loadPolice}
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
            data={police}

            keyExtractor={(item) =>
              item.id
            }

            renderItem={({ item }) => (

              <PoliceCard
                name={item.name}
                address={item.address}
                distance={item.distance}
                phone={item.phone}

                onDirections={() =>
                  openDirections(item)
                }

                onCall={() =>
                  callPolice(item.phone)
                }
              />

            )}

            contentContainerStyle={
              styles.listContent
            }

            showsVerticalScrollIndicator={
              false
            }
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
    alignItems: "center",
    justifyContent: "center",
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

  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 10,
  },

  listTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  count: {
    color: "#777D91",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 5,
  },

  listContent: {
    paddingTop: 12,
    paddingBottom: 30,
  },

  empty: {
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