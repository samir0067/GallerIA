/**
 * services/api.ts
 *
 * Centralise tous les appels réseau de l'application.
 * Regrouper les appels ici respecte le principe de "séparation des responsabilités" :
 * les écrans et hooks ne savent pas COMMENT les données sont récupérées,
 * ils appellent juste une fonction et reçoivent un résultat.
 *
 * API utilisée : JSONPlaceholder (https://jsonplaceholder.typicode.com)
 * → API REST publique, gratuite, parfaite pour les projets démo et d'apprentissage.
 */

import { Photo } from '../types';

/** URL de base de l'API — modifiable en un seul endroit si l'API change */
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// ---------------------------------------------------------------------------
// Remplacement des URLs d'images par Picsum Photos
// ---------------------------------------------------------------------------

/**
 * Transforme les URLs d'images d'une photo JSONPlaceholder en URLs Picsum Photos.
 * JSONPlaceholder retourne des carrés gris unis (via.placeholder.com) — peu utile
 * pour une démo visuelle. Picsum Photos fournit de vraies photographies.
 *
 * --- Notion pédagogique : seed et déterminisme ---
 *
 * Un "seed" (littéralement "graine") est une valeur d'entrée qui initialise
 * un processus de sélection. L'API Picsum l'utilise pour choisir TOUJOURS
 * la même photo pour un seed donné :
 *
 *   picsum.photos/seed/42/150/150  →  retourne TOUJOURS la même image
 *   picsum.photos/150/150          →  retourne une image DIFFÉRENTE à chaque appel
 *
 * C'est le principe du DÉTERMINISME : à entrée identique, sortie identique.
 * En utilisant l'id de la photo comme seed, on garantit que la photo #42
 * affiche toujours la même image Picsum, peu importe quand l'app est chargée. ✓
 *
 * Format des URLs :
 *   Miniature  : https://picsum.photos/seed/{id}/150/150
 *   Grande image : https://picsum.photos/seed/{id}/600/600
 */
function withPicsumUrls(photo: Photo): Photo {
  return {
    ...photo,
    thumbnailUrl: `https://picsum.photos/seed/${photo.id}/150/150`,
    url: `https://picsum.photos/seed/${photo.id}/600/600`,
  };
}

/**
 * Récupère une liste de photos depuis l'API JSONPlaceholder.
 *
 * URL appelée : GET https://jsonplaceholder.typicode.com/photos?_limit=30
 * Le paramètre ?_limit=30 est crucial : sans lui, l'API retourne 5000 photos
 * ce qui serait très lent et consommerait inutilement la batterie.
 *
 * @param limit - Nombre maximum de photos à récupérer (défaut : 30)
 * @returns Promise<Photo[]> — tableau de photos résolu quand l'appel réussit
 * @throws Error avec message en français si le réseau est indisponible
 *         ou si le serveur répond avec un code d'erreur HTTP
 */
export async function fetchPhotos(limit: number = 30): Promise<Photo[]> {
  try {
    const response = await fetch(`${BASE_URL}/photos?_limit=${limit}`);

    // response.ok est true pour les codes 200-299, false pour 4xx/5xx
    if (!response.ok) {
      throw new Error(`Le serveur a répondu avec une erreur (code ${response.status}).`);
    }

    // response.json() désérialise le corps JSON de la réponse
    const data: Photo[] = await response.json();
    // On remplace les URLs via.placeholder.com par de vraies photos Picsum
    return data.map(withPicsumUrls);
  } catch (err) {
    // On attrape les erreurs réseau (pas de connexion) ET les erreurs HTTP
    // Si c'est déjà une Error avec notre message, on la relance telle quelle
    if (err instanceof Error && err.message.includes('Le serveur')) {
      throw err;
    }
    // Sinon c'est probablement une erreur réseau (fetch échoue si pas de connexion)
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
  }
}

/**
 * Récupère le détail d'une photo par son identifiant.
 *
 * URL appelée : GET https://jsonplaceholder.typicode.com/photos/:id
 * Exemple : fetchPhotoById(42) → GET /photos/42
 *
 * @param id - Identifiant numérique unique de la photo (1 à 5000 sur JSONPlaceholder)
 * @returns Promise<Photo> — la photo correspondante
 * @throws Error avec message en français si la photo n'existe pas ou si réseau indisponible
 */
export async function fetchPhotoById(id: number): Promise<Photo> {
  try {
    const response = await fetch(`${BASE_URL}/photos/${id}`);

    if (!response.ok) {
      // Code 404 : la photo n'existe pas
      if (response.status === 404) {
        throw new Error(`La photo #${id} est introuvable.`);
      }
      throw new Error(`Erreur lors du chargement de la photo (code ${response.status}).`);
    }

    const data: Photo = await response.json();
    // On remplace les URLs via.placeholder.com par de vraies photos Picsum
    return withPicsumUrls(data);
  } catch (err) {
    if (err instanceof Error && (err.message.includes('introuvable') || err.message.includes('Erreur lors'))) {
      throw err;
    }
    throw new Error('Impossible de charger le détail de la photo. Vérifiez votre connexion.');
  }
}
