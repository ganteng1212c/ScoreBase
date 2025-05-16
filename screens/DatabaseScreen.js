import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, TouchableOpacity } from 'react-native';
import { Text, Button } from '@react-native-material/core';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DatabaseScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('archery_sessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedSessions(selectAll ? [] : sessions.map((_, index) => index));
  };

  const toggleSessionSelect = (index) => {
    setSelectedSessions(prev => {
      const isSelected = prev.includes(index);
      if (isSelected) {
        setSelectAll(false);
        return prev.filter(i => i !== index);
      } else {
        const newSelected = [...prev, index];
        if (newSelected.length === sessions.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  const exportToExcel = async () => {
    if (selectedSessions.length === 0) {      Alert.alert('Peringatan', 'Pilih minimal satu sesi untuk diekspor');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      
      // Sheet Ringkasan
      const summaryData = selectedSessions.map(index => {
        const session = sessions[index];
        return {
          Tanggal: new Date(session.date).toLocaleDateString(),
          Jarak: session.distance + 'm',
          'Jumlah Pemain': session.players.length,
          'Total Skor Tertinggi': Math.max(...session.players.map((_, i) => calculateTotal(session.scores[i]))),
          'Total Skor Terendah': Math.min(...session.players.map((_, i) => calculateTotal(session.scores[i]))),
        };
      });
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

      // Sheet Detail per Sesi
      selectedSessions.forEach(index => {
        const session = sessions[index];
        const sessionData = session.players.map((player, playerIndex) => {
          const playerScores = session.scores[playerIndex];
          const scoresByBantalan = [];
          
          for (let i = 0; i < 10; i++) {
            const startIdx = i * 3;
            const bantalanScores = playerScores.slice(startIdx, startIdx + 3);
            scoresByBantalan.push(
              bantalanScores[0] || '-',
              bantalanScores[1] || '-',
              bantalanScores[2] || '-',
              calculateTotal(bantalanScores) || 0
            );
          }

          return {
            'Nama Pemain': player.name,
            'Target': player.target,
            ...Object.fromEntries(
              scoresByBantalan.map((score, i) => [
                i % 4 === 3 ? `B${Math.floor(i/4)+1} Total` : `B${Math.floor(i/4)+1} P${(i%4)+1}`,
                score
              ])
            ),
            'Total Keseluruhan': calculateTotal(playerScores)
          };
        });

        const ws = XLSX.utils.json_to_sheet(sessionData);
        XLSX.utils.book_append_sheet(wb, ws, `Sesi ${index + 1}`);
      });

      // Generate dan simpan file
      const excelFile = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `ArcheryScore_${new Date().toISOString().slice(0,10)}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, excelFile, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Share.share({
        url: filePath,
        message: 'Data Skor Panahan'
      });

      Alert.alert('Sukses', 'File Excel berhasil dibuat dan dibagikan!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Error', 'Gagal membuat file Excel');
    }
  };

  const calculateTotal = (scores) => {
    return scores.reduce((sum, score) => {
      if (score === 'X') return sum + 10;
      return sum + (parseInt(score) || 0);
    }, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Database Pemanah</Text>
        <Button
          title={`Export ${selectedSessions.length} Sesi`}
          onPress={exportToExcel}
          style={[
            styles.exportButton,
            { opacity: selectedSessions.length > 0 ? 1 : 0.5 }
          ]}
          leading={props => <Text style={styles.buttonIcon}>📊</Text>}
        />
      </View>

      {sessions.length > 0 && (
        <TouchableOpacity 
          style={styles.selectAllContainer} 
          onPress={toggleSelectAll}
        >
          <View style={styles.checkboxContainer}>
            <MaterialIcons
              name={selectAll ? "check-box" : "check-box-outline-blank"}
              size={24}
              color="#2196F3"
            />
            <Text style={styles.checkboxLabel}>Pilih Semua Sesi</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Sesi</Text>
        {sessions.map((session, index) => (
          <View key={index} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <TouchableOpacity 
                  onPress={() => toggleSessionSelect(index)}
                  style={styles.checkboxContainer}
                >
                  <MaterialIcons
                    name={selectedSessions.includes(index) ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color="#2196F3"
                  />
                </TouchableOpacity>
                <View>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionDistance}>{session.distance}m</Text>
                </View>
              </View>
            </View>
            {session.players.map((player, playerIndex) => (
              <View key={playerIndex} style={styles.playerRow}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerTarget}>Target {player.target}</Text>
                <Text style={styles.playerScore}>
                  {calculateTotal(session.scores[playerIndex])}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {sessions.length === 0 && (
          <Text style={styles.noDataText}>
            Belum ada sesi yang tersimpan
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    backgroundColor: 'white',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectAllContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sessionHeader: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionDistance: {
    fontSize: 14,
    color: '#2196F3',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  playerName: {
    flex: 2,
    fontSize: 16,
  },
  playerTarget: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  playerScore: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#2196F3',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
