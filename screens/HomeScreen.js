import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Button, Text } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PlayerCountDialog = ({ visible, onClose, onSelect }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>Pilih Jumlah Pemain</Text>
          {[1, 2, 3, 4].map((count) => (
            <TouchableOpacity
              key={count}
              style={styles.playerOption}
              onPress={() => {
                onSelect(count);
                onClose();
              }}
            >
              <Icon name="account" size={24} color="#2196F3" />
              <Text style={styles.playerOptionText}>{count} Pemain</Text>
              <Icon name="chevron-right" size={24} color="#2196F3" />
            </TouchableOpacity>
          ))}
          <Button
            title="Batal"
            onPress={onClose}
            style={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen({ navigation }) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleCreateScore = () => {
    setDialogVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Selamat Datang Para Pelatih!</Text>
      <Text style={styles.title}>Skor Panahan</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Mode Skor"
          onPress={handleCreateScore}
          style={[styles.button, styles.scoringButton]}
          contentContainerStyle={styles.buttonContent}
          leading={props => <Text style={styles.buttonIcon}>🎯</Text>}
        />
        <Button
          title="Mode Database"
          onPress={() => navigation.navigate('Database')}
          style={[styles.button, styles.databaseButton]}
          contentContainerStyle={styles.buttonContent}
          leading={props => <Text style={styles.buttonIcon}>📊</Text>}
        />
      </View>
      <PlayerCountDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSelect={(count) => navigation.navigate('PlayerSetup', { playerCount: count })}
      />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2196F3',
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
  },
  playerOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  mainButton: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cancelButton: {
    marginTop: 10,
  },
});
