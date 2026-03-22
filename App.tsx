/**
 * App.tsx
 *
 * Point d'entrée principal de l'application GallerIA.
 * C'est le premier composant chargé par Expo au démarrage.
 *
 * --- Problème résolu : écran blanc au démarrage ---
 *
 * Sans gestion de l'hydratation, voici ce qui se passerait :
 *   1. App démarre → favorites = [] → FavoritesScreen affiche "Aucun favori"
 *   2. 50ms plus tard → AsyncStorage répond → les favoris apparaissent d'un coup
 * Résultat : un "flash" désagréable de liste vide, puis remplissage soudain.
 *
 * Solution : pendant isHydrating === true, on affiche un écran de démarrage
 * simple (SplashScreen). Dès qu'AsyncStorage a répondu, on affiche la navigation.
 * L'utilisateur voit un écran propre au lieu d'un contenu qui saute.
 *
 * --- Pourquoi AppContent est un composant séparé ? ---
 *
 * useFavoritesContext() doit être appelé À L'INTÉRIEUR du <FavoritesProvider>.
 * Si on l'appelait directement dans App(), on serait HORS du Provider → crash.
 * AppContent est monté DANS le Provider → il peut lire le Context. ✓
 *
 * Arbre de composants :
 *   <FavoritesProvider>    ← fournit le Context
 *     <AppContent>         ← lit isHydrating depuis le Context
 *       <SplashScreen />   ← affiché si isHydrating === true
 *       <AppNavigator />   ← affiché si isHydrating === false
 *
 * Notions abordées :
 *   - Pattern "hydratation" : afficher un placeholder pendant le chargement
 *   - Contrainte du Context : les consommateurs doivent être enfants du Provider
 *   - Séparation des responsabilités : App = setup, AppContent = logique d'affichage
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { useFavoritesContext } from './src/context/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// ─── Écran de démarrage affiché pendant l'hydratation ────────────────────────

/**
 * SplashScreen — affiché pendant la lecture d'AsyncStorage.
 * Design volontairement simple : fond indigo + logo centré.
 * Pas d'animation ici pour ne pas compliquer le code pédagogique.
 *
 * En production, Expo propose `expo-splash-screen` pour des splash screens
 * natifs plus sophistiqués (affichés AVANT même que React Native charge).
 */
function SplashScreen() {
  return (
    <View style={styles.splash}>
      {/* StatusBar en style "light" pour le fond sombre */}
      <StatusBar style="light" />
      <Text style={styles.splashIcon}>🖼️</Text>
      <Text style={styles.splashTitle}>GallerIA</Text>
      <Text style={styles.splashSubtitle}>Chargement de tes favoris…</Text>
    </View>
  );
}

// ─── Composant intermédiaire qui lit le Context ───────────────────────────────

/**
 * AppContent — consomme isHydrating depuis FavoritesContext.
 *
 * Ce composant doit être enfant de <FavoritesProvider> pour pouvoir
 * appeler useFavoritesContext(). Il joue le rôle d'aiguillage :
 *   - isHydrating === true  → <SplashScreen />
 *   - isHydrating === false → <AppNavigator />
 */
function AppContent() {
  /*
   * isHydrating est true le temps qu'AsyncStorage réponde.
   * Sa valeur passe à false dans le bloc finally du useEffect #1
   * de FavoritesContext (qu'il y ait des données ou non).
   */
  const { isHydrating } = useFavoritesContext();

  if (isHydrating) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

// ─── Composant racine ─────────────────────────────────────────────────────────

/**
 * App — composant racine, monté en premier par Expo.
 *
 * Sa seule responsabilité : fournir le Context à toute l'application.
 * La logique d'affichage (splash vs navigation) est déléguée à AppContent.
 *
 * Règle d'or : le Provider doit englober TOUS les composants
 * qui ont besoin du Context. App.tsx est l'endroit idéal car il est
 * au sommet absolu de l'arbre de composants.
 */
export default function App() {
  return (
    <FavoritesProvider>
      {/*
       * AppContent est À L'INTÉRIEUR de FavoritesProvider.
       * Il peut donc appeler useFavoritesContext() sans erreur.
       * Si on mettait useFavoritesContext() directement ici → crash :
       * "useFavoritesContext doit être utilisé dans un <FavoritesProvider>"
       */}
      <AppContent />
    </FavoritesProvider>
  );
}

// ─── Styles du splash screen ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Fond indigo plein écran — même couleur que le headerBand de FeedScreen
  splash: {
    flex: 1,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  splashIcon: {
    fontSize: 64,
  },

  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },

  splashSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});
