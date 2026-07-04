/**
 * Login Screen
 * 
 * Firebase OTP authentication screen supporting Gmail and phone number
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, TextInputField } from '../components';
import {
  validateEmail,
  validatePhoneNumber,
  formatPhoneNumber,
} from '../utils/helpers';
import { sendEmailOTP, sendPhoneOTP } from '../services/authService';
import { COLORS, SPACING, TYPOGRAPHY, ERROR_MESSAGES } from '../constants';
import { useForm } from '../hooks/useFormHandling';

type LoginScreenProps = NativeStackScreenProps<any, 'Login'>;

interface LoginFormValues {
  email: string;
  phone: string;
  loginType: 'email' | 'phone';
}

/**
 * Login Screen Component
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    email: '',
    phone: '',
    loginType: 'email',
  });

  /**
   * Handle send OTP for email
   */
  const handleSendEmailOTP = async () => {
    // Validate email
    if (!form.values.email.trim()) {
      form.setFieldError('email', 'Email is required');
      return;
    }

    if (!validateEmail(form.values.email)) {
      form.setFieldError('email', ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailOTP(form.values.email);
      Alert.alert(
        'Success',
        'Verification link sent to your email. Check your inbox.'
      );
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        email: form.values.email,
        type: 'email',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle send OTP for phone
   */
  const handleSendPhoneOTP = async () => {
    // Validate phone
    if (!form.values.phone.trim()) {
      form.setFieldError('phone', 'Phone number is required');
      return;
    }

    if (!validatePhoneNumber(form.values.phone)) {
      form.setFieldError('phone', ERROR_MESSAGES.INVALID_PHONE);
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(form.values.phone);
      await sendPhoneOTP(formattedPhone);
      Alert.alert('Success', 'OTP sent to your phone');
      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phone: formattedPhone,
        type: 'phone',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to access your society management
          </Text>
        </View>

        {/* Login Type Selector */}
        <View style={styles.loginTypeSelector}>
          <Button
            title="Email Login"
            variant={loginType === 'email' ? 'primary' : 'outline'}
            size="md"
            onPress={() => setLoginType('email')}
            style={{ flex: 1 }}
          />
          <View style={{ width: SPACING.MD }} />
          <Button
            title="Phone Login"
            variant={loginType === 'phone' ? 'primary' : 'outline'}
            size="md"
            onPress={() => setLoginType('phone')}
            style={{ flex: 1 }}
          />
        </View>

        {/* Email Login Form */}
        {loginType === 'email' && (
          <View style={styles.formContainer}>
            <TextInputField
              label="Email Address"
              placeholder="Enter your Gmail address"
              value={form.values.email}
              onChangeText={(text) => form.handleChange('email', text)}
              onBlur={() => form.handleBlur('email')}
              error={form.errors.email}
              keyboardType="email-address"
              editable={!isLoading}
            />

            <Text style={styles.infoText}>
              ℹ️ We'll send a verification link to your Gmail inbox
            </Text>

            <Button
              title="Send Verification Link"
              onPress={handleSendEmailOTP}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              style={{ marginTop: SPACING.LG }}
            />
          </View>
        )}

        {/* Phone Login Form */}
        {loginType === 'phone' && (
          <View style={styles.formContainer}>
            <TextInputField
              label="Phone Number"
              placeholder="+91 XXXXX XXXXX"
              value={form.values.phone}
              onChangeText={(text) => form.handleChange('phone', text)}
              onBlur={() => form.handleBlur('phone')}
              error={form.errors.phone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />

            <Text style={styles.infoText}>
              ℹ️ We'll send a 6-digit OTP to your registered phone number
            </Text>

            <Button
              title="Send OTP"
              onPress={handleSendPhoneOTP}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              style={{ marginTop: SPACING.LG }}
            />
          </View>
        )}

        {/* Terms & Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
  },
  header: {
    marginBottom: SPACING.XXL,
    marginTop: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.TITLE_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  loginTypeSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.XXL,
  },
  formContainer: {
    marginBottom: SPACING.XXL,
  },
  infoText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.INFO,
    marginBottom: SPACING.LG,
    paddingHorizontal: SPACING.MD,
    backgroundColor: '#F0F8FF',
    paddingVertical: SPACING.MD,
    borderRadius: 8,
  },
  termsContainer: {
    marginTop: SPACING.XXL,
    paddingTop: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  termsText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
