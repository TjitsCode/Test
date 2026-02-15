import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Rect,
  Line,
  Circle,
  Text as SvgText,
  G,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../utils/colors';
import { PISTES, LIFTS, POIS, ZONES } from '../data/ischgl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32;
const MAP_HEIGHT = 420;

// Approximate positions for zones on the map (relative to MAP_WIDTH/MAP_HEIGHT)
const ZONE_POSITIONS = {
  'ischgl-center': { x: 0.45, y: 0.4 },
  'ischgl-east': { x: 0.8, y: 0.35 },
  'ischgl-west': { x: 0.15, y: 0.35 },
  samnaun: { x: 0.3, y: 0.15 },
};

// Approximate positions for lifts
const LIFT_POSITIONS = {
  L1: { x: 0.42, y: 0.85 },
  L2: { x: 0.48, y: 0.82 },
  L3: { x: 0.75, y: 0.82 },
  L4: { x: 0.22, y: 0.45 },
  L5: { x: 0.5, y: 0.48 },
  L6: { x: 0.52, y: 0.25 },
  L7: { x: 0.18, y: 0.55 },
  L8: { x: 0.4, y: 0.2 },
  L9: { x: 0.28, y: 0.35 },
  L10: { x: 0.55, y: 0.35 },
  L11: { x: 0.72, y: 0.6 },
  L12: { x: 0.32, y: 0.25 },
  L13: { x: 0.25, y: 0.2 },
  L14: { x: 0.2, y: 0.5 },
  L15: { x: 0.82, y: 0.35 },
};

// Approximate positions for POIs
const POI_POSITIONS = {
  POI1: { x: 0.78, y: 0.3 },
  POI2: { x: 0.48, y: 0.42 },
  POI3: { x: 0.18, y: 0.48 },
  POI4: { x: 0.28, y: 0.18 },
  POI5: { x: 0.7, y: 0.55 },
  POI6: { x: 0.16, y: 0.58 },
  POI7: { x: 0.54, y: 0.18 },
};

function PisteMapSVG({ selectedZone, onSelectPiste, navigation }) {
  const filteredPistes = selectedZone
    ? PISTES.filter((p) => p.zone === selectedZone)
    : PISTES;

  return (
    <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
      <Defs>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#87CEEB" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#E8F4FD" stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="0.4" stopColor="#E8E8E8" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#A8D5A2" stopOpacity="0.5" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#skyGrad)" rx={12} />

      {/* Mountain shapes */}
      <Polygon
        points={`0,${MAP_HEIGHT} 0,${MAP_HEIGHT * 0.5} ${MAP_WIDTH * 0.15},${MAP_HEIGHT * 0.2} ${MAP_WIDTH * 0.3},${MAP_HEIGHT * 0.12} ${MAP_WIDTH * 0.45},${MAP_HEIGHT * 0.08} ${MAP_WIDTH * 0.55},${MAP_HEIGHT * 0.1} ${MAP_WIDTH * 0.7},${MAP_HEIGHT * 0.15} ${MAP_WIDTH * 0.85},${MAP_HEIGHT * 0.2} ${MAP_WIDTH},${MAP_HEIGHT * 0.4} ${MAP_WIDTH},${MAP_HEIGHT}`}
        fill="url(#mountainGrad)"
      />

      {/* Snow cap */}
      <Polygon
        points={`${MAP_WIDTH * 0.35},${MAP_HEIGHT * 0.14} ${MAP_WIDTH * 0.45},${MAP_HEIGHT * 0.08} ${MAP_WIDTH * 0.55},${MAP_HEIGHT * 0.1} ${MAP_WIDTH * 0.5},${MAP_HEIGHT * 0.15} ${MAP_WIDTH * 0.42},${MAP_HEIGHT * 0.13}`}
        fill="white"
        opacity={0.8}
      />

      {/* Lift lines */}
      {LIFTS.map((lift) => {
        const startPos = LIFT_POSITIONS[lift.id];
        if (!startPos) return null;

        // Draw lift as a line going upward
        const endY = startPos.y - 0.12;
        return (
          <G key={lift.id}>
            <Line
              x1={startPos.x * MAP_WIDTH}
              y1={startPos.y * MAP_HEIGHT}
              x2={startPos.x * MAP_WIDTH}
              y2={endY * MAP_HEIGHT}
              stroke={COLORS.liftLine}
              strokeWidth={2}
              strokeDasharray="4,3"
              opacity={0.6}
            />
            {/* Lift station marker */}
            <Circle
              cx={startPos.x * MAP_WIDTH}
              cy={startPos.y * MAP_HEIGHT}
              r={4}
              fill={COLORS.liftLine}
            />
          </G>
        );
      })}

      {/* Piste lines */}
      {filteredPistes.map((piste) => {
        const startLiftPos = LIFT_POSITIONS[piste.startLift];
        const endLiftId = piste.endLifts[0];
        const endLiftPos = LIFT_POSITIONS[endLiftId];

        if (!startLiftPos || !endLiftPos) return null;

        const color = DIFFICULTY_COLORS[piste.difficulty];
        const startX = startLiftPos.x * MAP_WIDTH;
        const startY = (startLiftPos.y - 0.1) * MAP_HEIGHT;
        const endX = endLiftPos.x * MAP_WIDTH;
        const endY = endLiftPos.y * MAP_HEIGHT;

        // Add a slight curve to the piste line
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 20;
        const midY = (startY + endY) / 2;

        return (
          <G key={piste.id}>
            <Line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={selectedZone && piste.zone !== selectedZone ? 0.2 : 0.8}
              onPress={() => onSelectPiste(piste)}
            />
            {/* Piste number label */}
            <Circle
              cx={midX}
              cy={midY}
              r={10}
              fill={color}
              opacity={selectedZone && piste.zone !== selectedZone ? 0.2 : 1}
              onPress={() => onSelectPiste(piste)}
            />
            <SvgText
              x={midX}
              y={midY + 4}
              fill="white"
              fontSize={8}
              fontWeight="bold"
              textAnchor="middle"
              onPress={() => onSelectPiste(piste)}
            >
              {piste.number}
            </SvgText>
          </G>
        );
      })}

      {/* POI markers */}
      {POIS.map((poi) => {
        const pos = POI_POSITIONS[poi.id];
        if (!pos) return null;

        const icon = poi.type === 'restaurant' ? 'R' : 'C';

        return (
          <G key={poi.id}>
            <Circle
              cx={pos.x * MAP_WIDTH}
              cy={pos.y * MAP_HEIGHT}
              r={8}
              fill={COLORS.stopMarker}
              opacity={0.9}
            />
            <SvgText
              x={pos.x * MAP_WIDTH}
              y={pos.y * MAP_HEIGHT + 4}
              fill="white"
              fontSize={8}
              fontWeight="bold"
              textAnchor="middle"
            >
              {icon}
            </SvgText>
          </G>
        );
      })}

      {/* Zone labels */}
      {ZONES.map((zone) => {
        const pos = ZONE_POSITIONS[zone.id];
        if (!pos) return null;

        return (
          <SvgText
            key={zone.id}
            x={pos.x * MAP_WIDTH}
            y={pos.y * MAP_HEIGHT - 20}
            fill={COLORS.primaryDark}
            fontSize={9}
            fontWeight="bold"
            textAnchor="middle"
            opacity={0.7}
          >
            {zone.name.split('(')[0].trim()}
          </SvgText>
        );
      })}

      {/* Valley label */}
      <SvgText
        x={MAP_WIDTH * 0.5}
        y={MAP_HEIGHT - 15}
        fill={COLORS.primary}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        Ischgl (1,400m)
      </SvgText>
    </Svg>
  );
}

export default function MapScreen({ navigation }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedPiste, setSelectedPiste] = useState(null);

  function handleSelectPiste(piste) {
    setSelectedPiste(piste);
  }

  return (
    <ScrollView style={styles.container}>
      {/* Zone filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.zoneFilter}
        contentContainerStyle={styles.zoneFilterContent}
      >
        <TouchableOpacity
          style={[styles.zoneChip, !selectedZone && styles.zoneChipActive]}
          onPress={() => setSelectedZone(null)}
        >
          <Text style={[styles.zoneChipText, !selectedZone && styles.zoneChipTextActive]}>
            All Zones
          </Text>
        </TouchableOpacity>
        {ZONES.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={[styles.zoneChip, selectedZone === zone.id && styles.zoneChipActive]}
            onPress={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}
          >
            <Text
              style={[
                styles.zoneChipText,
                selectedZone === zone.id && styles.zoneChipTextActive,
              ]}
            >
              {zone.name.split('(')[0].trim()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <PisteMapSVG
          selectedZone={selectedZone}
          onSelectPiste={handleSelectPiste}
          navigation={navigation}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.pisteBlue }]} />
          <Text style={styles.legendText}>Blue (Easy)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.pisteRed }]} />
          <Text style={styles.legendText}>Red (Medium)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.pisteBlack }]} />
          <Text style={styles.legendText}>Black (Expert)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.stopMarker }]} />
          <Text style={styles.legendText}>Restaurant/Cafe</Text>
        </View>
      </View>

      {/* Selected piste info */}
      {selectedPiste && (
        <TouchableOpacity
          style={styles.pisteInfo}
          onPress={() =>
            navigation.navigate('PisteDetail', { pisteId: selectedPiste.id })
          }
        >
          <View style={styles.pisteInfoHeader}>
            <View
              style={[
                styles.pisteBadge,
                { backgroundColor: DIFFICULTY_COLORS[selectedPiste.difficulty] },
              ]}
            >
              <Text style={styles.pisteBadgeText}>{selectedPiste.number}</Text>
            </View>
            <View style={styles.pisteInfoTitle}>
              <Text style={styles.pisteInfoName}>{selectedPiste.name}</Text>
              <Text style={styles.pisteInfoDiff}>
                {DIFFICULTY_LABELS[selectedPiste.difficulty]}
              </Text>
            </View>
            <Text style={styles.pisteInfoArrow}>{'>'}</Text>
          </View>
          <Text style={styles.pisteInfoDesc}>{selectedPiste.description}</Text>
          <View style={styles.pisteInfoStats}>
            <Text style={styles.pisteInfoStat}>{selectedPiste.lengthKm} km</Text>
            <Text style={styles.pisteInfoStat}>
              {selectedPiste.elevationDrop}m drop
            </Text>
            <Text style={styles.pisteInfoStat}>
              ~{selectedPiste.estimatedMinutes} min
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Piste list */}
      <View style={styles.pisteList}>
        <Text style={styles.listTitle}>
          {selectedZone
            ? `Pistes in ${ZONES.find((z) => z.id === selectedZone)?.name || ''}`
            : 'All Pistes'}
        </Text>
        {(selectedZone
          ? PISTES.filter((p) => p.zone === selectedZone)
          : PISTES
        ).map((piste) => (
          <TouchableOpacity
            key={piste.id}
            style={styles.pisteListItem}
            onPress={() => handleSelectPiste(piste)}
          >
            <View
              style={[
                styles.pisteListBadge,
                { backgroundColor: DIFFICULTY_COLORS[piste.difficulty] },
              ]}
            >
              <Text style={styles.pisteListBadgeText}>{piste.number}</Text>
            </View>
            <View style={styles.pisteListInfo}>
              <Text style={styles.pisteListName}>{piste.name}</Text>
              <Text style={styles.pisteListStats}>
                {piste.lengthKm} km · {piste.elevationDrop}m drop
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  zoneFilter: {
    maxHeight: 50,
    marginTop: 8,
  },
  zoneFilterContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  zoneChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  zoneChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  zoneChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  zoneChipTextActive: {
    color: COLORS.textLight,
  },
  mapContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: COLORS.surface,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pisteInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
  },
  pisteInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pisteBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pisteBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pisteInfoTitle: {
    flex: 1,
    marginLeft: 12,
  },
  pisteInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  pisteInfoDiff: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pisteInfoArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  pisteInfoDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  pisteInfoStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  pisteInfoStat: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pisteList: {
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  pisteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 6,
  },
  pisteListBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pisteListBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pisteListInfo: {
    marginLeft: 12,
  },
  pisteListName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  pisteListStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  spacer: {
    height: 40,
  },
});
