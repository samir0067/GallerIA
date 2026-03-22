/**
 * App.tsx
 *
 * Point d'entrée principal de l'application GallerIA.
 * C'est le premier composant chargé par Expo au démarrage.
 * Il configure la navigation globale de l'application via AppNavigator.
 */

import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
