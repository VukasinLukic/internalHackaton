import { View, Text, StyleSheet, Pressable, ScrollView, Image, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function AddApartmentScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Beograd');
  const [size, setSize] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      Alert.alert('Greška', 'Dodaj bar jednu sliku stana');
      return;
    }
    if (!price || !address) {
      Alert.alert('Greška', 'Popuni sva obavezna polja');
      return;
    }

    // Demo - just show success and go back
    Alert.alert(
      'Uspešno!',
      'Tvoj stan je dodat i sada je vidljiv ostalim korisnicima.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Dodaj Stan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slike stana</Text>
          <Text style={styles.sectionSubtitle}>Dodaj do 5 slika</Text>

          <View style={styles.imagesGrid}>
            {/* Uploaded Images */}
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <Pressable
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </Pressable>
                {index === 0 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageText}>Glavna</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Add Image Button */}
            {images.length < 5 && (
              <Pressable style={styles.addImageButton} onPress={pickImage}>
                <View style={styles.addImageIcon}>
                  <Text style={styles.addImageIconText}>+</Text>
                </View>
                <Text style={styles.addImageText}>Dodaj sliku</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Osnovne informacije</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cena (€/mesec) *</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. 450"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresa *</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. Kralja Milana 25"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Grad</Text>
            <View style={styles.citySelector}>
              {['Beograd', 'Novi Sad', 'Niš'].map((c) => (
                <Pressable
                  key={c}
                  style={[styles.cityOption, city === c && styles.cityOptionActive]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.cityOptionText, city === c && styles.cityOptionTextActive]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Površina (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="npr. 55"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={size}
                onChangeText={setSize}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Sobe</Text>
              <View style={styles.roomSelector}>
                {['1', '2', '3', '4+'].map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.roomOption, bedrooms === r && styles.roomOptionActive]}
                    onPress={() => setBedrooms(r)}
                  >
                    <Text style={[styles.roomOptionText, bedrooms === r && styles.roomOptionTextActive]}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Opiši svoj stan - šta ga čini posebnim?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* AI Analysis Preview */}
        <View style={styles.section}>
          <View style={styles.aiPreviewCard}>
            <View style={styles.aiPreviewHeader}>
              <View style={styles.aiIconWrapper}>
                <Text style={styles.aiIcon}>✱</Text>
              </View>
              <Text style={styles.aiPreviewTitle}>AI Analiza</Text>
            </View>
            <Text style={styles.aiPreviewText}>
              Nakon što dodaš slike, AI će automatski analizirati tvoj stan i dodeliti mu vajbove poput "Svetao", "Moderan", "Udoban" itd.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Objavi Stan</Text>
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#E991D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainImageText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addImageIconText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '300',
  },
  addImageText: {
    fontSize: 11,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  citySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  cityOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  cityOptionActive: {
    backgroundColor: '#E991D9',
  },
  cityOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cityOptionTextActive: {
    color: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  roomSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roomOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  roomOptionActive: {
    backgroundColor: '#E991D9',
  },
  roomOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  roomOptionTextActive: {
    color: '#fff',
  },
  aiPreviewCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 16,
  },
  aiPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E991D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiIcon: {
    fontSize: 12,
    color: '#fff',
  },
  aiPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiPreviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  submitSection: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#E991D9',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
