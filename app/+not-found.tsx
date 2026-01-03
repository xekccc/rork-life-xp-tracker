import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Pressable onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Go back home</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: Colors.secondary,
  },
});
