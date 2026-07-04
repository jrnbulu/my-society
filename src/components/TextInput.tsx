/**
 * Text Input Component
 * 
 * Reusable text input with validation, error states, and icons
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants';

export interface TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

/**
 * Text Input Component
 */
export const TextInputField: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  label,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color:
                error && error.length > 0
                  ? COLORS.DANGER
                  : COLORS.TEXT_PRIMARY,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor:
              error && error.length > 0
                ? COLORS.DANGER
                : isFocused
                  ? COLORS.PRIMARY
                  : COLORS.BORDER,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_DISABLED}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          editable={!disabled}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />

        {rightIcon || (secureTextEntry && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={
              onRightIconPress
                ? onRightIconPress
                : () => setIsSecure(!isSecure)
            }
          >
            {rightIcon}
          </TouchableOpacity>
        ))}
      </View>

      {error && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.LG,
  },
  label: {
    ...TYPOGRAPHY.LABEL_LARGE,
    marginBottom: SPACING.SM,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.MD,
    color: COLORS.TEXT_PRIMARY,
    ...TYPOGRAPHY.BODY_LARGE,
  },
  iconLeft: {
    marginRight: SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    marginLeft: SPACING.SM,
    padding: SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.DANGER,
    marginTop: SPACING.XS,
  },
});
