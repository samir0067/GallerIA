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

// Représente une photo ajoutée manuellement depuis la galerie du téléphone
export type LocalPhoto = {
  id: string; // identifiant unique généré localement (ex: timestamp)
  uri: string; // chemin local de l'image sur le téléphone
  title: string;
  isLocal: true; // permet de distinguer les photos locales des photos API
};

// Un favori peut être une photo API ou une photo locale
export type FavoriteItem = Photo | LocalPhoto;
