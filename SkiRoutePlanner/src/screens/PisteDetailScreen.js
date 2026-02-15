import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../utils/colors';
import { PISTES, LIFTS, POIS } from '../data/ischgl';

export default function PisteDetailScreen({ route }) {
  const { pisteId } = route.params;
  const piste = PISTES.find((p) => p.id === pisteId);

  if (!piste) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Piste not found</Text>
      </View>
    );
  }

  const startLift = LIFTS.find((l) => l.id === piste.startLift);
  const endLifts = piste.endLifts
    .map((id) => LIFTS.find((l) => l.id === id))
    .filter(Boolean);
  const nearbyPOIs = POIS.filter((poi) => poi.nearPistes.includes(piste.id));

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: DIFFICULTY_COLORS[piste.difficulty] },
        ]}
      >
        <View style={styles.headerBadge}>
          <Text style={styles.headerNumber}>{piste.number}</Text>
        </View>
        <Text style={styles.headerTitle}>{piste.name}</Text>
        <Text style={styles.headerDiff}>
          {DIFFICULTY_LABELS[piste.difficulty]}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{piste.lengthKm} km</Text>
          <Text style={styles.statLabel}>Length</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{piste.elevationDrop}m</Text>
          <Text style={styles.statLabel}>Elevation Drop</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>~{piste.estimatedMinutes} min</Text>
          <Text style={styles.statLabel}>Estimated Time</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{piste.description}</Text>
      </View>

      {/* Start lift */}
      {startLift && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Lift</Text>
          <View style={styles.liftCard}>
            <Text style={styles.liftName}>{startLift.name}</Text>
            <Text style={styles.liftInfo}>
              {startLift.type.charAt(0).toUpperCase() + startLift.type.slice(1)}{' '}
              · {startLift.startAltitude}m to {startLift.endAltitude}m ·{' '}
              {startLift.duration} min
            </Text>
          </View>
        </View>
      )}

      {/* End lifts */}
      {endLifts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connects to Lifts</Text>
          {endLifts.map((lift) => (
            <View key={lift.id} style={styles.liftCard}>
              <Text style={styles.liftName}>{lift.name}</Text>
              <Text style={styles.liftInfo}>
                {lift.type.charAt(0).toUpperCase() + lift.type.slice(1)} ·{' '}
                {lift.startAltitude}m to {lift.endAltitude}m
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Nearby POIs */}
      {nearbyPOIs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Stops</Text>
          {nearbyPOIs.map((poi) => (
            <View key={poi.id} style={styles.poiCard}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiType}>
                {poi.type.charAt(0).toUpperCase() + poi.type.slice(1)} ·{' '}
                {poi.altitude}m · {poi.priceRange}
              </Text>
              <Text style={styles.poiDesc}>{poi.description}</Text>
              <View style={styles.poiTags}>
                {poi.hasCoffee && (
                  <View style={styles.poiTag}>
                    <Text style={styles.poiTagText}>Coffee</Text>
                  </View>
                )}
                {poi.hasLunch && (
                  <View style={styles.poiTag}>
                    <Text style={styles.poiTagText}>Lunch</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
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
  error: {
    padding: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerDiff: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  liftCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.liftLine,
  },
  liftName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  liftInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  poiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.stopMarker,
  },
  poiName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  poiType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  poiDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  poiTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  poiTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
  },
  poiTagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
