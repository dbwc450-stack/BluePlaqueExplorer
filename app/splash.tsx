import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        source={require('../animations/splash.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
