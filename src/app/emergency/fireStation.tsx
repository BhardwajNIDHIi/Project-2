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

import FireStationCard from "../components/FireStationCard";

import {
  getNearbyFireStations,
  NearbyFireStation,
} from "../services/fireStationService";


export default function FireStationScreen() {

  const [stations, setStations] =
    useState<NearbyFireStation[]>([]);

  const [loading, setLoading] =
    useState(true);


  const loadFireStations = async () => {

    try {

      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        Alert.alert(
          "Location Permission",
          "Nearby fire stations find karne ke liye location permission required hai."
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const result =
        await getNearbyFireStations(
          current.coords.latitude,
          current.coords.longitude
        );

      console.log(
        "FIRE STATIONS FOUND:",
        result.length
      );

      setStations(result);

    } catch (error) {

      console.log(
        "FIRE STATION ERROR:",
        error
      );

      Alert.alert(
        "Fire Station Error",
        "Nearby fire stations load nahi ho paaye."
      );

      setStations([]);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadFireStations();
  }, []);


  const openDirections = (
    station: NearbyFireStation
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;

    Linking.openURL(url);
  };


  const callStation = (
    phone: string | null
  ) => {

    if (!phone) {

      Alert.alert(
        "Phone unavailable",
        "Is fire station ka phone number available nahi hai."
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
          Finding nearby fire stations...
        </Text>

      </View>
    );
  }


  return (
    <View style={styles.container}>

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
            Nearby Fire Stations
          </Text>

          <Text style={styles.subtitle}>
            Fire stations near your location
          </Text>

        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadFireStations}
        >

          <Ionicons
            name="refresh"
            size={21}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>


      <View style={styles.listContainer}>

        <Text style={styles.listTitle}>
          Nearby Fire Stations
        </Text>

        <Text style={styles.count}>
          {stations.length} fire stations found
        </Text>


        {stations.length === 0 ? (

          <View style={styles.empty}>

            <Ionicons
              name="flame-outline"
              size={50}
              color="#EF4444"
            />

            <Text style={styles.emptyTitle}>
              No fire station found
            </Text>

            <Text style={styles.emptyText}>
              Aapke nearby area mein
              {"\n"}
              fire station nahi mila.
            </Text>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={loadFireStations}
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
            data={stations}

            keyExtractor={(item) =>
              item.id
            }

            renderItem={({ item }) => (

              <FireStationCard
                name={item.name}
                address={item.address}
                distance={item.distance}
                phone={item.phone}

                onDirections={() =>
                  openDirections(item)
                }

                onCall={() =>
                  callStation(item.phone)
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