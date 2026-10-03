import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

/**
 * MEASUREGX Official Mobile Intro Splash Screen (3 Seconds)
 * 
 * - Displays the official high-resolution MeasureGX brand splash artwork
 * - Runs for exactly 3 seconds, then transitions fast & smooth to Login
 * - Tap anywhere to skip instantly
 */
export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  // Animation values
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const isExiting = useRef(false);

  const triggerExit = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    // Fast 380ms smooth dissolve into Login Screen
    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.03,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onComplete) onComplete();
    });
  };

  useEffect(() => {
    // Quick, elegant 300ms fade-in
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Exactly 2.6s hold + 0.4s smooth dissolve = 3.0s total transition to login
    const timer = setTimeout(() => {
      triggerExit();
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: Animated.multiply(entranceAnim, exitOpacity),
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar style="dark" />

      {/* Tap anywhere to skip instantly */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.touchArea}
        onPress={triggerExit}
      >
        <Image
          source={require('../../assets/splash_intro.png')}
          style={styles.splashImage}
          resizeMode="contain"
          fadeDuration={0}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashImage: {
    width: width * 0.9,
    height: height * 0.85,
  },
});
