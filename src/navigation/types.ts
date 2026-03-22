/**
 * navigation/types.ts
 *
 * Définit les types TypeScript pour tous les navigateurs de l'application.
 * Centraliser les types ici permet de les importer facilement depuis
 * n'importe quel écran qui a besoin de typer useNavigation() ou useRoute().
 *
 * --- Comment lire ces types ---
 *
 * FeedStackParamList décrit les écrans de la Stack Navigator du Feed :
 *   { NomEcran: TypeDesParametresReçus }
 *   - undefined : l'écran ne reçoit aucun paramètre
 *   - { photoId: number } : l'écran reçoit un objet avec photoId
 *
 * Quand on navigue : navigation.navigate('PhotoDetail', { photoId: 42 })
 * TypeScript vérifie que 42 est bien un number — pratique pour éviter les bugs.
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

/** Écrans de la Stack Navigator dans l'onglet Feed */
export type FeedStackParamList = {
  FeedMain: undefined;                    // écran principal, pas de params
  PhotoDetail: { photoId: number };       // écran détail, reçoit l'id de la photo
};

/** Type de la prop navigation dans les écrans de FeedStack */
export type FeedStackNavigationProp<RouteName extends keyof FeedStackParamList> =
  NativeStackNavigationProp<FeedStackParamList, RouteName>;

/** Type de la prop route dans les écrans de FeedStack */
export type FeedStackRouteProp<RouteName extends keyof FeedStackParamList> =
  RouteProp<FeedStackParamList, RouteName>;
