import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from '@react-native-material/core';

export default function HomeScreen({ navigation }) {
  const handleCreateScore = () => {
    Alert.alert(      'Pilih Jumlah Pemain',
      'Berapa pemain yang akan berpartisipasi?',
      [
        {
          text: '1 Pemain',
          onPress: () => navigation.navigate('PlayerSetup', { playerCount: 1 }),
        },
        {
          text: '2 Pemain',
          onPress: () => navigation.navigate('PlayerSetup', { playerCount: 2 }),
        },
        {
          text: '3 Pemain',
          onPress: () => navigation.navigate('PlayerSetup', { playerCount: 3 }),
        },
        {
          text: '4 Pemain',
          onPress: () => navigation.navigate('PlayerSetup', { playerCount: 4 }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Selamat Datang Para Pelatih!</Text>
      <Text style={styles.title}>Archery Score</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Scoring Mode"
          onPress={handleCreateScore}
          style={[styles.button, styles.scoringButton]}
          contentContainerStyle={styles.buttonContent}
          leading={props => <Text style={styles.buttonIcon}>🎯</Text>}
        />
        <Button
          title="Database Mode"
          onPress={() => navigation.navigate('Database')}
          style={[styles.button, styles.databaseButton]}
          contentContainerStyle={styles.buttonContent}
          leading={props => <Text style={styles.buttonIcon}>📊</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#2196F3',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    height: 60,
    borderRadius: 15,
  },
  scoringButton: {
    backgroundColor: '#2196F3',
  },
  databaseButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
});
