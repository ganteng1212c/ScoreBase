import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from '@react-native-material/core';

export default function PlayerSetupScreen({ route, navigation }) {
  const { playerCount } = route.params;
  const [distance, setDistance] = useState('18');
  const [players, setPlayers] = useState(Array(playerCount).fill().map(() => ({
    name: '',
    target: ''
  })));

  const handleSubmit = () => {
    if (!distance || isNaN(distance)) {
      alert('Mohon isi jarak tembak dengan benar');
      return;
    }

    // Validasi input pemain
    const isValid = players.every(player => player.name && player.target);
    if (!isValid) {
      alert('Mohon isi semua data pemain');
      return;
    }

    // Validasi target unik
    const targets = players.map(p => p.target);
    const uniqueTargets = new Set(targets);
    if (uniqueTargets.size !== players.length) {
      alert('Setiap pemain harus memiliki target yang berbeda');
      return;
    }

    // Simpan ke database juga
    const sessionData = {
      date: new Date().toISOString(),
      distance: distance,
      players: players,
      scores: Array(playerCount).fill([])
    };
    
    // Navigasi ke score sheet
    navigation.navigate('ScoreSheet', { 
      players,
      distance,
      sessionData
    });
  };

  const getTargetSuggestions = (currentIndex) => {
    const usedTargets = players
      .filter((_, index) => index !== currentIndex)
      .map(p => p.target);
    const allTargets = ['A', 'B', 'C', 'D'];
    return allTargets.filter(t => !usedTargets.includes(t));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setup Sesi Panahan</Text>

      <View style={styles.distanceForm}>
        <Text style={styles.sectionTitle}>Jarak Tembak</Text>
        <TextInput
          label="Jarak (meter)"
          value={distance}
          onChangeText={setDistance}
          keyboardType="number-pad"
          style={styles.input}
          trailing={props => <Text style={styles.unitText}>m</Text>}
        />
      </View>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>Data {playerCount} Pemain</Text>
        {players.map((player, index) => (
          <View key={index} style={styles.playerForm}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>Pemain {index + 1}</Text>
              <Text style={styles.targetSuggestion}>
                Target Tersedia: {getTargetSuggestions(index).join(', ')}
              </Text>
            </View>
            <TextInput
              label="Nama Pemain"
              value={players[index].name}
              onChangeText={(text) => {
                const newPlayers = [...players];
                newPlayers[index].name = text;
                setPlayers(newPlayers);
              }}
              style={styles.input}
            />
            <TextInput
              label="Target (A/B/C/D)"
              value={players[index].target}
              onChangeText={(text) => {
                const newPlayers = [...players];
                newPlayers[index].target = text.toUpperCase();
                setPlayers(newPlayers);
              }}
              style={styles.input}
              autoCapitalize="characters"
              maxLength={1}
            />
          </View>
        ))}
      </View>

      <Button
        title="Mulai Scoring"
        onPress={handleSubmit}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2196F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  distanceForm: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  playersSection: {
    marginBottom: 20,
  },
  playerForm: {
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  targetSuggestion: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 10,
  },
  unitText: {
    color: '#666',
    marginRight: 10,
  },
  button: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#2196F3',
    height: 50,
  },
});
