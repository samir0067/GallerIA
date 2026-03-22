/**
 * navigation/AppNavigator.tsx
 *
 * Ce fichier configure la navigation de l'application.
 * On utilise une navigation par onglets (tab navigation) en bas de l'écran,
 * ce qui est le pattern le plus courant dans les applications mobiles.
 *
 * React Navigation est la librairie de navigation standard pour React Native.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { FeedScreen } from '../screens/FeedScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';

// createBottomTabNavigator crée un navigateur avec des onglets en bas de l'écran
const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#6C63FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#999',
        }}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            title: 'GallerIA',
            tabBarLabel: 'Feed',
            // tabBarIcon sera enrichi avec de vraies icônes à l'étape suivante
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🖼️</Text>,
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Mes Favoris',
            tabBarLabel: 'Favoris',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>❤️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
