/**
 * components/ErrorMessage.tsx
 *
 * Composant réutilisable pour afficher un message d'erreur.
 * Une bonne application gère toujours les cas d'erreur (réseau indisponible,
 * API en panne, etc.) pour ne pas laisser l'utilisateur sans retour visuel.
 *
 * Notions abordées : props optionnelles, rendu conditionnel ({condition && <Composant/>})
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Définition des props du composant
type Props = {
  message: string;       // message d'erreur à afficher
  onRetry?: () => void;  // le "?" signifie que la prop est optionnelle
};

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>

      {/* Icône d'avertissement en grand */}
      <Text style={styles.icon}>⚠️</Text>

      {/* Message d'erreur reçu en prop */}
      <Text style={styles.message}>{message}</Text>

      {/*
        Rendu conditionnel : le bouton n'apparaît QUE si onRetry est fourni.
        C'est un pattern très courant en React : {condition && <Composant />}
      */}
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur centré qui prend tout l'espace disponible
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  // Grande icône d'avertissement
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },

  // Texte du message d'erreur
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  // Bouton "Réessayer"
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },

  // Texte du bouton
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
