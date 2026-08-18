import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { router } from "expo-router";
type Tourist = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
};

type EmergencyService = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const emergencyServices: EmergencyService[] = [
  {
    id: 'hospital',
    title: 'Hospital',
    icon: 'medkit',
    color: '#E53935',
  },
  {
    id: 'clinic',
    title: 'Clinic',
    icon: 'medical',
    color: '#8E44AD',
  },
  {
    id: 'police',
    title: 'Police',
    icon: 'shield-checkmark',
    color: '#2980B9',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    icon: 'flask',
    color: '#27AE60',
  },
  {
    id: 'mechanic',
    title: 'Mechanic',
    icon: 'build',
    color: '#F39C12',
  },
  {
    id: 'fire',
    title: 'Fire Station',
    icon: 'flame',
    color: '#E74C3C',
  },
  {
    id: 'atm',
    title: 'ATM',
    icon: 'cash',
    color: '#16A085',
  },
  {
    id: 'fuel',
    title: 'Fuel',
    icon: 'car',
    color: '#34495E',
  },
];

export default function Home() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [loadingLocation, setLoadingLocation] =
    useState(true);

  const [placeName, setPlaceName] =
    useState('Getting location...');

  // Temporary testing data
  // Later this will come from backend/MongoDB.
  const [activeTourists] = useState<Tourist[]>([
    {
      id: '1',
      name: 'Tourist 1',
      latitude: 28.7041,
      longitude: 77.1025,
      distance: '1.2 km away',
    },
    {
      id: '2',
      name: 'Tourist 2',
      latitude: 28.7085,
      longitude: 77.1055,
      distance: '2.4 km away',
    },
  ]);

  
  // LIVE LOCATION
  

  useEffect(() => {
    let locationSubscription:
      | Location.LocationSubscription
      | null = null;

    const startLiveLocation = async () => {
      try {
        setLoadingLocation(true);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !== Location.PermissionStatus.GRANTED
        ) {
          setPlaceName('Location permission required');

          Alert.alert(
            'Location Permission',
            'Please allow location permission to use Safe Tourism.'
          );

          setLoadingLocation(false);
          return;
        }

        // Get current location immediately
        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setLocation(currentLocation);

        // Get city/country name
        try {
          const address =
            await Location.reverseGeocodeAsync({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });

          if (address.length > 0) {
            const place = address[0];

            const city =
              place.city ||
              place.district ||
              place.subregion ||
              'Unknown';

            const country =
              place.country || '';

            setPlaceName(`${city}, ${country}`);
          }
        } catch (error) {
          console.log(
            'Reverse Geocode Error:',
            error
          );
        }

        setLoadingLocation(false);

        
        // START LIVE LOCATION TRACKING
       

        locationSubscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,

              // Request location update every ~3 seconds
              timeInterval: 3000,

              // Or when user moves approximately 5 meters
              distanceInterval: 5,
            },
            (newLocation) => {
              console.log(
                'LIVE LOCATION:',
                newLocation.coords.latitude,
                newLocation.coords.longitude
              );

              setLocation(newLocation);
            }
          );
      } catch (error) {
        console.log(
          'Location Error:',
          error
        );

        setPlaceName(
          'Unable to get location'
        );

        setLoadingLocation(false);

        Alert.alert(
          'Location Error',
          'Unable to get your current location.'
        );
      }
    };

    startLiveLocation();

    // Stop tracking when screen closes
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  
  // EMERGENCY SERVICE
  

  const openEmergencyService = (
  service: EmergencyService
) => {
  if (service.id === 'hospital') {
    router.push('/emergency/hospital');
    return;
  }

  Alert.alert(
    service.title,
    `Finding nearby ${service.title.toLowerCase()} services...`
  );
};

  
  // TOURIST LOCATION
  

  const openTouristLocation = (
    tourist: Tourist
  ) => {
    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${tourist.latitude},${tourist.longitude}`;

    Linking.openURL(url);
  };

  
  // UI
  

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 
          LOCATION CARD
       */}

      <View style={styles.locationCard}>
        {/* LEFT INFORMATION */}

        <View style={styles.locationInfo}>
          {/* Current Location */}

          <View style={styles.infoRow}>
            <View style={styles.greenDot} />

            <Text style={styles.infoLabel}>
              Current Location
            </Text>
          </View>

          <Text style={styles.placeName}>
            {placeName}
          </Text>

          {/* Divider */}

          <View style={styles.divider} />

          {/* Safety Status */}

          <View style={styles.infoRow}>
            <View style={styles.greenDot} />

            <Text style={styles.infoLabel}>
              Safety Status
            </Text>
          </View>

          <View style={styles.safeRow}>
            <View style={styles.safeIcon}>
              <Ionicons
                name="checkmark"
                size={16}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.safeText}>
              SAFE AREA
            </Text>
          </View>
        </View>

        {/* ==================================
            SMALL LIVE MAP
        =================================== */}

        <View style={styles.smallMapContainer}>
          {loadingLocation ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator
                size="small"
                color="#00D4FF"
              />

              <Text style={styles.mapLoadingText}>
                Locating...
              </Text>
            </View>
          ) : location ? (
            <MapView
              style={styles.smallMap}
              showsUserLocation={true}
              showsMyLocationButton={false}
              followsUserLocation={true}
              initialRegion={{
                latitude:
                  location.coords.latitude,
                longitude:
                  location.coords.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }}
            >
              {/* YOUR LIVE LOCATION */}

              <Marker
                coordinate={{
                  latitude:
                    location.coords.latitude,
                  longitude:
                    location.coords.longitude,
                }}
                title="You are here"
                description="Your live location"
              >
                <View
                  style={styles.liveMarker}
                >
                  <View
                    style={styles.markerDot}
                  />
                </View>
              </Marker>

              {/* ACTIVE TOURISTS */}

              {activeTourists.map(
                (tourist) => (
                  <Marker
                    key={tourist.id}
                    coordinate={{
                      latitude:
                        tourist.latitude,
                      longitude:
                        tourist.longitude,
                    }}
                    title={tourist.name}
                    description={
                      tourist.distance
                    }
                  >
                    <View
                      style={
                        styles.touristMarker
                      }
                    >
                      <Ionicons
                        name="person"
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>
                  </Marker>
                )
              )}
            </MapView>
          ) : (
            <View style={styles.mapLoading}>
              <Ionicons
                name="location-outline"
                size={30}
                color="#00D4FF"
              />

              <Text
                style={styles.mapLoadingText}
              >
                Location unavailable
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 
          EMERGENCY SERVICES*/}

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionTitle}>
              Emergency Services
            </Text>

            <Text style={styles.sectionSubtitle}>
              Find essential services near you
            </Text>
          </View>

          <Ionicons
            name="navigate"
            size={22}
            color="#6C63FF"
          />
        </View>

        <View style={styles.servicesGrid}>
          {emergencyServices.map(
            (service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                activeOpacity={0.8}
                onPress={() =>
                  openEmergencyService(
                    service
                  )
                }
              >
                <View
                  style={[
                    styles.serviceIcon,
                    {
                      backgroundColor:
                        `${service.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={service.icon}
                    size={25}
                    color={service.color}
                  />
                </View>

                <Text
                  style={
                    styles.serviceTitle
                  }
                >
                  {service.title}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* 
          ACTIVE TOURISTS
       */}

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionTitle}>
              Active Tourists
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tourists currently active nearby
            </Text>
          </View>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />

            <Text
              style={styles.activeBadgeText}
            >
              {activeTourists.length} Active
            </Text>
          </View>
        </View>

        <View
          style={styles.touristsContainer}
        >
          {activeTourists.length === 0 ? (
            <View
              style={styles.emptyContainer}
            >
              <Ionicons
                name="people-outline"
                size={40}
                color="#8A8FA3"
              />

              <Text
                style={styles.emptyTitle}
              >
                No active tourists nearby
              </Text>

              <Text
                style={styles.emptyText}
              >
                Other active tourists will
                appear here.
              </Text>
            </View>
          ) : (
            activeTourists.map(
              (tourist) => (
                <TouchableOpacity
                  key={tourist.id}
                  style={styles.touristCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    openTouristLocation(
                      tourist
                    )
                  }
                >
                  <View
                    style={styles.touristAvatar}
                  >
                    <Ionicons
                      name="person"
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={styles.touristInfo}
                  >
                    <View
                      style={styles.nameRow}
                    >
                      <Text
                        style={
                          styles.touristName
                        }
                      >
                        {tourist.name}
                      </Text>

                      <View
                        style={
                          styles.onlineDot
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.touristDistance
                      }
                    >
                      {tourist.distance}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color="#8A8FA3"
                  />
                </TouchableOpacity>
              )
            )
          )}
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B18',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 15,
  },

  

  locationCard: {
    minHeight: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#42266D',
    backgroundColor: '#0B1020',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 15,
    marginBottom: 25,

    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 4,
  },

  locationInfo: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#00D4A8',
    marginRight: 8,
  },

  infoLabel: {
    color: '#D8D9E2',
    fontSize: 12,
    fontWeight: '500',
  },

  placeName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 7,
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: '#29304A',
    marginBottom: 14,
  },

  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  safeIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#20B84B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  safeText: {
    color: '#20E65A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  

  smallMapContainer: {
    width: '45%',
    height: 155,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#11182B',
  },

  smallMap: {
    width: '100%',
    height: '100%',
  },

  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11182B',
  },

  mapLoadingText: {
    color: '#8E94A8',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },

  liveMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2878FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',

    shadowColor: '#2878FF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,

    elevation: 6,
  },

  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  touristMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ========================================
  // SECTIONS
  // ========================================

  sectionContainer: {
    marginBottom: 25,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8A8FA3',
    marginTop: 4,
  },

  

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  serviceCard: {
    width: '23.5%',
    minHeight: 100,
    backgroundColor: '#0F1426',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#202640',
    paddingHorizontal: 4,
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  serviceTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D9DBE5',
    textAlign: 'center',
  },

  

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2A1A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#164D2C',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22E66A',
  },

  touristsContainer: {
    backgroundColor: '#0F1426',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#202640',
  },

  touristCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#202640',
  },

  touristAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  touristInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  touristName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginLeft: 7,
  },

  touristDistance: {
    fontSize: 12,
    color: '#8A8FA3',
    marginTop: 4,
  },

  emptyContainer: {
    paddingVertical: 35,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D9DBE5',
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    color: '#8A8FA3',
    marginTop: 5,
  },
});