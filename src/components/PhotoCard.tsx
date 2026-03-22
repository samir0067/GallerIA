/**
 * components/PhotoCard.tsx
 *
 * Composant réutilisable qui affiche une photo sous forme de carte.
 * Accepte 2 types de photos :
 *   - Photo API (thumbnailUrl comme source d'image)
 *   - LocalPhoto (uri local comme source d'image)
 *
 * --- Animation de pression (scale) ---
 *
 * Quand l'utilisateur appuie, la carte se rétracte légèrement (scale 0.97)
 * puis revient à sa taille normale avec un effet de ressort (spring).
 *
 * Pourquoi useRef et non useState pour scaleAnim ?
 *   useState déclencherait un re-render à chaque frame d'animation → lent.
 *   useRef stocke la valeur animée SANS déclencher de re-render.
 *   L'Animated API lit directement la valeur native — pas de re-render du tout.
 *
 * Pourquoi Animated.View + Pressable plutôt que Animated.createAnimatedComponent(TouchableOpacity) ?
 *   Pressable expose onPressIn / onPressOut séparément,
 *   ce qui permet de déclencher l'animation au début de la pression
 *   (pas seulement au relâchement). Résultat : feedback immédiat et naturel.
 *
 * --- Animated.spring vs Animated.timing ---
 *
 *   timing → durée fixe, courbe de Bézier → adapté aux transitions d'UI
 *   spring → physique (friction, tension) → adapté aux interactions tactiles
 *
 * Ici on choisit spring pour le retour car il simule un "rebond" naturel
 * qui correspond à l'attente de l'utilisateur quand il relâche sa pression.
 *
 * Notions abordées : View, Image, Text, Pressable, StyleSheet,
 * position absolute, badge conditionnel, union de types TypeScript,
 * Animated.Value, useRef, Animated.spring, Animated.timing, transform: scale
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { Photo, LocalPhoto } from '../types';

type Props = {
  /** La photo à afficher — peut être une Photo API ou une LocalPhoto */
  photo: Photo | LocalPhoto;

  /**
   * Source de l'image à afficher dans la carte.
   * Pour une Photo API : passer photo.thumbnailUrl
   * Pour une LocalPhoto : passer photo.uri
   * Ce champ est explicite pour ne pas avoir de logique de détection dans le composant.
   */
  imageSource: string;

  /** Si true, affiche un badge "📱 Local" pour distinguer les photos locales */
  isLocal?: boolean;

  /** true si cette photo est dans la liste des favoris */
  isFavorite: boolean;

  /** Appelée quand l'utilisateur tape sur la carte */
  onPress: () => void;

  /** Appelée quand l'utilisateur tape sur le cœur */
  onFavoritePress: () => void;
};

export function PhotoCard({
  photo,
  imageSource,
  isLocal = false,
  isFavorite,
  onPress,
  onFavoritePress,
}: Props) {
  /*
   * scaleAnim — valeur animée qui contrôle le scale de la carte.
   *
   * useRef (et non useState) : Animated.Value est un objet mutable.
   * Le modifier ne doit PAS déclencher de re-render.
   * useRef persiste la référence entre les renders sans les provoquer.
   *
   * new Animated.Value(1) : scale initial = 1 (taille normale)
   */
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Appelée quand l'utilisateur pose le doigt (pression commence)
  const handlePressIn = () => {
    /*
     * Animated.timing — animation avec durée fixe.
     * Ici on veut un retrait rapide et immédiat → timing est approprié.
     *
     * toValue: 0.97 → la carte se rétracte à 97% de sa taille
     * duration: 100ms → très rapide pour que ça semble instantané
     * useNativeDriver: true → l'animation tourne sur le thread natif
     *   (pas le thread JS), ce qui garantit 60 fps même si le JS est chargé
     */
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Appelée quand l'utilisateur relève le doigt (pression termine)
  const handlePressOut = () => {
    /*
     * Animated.spring — animation physique avec rebond.
     * Meilleur que timing pour le "retour" car il simule un relâchement naturel.
     *
     * toValue: 1 → retour à la taille normale
     * useNativeDriver: true → performances natives
     *
     * Les valeurs de spring par défaut (friction: 7, tension: 40) donnent
     * un effet légèrement rebondissant. Pas besoin de les ajuster ici.
     */
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    /*
     * Animated.View — version "animable" de View.
     * Le style "transform: [{ scale: scaleAnim }]" est relu à chaque frame
     * par le moteur Animated pour appliquer la transformation visuelle.
     *
     * Note : on applique l'animation sur la View externe, pas directement
     * sur Pressable, car les props de style de Pressable ont une API différente.
     */
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/*
       * Pressable vs TouchableOpacity :
       *   TouchableOpacity → réduit l'opacité au tap (pas de contrôle fin de timing)
       *   Pressable → expose onPressIn / onPressOut séparément → contrôle total
       * On utilise Pressable pour déclencher l'animation DÈS le contact,
       * et non à la fin du tap.
       */}
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>

        {/* Image — source fournie explicitement en prop pour supporter les deux types */}
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          resizeMode="cover"
        />

        {/*
          Badge "📱 Local" — affiché uniquement pour les photos venant de la galerie.
          Positionné en absolu en haut à GAUCHE (le cœur est à droite).
        */}
        {isLocal && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>📱 Local</Text>
          </View>
        )}

        {/* Titre tronqué à 2 lignes */}
        <Text style={styles.title} numberOfLines={2}>
          {photo.title}
        </Text>

      </Pressable>

      {/*
       * Le bouton cœur est EN DEHORS de Pressable.
       * Si on le mettait à l'intérieur, tapper le cœur déclencherait aussi onPress.
       * Position absolute + parent Animated.View → reste visible par-dessus l'image.
       */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavoritePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.favoriteIcon}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal de la carte
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  // Image carrée qui prend toute la largeur de la carte
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },

  // Titre en bas de la carte
  title: {
    padding: 8,
    fontSize: 12,
    lineHeight: 16,
    color: '#374151',
    fontWeight: '500',
  },

  // Badge "📱 Local" en haut à gauche — positionné en absolu
  localBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  localBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Bouton cœur positionné en absolu en haut à droite
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 4,
  },

  favoriteIcon: {
    fontSize: 16,
  },
});
