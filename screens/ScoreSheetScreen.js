import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import { Text, IconButton, Button } from '@react-native-material/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_BANTALAN = 10;

export default function ScoreSheetScreen({ route, navigation }) {
  const { players, distance, sessionData } = route.params;
  const [scores, setScores] = useState(players.map(() => []));
  const [activePlayer, setActivePlayer] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const scoreButtons = ['X', '10', '9', '8', '7', '6', '5', '4', '3'];

  useEffect(() => {
    checkCompletion();
  }, [scores]);

  const checkCompletion = () => {
    // Cek apakah semua pemain sudah selesai
    const isComplete = scores.every(playerScores => {
      const bantalanCount = Math.floor(playerScores.length / 3);
      return bantalanCount === MAX_BANTALAN && playerScores.length % 3 === 0;
    });

    if (isComplete) {
      saveSession();
      setShowFinishModal(true);
    }
  };

  const saveSession = async () => {
    try {
      const existingSessions = await AsyncStorage.getItem('archery_sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      
      const newSession = {
        ...sessionData,
        scores: scores,
        completedAt: new Date().toISOString()
      };
      
      sessions.push(newSession);
      await AsyncStorage.setItem('archery_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleNewSession = () => {
    setShowFinishModal(false);
    navigation.navigate('Home');
  };

  const handleCheckDatabase = () => {
    setShowFinishModal(false);
    navigation.navigate('Database');
  };

  const showPlayerSelector = () => {
    Alert.alert(
      "Pilih Pemain",
      "Pilih pemain untuk memasukkan skor:",
      players.map((player, index) => ({
        text: `${player.name} (Target ${player.target})`,
        onPress: () => setActivePlayer(index)
      }))
    );
  };

  const calculateTotal = (playerScores) => {
    return playerScores.reduce((sum, score) => {
      if (score === 'X') return sum + 10;
      return sum + (parseInt(score) || 0);
    }, 0);
  };

  const addScore = (score) => {
    const playerScores = scores[activePlayer];
    const currentBantalanCount = Math.floor(playerScores.length / 3);
    
    if (currentBantalanCount >= MAX_BANTALAN) {
      Alert.alert('Maksimal Bantalan', 'Sudah mencapai maksimal 10 bantalan');
      return;
    }

    const shotsInCurrentBantalan = playerScores.length % 3;
    
    if (shotsInCurrentBantalan < 3) {
      const newScores = [...scores];
      newScores[activePlayer] = [...playerScores, score];
      setScores(newScores);
    } else {
      Alert.alert('Bantalan Penuh', 'Silakan mulai bantalan baru');
    }
  };

  const removeLastScore = () => {
    const playerScores = scores[activePlayer];
    if (playerScores.length === 0) {
      Alert.alert('Tidak ada skor', 'Tidak ada skor yang bisa dihapus');
      return;
    }

    Alert.alert(
      'Hapus Skor',
      'Apakah Anda yakin ingin menghapus skor terakhir?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const newScores = [...scores];
            newScores[activePlayer].pop();
            setScores(newScores);
          }
        }
      ]
    );
  };

  const getScoreColor = (score) => {
    if (score === 'X' || score === '10') return '#ffd700';
    if (score === '9' || score === '8') return '#ff0000';
    if (score === '7' || score === '6') return '#4169e1';
    return '#000000';
  };

  const ScoreTable = ({ playerScores }) => {
    const rows = [];
    for (let i = 0; i < MAX_BANTALAN; i++) {
      const startIdx = i * 3;
      const bantalanScores = playerScores.slice(startIdx, startIdx + 3);
      const bantalanTotal = calculateTotal(bantalanScores);
      
      rows.push(
        <View key={i} style={styles.tableRow}>
          <Text style={styles.bantalanNumber}>{i + 1}</Text>
          <View style={styles.scoresContainer}>
            {[0, 1, 2].map((shotIndex) => (
              <Text 
                key={shotIndex} 
                style={[
                  styles.score,
                  { color: getScoreColor(bantalanScores[shotIndex] || '') }
                ]}
              >
                {bantalanScores[shotIndex] || '-'}
              </Text>
            ))}
          </View>
          <Text style={styles.bantalanTotal}>
            {bantalanScores.length > 0 ? bantalanTotal : '-'}
          </Text>
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        {players.length > 1 && (
          <Button
            title={`${players[activePlayer].name} (Target ${players[activePlayer].target})`}
            onPress={showPlayerSelector}
            style={styles.playerSelector}
          />
        )}
        <Text style={styles.distanceText}>{distance}m</Text>
      </View>

      <View style={styles.scoreArea}>
        <ScrollView style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>No.</Text>
            <Text style={[styles.headerText, { flex: 3 }]}>Skor</Text>
            <Text style={styles.headerText}>Total</Text>
          </View>
          
          <ScoreTable playerScores={scores[activePlayer]} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Keseluruhan:</Text>
            <Text style={styles.grandTotal}>
              {calculateTotal(scores[activePlayer])}
            </Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputArea}>
        <View style={styles.scoreButtonsContainer}>
          <TouchableOpacity
            style={styles.backspaceButton}
            onPress={removeLastScore}
          >
            <Text style={styles.backspaceText}>⌫</Text>
          </TouchableOpacity>
          {scoreButtons.map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.scoreButton,
                { backgroundColor: getScoreColor(score) }
              ]}
              onPress={() => addScore(score)}
            >
              <Text style={[
                styles.scoreButtonText,
                { color: ['X', '10', '9', '8'].includes(score) ? '#000' : '#fff' }
              ]}>
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        visible={showFinishModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sesi Selesai!</Text>
            <Text style={styles.modalText}>
              Semua pemain telah menyelesaikan sesi panahan.
              Apa yang ingin Anda lakukan selanjutnya?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Buat Sesi Baru"
                onPress={handleNewSession}
                style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
              />
              <Button
                title="Cek Database"
                onPress={handleCheckDatabase}
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    elevation: 4,
  },
  playerSelector: {
    flex: 1,
    marginRight: 10,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  scoreArea: {
    flex: 1,
    margin: 10,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  inputArea: {
    backgroundColor: '#333',
    padding: 10,
    paddingBottom: 30, // Extra padding to avoid home gesture area
    elevation: 8,
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  scoreButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  scoreButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backspaceButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff5252',
    borderRadius: 30,
    elevation: 3,
  },
  backspaceText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  playerSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  playerTarget: {
    fontSize: 16,
    color: '#666',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 10,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  bantalanNumber: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scoresContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  score: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bantalanTotal: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtons: {
    gap: 10,
  },
  modalButton: {
    width: '100%',
    height: 45,
  },
});
