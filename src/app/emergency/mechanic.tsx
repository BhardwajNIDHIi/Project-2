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

import MechanicCard from "../components/MechanicCard";

import {
  getNearbyMechanics,
  NearbyMechanic,
} from "../services/mechanicService";


export default function MechanicScreen() {

  const [mechanics, setMechanics] =
    useState<NearbyMechanic[]>([]);

  const [loading, setLoading] =
    useState(true);


  const loadMechanics = async () => {

    try {

      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        Alert.alert(
          "Location Permission",
          "Nearby mechanics find karne ke liye location permission required hai."
        );

        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const result =
        await getNearbyMechanics(
          current.coords.latitude,
          current.coords.longitude
        );

      console.log(
        "MECHANICS FOUND:",
        result.length
      );

      setMechanics(result);

    } catch (error) {

      console.log(
        "MECHANIC ERROR:",
        error
      );

      Alert.alert(
        "Mechanic Error",
        "Nearby mechanics load nahi ho paaye."
      );

      setMechanics([]);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadMechanics();
  }, []);


  const openDirections = (
    mechanic: NearbyMechanic
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${mechanic.latitude},${mechanic.longitude}`;

    Linking.openURL(url);
  };


  const callMechanic = (
    phone: string | null
  ) => {

    if (!phone) {

      Alert.alert(
        "Phone unavailable",
        "Is mechanic ka phone number available nahi hai."
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
          Finding nearby mechanics...
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
            Nearby Mechanics
          </Text>

          <Text style={styles.subtitle}>
            Mechanics near your location
          </Text>

        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadMechanics}
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
          Nearby Mechanics
        </Text>

        <Text style={styles.count}>
          {mechanics.length} mechanics found
        </Text>


        {mechanics.length === 0 ? (

          <View style={styles.empty}>

            <Ionicons
              name="construct-outline"
              size={50}
              color="#F59E0B"
            />

            <Text style={styles.emptyTitle}>
              No mechanics found
            </Text>

            <Text style={styles.emptyText}>
              Aapke nearby area mein
              {"\n"}
              mechanic nahi mila.
            </Text>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={loadMechanics}
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
            data={mechanics}

            keyExtractor={(item) =>
              item.id
            }

            renderItem={({ item }) => (

              <MechanicCard
                name={item.name}
                address={item.address}
                distance={item.distance}
                phone={item.phone}

                onDirections={() =>
                  openDirections(item)
                }

                onCall={() =>
                  callMechanic(item.phone)
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