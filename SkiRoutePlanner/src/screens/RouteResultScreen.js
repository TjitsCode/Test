import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../utils/colors';

function SegmentCard({ segment, index }) {
  if (segment.type === 'piste') {
    const piste = segment.data;
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentTimeline}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: DIFFICULTY_COLORS[piste.difficulty] },
            ]}
          />
          <View style={styles.timelineLine} />
        </View>
        <View style={styles.segmentContent}>
          <View style={styles.segmentHeader}>
            <View
              style={[
                styles.pisteBadge,
                { backgroundColor: DIFFICULTY_COLORS[piste.difficulty] },
              ]}
            >
              <Text style={styles.pisteBadgeText}>{piste.number}</Text>
            </View>
            <View style={styles.segmentInfo}>
              <Text style={styles.segmentName}>{piste.name}</Text>
              <Text style={styles.segmentDifficulty}>
                {DIFFICULTY_LABELS[piste.difficulty]}
              </Text>
            </View>
            <Text style={styles.segmentIcon}>{'⛷'}</Text>
          </View>
          <Text style={styles.segmentDesc}>{piste.description}</Text>
          <View style={styles.segmentStats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{piste.lengthKm} km</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Drop</Text>
              <Text style={styles.statValue}>{piste.elevationDrop}m</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>~{piste.estimatedMinutes} min</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (segment.type === 'lift') {
    const lift = segment.data;
    if (!lift) return null;

    const liftIcon =
      lift.type === 'gondola' ? 'G' : lift.type === 'chairlift' ? 'C' : 'D';

    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentTimeline}>
          <View style={[styles.timelineDot, styles.timelineDotLift]} />
          <View style={styles.timelineLine} />
        </View>
        <View style={[styles.segmentContent, styles.liftContent]}>
          <View style={styles.segmentHeader}>
            <View style={styles.liftBadge}>
              <Text style={styles.liftBadgeText}>{liftIcon}</Text>
            </View>
            <View style={styles.segmentInfo}>
              <Text style={styles.liftName}>{lift.name}</Text>
              <Text style={styles.liftType}>
                {lift.type.charAt(0).toUpperCase() + lift.type.slice(1)} ·{' '}
                {lift.duration} min
              </Text>
            </View>
            <Text style={styles.segmentIcon}>{'🚡'}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (segment.type === 'stop') {
    const poi = segment.data;
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentTimeline}>
          <View style={[styles.timelineDot, styles.timelineDotStop]} />
          <View style={styles.timelineLine} />
        </View>
        <View style={[styles.segmentContent, styles.stopContent]}>
          <View style={styles.segmentHeader}>
            <View style={styles.stopBadge}>
              <Text style={styles.stopBadgeText}>
                {poi.hasLunch ? 'L' : 'C'}
              </Text>
            </View>
            <View style={styles.segmentInfo}>
              <Text style={styles.stopName}>{poi.name}</Text>
              <Text style={styles.stopType}>
                {poi.hasLunch ? 'Lunch stop' : 'Coffee break'} ·{' '}
                {segment.duration} min
              </Text>
            </View>
            <Text style={styles.segmentIcon}>
              {poi.hasLunch ? '🍽' : '☕'}
            </Text>
          </View>
          <Text style={styles.segmentDesc}>{poi.description}</Text>
          <Text style={styles.stopAlt}>
            {poi.altitude}m · {poi.priceRange}
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

export default function RouteResultScreen({ route, navigation }) {
  const { routeData } = route.params;
  const { route: skiRoute, preferences, summary } = routeData;

  return (
    <ScrollView style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Route Summary</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalPistes}</Text>
            <Text style={styles.summaryLabel}>Pistes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {summary.totalDistanceKm.toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>km total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalElevationDrop}</Text>
            <Text style={styles.summaryLabel}>m drop</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalTimeMin}</Text>
            <Text style={styles.summaryLabel}>min total</Text>
          </View>
        </View>

        <View style={styles.timeBreakdown}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Skiing time</Text>
            <Text style={styles.timeValue}>{summary.totalSkiTimeMin} min</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Lift time</Text>
            <Text style={styles.timeValue}>{summary.totalLiftTimeMin} min</Text>
          </View>
          {summary.totalStopTimeMin > 0 && (
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Break time</Text>
              <Text style={styles.timeValue}>
                {summary.totalStopTimeMin} min
              </Text>
            </View>
          )}
        </View>

        <View style={styles.prefsRow}>
          <View
            style={[
              styles.prefBadge,
              { backgroundColor: DIFFICULTY_COLORS[preferences.difficulty] },
            ]}
          >
            <Text style={styles.prefBadgeText}>
              {DIFFICULTY_LABELS[preferences.difficulty]}
            </Text>
          </View>
          <View style={styles.prefBadge}>
            <Text style={styles.prefBadgeText}>{preferences.duration}</Text>
          </View>
        </View>
      </View>

      {/* Route segments */}
      <View style={styles.routeSection}>
        <Text style={styles.routeTitle}>Your Route</Text>
        <Text style={styles.routeSubtitle}>
          Follow this route for the best experience
        </Text>

        {skiRoute.segments.map((segment, index) => (
          <SegmentCard key={`${segment.type}-${index}`} segment={segment} index={index} />
        ))}

        {/* End marker */}
        <View style={styles.endMarker}>
          <View style={[styles.timelineDot, styles.timelineDotEnd]} />
          <Text style={styles.endText}>End of route</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.newRouteButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.newRouteButtonText}>Generate New Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'Map' })
          }
        >
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
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
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  timeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  prefsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  prefBadgeText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  routeSection: {
    paddingHorizontal: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  routeSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  segmentCard: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  segmentTimeline: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  timelineDotLift: {
    backgroundColor: COLORS.liftLine,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 2,
  },
  timelineDotStop: {
    backgroundColor: COLORS.stopMarker,
  },
  timelineDotEnd: {
    backgroundColor: COLORS.success,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  segmentContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    marginLeft: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  liftContent: {
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: 8,
  },
  stopContent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.stopMarker,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pisteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pisteBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  liftBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.liftLine,
  },
  liftBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stopBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.stopMarker,
  },
  stopBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  segmentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  segmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  segmentDifficulty: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  segmentIcon: {
    fontSize: 18,
  },
  liftName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  liftType: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  stopType: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  segmentDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 17,
  },
  segmentStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  stopAlt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  endMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingVertical: 8,
  },
  endText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 12,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  newRouteButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newRouteButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  mapButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
