/**
 * types/index.ts
 *
 * Ce fichier centralise tous les types TypeScript utilisés dans l'application.
 * Définir les types ici permet de les réutiliser facilement partout dans le projet
 * et garantit la cohérence des données (photo, favori, photo locale, etc.).
 */

// ---------------------------------------------------------------------------
// Photos venant de l'API JSONPlaceholder
// ---------------------------------------------------------------------------

/** Photo reçue depuis l'API REST (JSONPlaceholder /photos) */
export type Photo = {
  id: number;       // identifiant numérique unique (1 à 5000)
  albumId: number;
  title: string;
  url: string;           // image haute résolution
  thumbnailUrl: string;  // miniature 150×150
};

// ---------------------------------------------------------------------------
// Photos ajoutées localement depuis la galerie du téléphone
// ---------------------------------------------------------------------------

/**
 * Photo ajoutée par l'utilisateur depuis sa galerie (via expo-image-picker).
 * Le champ "isLocal: true" est un DISCRIMINANT de type : il permet à TypeScript
 * de distinguer un LocalPhoto d'un Photo API dans un union type.
 *
 * Exemple : if (isLocalPhoto(item)) { ... item.uri ... }
 */
export type LocalPhoto = {
  id: string;        // généré avec Date.now().toString() — toujours unique
  uri: string;       // chemin local sur l'appareil (ex: "file:///var/mobile/...")
  title: string;     // titre automatique (ex: "Ma photo — 22 mars 2024")
  isLocal: true;     // discriminant — TOUJOURS true pour un LocalPhoto
  dateAdded: string; // date ISO d'ajout aux favoris
};

// ---------------------------------------------------------------------------
// Favoris : union des deux types de photos
// ---------------------------------------------------------------------------

/**
 * Un favori peut être :
 *   - une Photo API enrichie d'une dateAdded  (Photo & { dateAdded: string })
 *   - une LocalPhoto ajoutée depuis la galerie
 *
 * Le type union "|" signifie "l'un OU l'autre".
 * Utilise isLocalPhoto() pour distinguer les deux à l'exécution.
 */
export type FavoriteItem = (Photo & { dateAdded: string }) | LocalPhoto;

// ---------------------------------------------------------------------------
// Type guard — distingue LocalPhoto d'une Photo API au runtime
// ---------------------------------------------------------------------------

/**
 * Type guard TypeScript : retourne true si item est un LocalPhoto.
 * Après cet appel, TypeScript "sait" que item est un LocalPhoto
 * dans le bloc if → plus besoin de cast manuel.
 *
 * Utilisation :
 *   if (isLocalPhoto(item)) {
 *     console.log(item.uri); // TypeScript accepte .uri ici
 *   } else {
 *     console.log(item.thumbnailUrl); // TypeScript accepte .thumbnailUrl ici
 *   }
 */
export function isLocalPhoto(item: FavoriteItem): item is LocalPhoto {
  return 'isLocal' in item && item.isLocal === true;
}
