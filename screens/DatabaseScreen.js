import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, TouchableOpacity } from 'react-native';
import { Text, Button } from '@react-native-material/core';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';

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
  };  const exportToExcel = async () => {
    if (selectedSessions.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu sesi untuk diekspor');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      
      selectedSessions.forEach((sessionIndex) => {
        const session = sessions[sessionIndex];
        const sessionData = [];
        
        // Header informasi sesi
        sessionData.push({
          'Informasi': `Sesi Panahan - ${new Date(session.date).toLocaleDateString()}`,
        });
        sessionData.push({
          'Informasi': `Jarak Tembak: ${session.distance} meter`,
        });
        
        // Spasi kosong
        sessionData.push({});
        
        // Header untuk data pemain
        const headerRow = {
          'Nama Pemanah': '',
          'Target': '',
        };
        
        // Buat header untuk setiap rambahan
        for (let i = 1; i <= 10; i++) {
          headerRow[`R${i}.1`] = '';  // Rambahan kolom 1
          headerRow[`R${i}.2`] = `Rambahan ${i}`;  // Rambahan kolom 2
          headerRow[`R${i}.3`] = '';  // Rambahan kolom 3
          headerRow[`Total R${i}`] = '';
        }
        headerRow['Total'] = '';
        sessionData.push(headerRow);
        
        // Sub-header dengan detail kolom
        const subHeaderRow = {
          'Nama Pemanah': 'Nama Pemanah',
          'Target': 'Target',
        };
        
        // Detail kolom untuk setiap rambahan
        for (let i = 1; i <= 10; i++) {
          subHeaderRow[`R${i}.1`] = 'Panah 1';
          subHeaderRow[`R${i}.2`] = 'Panah 2';
          subHeaderRow[`R${i}.3`] = 'Panah 3';
          subHeaderRow[`Total R${i}`] = 'Total';
        }
        subHeaderRow['Total'] = 'Total Skor';
        sessionData.push(subHeaderRow);
        
        // Data setiap pemain
        session.players.forEach((player, playerIndex) => {
          const scores = session.scores[playerIndex];
          const playerRow = {
            'Nama Pemanah': player.name,
            'Target': String.fromCharCode(65 + parseInt(player.target) - 1), // Konversi nomor ke huruf (1->A, 2->B, dst)
          };
          
          // Isi skor untuk setiap rambahan
          let totalScore = 0;
          for (let i = 0; i < 10; i++) {
            const startIdx = i * 3;
            const rambahanScores = scores.slice(startIdx, startIdx + 3);
            const rambahanTotal = calculateTotal(rambahanScores);
            
            playerRow[`R${i+1}.1`] = rambahanScores[0] || '';
            playerRow[`R${i+1}.2`] = rambahanScores[1] || '';
            playerRow[`R${i+1}.3`] = rambahanScores[2] || '';
            playerRow[`Total R${i+1}`] = rambahanTotal;
            
            totalScore += rambahanTotal;
          }
          playerRow['Total'] = totalScore;
          sessionData.push(playerRow);
        });

        // Tambahkan summary statistik
        sessionData.push({});
        const statsRow = {
          'Nama Pemanah': 'Statistik Sesi',
        };
        sessionData.push(statsRow);
        
        // Buat worksheet dengan pengaturan lebar kolom
        const ws = XLSX.utils.json_to_sheet(sessionData);
        
        // Atur lebar kolom
        const colWidths = {
          'A': 25, // Nama Pemanah
          'B': 10, // Target
        };
        
        // Atur lebar kolom untuk rambahan
        for (let i = 0; i < 41; i++) { // 10 rambahan x 4 kolom (3 panah + total) + 2 kolom awal + 1 total
          const col = String.fromCharCode(65 + i);
          colWidths[col] = 10;
        }
        
        ws['!cols'] = Object.keys(colWidths).map(key => ({
          wch: colWidths[key]
        }));

        // Tambahkan worksheet ke workbook
        XLSX.utils.book_append_sheet(wb, ws, `Sesi ${sessionIndex + 1}`);
      });

      // Generate file Excel
      const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `SkorPanahan_${new Date().toISOString().slice(0,10)}.xlsx`;
      const filePath = FileSystem.documentDirectory + fileName;

      // Simpan dan bagikan file
      await FileSystem.writeAsStringAsync(filePath, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Share.share({
        url: filePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        message: 'Hasil Skor Panahan'
      });

      Alert.alert('Sukses', 'File Excel berhasil dibuat dan dibagikan!');
    } catch (error) {
      console.error('Error ekspor Excel:', error);
      Alert.alert('Error', 'Gagal membuat file Excel. ' + error.message);
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
          title={`Ekspor ${selectedSessions.length} Sesi`}
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
