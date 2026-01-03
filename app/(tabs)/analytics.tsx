import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Zap, Trophy, Calendar, Flame, TrendingUp, Target } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useMoments } from '@/contexts/MomentsContext';
import {
  calculateAttributes,
  calculateEfficiency,
  generateLast30Days,
  calculateLifetimeStats,
  getHeatmapColor,
  AttributeData,
} from '@/utils/attributes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = SCREEN_WIDTH - 80;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = CHART_SIZE / 2 - 40;

function getHexagonPoint(index: number, radius: number, centerX: number, centerY: number) {
  const angle = (Math.PI / 3) * index - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function RadarChart({ attributes }: { attributes: AttributeData[] }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const webLevels = [0.25, 0.5, 0.75, 1];

  const getDataPoints = () => {
    return attributes.map((attr, i) => {
      const normalizedValue = Math.max(0.1, attr.normalized / 100);
      return getHexagonPoint(i, CHART_RADIUS * normalizedValue, CHART_CENTER, CHART_CENTER);
    });
  };

  const dataPoints = getDataPoints();
  const dataPolygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.radarContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          {webLevels.map((level, levelIdx) => {
            const points = Array.from({ length: 6 }, (_, i) =>
              getHexagonPoint(i, CHART_RADIUS * level, CHART_CENTER, CHART_CENTER)
            );
            const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <Polygon
                key={`web-${levelIdx}`}
                points={polygonPoints}
                fill="none"
                stroke={Colors.gray}
                strokeWidth={1}
                opacity={0.5}
              />
            );
          })}

          {Array.from({ length: 6 }, (_, i) => {
            const point = getHexagonPoint(i, CHART_RADIUS, CHART_CENTER, CHART_CENTER);
            return (
              <Line
                key={`axis-${i}`}
                x1={CHART_CENTER}
                y1={CHART_CENTER}
                x2={point.x}
                y2={point.y}
                stroke={Colors.gray}
                strokeWidth={1}
                opacity={0.3}
              />
            );
          })}

          <Polygon
            points={dataPolygonPoints}
            fill={Colors.secondary}
            fillOpacity={0.25}
            stroke={Colors.secondary}
            strokeWidth={2}
          />

          {dataPoints.map((point, i) => (
            <Circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r={5}
              fill={attributes[i].color}
              stroke={Colors.white}
              strokeWidth={2}
            />
          ))}

          {attributes.map((attr, i) => {
            const labelPoint = getHexagonPoint(i, CHART_RADIUS + 25, CHART_CENTER, CHART_CENTER);
            return (
              <SvgText
                key={`label-${i}`}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize={11}
                fontWeight="600"
                fill={attr.color}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {attr.label}
              </SvgText>
            );
          })}
        </Svg>
      </Animated.View>

      <View style={styles.attributeStats}>
        {attributes.map((attr) => (
          <View key={attr.attribute} style={styles.attributeStat}>
            <View style={[styles.attributeDot, { backgroundColor: attr.color }]} />
            <Text style={styles.attributeStatLabel}>{attr.label}</Text>
            <Text style={[styles.attributeStatValue, { color: attr.color }]}>{attr.xp}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EfficiencyGauge({ efficiency, todayXP }: { efficiency: number; todayXP: number }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: efficiency,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [efficiency, animValue]);

  const progressWidth = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Target size={20} color={Colors.secondary} />
          <Text style={styles.cardTitle}>Time Alchemy Rate</Text>
        </View>
        <Text style={styles.efficiencyPercent}>{efficiency}%</Text>
      </View>

      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeTrack}>
          <Animated.View style={[styles.gaugeFill, { width: progressWidth }]} />
        </View>
      </View>

      <Text style={styles.gaugeSubtext}>
        You harvested <Text style={styles.highlight}>{todayXP} XP</Text> today
      </Text>
    </View>
  );
}

function LifeDensityHeatmap({ moments }: { moments: ReturnType<typeof useMoments>['moments'] }) {
  const days = useMemo(() => generateLast30Days(moments), [moments]);

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Calendar size={20} color={Colors.primary} />
        <Text style={styles.cardTitle}>Life Density</Text>
      </View>
      <Text style={styles.cardSubtitle}>Last 30 days activity</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heatmapContainer}
      >
        {days.map((day, index) => (
          <View key={index} style={styles.heatmapDay}>
            <View
              style={[
                styles.heatmapSquare,
                { backgroundColor: getHeatmapColor(day.xp) },
              ]}
            />
            {index % 5 === 0 && (
              <Text style={styles.heatmapLabel}>{day.displayDate}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.heatmapLegend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={[styles.legendSquare, { backgroundColor: Colors.heatmapNone }]} />
        <View style={[styles.legendSquare, { backgroundColor: Colors.heatmapLow }]} />
        <View style={[styles.legendSquare, { backgroundColor: Colors.heatmapHigh }]} />
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

function VaultStats({ moments }: { moments: ReturnType<typeof useMoments>['moments'] }) {
  const stats = useMemo(() => calculateLifetimeStats(moments), [moments]);

  const statItems = [
    {
      icon: Zap,
      label: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      color: Colors.primary,
    },
    {
      icon: TrendingUp,
      label: 'Level',
      value: stats.level.toString(),
      color: Colors.secondary,
    },
    {
      icon: Trophy,
      label: 'Moments',
      value: stats.totalMoments.toString(),
      color: Colors.creation,
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${stats.streakDays}d`,
      color: Colors.grit,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Trophy size={20} color={Colors.primary} />
        <Text style={styles.cardTitle}>The Vault</Text>
      </View>
      <Text style={styles.cardSubtitle}>Lifetime achievements</Text>

      <View style={styles.vaultGrid}>
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <View key={index} style={styles.vaultItem}>
              <View style={[styles.vaultIconBg, { backgroundColor: `${item.color}15` }]}>
                <IconComponent size={22} color={item.color} />
              </View>
              <Text style={styles.vaultValue}>{item.value}</Text>
              <Text style={styles.vaultLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { moments, currentXP } = useMoments();

  const attributes = useMemo(() => calculateAttributes(moments), [moments]);
  const efficiency = useMemo(() => calculateEfficiency(currentXP), [currentXP]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Character Stats</Text>
          <Text style={styles.subtitle}>Your RPG soul profile</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Zap size={20} color={Colors.secondary} />
            <Text style={styles.cardTitle}>The Soul</Text>
          </View>
          <RadarChart attributes={attributes} />
        </View>

        <EfficiencyGauge efficiency={efficiency} todayXP={currentXP} />

        <LifeDensityHeatmap moments={moments} />

        <VaultStats moments={moments} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  radarContainer: {
    alignItems: 'center',
  },
  attributeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  attributeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  attributeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  attributeStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  attributeStatValue: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  efficiencyPercent: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.secondary,
  },
  gaugeContainer: {
    marginBottom: 12,
  },
  gaugeTrack: {
    height: 12,
    backgroundColor: Colors.gray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 6,
  },
  gaugeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  highlight: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  heatmapContainer: {
    paddingVertical: 8,
    gap: 6,
  },
  heatmapDay: {
    alignItems: 'center',
    marginRight: 6,
  },
  heatmapSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  heatmapLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  legendSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  vaultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vaultItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  vaultIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  vaultValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  vaultLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
});
