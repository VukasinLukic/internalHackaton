import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('[LOGIN] 🎭 DEMO MODE - No backend needed!');
    // Hardcoded demo - just navigate to feed
    router.replace('/(tabs)/feed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/veliki logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Manje stresa. Bolji cimer.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Prijavi se</Text>
        </Pressable>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Nemaš nalog? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.registerLink}>Registruj se</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    width: 280,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 30,
    padding: 18,
    paddingHorizontal: 24,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#E991D9',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#1a1a1a',
    fontSize: 15,
  },
  registerLink: {
    color: '#E991D9',
    fontSize: 15,
    fontWeight: '600',
  },
});
