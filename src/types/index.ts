/**
 * types/index.ts
 *
 * Ce fichier centralise tous les types TypeScript utilisés dans l'application.
 * Définir les types ici permet de les réutiliser facilement partout dans le projet
 * et garantit la cohérence des données (photo, favori, etc.).
 */

// Représente une photo telle que renvoyée par l'API JSONPlaceholder
export type Photo = {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};

// Représente un favori : une photo enrichie de la date à laquelle elle a été ajoutée
// L'opérateur "&" signifie "Photo + les champs supplémentaires ci-dessous"
export type FavoriteItem = Photo & {
  dateAdded: string; // date ISO (ex: "2024-03-22T14:30:00.000Z") générée au moment de l'ajout
};
