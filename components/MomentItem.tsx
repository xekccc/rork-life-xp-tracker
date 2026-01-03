import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform, PanResponder } from 'react-native';
import { Coffee, Brain, Heart, Sun, BookOpen, Dumbbell, Music, Star, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Moment } from '@/mocks/moments';

interface MomentItemProps {
  moment: Moment;
  index: number;
  onDelete: (momentId: string) => void;
}

const iconMap = {
  coffee: Coffee,
  brain: Brain,
  heart: Heart,
  sun: Sun,
  book: BookOpen,
  dumbbell: Dumbbell,
  music: Music,
  star: Star,
};

const categoryColors = {
  joy: Colors.primary,
  focus: Colors.secondary,
  connection: '#E91E63',
  health: Colors.success,
};

const SWIPE_THRESHOLD = 80;
const DELETE_BUTTON_WIDTH = 70;

export default function MomentItem({ moment, index, onDelete }: MomentItemProps) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const deleteSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteOpacityAnim = useRef(new Animated.Value(1)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          swipeAnim.setValue(Math.max(gestureState.dx, -DELETE_BUTTON_WIDTH - 20));
        } else if (isSwiped) {
          swipeAnim.setValue(Math.min(gestureState.dx - DELETE_BUTTON_WIDTH, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.spring(swipeAnim, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwiped(true);
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsSwiped(false);
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, slideAnim, opacityAnim]);

  const handlePress = () => {
    if (isSwiped) {
      Animated.spring(swipeAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
      setIsSwiped(false);
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.parallel([
      Animated.timing(deleteSlideAnim, {
        toValue: -400,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(deleteOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete(moment.id);
    });
  };

  const IconComponent = iconMap[moment.icon];
  const categoryColor = categoryColors[moment.category];

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          transform: [
            { translateX: Animated.add(slideAnim, deleteSlideAnim) },
            { scale: scaleAnim },
          ],
          opacity: Animated.multiply(opacityAnim, deleteOpacityAnim),
        },
      ]}
    >
      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <View style={styles.deleteButtonInner}>
          <Trash2 size={20} color="#FFFFFF" />
        </View>
      </Pressable>

      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: swipeAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={handlePress} style={styles.pressable}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <IconComponent size={22} color={categoryColor} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{moment.title}</Text>
            <Text style={styles.time}>{moment.time}</Text>
          </View>

          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{moment.xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    position: 'relative',
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  xpBadge: {
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.success,
    marginTop: -2,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 16,
  },
  deleteButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
