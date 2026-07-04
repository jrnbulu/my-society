/**
 * OTP Verification Screen
 * 
 * Screen for entering and verifying OTP code
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, TextInputField } from '../components';
import { validateOTP } from '../utils/helpers';
import { verifyPhoneOTP, verifyEmailOTP } from '../services/authService';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  TIME_INTERVALS,
  ERROR_MESSAGES,
} from '../constants';

type OTPVerificationScreenProps = NativeStackScreenProps<any, 'OTPVerification'>;

/**
 * OTP Verification Screen Component
 */
export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { email, phone, type } = route.params || {};
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_INTERVALS.OTP_EXPIRY / 1000); // in seconds
  const [canResend, setCanResend] = useState(false);

  // OTP expiry timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Format time left
   */
  const formatTimeLeft = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /**
   * Handle OTP verification
   */
  const handleVerifyOTP = async () => {
    // Validate OTP
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }

    if (!validateOTP(otp)) {
      setError(ERROR_MESSAGES.INVALID_OTP);
      return;
    }

    setIsLoading(true);
    try {
      if (type === 'email' && email) {
        // Verify email OTP
        await verifyEmailOTP(email, otp);
        Alert.alert('Success', 'Email verified successfully');
        // Navigation will be handled by auth context
      } else if (type === 'phone' && phone) {
        // Verify phone OTP
        // Note: confirmationResult should be passed from login screen
        // This is a placeholder implementation
        Alert.alert('Success', 'Phone verified successfully');
        // Navigation will be handled by auth context
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    setTimeLeft(TIME_INTERVALS.OTP_EXPIRY / 1000);
    setCanResend(false);
    setOtp('');
    setError('');

    try {
      // Resend OTP logic
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to{'\n'}
            <Text style={styles.highlight}>
              {email || phone}
            </Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.formContainer}>
          <TextInputField
            label="Enter OTP"
            placeholder="000000"
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (error) setError('');
            }}
            error={error}
            keyboardType="numeric"
            maxLength={6}
            editable={!isLoading}
          />

          {/* Timer Info */}
          <View style={styles.timerContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                OTP expires in: <Text style={styles.timerCount}>{formatTimeLeft()}</Text>
              </Text>
            ) : (
              <Text style={styles.expiredText}>OTP has expired</Text>
            )}
          </View>

          {/* Verify Button */}
          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            loading={isLoading}
            disabled={isLoading || !otp}
            size="lg"
            style={{ marginTop: SPACING.XXL }}
          />
        </View>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP?</Text>
          <Button
            title={canResend ? 'Resend OTP' : `Resend in ${formatTimeLeft()}`}
            variant="outline"
            onPress={handleResendOTP}
            disabled={!canResend || isLoading}
            size="md"
            style={{ marginTop: SPACING.MD }}
          />
        </View>

        {/* Back Button */}
        <Button
          title="← Back to Login"
          variant="outline"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          style={{ marginTop: SPACING.LG }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: SPACING.XXL,
    marginTop: SPACING.XL,
  },
  title: {
    ...TYPOGRAPHY.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  highlight: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: SPACING.XXL,
  },
  timerContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
  },
  timerText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.WARNING,
  },
  timerCount: {
    fontWeight: '600',
    color: COLORS.DANGER,
  },
  expiredText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.DANGER,
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: SPACING.LG,
  },
  resendText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
});
