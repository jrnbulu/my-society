/**
 * Dashboard Screen
 * 
 * Main screen after login with navigation drawer, carousel, and tabbed content
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Carousel, Tabs, NavigationDrawer } from '../components';
import { useAuth } from '../context/AuthContext';
import {
  getOwnersBySociety,
  getTenantsBySociety,
  getSocietyDetails,
  UserProfile,
  SocietyDetails,
} from '../services/userService';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  TAB_NAMES,
  USER_ROLES,
} from '../constants';

type DashboardScreenProps = {
  navigation: DrawerNavigationProp<any, 'Dashboard'>;
  route: RouteProp<any, 'Dashboard'>;
};

/**
 * Dashboard Screen Component
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const { user, userProfile, logout } = useAuth();
  const [owners, setOwners] = useState<UserProfile[]>([]);
  const [tenants, setTenants] = useState<UserProfile[]>([]);
  const [society, setSociety] = useState<SocietyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | number>(TAB_NAMES.OWNERS);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userProfile?.societyId) return;

        const [ownersData, tenantsData, societyData] = await Promise.all([
          getOwnersBySociety(userProfile.societyId),
          getTenantsBySociety(userProfile.societyId),
          getSocietyDetails(userProfile.societyId),
        ]);

        setOwners(ownersData);
        setTenants(tenantsData);
        setSociety(societyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        Alert.alert('Error', 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
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

  /**
   * Render owner/tenant list item
   */
  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardContent}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.phoneNumber && (
          <Text style={styles.userPhone}>{item.phoneNumber}</Text>
        )}
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{item.role.toUpperCase()}</Text>
      </View>
    </View>
  );

  /**
   * Render owners tab content
   */
  const renderOwnersTab = () => (
    <View>
      <Text style={styles.tabTitle}>Property Owners ({owners.length})</Text>
      <FlatList
        data={owners}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  /**
   * Render tenants tab content
   */
  const renderTenantsTab = () => (
    <View>
      <Text style={styles.tabTitle}>Tenants ({tenants.length})</Text>
      <FlatList
        data={tenants}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  /**
   * Render society details tab content
   */
  const renderSocietyTab = () => (
    <View>
      <Text style={styles.tabTitle}>Society Details</Text>
      {society && (
        <View style={styles.societyCard}>
          <DetailRow label="Society Name" value={society.name} />
          <DetailRow
            label="Address"
            value={`${society.address}, ${society.city}`}
          />
          <DetailRow label="State" value={society.state} />
          <DetailRow label="Pincode" value={society.pincode} />
          <DetailRow label="Total Units" value={society.totalUnits.toString()} />

          <View style={styles.divider} />

          <Text style={styles.officersTitle}>Office Bearers</Text>

          <DetailRow label="Secretary" value={society.secretary} />
          <DetailRow label="Secretary Phone" value={society.secretaryPhone} />
          <DetailRow label="Secretary Email" value={society.secretaryEmail} />

          <View style={styles.officerDivider} />

          <DetailRow label="President" value={society.president} />
          <DetailRow label="President Phone" value={society.presidentPhone} />
          <DetailRow label="President Email" value={society.presidentEmail} />

          {society.treasurer && (
            <>
              <View style={styles.officerDivider} />
              <DetailRow label="Treasurer" value={society.treasurer} />
            </>
          )}
        </View>
      )}
    </View>
  );

  /**
   * Carousel items
   */
  const carouselItems = [
    {
      id: 1,
      title: 'Welcome to MySociety',
      description: 'Community Management Platform',
      color: COLORS.PRIMARY,
    },
    {
      id: 2,
      title: 'Announcements',
      description: 'Stay updated with society news',
      color: COLORS.SECONDARY,
    },
    {
      id: 3,
      title: 'Events',
      description: 'Upcoming community events',
      color: COLORS.SUCCESS,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Left Drawer Navigation */}
      <NavigationDrawer
        userName={userProfile?.name || 'User'}
        userEmail={userProfile?.email}
        userRole={userProfile?.role}
        items={[
          {
            id: 'profile',
            label: 'Profile',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            id: 'settings',
            label: 'Settings',
            onPress: () => navigation.navigate('Settings'),
          },
          {
            id: 'logout',
            label: 'Logout',
            onPress: handleLogout,
          },
        ]}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {userProfile?.name?.split(' ')[0]}!
          </Text>
          <Text style={styles.role}>
            {userProfile?.role?.toUpperCase()} DASHBOARD
          </Text>
        </View>

        {/* Carousel Banner */}
        <Carousel
          items={carouselItems}
          height={160}
          autoScroll
          autoScrollInterval={5000}
        />

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <Tabs
            tabs={[
              {
                id: TAB_NAMES.OWNERS,
                label: 'Owners',
                content: renderOwnersTab(),
              },
              {
                id: TAB_NAMES.TENANTS,
                label: 'Tenants',
                content: renderTenantsTab(),
              },
              {
                id: TAB_NAMES.SOCIETY,
                label: 'Society',
                content: renderSocietyTab(),
              },
            ]}
            defaultTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Detail Row Component for Society Info
 */
const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.GRAY_LIGHTER,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  greeting: {
    ...TYPOGRAPHY.TITLE_MEDIUM,
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
  },
  role: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabsContainer: {
    flex: 1,
    marginBottom: SPACING.XXL,
  },
  tabTitle: {
    ...TYPOGRAPHY.TITLE_SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  listContainer: {
    gap: SPACING.MD,
  },
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardContent: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  userEmail: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  userPhone: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  roleBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.FULL,
  },
  roleBadgeText: {
    ...TYPOGRAPHY.LABEL_MEDIUM,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  societyCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    marginBottom: SPACING.MD,
  },
  detailLabel: {
    ...TYPOGRAPHY.LABEL_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  detailValue: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD,
  },
  officerDivider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SM,
  },
  officersTitle: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
});

// Add BORDER_RADIUS to imports
import { BORDER_RADIUS } from '../constants';
