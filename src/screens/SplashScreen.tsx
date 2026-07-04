/**
 * Splash Screen
 * 
 * Initial loading screen displayed while app initializes
 * and checks authentication state
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, SPACING, TYPOGRAPHY, TIME_INTERVALS } from '../constants';

type SplashScreenProps = NativeStackScreenProps<any, 'Splash'>;

/**
 * Splash Screen Component
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // Simulate app initialization
    const timeout = setTimeout(() => {
      // This will be handled by navigation based on authentication state
      // from the auth context in the root navigator
    }, TIME_INTERVALS.SPLASH_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo/App Title */}
      <View style={styles.content}>
        <Text style={styles.appTitle}>MySociety</Text>
        <Text style={styles.appSubtitle}>Community Management</Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.PRIMARY}
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    ...TYPOGRAPHY.TITLE_LARGE,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
  },
  appSubtitle: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_SECONDARY,
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: height * 0.2,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  footer: {
    paddingBottom: SPACING.XL,
  },
  versionText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_DISABLED,
  },
});
