/**
 * Carousel Component
 * 
 * Scrollable carousel for displaying multiple items horizontally
 * with auto-scroll and manual navigation
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

const { width } = Dimensions.get('window');

export interface CarouselItem {
  id: string | number;
  image?: string;
  title: string;
  description?: string;
  color?: string;
}

export interface CarouselProps {
  items: CarouselItem[];
  autoScroll?: boolean;
  autoScrollInterval?: number;
  onItemPress?: (item: CarouselItem, index: number) => void;
  height?: number;
  style?: ViewStyle;
}

/**
 * Carousel Component
 */
export const Carousel: React.FC<CarouselProps> = ({
  items,
  autoScroll = true,
  autoScrollInterval = 5000,
  onItemPress,
  height = 180,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || items.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (width - 40),
        animated: true,
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoScroll, autoScrollInterval, items.length]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (width - 40));
    setCurrentIndex(newIndex);
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        snapToInterval={width - 40}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { height }]}
            activeOpacity={0.8}
            onPress={() => onItemPress?.(item, index)}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  { backgroundColor: item.color || COLORS.PRIMARY },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      {items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? COLORS.PRIMARY
                      : COLORS.GRAY_LIGHT,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.LG,
  },
  scrollContent: {
    paddingHorizontal: SPACING.LG,
    gap: SPACING.MD,
  },
  card: {
    width: width - 40,
    borderRadius: BORDER_RADIUS.LG,
    overflow: 'hidden',
    backgroundColor: COLORS.GRAY_LIGHTER,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
