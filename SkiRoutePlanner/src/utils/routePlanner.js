/**
 * Route Planning Algorithm for Ski Route Planner
 *
 * Generates ski routes based on user preferences:
 * - Difficulty level (blue, red, black)
 * - Duration (short, medium, long)
 * - Coffee/lunch stops
 */

import { PISTES, LIFTS, POIS } from '../data/ischgl';

// Duration ranges in minutes (skiing time only, excluding lifts)
const DURATION_RANGES = {
  short: { min: 20, max: 45, label: '30-60 min' },
  medium: { min: 45, max: 90, label: '1-2 hours' },
  long: { min: 90, max: 180, label: '2-4 hours' },
};

/**
 * Find pistes that match the difficulty preference.
 * Allows one level easier pistes to be mixed in for variety.
 */
function filterPistesByDifficulty(difficulty) {
  const allowed = {
    blue: ['blue'],
    red: ['blue', 'red'],
    black: ['red', 'black'],
  };

  return PISTES.filter((p) => allowed[difficulty].includes(p.difficulty));
}

/**
 * Get the lift object by ID.
 */
function getLift(liftId) {
  return LIFTS.find((l) => l.id === liftId);
}

/**
 * Get POIs near a specific piste or lift.
 */
function getPOIsNearPiste(pisteId) {
  return POIS.filter((poi) => poi.nearPistes.includes(pisteId));
}

/**
 * Build a graph of connected pistes via lifts.
 * A piste's endLifts connect to other pistes' startLifts.
 */
function buildConnectionGraph(availablePistes) {
  const graph = {};
  const pisteSet = new Set(availablePistes.map((p) => p.id));

  for (const piste of availablePistes) {
    graph[piste.id] = [];

    // For each lift at the end of this piste, find pistes that start from those lifts
    for (const endLiftId of piste.endLifts) {
      const nextPistes = availablePistes.filter(
        (p) => p.startLift === endLiftId && p.id !== piste.id
      );
      for (const next of nextPistes) {
        const lift = getLift(endLiftId);
        graph[piste.id].push({
          pisteId: next.id,
          viaLift: endLiftId,
          liftDuration: lift ? lift.duration : 5,
        });
      }

      // Also check if the end lift connects to a lift that connects to another piste
      // (indirect connections via the same zone)
      const lift = getLift(endLiftId);
      if (lift) {
        const sameLiftPistes = availablePistes.filter(
          (p) =>
            p.startLift !== endLiftId &&
            pisteSet.has(p.id) &&
            p.id !== piste.id &&
            getLift(p.startLift)?.zone === lift.zone
        );
        for (const next of sameLiftPistes) {
          // Check if not already connected
          if (!graph[piste.id].find((c) => c.pisteId === next.id)) {
            graph[piste.id].push({
              pisteId: next.id,
              viaLift: next.startLift,
              liftDuration: (getLift(next.startLift)?.duration || 5) + 2, // extra transfer time
            });
          }
        }
      }
    }
  }

  return graph;
}

/**
 * Generate a route using a greedy path-building approach.
 * Tries to build a route that matches the target duration.
 */
function buildRoute(graph, availablePistes, targetMinutes, preferences) {
  const pisteMap = {};
  for (const p of availablePistes) {
    pisteMap[p.id] = p;
  }

  // Start from a piste that connects to the main gondolas (L1, L2, or L3)
  const startPistes = availablePistes.filter((p) =>
    ['L1', 'L2', 'L3'].includes(p.startLift)
  );

  if (startPistes.length === 0) return null;

  // Try multiple starting points and pick the best route
  let bestRoute = null;
  let bestScore = -1;

  for (const startPiste of startPistes) {
    const route = [];
    const visited = new Set();
    let totalSkiTime = 0;
    let totalLiftTime = 0;
    let currentPisteId = startPiste.id;

    // Add initial lift time
    const startLift = getLift(startPiste.startLift);
    totalLiftTime += startLift ? startLift.duration : 5;

    while (totalSkiTime < targetMinutes) {
      const piste = pisteMap[currentPisteId];
      if (!piste) break;

      visited.add(currentPisteId);
      totalSkiTime += piste.estimatedMinutes;

      route.push({
        type: 'piste',
        data: piste,
        cumulativeSkiTime: totalSkiTime,
      });

      // Check if we've reached target
      if (totalSkiTime >= targetMinutes) break;

      // Find next piste
      const connections = graph[currentPisteId] || [];
      const unvisited = connections.filter((c) => !visited.has(c.pisteId));

      if (unvisited.length === 0) {
        // Allow revisiting if no unvisited options
        if (connections.length === 0) break;
        const revisit = connections[Math.floor(Math.random() * connections.length)];
        totalLiftTime += revisit.liftDuration;
        route.push({
          type: 'lift',
          data: getLift(revisit.viaLift),
          cumulativeSkiTime: totalSkiTime,
        });
        currentPisteId = revisit.pisteId;
      } else {
        // Prefer unvisited pistes, with some randomness
        const next = unvisited[Math.floor(Math.random() * unvisited.length)];
        totalLiftTime += next.liftDuration;
        route.push({
          type: 'lift',
          data: getLift(next.viaLift),
          cumulativeSkiTime: totalSkiTime,
        });
        currentPisteId = next.pisteId;
      }
    }

    // Score this route based on how close it is to target time and variety
    const timeDiff = Math.abs(totalSkiTime - targetMinutes);
    const uniquePistes = new Set(route.filter((r) => r.type === 'piste').map((r) => r.data.id)).size;
    const score = uniquePistes * 10 - timeDiff;

    if (score > bestScore && route.length > 0) {
      bestScore = score;
      bestRoute = {
        segments: route,
        totalSkiTime,
        totalLiftTime,
        totalTime: totalSkiTime + totalLiftTime,
        uniquePistes,
      };
    }
  }

  return bestRoute;
}

/**
 * Insert stop suggestions into the route.
 */
function insertStops(route, preferences) {
  if (!route || !preferences.stops || preferences.stops === 'none') return route;

  const segments = [...route.segments];
  const pisteSegments = segments
    .map((s, i) => ({ ...s, index: i }))
    .filter((s) => s.type === 'piste');

  const stops = [];

  // Find suitable POIs along the route
  for (const seg of pisteSegments) {
    const nearbyPOIs = getPOIsNearPiste(seg.data.id);
    for (const poi of nearbyPOIs) {
      if (preferences.stops === 'coffee' && poi.hasCoffee) {
        stops.push({ poi, afterIndex: seg.index, time: 15 });
      } else if (preferences.stops === 'lunch' && poi.hasLunch) {
        stops.push({ poi, afterIndex: seg.index, time: 45 });
      } else if (preferences.stops === 'both') {
        if (poi.hasLunch) {
          stops.push({ poi, afterIndex: seg.index, time: 45 });
        } else if (poi.hasCoffee) {
          stops.push({ poi, afterIndex: seg.index, time: 15 });
        }
      }
    }
  }

  // Select the best stops (max 1 lunch, max 2 coffee)
  let selectedStops = [];
  const lunchStops = stops.filter((s) => s.time === 45);
  const coffeeStops = stops.filter((s) => s.time === 15);

  if (preferences.stops === 'lunch' || preferences.stops === 'both') {
    if (lunchStops.length > 0) {
      // Pick lunch stop roughly in the middle of the route
      const midIndex = Math.floor(pisteSegments.length / 2);
      const bestLunch = lunchStops.reduce((best, s) =>
        Math.abs(s.afterIndex - segments[midIndex]?.index || 0) <
        Math.abs(best.afterIndex - segments[midIndex]?.index || 0)
          ? s
          : best
      );
      selectedStops.push(bestLunch);
    }
  }

  if (preferences.stops === 'coffee' || preferences.stops === 'both') {
    // Pick a coffee stop in the first third of the route
    const earlyStops = coffeeStops.filter(
      (s) => s.afterIndex < segments.length / 3
    );
    if (earlyStops.length > 0) {
      selectedStops.push(earlyStops[0]);
    } else if (coffeeStops.length > 0) {
      selectedStops.push(coffeeStops[0]);
    }
  }

  // Insert stops into segments (in reverse order to preserve indices)
  selectedStops.sort((a, b) => b.afterIndex - a.afterIndex);

  let totalStopTime = 0;
  const newSegments = [...segments];

  for (const stop of selectedStops) {
    newSegments.splice(stop.afterIndex + 1, 0, {
      type: 'stop',
      data: stop.poi,
      duration: stop.time,
    });
    totalStopTime += stop.time;
  }

  return {
    ...route,
    segments: newSegments,
    totalStopTime,
    totalTime: route.totalTime + totalStopTime,
    stops: selectedStops.map((s) => s.poi),
  };
}

/**
 * Main route planning function.
 *
 * @param {Object} preferences
 * @param {string} preferences.difficulty - 'blue', 'red', or 'black'
 * @param {string} preferences.duration - 'short', 'medium', or 'long'
 * @param {string} preferences.stops - 'none', 'coffee', 'lunch', or 'both'
 * @returns {Object} Generated route with segments and stats
 */
export function planRoute(preferences) {
  const { difficulty, duration, stops } = preferences;

  // Get available pistes for this difficulty
  const availablePistes = filterPistesByDifficulty(difficulty);

  // Build connection graph
  const graph = buildConnectionGraph(availablePistes);

  // Calculate target time
  const durationRange = DURATION_RANGES[duration];
  const targetMinutes = (durationRange.min + durationRange.max) / 2;

  // Try to generate a good route (multiple attempts for randomized variety)
  let bestRoute = null;
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < 5; attempt++) {
    const route = buildRoute(graph, availablePistes, targetMinutes, preferences);
    if (route) {
      const timeDiff = Math.abs(route.totalSkiTime - targetMinutes);
      const score = route.uniquePistes * 10 - timeDiff;
      if (score > bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    }
  }

  if (!bestRoute) {
    return {
      success: false,
      message: 'Could not find a suitable route. Try adjusting your preferences.',
    };
  }

  // Insert stops if requested
  const routeWithStops = insertStops(bestRoute, { stops });

  return {
    success: true,
    route: routeWithStops,
    preferences: {
      difficulty,
      duration: DURATION_RANGES[duration].label,
      stops,
    },
    summary: {
      totalPistes: routeWithStops.uniquePistes,
      totalSkiTimeMin: routeWithStops.totalSkiTime,
      totalLiftTimeMin: routeWithStops.totalLiftTime,
      totalStopTimeMin: routeWithStops.totalStopTime || 0,
      totalTimeMin: routeWithStops.totalTime,
      totalDistanceKm: routeWithStops.segments
        .filter((s) => s.type === 'piste')
        .reduce((sum, s) => sum + s.data.lengthKm, 0),
      totalElevationDrop: routeWithStops.segments
        .filter((s) => s.type === 'piste')
        .reduce((sum, s) => sum + s.data.elevationDrop, 0),
    },
  };
}

export { DURATION_RANGES };
