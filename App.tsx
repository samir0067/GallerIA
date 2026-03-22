/**
 * App.tsx
 *
 * Point d'entrée principal de l'application GallerIA.
 *
 * --- Splash screen natif vs écran de chargement React ---
 *
 * Il existe deux façons d'afficher quelque chose pendant que l'app charge :
 *
 *   1. SPLASH NATIF (expo-splash-screen)
 *      → Affiché par l'OS AVANT même que React Native charge.
 *      → Pas un composant React — c'est une image native (iOS: LaunchScreen.storyboard,
 *        Android: drawable). Configuré dans app.json.
 *      → expo-splash-screen permet de le garder visible PLUS LONGTEMPS que d'habitude,
 *        le temps que l'app soit prête (données chargées, polices, etc.).
 *      → Se ferme via SplashScreen.hideAsync() quand on décide que c'est prêt.
 *
 *   2. ÉCRAN DE CHARGEMENT REACT (composant normal)
 *      → N'apparaît qu'APRÈS le premier render de React Native.
 *      → Entre le splash natif et l'écran React, il peut y avoir un flash blanc
 *        le temps que React Native initialise — indésirable.
 *      → Version précédente de GallerIA : on affichait un <SplashScreen /> React
 *        pendant isHydrating. Cette version le remplace par le splash natif.
 *
 * --- Pourquoi preventAutoHideAsync() est appelé AU NIVEAU MODULE ---
 *
 * Par défaut, Expo cache le splash natif dès que le premier frame React est rendu.
 * Si on appelait preventAutoHideAsync() dans un useEffect (après le premier render),
 * il serait trop tard — le splash aurait déjà disparu.
 *
 * En l'appelant au niveau MODULE (hors de tout composant, à l'import),
 * il s'exécute AVANT le premier render. Le splash reste visible jusqu'à
 * ce qu'on appelle hideAsync() explicitement. ✓
 *
 * --- Pourquoi AppContent retourne null pendant l'hydratation ---
 *
 * Pendant isHydrating === true, le splash natif est encore affiché.
 * Retourner null = ne rien rendre du côté React.
 * Avantage : zéro risque de "flash" entre le splash natif et la navigation.
 * Si on rendait un composant React à la place, il y aurait toujours
 * un infime délai entre la disparition du splash et l'apparition du composant.
 *
 * --- Cycle de vie complet au démarrage ---
 *
 *   ① OS démarre → splash natif indigo affiché (app.json backgroundColor)
 *   ② React Native charge → preventAutoHideAsync() déjà appelé → splash reste
 *   ③ FavoritesProvider monte → useEffect lit AsyncStorage → isHydrating = true
 *   ④ AppContent : isHydrating === true → retourne null (rien à rendre)
 *   ⑤ AsyncStorage répond → setFavorites() → setIsHydrating(false)
 *   ⑥ AppContent : isHydrating === false → hideAsync() → splash disparaît
 *   ⑦ AppNavigator s'affiche → l'utilisateur voit l'app
 *
 * Notions abordées :
 *   - expo-splash-screen : contrôle manuel du splash natif
 *   - SplashScreen.preventAutoHideAsync() : appelé au niveau module
 *   - SplashScreen.hideAsync() : appelé dans useEffect quand les données sont prêtes
 *   - Contrainte du Context : AppContent doit être enfant de FavoritesProvider
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { useFavoritesContext } from './src/context/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// ─── Prévention de la fermeture automatique du splash ────────────────────────
//
// Appelé ICI, au niveau module, AVANT le premier render de React.
// Sans cet appel, le splash natif disparaîtrait dès le premier frame React,
// exposant un fond blanc pendant l'hydratation d'AsyncStorage.
//
// La promesse peut échouer si expo-splash-screen n'est pas configuré dans app.json
// → on attrape l'erreur silencieusement pour ne pas bloquer l'app.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* silencieux : le splash se fermera normalement si preventAutoHide échoue */
});

// ─── Composant intermédiaire qui lit le Context ───────────────────────────────

/**
 * AppContent — consomme isHydrating depuis FavoritesContext.
 *
 * Ce composant DOIT être un enfant de <FavoritesProvider> pour accéder au Context.
 * Si on appelait useFavoritesContext() directement dans App(), on serait hors
 * du Provider → "useFavoritesContext doit être utilisé dans un <FavoritesProvider>".
 *
 * Logique d'affichage :
 *   isHydrating === true  → null (splash natif encore visible, rien à rendre)
 *   isHydrating === false → <AppNavigator /> + SplashScreen.hideAsync()
 */
function AppContent() {
  const { isHydrating } = useFavoritesContext();

  useEffect(() => {
    /*
     * On n'agit que quand isHydrating passe à false.
     * À ce moment, AsyncStorage a répondu (succès ou erreur) et favorites
     * contient les données correctes.
     *
     * hideAsync() demande à l'OS de faire disparaître le splash natif.
     * Sur iOS : fondu enchaîné natif.
     * Sur Android : disparition immédiate.
     *
     * On ne cache PAS le splash pendant isHydrating === true (la condition
     * "if (!isHydrating)" protège contre ça).
     */
    if (!isHydrating) {
      SplashScreen.hideAsync().catch(() => {
        /* silencieux : si hideAsync échoue, l'app reste utilisable */
      });
    }
  }, [isHydrating]);

  /*
   * Pendant isHydrating === true : le splash natif est visible.
   * Retourner null = React ne rend rien du tout.
   * → Pas de flash, pas de composant intermédiaire, transition parfaite.
   */
  if (isHydrating) {
    return null;
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
 * Sa seule responsabilité : fournir le Context à toute l'application.
 */
export default function App() {
  return (
    <FavoritesProvider>
      <AppContent />
    </FavoritesProvider>
  );
}
