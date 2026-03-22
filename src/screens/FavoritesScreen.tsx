/**
 * screens/FavoritesScreen.tsx
 *
 * Écran des favoris : affiche toutes les photos sauvegardées,
 * qu'elles viennent de l'API ou de la galerie du téléphone.
 *
 * --- Animation d'apparition des items ---
 *
 * Chaque item de la liste entre en scène avec une animation combinée :
 *   - fade : opacité 0 → 1
 *   - slide : translateY 20 → 0 (remonte légèrement depuis le bas)
 *
 * Cette animation est encapsulée dans un composant AnimatedFavoriteItem.
 * À son montage, il démarre l'animation automatiquement via useEffect [].
 *
 * Animated.parallel() lance plusieurs animations en même temps.
 * C'est la façon idiomatic de combiner des effets dans React Native.
 *
 * Notions abordées :
 *   - useImagePicker() : accès à la galerie avec gestion des permissions
 *   - Type guard isLocalPhoto() : différencier deux types dans un union
 *   - Composant FAB en position absolute au-dessus du contenu
 *   - Animated.Value (opacité + translation)
 *   - Animated.parallel : plusieurs animations simultanées
 *   - Animated.timing : animation à durée fixe
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Animated,
  StyleSheet,
} from 'react-native';
import { FavoriteItem, isLocalPhoto } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { PhotoCard } from '../components/PhotoCard';
import { AddPhotoButton } from '../components/AddPhotoButton';
import { useFavorites } from '../hooks/useFavorites';
import { useImagePicker } from '../hooks/useImagePicker';

// ─── Composant wrapper animé pour chaque item ─────────────────────────────────

type AnimatedItemProps = {
  children: React.ReactNode;
};

/**
 * AnimatedFavoriteItem — enveloppe chaque carte de favori avec une animation
 * d'entrée (fade + remontée depuis le bas).
 *
 * Pourquoi un composant séparé et non une animation dans le map() ?
 * Chaque item a son PROPRE état d'animation (opacityAnim, translateYAnim).
 * Si on mettait les Animated.Value dans FavoritesScreen, ils seraient partagés
 * entre tous les items → tous animés en même temps au mauvais moment.
 * Un composant séparé = une instance isolée de chaque Animated.Value. ✓
 */
function AnimatedFavoriteItem({ children }: AnimatedItemProps) {
  /*
   * opacityAnim — contrôle l'opacité de 0 (invisible) à 1 (opaque).
   * translateYAnim — contrôle la position verticale : 20px en dessous → 0 (place normale).
   *
   * useRef : comme dans PhotoCard, on évite useState pour ne pas déclencher
   * de re-render à chaque frame d'animation.
   */
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    /*
     * Animated.parallel([...]) — lance toutes les animations en même temps.
     * Alternatives :
     *   Animated.sequence([...]) → les animations se jouent l'une après l'autre
     *   Animated.stagger(delay, [...]) → comme parallel mais avec un décalage entre chaque
     *
     * On choisit parallel car on veut que fade ET slide commencent en même temps.
     *
     * .start() — déclenche l'animation. Sans start(), rien ne se passe.
     */
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,           // opacity: 0 → 1
        duration: 350,        // 350ms — assez rapide pour ne pas sembler lent
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,           // translateY: 20 → 0 (remonte à sa position normale)
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // [] → s'exécute une seule fois au montage du composant

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export function FavoritesScreen() {
  const { favorites, isFavorite, toggleFavorite, addLocalPhoto, removeLocalPhoto } =
    useFavorites();

  const { pickImage, isLoading } = useImagePicker();

  // Retire un favori — la logique dépend du type de photo
  const handleRemoveFavorite = (item: FavoriteItem) => {
    if (isLocalPhoto(item)) {
      /*
       * LocalPhoto : on appelle removeLocalPhoto avec l'id string.
       * toggleFavorite ne fonctionne pas ici car LocalPhoto ≠ Photo API.
       */
      removeLocalPhoto(item.id);
    } else {
      /*
       * Photo API : toggleFavorite gère l'ajout ET le retrait.
       * Ici l'item est forcément en favori (on est dans FavoritesScreen),
       * donc toggleFavorite va le retirer.
       */
      toggleFavorite(item);
    }
  };

  // Tap sur le FAB "+" : ouvre la galerie et ajoute la photo sélectionnée
  const handleAddPhoto = async () => {
    const uri = await pickImage();

    if (uri) {
      // pickImage() a retourné une URI → on ajoute la photo aux favoris
      addLocalPhoto(uri);
      // Pas d'Alert : l'apparition animée de la carte est le feedback
    }
    // Si uri est null : l'utilisateur a annulé ou la permission a été refusée
    // (pickImage() a déjà affiché l'Alert dans ce cas)
  };

  // Détermine la source d'image à passer à PhotoCard selon le type de photo
  const getImageSource = (item: FavoriteItem): string => {
    if (isLocalPhoto(item)) {
      return item.uri;          // chemin local sur l'appareil
    }
    return item.thumbnailUrl;   // miniature depuis l'API
  };

  // Sous-titre dynamique du SectionHeader
  const subtitle =
    favorites.length === 0
      ? "Aucun favori pour l'instant"
      : `${favorites.length} photo${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`;

  return (
    /*
     * position: 'relative' (valeur par défaut) est important ici :
     * le bouton AddPhotoButton utilise position:'absolute', et il se
     * positionne par rapport au premier ancêtre avec position non-static.
     * En React Native, toutes les View ont position:'relative' par défaut. ✓
     */
    <View style={styles.screen}>

      <SectionHeader
        title="Mes favoris"
        subtitle={subtitle}
        rightElement={<Badge count={favorites.length} />}
      />

      {favorites.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title="Aucun favori pour l'instant"
          subtitle={"Appuie sur le 🤍 dans le feed\nou sur + pour ajouter une photo depuis ta galerie."}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {favorites.map((item) => (
            /*
             * AnimatedFavoriteItem enveloppe chaque carte.
             * La key est sur AnimatedFavoriteItem (pas sur la View intérieure)
             * pour que React crée une nouvelle instance animée à chaque nouvel item.
             *
             * Quand un item est supprimé, React démonte l'AnimatedFavoriteItem correspondant.
             * Quand un nouvel item est ajouté, un nouvel AnimatedFavoriteItem est monté
             * → son useEffect [] se déclenche → animation d'entrée. ✓
             */
            <AnimatedFavoriteItem key={item.id}>
              <View style={styles.cardWrapper}>
                <PhotoCard
                  photo={item}
                  imageSource={getImageSource(item)}
                  isLocal={isLocalPhoto(item)}
                  isFavorite={isFavorite(item.id)}
                  onPress={() => Alert.alert('📷 Photo', item.title)}
                  onFavoritePress={() => handleRemoveFavorite(item)}
                />
                <Text style={styles.dateAdded}>
                  Ajouté le{' '}
                  {new Date(item.dateAdded).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </AnimatedFavoriteItem>
          ))}

          {/* Espace en bas pour que le FAB ne cache pas la dernière carte */}
          <View style={styles.fabSpacer} />
        </ScrollView>
      )}

      {/*
        AddPhotoButton est rendu EN DEHORS du ScrollView mais DANS la View principale.
        Grâce à position:'absolute', il flotte par-dessus le contenu scrollable.
        C'est le pattern standard pour un FAB en React Native.
      */}
      <AddPhotoButton onPress={handleAddPhoto} isLoading={isLoading} />

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  listContent: {
    padding: 16,
    paddingBottom: 16,
    gap: 12,
  },

  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  dateAdded: {
    fontSize: 11,
    color: '#9ca3af',
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontStyle: 'italic',
  },

  // Espace en bas de la liste pour éviter que le FAB cache le dernier élément
  fabSpacer: {
    height: 80,
  },
});
