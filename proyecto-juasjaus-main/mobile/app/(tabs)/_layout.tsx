import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="principal" options={{ title: 'Principal' }} />
      <Tabs.Screen name="tienda" options={{ title: 'Tienda' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
