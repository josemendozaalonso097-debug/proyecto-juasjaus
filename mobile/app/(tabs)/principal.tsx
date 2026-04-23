import { View, Text } from 'react-native';

export default function PrincipalScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-red-600">Dashboard</Text>
      <Text className="mt-4 text-gray-600">Bienvenido a CBTis 258</Text>
    </View>
  );
}
