import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface TimeRingWidgetProps {
  focusPercent: number;
  joyPercent: number;
  restPercent: number;
  hoursLeft: number;
}

export default function TimeRingWidget({
  focusPercent,
  joyPercent,
  restPercent,
  hoursLeft,
}: TimeRingWidgetProps) {
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const focusLength = (focusPercent / 100) * circumference;
  const joyLength = (joyPercent / 100) * circumference;
  const restLength = (restPercent / 100) * circumference;

  const focusOffset = 0;
  const joyOffset = focusLength;
  const restOffset = focusLength + joyLength;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Clock size={18} color={Colors.secondary} />
          <Text style={styles.title}>Time Distribution</Text>
        </View>
        <Text style={styles.subtitle}>24-hour view</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.gray}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.grayDark}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${restLength} ${circumference - restLength}`}
                strokeDashoffset={-restOffset}
                strokeLinecap="round"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.primary}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${joyLength} ${circumference - joyLength}`}
                strokeDashoffset={-joyOffset}
                strokeLinecap="round"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={Colors.secondary}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${focusLength} ${circumference - focusLength}`}
                strokeDashoffset={-focusOffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.centerText}>
            <Text style={styles.hoursValue}>{hoursLeft}h</Text>
            <Text style={styles.hoursLabel}>Left</Text>
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>Deep Focus</Text>
              <Text style={styles.legendValue}>{focusPercent}%</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>Joy & Action</Text>
              <Text style={styles.legendValue}>{joyPercent}%</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.grayDark }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>Rest</Text>
              <Text style={styles.legendValue}>{restPercent}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  hoursLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -2,
  },
  legend: {
    flex: 1,
    marginLeft: 24,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
