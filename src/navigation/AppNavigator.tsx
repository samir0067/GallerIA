/**
 * navigation/AppNavigator.tsx
 *
 * Configure la navigation par onglets de l'application.
 *
 * Dans cette version, AppNavigator lit le nombre de favoris depuis le Context
 * pour mettre à jour le Badge de l'onglet "Favoris" en temps réel.
 *
 * POURQUOI AppNavigator peut lire le Context ?
 * FavoritesProvider est monté dans App.tsx, AU-DESSUS d'AppNavigator.
 * Tout composant qui est un enfant (direct ou indirect) du Provider
 * peut appeler useFavoritesContext() sans problème.
 *
 * Arbre de composants :
 *   <FavoritesProvider>      ← fournit le contexte
 *     <AppNavigator>         ← lit le contexte ici
 *       <Tab.Navigator>
 *         <FeedScreen>       ← lit le contexte via useFavorites()
 *         <FavoritesScreen>  ← lit le contexte via useFavorites()
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FeedScreen } from '../screens/FeedScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { Badge } from '../components/Badge';
import { useFavoritesContext } from '../context/FavoritesContext';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  /*
   * useFavoritesContext() permet à AppNavigator de réagir en temps réel
   * aux changements de favoris, même si ce n'est pas un "écran" classique.
   * Quand favorites.length change (ajout/retrait), le Badge se met à jour
   * IMMÉDIATEMENT sans aucune coordination manuelle entre les composants.
   */
  const { favorites } = useFavoritesContext();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            paddingBottom: 4,
          },
        }}
      >
        {/* Onglet 1 : Feed */}
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            title: 'GallerIA',
            tabBarLabel: 'Feed',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>🖼️</Text>
            ),
          }}
        />

        {/* Onglet 2 : Favoris — Badge mis à jour en temps réel via Context */}
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favoris',
            tabBarLabel: 'Favoris',
            tabBarIcon: ({ color }) => (
              /*
               * View avec position relative pour pouvoir placer le Badge
               * en position absolue par rapport à l'icône ❤️.
               * Cette technique (position:absolute + top/right négatifs)
               * est le moyen standard de superposer des éléments en RN.
               */
              <View style={styles.tabIconContainer}>
                <Text style={{ color, fontSize: 20 }}>❤️</Text>
                {/* Badge n'apparaît que s'il y a au moins 1 favori */}
                {favorites.length > 0 && (
                  <View style={styles.badgeWrapper}>
                    <Badge count={favorites.length} />
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Conteneur de l'icône d'onglet — position:relative pour ancrer le Badge
  tabIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge positionné en haut à droite de l'icône
  badgeWrapper: {
    position: 'absolute',
    top: -6,
    right: -10,
  },
});
