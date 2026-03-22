/**
 * hooks/useFavorites.ts
 *
 * Hook personnalisé pour gérer les favoris de l'utilisateur.
 * Les favoris sont sauvegardés localement sur l'appareil via AsyncStorage,
 * ce qui permet de les retrouver même après avoir fermé l'application.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from '../types';

// Clé utilisée pour stocker les favoris dans AsyncStorage
const STORAGE_KEY = '@galleria_favorites';

type UseFavoritesResult = {
  favorites: FavoriteItem[];
  isFavorite: (id: number | string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
};

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Chargement des favoris au démarrage de l'app
  useEffect(() => {
    async function loadFavorites() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } catch {
        console.warn('Impossible de charger les favoris.');
      }
    }
    loadFavorites();
  }, []);

  // Sauvegarde les favoris à chaque changement
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {
      console.warn('Impossible de sauvegarder les favoris.');
    });
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number | string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      return exists ? prev.filter((f) => f.id !== item.id) : [...prev, item];
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
