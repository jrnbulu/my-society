/**
 * Settings Screen
 * 
 * Application settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

type SettingsScreenProps = NativeStackScreenProps<any, 'Settings'>;

/**
 * Settings Screen Component
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Notifications Section */}
      <SettingSection title="Notifications">
        <SettingRow
          label="Enable Notifications"
          description="Receive push notifications"
          value={notifications}
          onToggle={setNotifications}
        />
        <SettingRow
          label="Community Updates"
          description="Announcements and news"
          value={true}
          onToggle={() => {}}
        />
        <SettingRow
          label="Event Reminders"
          description="Get notified about upcoming events"
          value={true}
          onToggle={() => {}}
        />
      </SettingSection>

      {/* Privacy & Security Section */}
      <SettingSection title="Privacy & Security">
        <SettingRow
          label="Location Access"
          description="Allow access to your location"
          value={locationAccess}
          onToggle={setLocationAccess}
        />
        <SettingRow
          label="Data Privacy"
          description="Manage your data preferences"
          value={true}
          onToggle={() => {}}
        />
      </SettingSection>

      {/* Appearance Section */}
      <SettingSection title="Appearance">
        <SettingRow
          label="Dark Mode"
          description="Use dark theme"
          value={darkMode}
          onToggle={setDarkMode}
        />
      </SettingSection>

      {/* About Section */}
      <SettingSection title="About">
        <View style={styles.aboutContainer}>
          <InfoText label="App Version" value="1.0.0" />
          <InfoText label="Build Number" value="001" />
          <Button
            title="Privacy Policy"
            variant="outline"
            size="md"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content here')}
            style={{ marginTop: SPACING.MD }}
          />
          <Button
            title="Terms & Conditions"
            variant="outline"
            size="md"
            onPress={() => Alert.alert('Terms', 'Terms & conditions content here')}
            style={{ marginTop: SPACING.MD }}
          />
        </View>
      </SettingSection>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          variant="danger"
          size="lg"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

/**
 * Setting Section Component
 */
const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

/**
 * Setting Row Component
 */
const SettingRow: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}> = ({ label, description, value, onToggle }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingContent}>
      <Text style={styles.settingLabel}>{label}</Text>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{
        false: COLORS.BORDER,
        true: COLORS.PRIMARY,
      }}
      thumbColor={COLORS.WHITE}
    />
  </View>
);

/**
 * Info Text Component
 */
const InfoText: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_LIGHTER,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.TITLE_MEDIUM,
    color: COLORS.WHITE,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    marginVertical: SPACING.MD,
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...TYPOGRAPHY.LABEL_LARGE,
    color: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.MD,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  settingDescription: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  aboutContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    gap: SPACING.MD,
  },
  infoRow: {
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  infoLabel: {
    ...TYPOGRAPHY.LABEL_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  infoValue: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    marginTop: SPACING.XS,
  },
  logoutContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XXL,
  },
});
