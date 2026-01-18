import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileSetupScreen() {
  const {
    onboardingRole,
    onboardingName,
    onboardingBio,
    onboardingPhotos,
    setOnboardingName,
    setOnboardingBio,
    setOnboardingPhotos,
    addOnboardingPhoto
  } = useAuthStore();

  const [name, setName] = useState(onboardingName);
  const [bio, setBio] = useState(onboardingBio);
  const [photos, setPhotos] = useState<string[]>(onboardingPhotos);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup galeriji');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhotos([...photos, uri]);
        addOnboardingPhoto(uri);
      }
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće učitati sliku');
      console.error('Image picker error:', error);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setOnboardingPhotos(newPhotos);
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Greška', 'Unesi svoje ime');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Greška', 'Dodaj bar jednu sliku');
      return;
    }

    setIsUploading(true);

    try {
      // Save to store
      setOnboardingName(name);
      setOnboardingBio(bio);
      setOnboardingPhotos(photos);

      // Navigate to AI analysis
      router.push('/(onboarding)/photo-analysis');
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške');
      console.error('Profile setup error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Tvoj profil</Text>
        <Text style={styles.subtitle}>
          {onboardingRole === 'seeker' ? 'Dodaj svoje slike da AI pronađe savršen stan za tebe' : 'Dodaj svoje slike da AI pronađe idealnog cimera'}
        </Text>
      </View>

      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>Tvoje slike ({photos.length}/4)</Text>
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <Pressable key={index} onLongPress={() => removePhoto(index)} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Pressable style={styles.removeButton} onPress={() => removePhoto(index)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            </Pressable>
          ))}
          {photos.length < 4 && (
            <Pressable style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoText}>+</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.hint}>✨ AI će analizirati tvoje slike i pronaći tvoj vibe</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Ime"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Kratko o tebi..."
          placeholderTextColor="#999"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>

      <Pressable
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Nastavi</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    lineHeight: 22,
  },
  photosSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 85,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  removeButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 85,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 36,
    color: '#999',
  },
  hint: {
    fontSize: 13,
    color: '#E991D9',
    marginTop: 12,
    fontWeight: '500',
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  input: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 25,
    padding: 18,
    paddingHorizontal: 24,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
    borderRadius: 20,
  },
  button: {
    backgroundColor: '#E991D9',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
});
