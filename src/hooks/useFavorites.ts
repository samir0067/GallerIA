/**
 * hooks/useFavorites.ts
 *
 * Hook personnalisé pour accéder aux favoris de l'utilisateur.
 *
 * Ce hook est une fine couche d'abstraction au-dessus de FavoritesContext.
 * Pourquoi ne pas appeler useFavoritesContext() directement dans les écrans ?
 *
 * → Séparation des responsabilités : les écrans ne savent pas QUE
 *   les favoris viennent d'un Context. Si demain on change l'implémentation
 *   (AsyncStorage, Redux, Zustand...), seul CE fichier change.
 *   Les écrans continuent d'appeler useFavorites() sans modification.
 *
 * C'est le principe d'encapsulation appliqué aux hooks React.
 *
 * Notions abordées :
 *   - Hook personnalisé comme couche d'abstraction
 *   - Séparation de la logique métier et de l'implémentation technique
 */

import { useFavoritesContext } from '../context/FavoritesContext';

/**
 * Expose les favoris et les fonctions pour les manipuler.
 *
 * @returns favorites  - liste des photos favorites (FavoriteItem[])
 * @returns isFavorite - fonction : (id: number) => boolean
 * @returns toggleFavorite - fonction : (photo: Photo) => void
 */
export function useFavorites() {
  // Délègue entièrement au contexte — toute la logique est dans FavoritesContext.tsx
  return useFavoritesContext();
}
