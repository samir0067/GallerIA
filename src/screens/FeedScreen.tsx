/**
 * screens/FeedScreen.tsx
 *
 * Écran principal : affiche la grille de 30 photos chargées depuis l'API.
 * Tap sur une carte → navigation vers PhotoDetailScreen (Stack Navigator).
 *
 * --- FlatList vs ScrollView : pourquoi ce changement ? ---
 *
 * ScrollView charge TOUS les éléments en mémoire dès le départ.
 * Avec 30 photos c'est acceptable, mais avec 500 ou 5000, les performances
 * s'effondrent : tout est rendu, tout occupe de la mémoire, même hors écran.
 *
 * FlatList est "virtualisée" : elle ne rend QUE les éléments visibles à l'écran
 * (+ quelques au-dessus/en-dessous en réserve). Les éléments qui sortent
 * de l'écran sont détruits et recréés à la volée. Résultat : mémoire constante
 * quelle que soit la taille de la liste. C'est le composant recommandé
 * pour toutes les listes de contenu dynamique en React Native.
 *
 * --- Header animé (collapsible) ---
 *
 * Le bandeau du haut rétrécit quand l'utilisateur scrolle vers le bas.
 * Effet : plus de place pour le contenu, header discret pendant la navigation.
 *
 * Mécanique :
 *   1. scrollY — Animated.Value qui suit la position de scroll
 *   2. Animated.event() — connecte l'événement onScroll à scrollY automatiquement
 *   3. scrollY.interpolate() — mappe une plage de scroll (0-80px) vers une plage de style
 *   4. Animated.View avec les styles interpolés → React Native applique la transformation
 *
 * useNativeDriver: false est obligatoire ici car on anime des propriétés de LAYOUT
 * (height, paddingTop, fontSize). Le driver natif ne supporte que les transformations
 * (translate, scale, opacity) qui ne modifient pas le layout.
 *
 * Notions abordées :
 *   - FlatList avec numColumns={2} pour une grille 2 colonnes
 *   - useNavigation() pour naviguer depuis un écran
 *   - Composition de hooks : usePhotos + useFavorites
 *   - Animated.Value + useRef pour suivre le scroll
 *   - Animated.event() : pont entre événement natif et Animated.Value
 *   - interpolate() : mapping de plages de valeurs
 *   - useNativeDriver: false pour les animations de layout
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Photo } from '../types';
import { PhotoCard } from '../components/PhotoCard';
import { SectionHeader } from '../components/SectionHeader';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePhotos } from '../hooks/usePhotos';
import { useFavorites } from '../hooks/useFavorites';
import { FeedStackNavigationProp } from '../navigation/types';

// --- Calcul de la largeur des cartes ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 12;
const CARD_GAP = 10;
// Chaque carte prend flex:1 dans sa colonne — CARD_WIDTH est utilisé comme référence
// pour les styles, mais avec FlatList numColumns la largeur est gérée par flex:1
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// --- Constantes pour l'animation du header ---
// Ces valeurs définissent le COMPORTEMENT de l'animation
const HEADER_MAX_HEIGHT = 80;   // hauteur initiale du bandeau
const HEADER_MIN_HEIGHT = 50;   // hauteur minimale après scroll

export function FeedScreen() {
  /*
   * useNavigation() retourne l'objet navigation de React Navigation.
   * On le type avec FeedStackNavigationProp<'FeedMain'> pour que TypeScript
   * valide les appels à navigation.navigate() : noms d'écrans et params vérifiés.
   */
  const navigation = useNavigation<FeedStackNavigationProp<'FeedMain'>>();

  const { photos, loading, error, reload } = usePhotos();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // ─── Animation du header ────────────────────────────────────────────────────

  /*
   * scrollY — Animated.Value qui reflète la position de scroll de la FlatList.
   *
   * useRef() : la valeur animée persiste entre les re-renders sans en déclencher.
   * .current : pattern standard pour accéder à la valeur du ref.
   *
   * new Animated.Value(0) : position de scroll initiale = 0 (haut de la liste).
   */
  const scrollY = useRef(new Animated.Value(0)).current;

  /*
   * headerHeight — interpolation de scrollY vers une hauteur de header.
   *
   * interpolate({ inputRange, outputRange }) :
   *   - inputRange: [0, 80] → quand scrollY vaut entre 0 et 80
   *   - outputRange: [80, 50] → la hauteur passe de 80 à 50
   *   - extrapolate: 'clamp' → bloque les valeurs aux bornes (ne va pas < 50 ou > 80)
   *
   * Quand scrollY = 0   → height = 80 (header pleine taille)
   * Quand scrollY = 40  → height = 65 (mi-animation)
   * Quand scrollY ≥ 80  → height = 50 (header compact — bloqué par clamp)
   */
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  /*
   * titleFontSize — interpolation de scrollY vers une taille de texte.
   * Même logique que headerHeight : le titre rétrécit de 26px à 18px.
   */
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [26, 18],
    extrapolate: 'clamp',
  });

  /*
   * titleOpacity — le sous-titre disparaît pendant le scroll.
   * Disparaît entre scroll 0 et 40 (deux fois plus rapide que le header).
   */
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  // Tap sur le cœur : toggle favori + Alert si ajout
  const handleFavoritePress = (photo: Photo) => {
    const wasAlreadyFavorite = isFavorite(photo.id);
    toggleFavorite(photo);
    if (!wasAlreadyFavorite) {
      Alert.alert('Favori ajouté !', `"${photo.title}" sauvegardé ❤️`);
    }
  };

  // Tap sur une carte : navigation vers le détail
  const handleCardPress = (photo: Photo) => {
    /*
     * navigation.navigate() empile PhotoDetailScreen sur FeedScreen.
     * Le deuxième argument est l'objet params — TypeScript vérifie
     * que { photoId: number } correspond à FeedStackParamList['PhotoDetail'].
     */
    navigation.navigate('PhotoDetail', { photoId: photo.id });
  };

  return (
    <View style={styles.screen}>

      {/*
        Animated.View — version animable de View.
        Le style accepte des Animated.Value (interpolées ou non).
        Ici : height et paddingTop sont des valeurs interpolées depuis scrollY.

        IMPORTANT : useNativeDriver: false est requis pour les animations de layout.
        Les propriétés comme height, padding, fontSize ne peuvent pas être
        animées sur le thread natif — elles nécessitent le bridge JS/natif.
      */}
      <Animated.View
        style={[
          styles.headerBand,
          {
            height: headerHeight,
          },
        ]}
      >
        {/* Titre animé — fontSize change avec le scroll */}
        <Animated.Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
          🖼️ GallerIA
        </Animated.Text>

        {/* Sous-titre — disparaît pendant le scroll */}
        <Animated.Text style={[styles.headerSubtitle, { opacity: subtitleOpacity }]}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} · {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
        </Animated.Text>
      </Animated.View>

      {/* Rendu conditionnel : loading → error → données */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        /*
         * Animated.FlatList — version animable de FlatList.
         * Permet d'utiliser onScroll avec Animated.event().
         *
         * onScroll={Animated.event([...])}
         * Animated.event() crée un handler qui met à jour scrollY automatiquement
         * à chaque événement de scroll natif — sans passer par setState.
         *
         * La structure [{ nativeEvent: { contentOffset: { y: scrollY } } }]
         * mappe la propriété nativeEvent.contentOffset.y de l'événement scroll
         * vers la valeur animée scrollY.
         *
         * scrollEventThrottle={16} : émet l'événement scroll au maximum toutes les 16ms
         * (~60 fps). Sans ça, l'animation serait saccadée sur iOS.
         */
        <Animated.FlatList
          data={photos}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            /*
             * Chaque item a flex:1 → prend 50% de la ligne automatiquement.
             * Pas besoin de CARD_WIDTH ici : FlatList gère la répartition
             * entre les colonnes via flexbox.
             */
            <View style={styles.cardWrapper}>
              <PhotoCard
                photo={item}
                imageSource={item.thumbnailUrl}  // Photo API → miniature 150×150
                isLocal={false}
                isFavorite={isFavorite(item.id)}
                onPress={() => handleCardPress(item)}
                onFavoritePress={() => handleFavoritePress(item)}
              />
            </View>
          )}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <SectionHeader
              title="Découvrir"
              subtitle={`${photos.length} photos depuis l'API`}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
            //                   ^^^^^ obligatoire pour les animations de layout (height, fontSize)
            //                   true serait possible si on animait uniquement opacity/transform
          )}
          scrollEventThrottle={16}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // Bandeau coloré en haut — hauteur contrôlée par l'animation
  headerBand: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    overflow: 'hidden', // masque le contenu qui dépasse quand le header rétrécit
    justifyContent: 'center',
  },

  headerTitle: {
    // fontSize est animé — on ne le définit PAS ici pour éviter le conflit
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },

  // Contenu scrollable de la FlatList
  listContent: {
    paddingBottom: 32,
  },

  // Style de chaque LIGNE de la grille (2 cartes côte à côte)
  row: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },

  // Chaque item prend 50% de la ligne (flex:1 sur 2 colonnes = 50%)
  cardWrapper: {
    flex: 1,
  },
});
