/**
 * hooks/useFavorites.ts
 *
 * Couche d'abstraction au-dessus de FavoritesContext.
 * Les écrans appellent useFavorites() sans savoir que les données
 * viennent d'un Context — si l'implémentation change, seul ce fichier change.
 *
 * Expose maintenant 5 fonctions/données :
 *   - favorites       : tableau (Photo API | LocalPhoto)[]
 *   - isFavorite      : (id: number | string) → boolean
 *   - toggleFavorite  : pour les Photo API (ajoute/retire)
 *   - addLocalPhoto   : pour les LocalPhoto (ajoute uniquement)
 *   - removeLocalPhoto: pour les LocalPhoto (retire uniquement)
 */

import { useFavoritesContext } from '../context/FavoritesContext';

export function useFavorites() {
  return useFavoritesContext();
}
