/**
 * Navigation Drawer Component
 * 
 * Side menu for navigation with profile section and menu items
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants';
import { getInitials } from '../utils/helpers';

export interface DrawerItem {
  id: string | number;
  label: string;
  icon?: string; // Can be SF Symbol or Material Icon name
  onPress: () => void;
  badge?: number;
}

export interface DrawerProps {
  userName: string;
  userEmail?: string;
  userRole?: string;
  profileImage?: string;
  items: DrawerItem[];
  onProfilePress?: () => void;
  style?: ViewStyle;
}

/**
 * Navigation Drawer Component
 */
export const NavigationDrawer: React.FC<DrawerProps> = ({
  userName,
  userEmail,
  userRole,
  profileImage,
  items,
  onProfilePress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImage,
                  styles.profileImagePlaceholder,
                ]}
              >
                <Text style={styles.initialsText}>
                  {getInitials(userName)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            {userEmail && (
              <Text style={styles.profileEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            )}
            {userRole && (
              <Text style={styles.profileRole}>
                {userRole.toUpperCase()}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              {item.icon && (
                <Text style={styles.menuIcon}>{item.icon}</Text>
              )}
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  profileImageContainer: {
    marginRight: SPACING.LG,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  profileEmail: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  profileRole: {
    ...TYPOGRAPHY.LABEL_MEDIUM,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD,
  },
  menuSection: {
    paddingHorizontal: SPACING.SM,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.MD,
    color: COLORS.PRIMARY,
  },
  menuLabel: {
    flex: 1,
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
  },
  badge: {
    backgroundColor: COLORS.DANGER,
    borderRadius: BORDER_RADIUS.FULL,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XS,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});
