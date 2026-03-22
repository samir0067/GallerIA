/**
 * components/SkeletonImage.tsx
 *
 * Composant Image avec état de chargement animé (skeleton loader).
 *
 * --- Qu'est-ce qu'un skeleton loader ? ---
 *
 * Un skeleton loader est un espace réservé animé qui occupe la place
 * d'un contenu en cours de chargement. Il donne deux informations
 * à l'utilisateur : "quelque chose va apparaître ici" et "l'app est vivante,
 * elle n'est pas bloquée". C'est une meilleure pratique UX que de laisser
 * un rectangle vide ou un spinner générique.
 *
 * --- Pourquoi Animated.loop ? ---
 *
 * Animated.loop(animation) rejoue indéfiniment l'animation passée en paramètre.
 * À la fin de chaque cycle, il la remet à son état initial et la relance.
 * C'est la façon idiomatique de créer une animation continue en React Native :
 * on décrit UN cycle (ici : montée de l'opacité → descente) et loop s'occupe
 * de le répéter sans écrire de récursion manuelle.
 *
 * --- Pourquoi useRef pour pulseAnim et non useState ? ---
 *
 * Animated.Value est un objet mutable : il change à chaque frame (60 fois/s).
 * Si on utilisait useState pour le stocker, chaque changement déclencherait
 * un re-render → l'UI recalculerait son JSX 60 fois par seconde → lag.
 * useRef stocke la valeur sans déclencher de re-render.
 * L'Animated API lit directement la valeur et met à jour l'UI via le pont natif.
 *
 * --- Pourquoi animation.stop() dans le cleanup du useEffect ? ---
 *
 * Quand un composant est démonté (scroll hors de l'écran, navigation, etc.),
 * React supprime le composant mais les animations peuvent continuer à tourner
 * en mémoire si on ne les arrête pas explicitement.
 * Sans stop(), l'animation bouclerait sur un composant démonté → fuite mémoire.
 * La fonction de retour du useEffect (le "cleanup") est le bon endroit pour
 * libérer ces ressources : elle est appelée juste avant le démontage.
 *
 * --- Cycle de vie de ce composant ---
 *
 *   Montage → pulse démarre (opacité 0.4 ↔ 0.9 en boucle)
 *   Image chargée → pulse s'arrête → fondu skeleton 0.4→0 en 150ms
 *                → setIsLoaded(true) → image apparaît, skeleton démonté
 *   Image en erreur → setIsError(true) → icône 🖼️ de remplacement
 *   Démontage → animation.stop() → pas de fuite mémoire
 *
 * Notions abordées :
 *   - Animated.loop : animation infinie
 *   - Animated.sequence : animations enchaînées (aller-retour opacité)
 *   - useRef pour Animated.Value et CompositeAnimation
 *   - Cleanup d'un useEffect (retour de fonction)
 *   - position: 'absolute' + StyleSheet.absoluteFillObject
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = {
  /** URL de l'image à charger */
  uri: string;
  /**
   * Style appliqué au conteneur (dimensions, borderRadius, etc.).
   * Le skeleton et l'image héritent de ces dimensions via position:absolute.
   */
  style: StyleProp<ViewStyle>;
};

export function SkeletonImage({ uri, style }: Props) {
  /*
   * pulseAnim — opacité du skeleton, oscillera entre 0.4 et 0.9.
   * Valeur initiale : 0.4 (skeleton visible dès le montage, avant que la boucle démarre).
   * useRef : la valeur change 60x/s pendant l'animation → pas de re-render voulu.
   */
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  /*
   * animationRef — référence à l'objet d'animation retourné par Animated.loop().
   * Stocké dans un ref pour pouvoir l'arrêter depuis handleLoad ET depuis le cleanup.
   * Type null initial : l'animation n'est pas encore créée au moment où le ref est déclaré.
   */
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // isLoaded — true quand onLoad est appelé et que le fondu du skeleton est terminé
  const [isLoaded, setIsLoaded] = useState(false);

  // isError — true si l'image n'a pas pu charger (URL invalide, réseau indisponible)
  const [isError, setIsError] = useState(false);

  // ─── Animation de pulse au montage ─────────────────────────────────────────

  useEffect(() => {
    /*
     * Animated.sequence([A, B]) → joue A puis B.
     * Animated.loop(sequence) → recommence depuis le début indéfiniment.
     *
     * Un cycle complet = 1 600ms :
     *   → 800ms : opacité 0.4 → 0.9 (éclaircissement)
     *   → 800ms : opacité 0.9 → 0.4 (assombrissement)
     *
     * On évite 0 et 1 car l'oscillation serait trop agressive visuellement.
     * 0.4-0.9 donne une pulsation subtile et non distrayante.
     */
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true, // opacity → supporté par le thread natif → 60 fps garanti
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animationRef.current = animation;
    animation.start();

    /*
     * Cleanup — appelé au démontage du composant.
     * Sans stop(), l'animation continuerait à tourner en mémoire même après
     * que React ait détruit le composant → fuite mémoire.
     */
    return () => {
      animation.stop();
    };
  }, []); // [] → une seule fois au montage

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLoad = () => {
    /*
     * L'image est chargée. On :
     *   1. Arrête la boucle de pulse
     *   2. Anime le skeleton de sa valeur actuelle vers 0 (fondu en 150ms)
     *   3. Dans le callback de fin d'animation : on passe isLoaded à true
     *      → le skeleton est démonté (déjà à opacité 0, donc pas de saut visuel)
     *      → l'image est désormais seule visible
     */
    animationRef.current?.stop();

    Animated.timing(pulseAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsLoaded(true);
    });
  };

  const handleError = () => {
    // Arrêt du pulse + affichage de l'état d'erreur
    animationRef.current?.stop();
    setIsError(true);
  };

  // ─── Rendu de l'état d'erreur ───────────────────────────────────────────────

  if (isError) {
    return (
      <View style={[style, styles.errorContainer]}>
        <Text style={styles.errorIcon}>🖼️</Text>
      </View>
    );
  }

  // ─── Rendu normal (loading → loaded) ───────────────────────────────────────

  return (
    /*
     * Conteneur principal : reçoit le style de l'appelant (largeur, ratio, etc.)
     * Les enfants absolus héritent de ces dimensions.
     */
    <View style={style}>

      {/*
       * Image chargée en dessous — rendue dès le montage pour démarrer
       * le téléchargement immédiatement, même si elle n'est pas encore visible.
       * Elle devient visible quand le skeleton se démonte (isLoaded → true).
       */}
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={handleError}
      />

      {/*
       * Skeleton par-dessus l'image — positionné en absolu pour la couvrir.
       * Rendu uniquement pendant le chargement (!isLoaded).
       * Quand le chargement se termine, handleLoad l'anime vers opacity 0
       * AVANT de passer isLoaded à true, évitant tout saut visuel.
       *
       * Ordre dans le JSX : Image d'abord (dessous), Skeleton ensuite (dessus).
       * En React Native, les éléments rendus en dernier sont au premier plan.
       */}
      {!isLoaded && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.skeleton,
            { opacity: pulseAnim },
          ]}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Rectangle gris clair qui pulse pendant le chargement
  skeleton: {
    backgroundColor: '#e5e7eb',
  },

  // Conteneur de l'état d'erreur — même dimensions que le conteneur normal
  errorContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icône d'erreur centrée
  errorIcon: {
    fontSize: 28,
    opacity: 0.4,
  },
});
