import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>SAFE TOURISM</Text>
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
      width: 260,
    },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: 'Home',
          title: 'Welcome',
        }}
      />
      <Drawer.Screen
  name="explore"
  options={{
    drawerLabel: 'Explore',
    title: 'Explore',
  }}
/>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});