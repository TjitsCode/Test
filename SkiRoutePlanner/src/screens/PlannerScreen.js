import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../utils/colors';
import { planRoute, DURATION_RANGES } from '../utils/routePlanner';

function OptionButton({ label, description, selected, onPress, color }) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected && styles.optionButtonSelected,
        selected && color && { borderColor: color, backgroundColor: color + '12' },
      ]}
      onPress={onPress}
    >
      {color && (
        <View style={[styles.colorDot, { backgroundColor: color }]} />
      )}
      <View style={styles.optionContent}>
        <Text
          style={[
            styles.optionLabel,
            selected && { color: color || COLORS.primary },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={styles.optionDesc}>{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function PlannerScreen({ navigation }) {
  const [difficulty, setDifficulty] = useState(null);
  const [duration, setDuration] = useState(null);
  const [stops, setStops] = useState(null);
  const [error, setError] = useState(null);

  const canGenerate = difficulty && duration && stops;

  function handleGenerate() {
    setError(null);

    const result = planRoute({
      difficulty,
      duration,
      stops,
    });

    if (result.success) {
      navigation.navigate('RouteResult', { routeData: result });
    } else {
      setError(result.message);
    }
  }

  function handleReset() {
    setDifficulty(null);
    setDuration(null);
    setStops(null);
    setError(null);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan Your Ski Route</Text>
        <Text style={styles.subtitle}>
          Choose your preferences and we'll create the perfect route for you.
        </Text>
      </View>

      {/* Step 1: Difficulty */}
      <View style={styles.section}>
        <Text style={styles.stepLabel}>Step 1</Text>
        <Text style={styles.sectionTitle}>Difficulty Level</Text>
        <Text style={styles.sectionDesc}>
          What's your skiing level?
        </Text>

        <View style={styles.options}>
          <OptionButton
            label="Blue - Easy"
            description="Wide, gentle slopes. Perfect for beginners and relaxed skiing."
            selected={difficulty === 'blue'}
            onPress={() => setDifficulty('blue')}
            color={DIFFICULTY_COLORS.blue}
          />
          <OptionButton
            label="Red - Intermediate"
            description="Steeper slopes with more variety. For confident skiers."
            selected={difficulty === 'red'}
            onPress={() => setDifficulty('red')}
            color={DIFFICULTY_COLORS.red}
          />
          <OptionButton
            label="Black - Expert"
            description="Steep and challenging runs. For experienced skiers only."
            selected={difficulty === 'black'}
            onPress={() => setDifficulty('black')}
            color={DIFFICULTY_COLORS.black}
          />
        </View>
      </View>

      {/* Step 2: Duration */}
      <View style={styles.section}>
        <Text style={styles.stepLabel}>Step 2</Text>
        <Text style={styles.sectionTitle}>Duration</Text>
        <Text style={styles.sectionDesc}>
          How long do you want to ski? (excluding lift and stop times)
        </Text>

        <View style={styles.options}>
          <OptionButton
            label="Short - 30-60 min"
            description="A quick session. 2-3 runs."
            selected={duration === 'short'}
            onPress={() => setDuration('short')}
          />
          <OptionButton
            label="Medium - 1-2 hours"
            description="A solid half-day of skiing. 4-6 runs."
            selected={duration === 'medium'}
            onPress={() => setDuration('medium')}
          />
          <OptionButton
            label="Long - 2-4 hours"
            description="An extended ski day. 7+ runs across the resort."
            selected={duration === 'long'}
            onPress={() => setDuration('long')}
          />
        </View>
      </View>

      {/* Step 3: Stops */}
      <View style={styles.section}>
        <Text style={styles.stepLabel}>Step 3</Text>
        <Text style={styles.sectionTitle}>Coffee & Lunch Stops</Text>
        <Text style={styles.sectionDesc}>
          Want to include any breaks along the way?
        </Text>

        <View style={styles.options}>
          <OptionButton
            label="No stops"
            description="Non-stop skiing, no breaks planned."
            selected={stops === 'none'}
            onPress={() => setStops('none')}
          />
          <OptionButton
            label="Coffee break"
            description="A quick ~15 min coffee or drink stop."
            selected={stops === 'coffee'}
            onPress={() => setStops('coffee')}
          />
          <OptionButton
            label="Lunch stop"
            description="A ~45 min lunch at a mountain restaurant."
            selected={stops === 'lunch'}
            onPress={() => setStops('lunch')}
          />
          <OptionButton
            label="Coffee + Lunch"
            description="Both a coffee break and a lunch stop."
            selected={stops === 'both'}
            onPress={() => setStops('both')}
          />
        </View>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          <Text style={styles.generateButtonText}>
            Generate Route
          </Text>
        </TouchableOpacity>

        {(difficulty || duration || stops) && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Preview */}
      {canGenerate && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Your Preferences</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Difficulty:</Text>
            <Text style={[styles.previewValue, { color: DIFFICULTY_COLORS[difficulty] }]}>
              {DIFFICULTY_LABELS[difficulty]}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Duration:</Text>
            <Text style={styles.previewValue}>
              {DURATION_RANGES[duration].label}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Stops:</Text>
            <Text style={styles.previewValue}>
              {stops === 'none'
                ? 'No stops'
                : stops === 'coffee'
                  ? 'Coffee break'
                  : stops === 'lunch'
                    ? 'Lunch stop'
                    : 'Coffee + Lunch'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  options: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  generateButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: COLORS.textLight,
    fontSize: 17,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  spacer: {
    height: 40,
  },
});
