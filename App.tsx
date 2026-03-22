/**
 * App.tsx
 *
 * Point d'entrée principal de l'application GallerIA.
 * C'est le premier composant chargé par Expo au démarrage.
 *
 * Dans cette version, on enveloppe toute l'app dans <FavoritesProvider>
 * pour que l'état des favoris soit accessible partout (FeedScreen,
 * FavoritesScreen, AppNavigator) sans prop drilling.
 *
 * Règle d'or du Context : le Provider doit être un ancêtre commun
 * de TOUS les composants qui ont besoin de la donnée.
 * Ici, App.tsx est l'ancêtre parfait car il est au sommet de l'arbre.
 */

import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    // FavoritesProvider enveloppe tout → tous les composants descendants
    // peuvent appeler useFavorites() / useFavoritesContext()
    <FavoritesProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </FavoritesProvider>
  );
}
