/**
 * Button Component
 * 
 * Reusable button component with multiple variants and states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.PRIMARY : COLORS.WHITE}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`buttonText_${variant}`],
            styles[`buttonText_${size}`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.MD,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button_primary: {
    backgroundColor: COLORS.PRIMARY,
  },
  button_secondary: {
    backgroundColor: COLORS.SECONDARY,
  },
  button_outline: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  button_danger: {
    backgroundColor: COLORS.DANGER,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  button_sm: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    minHeight: 32,
  },
  button_md: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    minHeight: 44,
  },
  button_lg: {
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XL,
    minHeight: 56,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonText_primary: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_LARGE,
  },
  buttonText_secondary: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_LARGE,
  },
  buttonText_outline: {
    color: COLORS.PRIMARY,
    ...TYPOGRAPHY.BODY_LARGE,
  },
  buttonText_danger: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BODY_LARGE,
  },
  buttonText_sm: {
    fontSize: 12,
  },
  buttonText_md: {
    fontSize: 14,
  },
  buttonText_lg: {
    fontSize: 16,
  },
});
