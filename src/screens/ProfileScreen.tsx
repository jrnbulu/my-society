/**
 * Profile Screen
 * 
 * User profile information and editing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, TextInputField } from '../components';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

type ProfileScreenProps = NativeStackScreenProps<any, 'Profile'>;

/**
 * Profile Screen Component
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
  });

  /**
   * Handle save profile
   */
  const handleSaveProfile = async () => {
    if (!user || !formData.name.trim()) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      });
      await refreshUserProfile();
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {!isEditing ? (
          <View style={styles.infoContainer}>
            <InfoRow label="Name" value={userProfile?.name || 'N/A'} />
            <InfoRow label="Email" value={userProfile?.email || 'N/A'} />
            <InfoRow
              label="Phone"
              value={userProfile?.phoneNumber || 'N/A'}
            />
            <InfoRow label="Role" value={userProfile?.role?.toUpperCase() || 'N/A'} />
            <InfoRow
              label="Society ID"
              value={userProfile?.societyId || 'N/A'}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <TextInputField
              label="Full Name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              editable={!isLoading}
            />

            <TextInputField
              label="Email Address"
              value={formData.email}
              editable={false}
              keyboardType="email-address"
            />

            <TextInputField
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, phoneNumber: text })
              }
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        )}
      </View>

      {/* Edit/Save Buttons */}
      <View style={styles.buttonContainer}>
        {!isEditing ? (
          <Button
            title="Edit Profile"
            onPress={() => setIsEditing(true)}
            size="lg"
          />
        ) : (
          <>
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  name: userProfile?.name || '',
                  email: userProfile?.email || '',
                  phoneNumber: userProfile?.phoneNumber || '',
                });
              }}
              disabled={isLoading}
              style={{ marginTop: SPACING.MD }}
            />
          </>
        )}
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <InfoRow
          label="Account Created"
          value={userProfile?.createdAt
            ? new Date(userProfile.createdAt.toDate?.() || userProfile.createdAt).toLocaleDateString()
            : 'N/A'}
        />
        <InfoRow
          label="Last Updated"
          value={userProfile?.updatedAt
            ? new Date(userProfile.updatedAt.toDate?.() || userProfile.updatedAt).toLocaleDateString()
            : 'N/A'}
        />
        <InfoRow label="Status" value={userProfile?.isActive ? 'Active' : 'Inactive'} />
      </View>
    </ScrollView>
  );
};

/**
 * Info Row Component
 */
const InfoRow: React.FC<{ label: string; value: string }> = ({
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
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  infoContainer: {
    gap: SPACING.MD,
  },
  infoRow: {
    marginBottom: SPACING.MD,
  },
  infoLabel: {
    ...TYPOGRAPHY.LABEL_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  infoValue: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  formContainer: {
    gap: SPACING.LG,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
});
