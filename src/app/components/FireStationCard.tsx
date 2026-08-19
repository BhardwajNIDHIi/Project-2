import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: string;
  address: string;
  distance: number;
  phone: string | null;
  onDirections: () => void;
  onCall: () => void;
};

export default function FireStationCard({
  name,
  address,
  distance,
  phone,
  onDirections,
  onCall,
}: Props) {
  return (
    <View style={styles.card}>

      <View style={styles.top}>

        <View style={styles.icon}>
          <Ionicons
            name="flame"
            size={22}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.info}>

          <Text
            style={styles.name}
            numberOfLines={2}
          >
            {name}
          </Text>

          <Text style={styles.distance}>
            {distance.toFixed(1)} km away
          </Text>

          <Text
            style={styles.address}
            numberOfLines={2}
          >
            {address}
          </Text>

        </View>

      </View>

      <View style={styles.actions}>

        <TouchableOpacity
          style={styles.button}
          onPress={onDirections}
        >
          <Ionicons
            name="navigate"
            size={17}
            color="#00D4FF"
          />

          <Text style={styles.buttonText}>
            Directions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onCall}
        >
          <Ionicons
            name="call"
            size={17}
            color="#22C55E"
          />

          <Text style={styles.buttonText}>
            Call
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#0F1426",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#202640",
  },

  top: {
    flexDirection: "row",
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  distance: {
    color: "#00D4FF",
    fontSize: 12,
    marginTop: 3,
  },

  address: {
    color: "#8A8FA3",
    fontSize: 11,
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  button: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#171D35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#D9DBE5",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },

});