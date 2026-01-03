import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import XPHeroCard from '@/components/XPHeroCard';
import TimeRingWidget from '@/components/TimeRingWidget';
import MomentItem from '@/components/MomentItem';
import { userData as initialUserData } from '@/mocks/moments';
import { useMoments } from '@/contexts/MomentsContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showConfetti] = useState(false);
  const { moments, currentXP, deleteMoment, timeBreakdown, hoursLeft } = useMoments();
  
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: initialUserData.dayProgress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [fabGlow, progressAnim]);

  const handleFABPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/add-moment');
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleDeleteMoment = (momentId: string) => {
    const momentToDelete = moments.find(m => m.id === momentId);
    if (!momentToDelete) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Delete "${momentToDelete.title}"?`);
      if (confirmed) {
        deleteMoment(momentId);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } else {
      Alert.alert(
        'Delete Moment',
        `Remove "${momentToDelete.title}" from your loot?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteMoment(momentId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {initialUserData.name}</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Day Progress: {initialUserData.dayProgress}%</Text>
              <View style={styles.progressBarOuter}>
                <Animated.View style={[styles.progressBarInner, { width: progressWidth }]} />
              </View>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.secondary, Colors.secondaryLight]}
              style={styles.avatar}
            >
              <Sparkles size={18} color={Colors.white} />
            </LinearGradient>
          </View>
        </View>

        <XPHeroCard currentXP={currentXP} yesterdayXP={initialUserData.yesterdayXP} />

        <TimeRingWidget
          focusPercent={timeBreakdown.focus}
          joyPercent={timeBreakdown.joy}
          restPercent={timeBreakdown.rest}
          hoursLeft={hoursLeft}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Loot</Text>
          <Text style={styles.sectionSubtitle}>{moments.length} moments captured</Text>
        </View>

        {moments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No moments captured yet</Text>
            <Text style={styles.emptyStateSubtext}>Start looting your day!</Text>
          </View>
        ) : (
          moments.map((moment, index) => (
            <MomentItem
              key={moment.id}
              moment={moment}
              index={index}
              onDelete={handleDeleteMoment}
            />
          ))
        )}
      </ScrollView>

      <Animated.View
        style={[
          styles.fabContainer,
          { bottom: insets.bottom + 24 },
        ]}
      >
        <Animated.View
          style={[
            styles.fabGlow,
            { opacity: fabGlow },
          ]}
        />
        <Pressable onPress={handleFABPress}>
          <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
            <LinearGradient
              colors={[Colors.secondary, '#8B7CF7']}
              style={styles.fabGradient}
            >
              <Plus size={28} color={Colors.white} strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <Text style={styles.fabLabel}>Capture Moment</Text>
      </Animated.View>

      {showConfetti && (
        <View style={styles.confettiContainer}>
          {[...Array(20)].map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 400,
        duration: 2000,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: randomX,
        duration: 2000,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 360,
        duration: 2000,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, translateX, opacity, rotate]);

  const colors = [Colors.primary, Colors.secondary, Colors.success, '#FFD700'];
  const color = colors[index % colors.length];

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          left: `${20 + (index % 5) * 15}%`,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotate.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            })},
          ],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  progressContainer: {
    gap: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  progressBarOuter: {
    width: 180,
    height: 6,
    backgroundColor: Colors.gray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  avatarContainer: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    top: -8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
