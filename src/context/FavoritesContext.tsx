/**
 * context/FavoritesContext.tsx
 *
 * Contexte React qui gère les favoris de l'application.
 * Dans cette version, le Context accepte 2 types de photos :
 *   - Photo API (toggleFavorite) : photos chargées depuis JSONPlaceholder
 *   - LocalPhoto (addLocalPhoto) : photos ajoutées depuis la galerie du téléphone
 *
 * Arbre de composants :
 *   <FavoritesProvider>      ← fournit le contexte
 *     <AppNavigator>         ← lit favorites.length pour le Badge
 *       <FeedScreen>         ← toggleFavorite pour les photos API
 *       <FavoritesScreen>    ← addLocalPhoto + removeLocalPhoto + liste
 *       <PhotoDetailScreen>  ← toggleFavorite pour le bouton "❤️ Ajouter"
 *
 * Notions abordées :
 *   - createContext, useContext (API Context de React)
 *   - Union de types TypeScript dans un tableau d'état
 *   - useCallback pour mémoriser les fonctions et éviter les re-renders
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Photo, LocalPhoto, FavoriteItem } from '../types';

// --- Type du contexte : tout ce que le Provider met à disposition ---
type FavoritesContextType = {
  /** Tableau des favoris : Photo API ou LocalPhoto */
  favorites: FavoriteItem[];

  /** Retourne true si la photo (identifiée par son id) est en favori */
  isFavorite: (id: number | string) => boolean;

  /** Ajoute ou retire une photo API des favoris (inchangé par rapport à l'étape précédente) */
  toggleFavorite: (photo: Photo) => void;

  /** Ajoute une photo locale (depuis la galerie) directement dans les favoris */
  addLocalPhoto: (uri: string) => void;

  /** Retire une photo locale des favoris à partir de son id string */
  removeLocalPhoto: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

type ProviderProps = { children: ReactNode };

export function FavoritesProvider({ children }: ProviderProps) {
  /*
   * favorites stocke un mélange de Photo API et de LocalPhoto.
   * Le type FavoriteItem = (Photo & { dateAdded }) | LocalPhoto
   * permet à TypeScript de vérifier que les deux sont bien gérés.
   */
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  /*
   * isFavorite — accepte maintenant number | string car :
   *   - Photo API → id: number
   *   - LocalPhoto → id: string
   * La comparaison f.id === id fonctionne dans les deux cas.
   */
  const isFavorite = useCallback(
    (id: number | string): boolean => favorites.some((f) => f.id === id),
    [favorites]
  );

  /*
   * toggleFavorite — INCHANGÉ pour les Photos API.
   * Ajoute (avec dateAdded) ou retire une Photo API des favoris.
   */
  const toggleFavorite = useCallback((photo: Photo): void => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === photo.id);
      if (exists) {
        return prev.filter((f) => f.id !== photo.id);
      }
      return [...prev, { ...photo, dateAdded: new Date().toISOString() }];
    });
  }, []);

  /*
   * addLocalPhoto — NOUVEAU.
   * Crée un objet LocalPhoto à partir d'une URI locale et l'ajoute aux favoris.
   * Le titre est généré automatiquement avec la date du jour en français.
   */
  const addLocalPhoto = useCallback((uri: string): void => {
    const now = new Date();

    // Titre lisible : "Ma photo — 22 mars 2024"
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newLocal: LocalPhoto = {
      id: Date.now().toString(), // identifiant unique basé sur le timestamp
      uri,
      title: `Ma photo — ${dateStr}`,
      isLocal: true,
      dateAdded: now.toISOString(),
    };

    setFavorites((prev) => [...prev, newLocal]);
  }, []);

  /*
   * removeLocalPhoto — NOUVEAU.
   * Retire une LocalPhoto des favoris à partir de son id (string).
   * Séparé de toggleFavorite car les LocalPhoto n'ont pas de "toggle" :
   * on ne peut qu'ajouter (via addLocalPhoto) ou retirer.
   */
  const removeLocalPhoto = useCallback((id: string): void => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, addLocalPhoto, removeLocalPhoto }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavoritesContext doit être utilisé dans un <FavoritesProvider>');
  }
  return ctx;
}
