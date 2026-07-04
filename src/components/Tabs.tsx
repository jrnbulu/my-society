/**
 * Tab Component
 * 
 * Tab navigation with swipeable content and smooth transitions
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants';

const { width } = Dimensions.get('window');

export interface TabItem {
  id: string | number;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string | number;
  onTabChange?: (tabId: string | number) => void;
  variant?: 'line' | 'solid' | 'outline';
  style?: ViewStyle;
  tabLabelStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

/**
 * Tabs Component with Swipeable Content
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'line',
  style,
  tabLabelStyle,
  containerStyle,
}) => {
  const defaultTabId = defaultTab ?? tabs[0]?.id;
  const [activeTab, setActiveTab] = useState<string | number>(defaultTabId);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tabId: string | number, index: number) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);

    // Scroll content to the selected tab
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex < tabs.length) {
      setActiveTab(tabs[newIndex].id);
      onTabChange?.(tabs[newIndex].id);
    }
  };

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const indicatorPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width / tabs.length) * activeIndex],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Tab Headers */}
      <View style={[styles.tabHeader, containerStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={tabs.length > 3}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                {
                  flex: tabs.length <= 3 ? 1 : undefined,
                  minWidth: tabs.length <= 3 ? width / tabs.length : 'auto',
                },
              ]}
              onPress={() => handleTabPress(tab.id, index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  tabLabelStyle,
                  {
                    color:
                      activeTab === tab.id
                        ? COLORS.PRIMARY
                        : COLORS.TEXT_SECONDARY,
                    fontWeight: activeTab === tab.id ? '600' : '400',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Indicator */}
      {variant === 'line' && (
        <View style={styles.indicatorContainer}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: width / tabs.length,
              },
            ]}
          />
        </View>
      )}

      {/* Tab Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {tabs.map((tab) => (
          <View
            key={tab.id}
            style={[styles.tabContent, { width }]}
          >
            {tab.content}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tabButton: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: COLORS.TEXT_SECONDARY,
  },
  indicatorContainer: {
    height: 3,
    backgroundColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  indicator: {
    height: 3,
    backgroundColor: COLORS.PRIMARY,
  },
  tabContent: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
});
