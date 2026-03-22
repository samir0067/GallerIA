/**
 * services/api.ts
 *
 * Ce fichier gère tous les appels à l'API externe (JSONPlaceholder).
 * En regroupant les appels réseau ici, on sépare la logique de récupération
 * des données de l'affichage — c'est le principe de "séparation des responsabilités".
 */

import { Photo } from '../types';

// URL de base de l'API publique JSONPlaceholder
const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Récupère une liste de photos depuis l'API.
 * @param limit - Nombre de photos à récupérer (par défaut : 20)
 */
export async function fetchPhotos(limit: number = 20): Promise<Photo[]> {
  const response = await fetch(`${BASE_URL}/photos?_limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Erreur réseau : ${response.status}`);
  }

  const data: Photo[] = await response.json();
  return data;
}
