import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Coffee,
  Brain,
  Heart,
  Sun,
  BookOpen,
  Dumbbell,
  Music,
  Star,
  Check,
  Target,
  Leaf,
  Palette,
  Code,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useMoments } from '@/contexts/MomentsContext';
import type { Moment } from '@/mocks/moments';
import { categoryDefaultDurations } from '@/mocks/moments';

const categories = [
  { id: 'health', label: 'Vitality', color: Colors.vitality, icon: Dumbbell },
  { id: 'focus', label: 'Wisdom', color: Colors.wisdom, icon: Brain },
  { id: 'connection', label: 'Connection', color: Colors.connection, icon: Heart },
  { id: 'creative', label: 'Creation', color: Colors.creation, icon: Palette },
  { id: 'discipline', label: 'Grit', color: Colors.grit, icon: Target },
  { id: 'rest', label: 'Serenity', color: Colors.serenity, icon: Leaf },
];

const iconOptions = [
  { id: 'coffee', icon: Coffee, label: 'Coffee' },
  { id: 'brain', icon: Brain, label: 'Focus' },
  { id: 'heart', icon: Heart, label: 'Love' },
  { id: 'sun', icon: Sun, label: 'Joy' },
  { id: 'book', icon: BookOpen, label: 'Reading' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Exercise' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'star', icon: Star, label: 'Special' },
  { id: 'code', icon: Code, label: 'Coding' },
  { id: 'palette', icon: Palette, label: 'Art' },
  { id: 'target', icon: Target, label: 'Goal' },
  { id: 'leaf', icon: Leaf, label: 'Nature' },
];

const xpOptions = [15, 25, 50, 75, 100, 150];

const durationOptions = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hrs' },
  { value: 120, label: '2 hrs' },
];

export default function AddMomentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Moment['category']>('health');
  const [selectedIcon, setSelectedIcon] = useState<Moment['icon']>('coffee');
  const [selectedXP, setSelectedXP] = useState(25);
  const [selectedDuration, setSelectedDuration] = useState<number>(
    categoryDefaultDurations['health']
  );
  
  const { addMoment } = useMoments();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addMoment({
      title: title.trim(),
      icon: selectedIcon,
      xp: selectedXP,
      category: selectedCategory,
      duration: selectedDuration,
    });
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleCategorySelect = (categoryId: Moment['category']) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedCategory(categoryId);
    setSelectedDuration(categoryDefaultDurations[categoryId]);
  };

  const handleIconSelect = (iconId: Moment['icon']) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedIcon(iconId);
  };

  const handleXPSelect = (xp: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedXP(xp);
  };

  const handleDurationSelect = (duration: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedDuration(duration);
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Capture Moment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>What happened?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Had a meaningful conversation..."
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategorySelect(category.id as Moment['category'])}
                  style={[
                    styles.categoryItem,
                    isSelected && { borderColor: category.color, borderWidth: 2 },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}15` },
                    ]}
                  >
                    <IconComponent size={20} color={category.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: category.color, fontWeight: '600' as const },
                    ]}
                  >
                    {category.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: category.color }]}>
                      <Check size={12} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {iconOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedIcon === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleIconSelect(option.id as Moment['icon'])}
                  style={[
                    styles.iconItem,
                    isSelected && {
                      backgroundColor: `${selectedCategoryData?.color}15`,
                      borderColor: selectedCategoryData?.color,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <IconComponent
                    size={24}
                    color={isSelected ? selectedCategoryData?.color : Colors.textSecondary}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationGrid}>
            {durationOptions.map((option) => {
              const isSelected = selectedDuration === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleDurationSelect(option.value)}
                  style={[
                    styles.durationItem,
                    isSelected && {
                      backgroundColor: selectedCategoryData?.color,
                      borderColor: selectedCategoryData?.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.durationValue,
                      isSelected && { color: Colors.white },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>XP Value</Text>
          <View style={styles.xpGrid}>
            {xpOptions.map((xp) => {
              const isSelected = selectedXP === xp;
              return (
                <Pressable
                  key={xp}
                  onPress={() => handleXPSelect(xp)}
                  style={[
                    styles.xpItem,
                    isSelected && {
                      backgroundColor: Colors.success,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.xpValue,
                      isSelected && { color: Colors.white },
                    ]}
                  >
                    +{xp}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleSave} disabled={!title.trim()}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={
                title.trim()
                  ? [Colors.secondary, '#8B7CF7']
                  : [Colors.gray, Colors.grayDark]
              }
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                Add Moment (+{selectedXP} XP)
              </Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '31%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  xpItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  xpValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
