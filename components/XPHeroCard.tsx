import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface XPHeroCardProps {
  currentXP: number;
  yesterdayXP: number;
}

export default function XPHeroCard({ currentXP, yesterdayXP }: XPHeroCardProps) {
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fillAnimation, {
      toValue: Math.min(currentXP / 1000, 1),
      duration: 1500,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentXP, fillAnimation, pulseAnimation]);

  const fillWidth = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const difference = currentXP - yesterdayXP;
  const isAhead = difference > 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnimation }] }]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.labelContainer}>
            <Zap size={16} color={Colors.white} fill={Colors.white} />
            <Text style={styles.label}>Life Experience Gained Today</Text>
          </View>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpValue}>{currentXP.toLocaleString()}</Text>
          <Text style={styles.xpUnit}>XP</Text>
        </View>

        <View style={styles.comparisonContainer}>
          <TrendingUp size={14} color={Colors.white} />
          <Text style={styles.comparisonText}>
            {isAhead ? `+${difference} ahead of` : `${Math.abs(difference)} behind`} yesterday&apos;s {yesterdayXP} XP
          </Text>
        </View>

        <View style={styles.batteryContainer}>
          <View style={styles.batteryOuter}>
            <Animated.View style={[styles.batteryFill, { width: fillWidth }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.batteryGradient}
              />
            </Animated.View>
            <View style={styles.batteryBubbles}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={[styles.bubble, { left: `${15 + i * 18}%` }]} />
              ))}
            </View>
          </View>
          <View style={styles.batteryTip} />
        </View>

        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: 24,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  xpValue: {
    fontSize: 64,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: -2,
  },
  xpUnit: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  comparisonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500' as const,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  batteryOuter: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  batteryGradient: {
    flex: 1,
  },
  batteryBubbles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: '35%',
  },
  batteryTip: {
    width: 8,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginLeft: 4,
  },
  decorCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -20,
    right: 60,
  },
});
