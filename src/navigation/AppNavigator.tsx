/**
 * navigation/AppNavigator.tsx
 *
 * Configure toute la navigation de l'application GallerIA.
 *
 * --- Architecture de navigation ---
 *
 *   NavigationContainer          ← conteneur racine obligatoire
 *   └── Tab.Navigator            ← barre d'onglets en bas
 *       ├── Tab "Feed"
 *       │   └── Stack.Navigator  ← navigation "pile" dans l'onglet Feed
 *       │       ├── FeedScreen           (écran principal)
 *       │       └── PhotoDetailScreen    (écran de détail, accessible via navigate())
 *       ├── Tab "Favoris"
 *       │   └── FavoritesScreen  ← écran simple, pas de sous-navigation
 *       └── Tab "Paramètres"
 *           └── SettingsScreen   ← paramètres et préférences
 *
 * --- Pourquoi imbriquer Stack dans Tab ? ---
 * L'onglet Feed a besoin d'une navigation "profonde" : FeedScreen → PhotoDetailScreen.
 * En créant un Stack Navigator à l'intérieur de l'onglet, on garde les onglets
 * visibles à tout moment, même sur PhotoDetailScreen.
 * Sans Stack (juste un Tab), il serait impossible de naviguer entre écrans
 * au sein d'un même onglet.
 *
 * Notions abordées :
 *   - createNativeStackNavigator : navigation de type "push/pop" (empilement)
 *   - createBottomTabNavigator : navigation par onglets
 *   - Imbrication de navigateurs
 *   - Types de navigation avec TypeScript
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FeedScreen } from '../screens/FeedScreen';
import { PhotoDetailScreen } from '../screens/PhotoDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Badge } from '../components/Badge';
import { useFavoritesContext } from '../context/FavoritesContext';
import { FeedStackParamList } from './types';

// --- Création des navigateurs ---
const Tab = createBottomTabNavigator();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();

/**
 * Stack Navigator pour l'onglet Feed.
 * Gère la navigation FeedScreen ↔ PhotoDetailScreen.
 * Extrait dans son propre composant pour garder AppNavigator lisible.
 */
function FeedNavigator() {
  return (
    <FeedStack.Navigator
      screenOptions={{
        // Style partagé par tous les headers de la stack Feed
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#ffffff',           // couleur du texte ET de la flèche retour
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Retour',            // texte du bouton retour (iOS uniquement)
      }}
    >
      {/* Écran principal du Feed — header masqué car on a notre propre bandeau */}
      <FeedStack.Screen
        name="FeedMain"
        component={FeedScreen}
        options={{ headerShown: false }} // on masque le header natif (on a notre headerBand)
      />

      {/* Écran de détail — header natif visible avec bouton retour automatique */}
      <FeedStack.Screen
        name="PhotoDetail"
        component={PhotoDetailScreen}
        options={{
          title: 'Détail',  // sera écrasé dynamiquement dans PhotoDetailScreen
        }}
      />
    </FeedStack.Navigator>
  );
}

/** Navigateur principal de l'application */
export function AppNavigator() {
  /*
   * Lecture du nombre de favoris depuis le Context pour le Badge.
   * AppNavigator peut lire le Context car FavoritesProvider est monté
   * dans App.tsx, AU-DESSUS d'AppNavigator dans l'arbre de composants.
   */
  const { favorites } = useFavoritesContext();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,               // les headers sont gérés par les stacks enfants
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            paddingBottom: 4,
          },
        }}
      >
        {/* Onglet Feed → FeedNavigator (Stack avec FeedScreen + PhotoDetailScreen) */}
        <Tab.Screen
          name="Feed"
          component={FeedNavigator}
          options={{
            tabBarLabel: 'Feed',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>🖼️</Text>
            ),
          }}
        />

        {/* Onglet Favoris → FavoritesScreen (écran simple) */}
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favoris',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShown: true,
            tabBarLabel: 'Favoris',
            tabBarIcon: ({ color }) => (
              <View style={styles.tabIconContainer}>
                <Text style={{ color, fontSize: 20 }}>❤️</Text>
                {favorites.length > 0 && (
                  <View style={styles.badgeWrapper}>
                    <Badge count={favorites.length} />
                  </View>
                )}
              </View>
            ),
          }}
        />

        {/*
         * Onglet Paramètres → SettingsScreen
         *
         * headerShown: true avec le même style indigo pour la cohérence visuelle.
         * Pas de Stack imbriqué ici : SettingsScreen n'a pas de navigation profonde.
         */}
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Paramètres',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShown: true,
            tabBarLabel: 'Paramètres',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Conteneur de l'icône d'onglet pour positionner le Badge
  tabIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge positionné en haut à droite de l'icône ❤️
  badgeWrapper: {
    position: 'absolute',
    top: -6,
    right: -10,
  },
});
