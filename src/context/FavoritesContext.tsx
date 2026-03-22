/**
 * context/FavoritesContext.tsx
 *
 * Ce fichier implémente le CONTEXTE React pour les favoris.
 *
 * --- Pourquoi un Context ? ---
 * Le problème : FeedScreen et FavoritesScreen ont besoin du MÊME état "favoris",
 * et AppNavigator doit aussi connaître le nombre de favoris pour le Badge.
 * Ces 3 composants ne sont pas dans une relation parent-enfant directe,
 * donc passer l'état par des props serait lourd ("prop drilling").
 *
 * La solution : React Context crée une "boutique" globale accessible
 * par n'importe quel composant enveloppé dans <FavoritesProvider>.
 * C'est l'alternative légère à Redux pour des apps de taille modeste.
 *
 * --- Comment ça marche ---
 * 1. createContext() crée le "conteneur" vide
 * 2. FavoritesProvider stocke l'état et le rend disponible
 * 3. useFavoritesContext() permet à n'importe quel enfant de le lire
 *
 * Notions abordées :
 *   - createContext, useContext (API Context de React)
 *   - Provider pattern
 *   - useCallback pour mémoriser les fonctions
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Photo, FavoriteItem } from '../types';

// --- Type du contexte : ce que le Provider met à disposition ---
type FavoritesContextType = {
  favorites: FavoriteItem[];                  // liste des photos favorites
  isFavorite: (id: number) => boolean;        // teste si une photo est en favori
  toggleFavorite: (photo: Photo) => void;     // ajoute ou retire une photo des favoris
};

// createContext() crée le contexte avec une valeur initiale null.
// Le "!" dans useFavoritesContext() garantit qu'on l'utilise toujours dans un Provider.
const FavoritesContext = createContext<FavoritesContextType | null>(null);

// --- Provider : le composant qui enveloppe l'app et partage l'état ---
type ProviderProps = { children: ReactNode };

export function FavoritesProvider({ children }: ProviderProps) {
  /*
   * useState<FavoriteItem[]>([]) — stocke la liste des favoris.
   * Séparé des autres états car c'est LA donnée centrale de ce contexte :
   * tous les autres calculs (isFavorite, toggleFavorite) en dépendent.
   */
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  /*
   * useCallback mémorise isFavorite entre les renders.
   *
   * POURQUOI useCallback ici ?
   * Sans useCallback, isFavorite serait une NOUVELLE fonction à chaque render
   * du Provider, ce qui forcerait tous les composants consommateurs à
   * se re-render, même si favorites n'a pas changé.
   * Avec useCallback([favorites]), la fonction n'est recréée que quand
   * favorites change — ce qui est le seul cas où le résultat peut changer.
   */
  const isFavorite = useCallback(
    (id: number): boolean => favorites.some((f) => f.id === id),
    [favorites] // recalcule seulement quand la liste change
  );

  /*
   * useCallback mémorise toggleFavorite entre les renders.
   *
   * POURQUOI useCallback avec [] (dépendances vides) ?
   * toggleFavorite utilise la forme fonctionnelle de setFavorites : (prev) => ...
   * Cela lui permet d'accéder à l'état le plus récent SANS avoir
   * favorites dans ses dépendances. La fonction est donc stable pour
   * toute la durée de vie du composant → pas de re-renders inutiles.
   */
  const toggleFavorite = useCallback((photo: Photo): void => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === photo.id);
      if (exists) {
        // Retire la photo : filtre = nouveau tableau sans cet élément
        return prev.filter((f) => f.id !== photo.id);
      } else {
        // Ajoute la photo : on enrichit Photo avec la date d'ajout → FavoriteItem
        const newFavorite: FavoriteItem = {
          ...photo,
          dateAdded: new Date().toISOString(), // date ISO : "2024-03-22T14:30:00.000Z"
        };
        return [...prev, newFavorite];
      }
    });
  }, []); // pas de dépendances : setFavorites est stable, et on utilise prev

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// --- Hook utilitaire pour consommer le contexte facilement ---
export function useFavoritesContext(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  // Garde-fou : si on appelle ce hook hors du Provider, on obtient une erreur claire
  if (!ctx) {
    throw new Error('useFavoritesContext doit être utilisé dans un <FavoritesProvider>');
  }
  return ctx;
}
