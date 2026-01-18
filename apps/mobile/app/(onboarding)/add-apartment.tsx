import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function AddApartmentScreen() {
  const [monthlyRent, setMonthlyRent] = useState('400');
  const [squareMeters, setSquareMeters] = useState('55');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const aiTags = ['#Svetlo', '#Moderno', '#Biljke', '#Prostorno'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće učitati sliku');
    }
  };

  const handleSubmit = () => {
    if (!monthlyRent || !squareMeters) {
      Alert.alert('Greška', 'Popuni sva polja');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Greška', 'Dodaj bar jednu sliku stana');
      return;
    }

    // Save apartment data and navigate
    router.push('/(onboarding)/preferences');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>zzimeri</Text>
      </View>

      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>✕</Text>
      </Pressable>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dodaj svoj stan</Text>

        {/* Photo Upload */}
        <Pressable style={styles.imageCard} onPress={pickImage}>
          {photos.length > 0 ? (
            <Image source={{ uri: photos[0] }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.uploadText}>📷 Dodaj sliku stana</Text>
            </View>
          )}
        </Pressable>

        {/* AI Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI je prepoznao:</Text>
          <View style={styles.tagsContainer}>
            {aiTags.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={styles.tagIcon}>✨</Text>
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>
            * AI Insight: Ovaj stan će privući ljude koji vole mir i prirodu.
          </Text>
        </View>

        {/* Monthly Rent */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mesečna kirija (€)</Text>
          <TextInput
            style={styles.input}
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            keyboardType="numeric"
            placeholder="400"
            placeholderTextColor="#999"
          />
        </View>

        {/* Square Meters */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kvadratura (m²)</Text>
          <TextInput
            style={styles.input}
            value={squareMeters}
            onChangeText={setSquareMeters}
            keyboardType="numeric"
            placeholder="55"
            placeholderTextColor="#999"
          />
        </View>

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Objavi oglas</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  imageCard: {
    width: '100%',
    aspectRatio: 1.2,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    fontSize: 18,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E991D9',
    gap: 4,
  },
  tagActive: {
    backgroundColor: '#E991D9',
  },
  tagIcon: {
    fontSize: 14,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tagTextActive: {
    color: '#1a1a1a',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 25,
    padding: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#E991D9',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
});
