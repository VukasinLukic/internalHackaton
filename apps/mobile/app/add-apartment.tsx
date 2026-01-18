import { View, Text, StyleSheet, Pressable, ScrollView, Image, TextInput, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fake AI vibes that will be "detected" from the image
const FAKE_AI_VIBES = ['Svetlo', 'Moderno', 'Biljke', 'Prostrano', 'Minimalist'];

export default function AddApartmentScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [price, setPrice] = useState('400');
  const [size, setSize] = useState('55');
  const [showVibes, setShowVibes] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImage(result.assets[0].uri);
      // Simulate AI analysis delay
      setTimeout(() => {
        setShowVibes(true);
      }, 500);
    }
  };

  const handleSubmit = () => {
    if (!image) {
      Alert.alert('Greška', 'Dodaj sliku stana');
      return;
    }
    if (!price) {
      Alert.alert('Greška', 'Unesi mesečnu kiriju');
      return;
    }

    Alert.alert(
      'Uspešno!',
      'Tvoj stan je objavljen i sada je vidljiv tražiocima.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modal Card */}
        <View style={styles.card}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>

          {/* Logo */}
          <Image
            source={require('../assets/mali logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Dodaj svoj stan</Text>

          {/* Image Upload Section */}
          <Pressable style={styles.imageUploadContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.uploadIconWrapper}>
                  <Text style={styles.uploadIcon}>📷</Text>
                </View>
                <Text style={styles.uploadText}>Dodaj sliku stana</Text>
              </View>
            )}
          </Pressable>

          {/* AI Vibes Section - shows after image upload */}
          {showVibes && (
            <View style={styles.aiSection}>
              <Text style={styles.aiLabel}>AI je prepoznao:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.vibesScrollView}
                contentContainerStyle={styles.vibesContainer}
              >
                {FAKE_AI_VIBES.map((vibe, index) => (
                  <View key={index} style={styles.vibeBadge}>
                    <Text style={styles.vibeIcon}>✱</Text>
                    <Text style={styles.vibeText}>#{vibe}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* AI Insight */}
              <Text style={styles.aiInsight}>
                <Text style={styles.aiInsightLabel}>* AI Insight: </Text>
                Ovaj stan će privući ljude koji vole mir i prirodu.
              </Text>
            </View>
          )}

          {/* Price Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mesečna kirija (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="400"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Size Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kvadratura (m²)</Text>
            <TextInput
              style={styles.input}
              placeholder="55"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={size}
              onChangeText={setSize}
            />
          </View>

          {/* Submit Button */}
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Objavi oglas</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 32,
    color: '#999',
    fontWeight: '300',
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  imageUploadContainer: {
    width: SCREEN_WIDTH - 88,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8E8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  aiSection: {
    width: '100%',
    marginBottom: 20,
  },
  aiLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  vibesScrollView: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  vibesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 24,
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  vibeIcon: {
    fontSize: 12,
    color: '#E991D9',
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiInsight: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginTop: 16,
  },
  aiInsightLabel: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1a1a1a',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#E991D9',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
