import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, DIFFICULTY_COLORS } from '../utils/colors';
import { RESORT_INFO, PISTES, LIFTS, POIS, ZONES } from '../data/ischgl';

function StatCard({ label, value, sub }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function ZoneCard({ zone, pisteCount, navigation }) {
  return (
    <TouchableOpacity
      style={styles.zoneCard}
      onPress={() => navigation.navigate('Map')}
    >
      <Text style={styles.zoneName}>{zone.name}</Text>
      <Text style={styles.zoneDesc}>{zone.description}</Text>
      <Text style={styles.zonePistes}>{pisteCount} pistes</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const blueCount = PISTES.filter((p) => p.difficulty === 'blue').length;
  const redCount = PISTES.filter((p) => p.difficulty === 'red').length;
  const blackCount = PISTES.filter((p) => p.difficulty === 'black').length;

  return (
    <ScrollView style={styles.container}>
      {/* Hero section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{RESORT_INFO.name}</Text>
        <Text style={styles.heroSubtitle}>
          {RESORT_INFO.region}, {RESORT_INFO.country}
        </Text>
        <Text style={styles.heroAlt}>
          {RESORT_INFO.altitude.min}m - {RESORT_INFO.altitude.max}m
        </Text>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <StatCard label="Piste km" value={RESORT_INFO.totalPisteKm} />
        <StatCard label="Lifts" value={RESORT_INFO.totalLifts} />
        <StatCard label="Restaurants" value={POIS.length} />
      </View>

      {/* Difficulty breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pistes by Difficulty</Text>
        <View style={styles.difficultyRow}>
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS.blue }]}>
            <Text style={styles.diffText}>{blueCount} Blue</Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS.red }]}>
            <Text style={styles.diffText}>{redCount} Red</Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS.black }]}>
            <Text style={styles.diffText}>{blackCount} Black</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Planner')}
      >
        <Text style={styles.ctaText}>Plan Your Route</Text>
      </TouchableOpacity>

      {/* Zones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ski Zones</Text>
        {ZONES.map((zone) => {
          const pisteCount = PISTES.filter((p) => p.zone === zone.id).length;
          return (
            <ZoneCard
              key={zone.id}
              zone={zone}
              pisteCount={pisteCount}
              navigation={navigation}
            />
          );
        })}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{RESORT_INFO.description}</Text>
        <Text style={styles.seasonText}>Season: {RESORT_INFO.season}</Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroAlt: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: -12,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  diffText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ctaText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  zoneDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  zonePistes: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  seasonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  spacer: {
    height: 40,
  },
});
