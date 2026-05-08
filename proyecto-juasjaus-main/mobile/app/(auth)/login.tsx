import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    // TODO: Implementar lógica de login
    router.replace('/(tabs)/principal');
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-3xl font-bold mb-8 text-red-600">CBTis 258</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-lg p-3 mb-6"
      />
      <TouchableOpacity onPress={handleLogin} className="w-full bg-red-600 p-3 rounded-lg">
        <Text className="text-white text-center font-bold">Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
