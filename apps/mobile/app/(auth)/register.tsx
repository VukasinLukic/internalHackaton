import { View, Text, StyleSheet, TextInput, Pressable, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setOnboardingName, login } = useAuthStore();

  const handleRegister = () => {
    console.log('[REGISTER] 🎭 DEMO MODE - No backend needed!');

    // Validate fields
    if (!name.trim()) {
      alert('Unesi ime i prezime');
      return;
    }

    if (!email.trim()) {
      alert('Unesi email adresu');
      return;
    }

    // Validate email contains @gmail.com
    if (!email.toLowerCase().includes('@gmail.com')) {
      alert('Email mora biti @gmail.com adresa');
      return;
    }

    if (!password.trim() || password.length < 6) {
      alert('Lozinka mora imati minimum 6 karaktera');
      return;
    }

    // Save name and email to onboarding state
    setOnboardingName(name);

    // Create demo user object with email
    const demoUser = {
      id: 'demo-user-id',
      email: email,
      name: name,
      role: 'seeker' as const,
      images: [],
      attributes: [],
      preferences: {},
    };

    // Store in auth state using login
    login('demo-token', demoUser);

    // Hardcoded demo - go straight to onboarding
    router.replace('/(onboarding)/role-selection');
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
          placeholder="Ime i prezime"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
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

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registruj se</Text>
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Već imaš nalog? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>Prijavi se</Text>
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
    width: 420,
    height: 220,
    marginBottom: 32,
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#1a1a1a',
    fontSize: 15,
  },
  loginLink: {
    color: '#E991D9',
    fontSize: 15,
    fontWeight: '600',
  },
});
