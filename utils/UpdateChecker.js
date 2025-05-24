import { Alert, Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const VERSION = '1.0.0'; // Sesuaikan dengan versi di app.json
const UPDATE_URL = 'https://raw.githubusercontent.com/ganteng1212c/ScoreBase/main/updates/version.json';

export const checkForUpdates = async () => {
  try {
    // Cek koneksi internet
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return; // Biarkan aplikasi berjalan normal jika tidak ada internet
    }

    // Cek update dari GitHub
    const response = await fetch(UPDATE_URL);
    const data = await response.json();

    if (data.version > VERSION) {
      Alert.alert(
        'Update Tersedia',
        `Versi baru (${data.version}) tersedia. ${data.message || 'Apakah Anda ingin mengunduh versi terbaru?'}`,
        [
          {
            text: 'Nanti Saja',
            style: 'cancel'
          },
          {
            text: 'Update Sekarang',
            onPress: () => Linking.openURL(data.downloadUrl)
          }
        ],
        { cancelable: true }
      );
    }
  } catch (error) {
    console.log('Error checking for updates:', error);
    // Biarkan aplikasi berjalan normal jika ada error
  }
};
