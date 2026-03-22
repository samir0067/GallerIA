/**
 * hooks/useImagePicker.ts
 *
 * Hook personnalisé qui encapsule toute la logique d'accès à la galerie photo.
 * Utilise expo-image-picker, le module Expo officiel pour sélectionner des images.
 *
 * --- Fonctionnement des permissions : iOS vs Android ---
 *
 * iOS :
 *   Le système affiche une boîte de dialogue native à la PREMIÈRE demande.
 *   Si l'utilisateur refuse, il doit aller dans Réglages > GallerIA pour
 *   changer son choix — l'app ne peut plus demander automatiquement.
 *   requestMediaLibraryPermissionsAsync() retourne 'denied' si déjà refusé.
 *
 * Android :
 *   Le comportement dépend de la VERSION du système :
 *   - Android 13+ (API 33+) : permission READ_MEDIA_IMAGES requise
 *   - Android < 13           : permission READ_EXTERNAL_STORAGE requise
 *   Expo gère cette différence automatiquement en coulisses.
 *   Sur Android, le bouton "Ne plus demander" peut bloquer définitivement
 *   la permission — d'où l'importance du message dans l'Alert de refus.
 *
 * --- Pourquoi ce hook ? ---
 * En isolant la logique ici, les écrans restent simples :
 *   const { pickImage, isLoading } = useImagePicker();
 *   const uri = await pickImage(); // ← tout le reste est géré ici
 *
 * Notions abordées :
 *   - expo-image-picker : SDK Expo pour accéder à la galerie
 *   - Gestion des permissions runtime (accordées à l'exécution, pas à l'install)
 *   - async/await dans un hook React
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type UseImagePickerResult = {
  pickImage: () => Promise<string | null>;
  isLoading: boolean;
};

export function useImagePicker(): UseImagePickerResult {
  /*
   * isLoading — true pendant toute la durée de l'opération :
   * demande de permission + ouverture de la galerie + sélection.
   * Permet à l'UI de montrer un spinner et désactiver le bouton.
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pickImage = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);

    try {
      // --- Étape 1 : Demander la permission d'accès à la galerie ---
      //
      // Cette fonction affiche la boîte de dialogue système (iOS/Android).
      // Si la permission a déjà été accordée précédemment, elle retourne
      // immédiatement 'granted' sans afficher de dialogue.
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        // Permission refusée : on informe l'utilisateur
        // et on lui explique comment débloquer manuellement
        Alert.alert(
          'Permission refusée',
          "GallerIA n'a pas accès à ta galerie photo.\n\n" +
            "Va dans les Réglages de ton téléphone → GallerIA → Photos " +
            "pour autoriser l'accès.",
          [{ text: 'OK', style: 'default' }]
        );
        return null;
      }

      // --- Étape 2 : Ouvrir le sélecteur d'image ---
      //
      // launchImageLibraryAsync() ouvre la galerie native du téléphone.
      // L'utilisateur peut parcourir ses albums et choisir une photo.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',  // images uniquement (pas de vidéos)
        allowsEditing: true,   // affiche un recadrage après sélection
        aspect: [1, 1],        // recadrage carré (cohérent avec les PhotoCard)
        quality: 0.8,          // compression légère pour économiser la mémoire
      });

      // result.canceled est true si l'utilisateur appuie sur "Annuler"
      if (result.canceled) {
        return null;
      }

      // result.assets[0].uri est le chemin local de l'image sélectionnée
      // Format iOS  : "file:///var/mobile/Containers/Data/.../image.jpg"
      // Format Android : "content://media/external/images/..."
      return result.assets[0].uri;

    } finally {
      // Le bloc finally s'exécute toujours, que l'opération réussisse ou non.
      // Ça garantit que isLoading repasse à false même en cas d'erreur.
      setIsLoading(false);
    }
  }, []);

  return { pickImage, isLoading };
}
