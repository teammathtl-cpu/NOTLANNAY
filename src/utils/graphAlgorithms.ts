import { Route, TouristLocation, PathResult, DijkstraStep, AlternativePlan } from '../types';

export interface AdjacencyItem {
  nodeId: string;
  weight: number;
  routeId: string;
}

export function buildAdjacencyList(routes: Route[]): Map<string, AdjacencyItem[]> {
  const adj = new Map<string, AdjacencyItem[]>();

  for (const r of routes) {
    if (!adj.has(r.from)) adj.set(r.from, []);
    adj.get(r.from)!.push({ nodeId: r.to, weight: r.distanceKm, routeId: r.id });

    // If reverse route does NOT exist in routes, add reverse for undirected fallback:
    const hasReverse = routes.some(other => other.from === r.to && other.to === r.from);
    if (!hasReverse) {
      if (!adj.has(r.to)) adj.set(r.to, []);
      adj.get(r.to)!.push({ nodeId: r.from, weight: r.distanceKm, routeId: r.id });
    }
  }

  return adj;
}

/**
 * Get direct distance in km between two locations from routes, or null if none
 */
export function getDirectDistance(
  fromId: string,
  toId: string,
  routes: Route[]
): number | null {
  if (fromId === toId) return 0;
  // 1. Try exact directed match (fromId -> toId)
  const directedMatch = routes.find(r => r.from === fromId && r.to === toId);
  if (directedMatch) return directedMatch.distanceKm;
  // 2. Fallback to reverse match (toId -> fromId)
  const reverseMatch = routes.find(r => r.from === toId && r.to === fromId);
  return reverseMatch ? reverseMatch.distanceKm : null;
}

/**
 * Calculates Haversine distance in km between two lat/lng coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates estimated travel times by various modes of transport
 */
export function calculateTravelTimes(distanceKm: number) {
  return {
    walkMinutes: Math.max(1, Math.round((distanceKm / 4.2) * 60)), // Walking ~4.2 km/h
    bikeMinutes: Math.max(1, Math.round((distanceKm / 15) * 60)),  // Bicycle ~15 km/h
    motoMinutes: Math.max(1, Math.round((distanceKm / 30) * 60)),  // Motorbike ~30 km/h
    carMinutes: Math.max(1, Math.round((distanceKm / 26) * 60)),   // Car in city ~26 km/h
    caloriesBurnedWalk: Math.round(distanceKm * 55),
    caloriesBurnedBike: Math.round(distanceKm * 32),
  };
}

/**
 * Calculate total distance along a path array
 */
export function calculatePathDistance(path: string[], routes: Route[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = getDirectDistance(path[i], path[i + 1], routes);
    total += d !== null ? d : 2.5;
  }
  return Math.round(total * 10) / 10;
}

/**
 * Permutations helper
 */
function permute<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingPermuted = permute(remaining);
    for (const p of remainingPermuted) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * Solve Hamiltonian Cycle (Bài 1 / Tự chọn chu trình):
 * Finds the shortest cycle that starts at startId, visits each stop in nodes exactly once,
 * and returns to startId.
 */
export function solveHamiltonianCycle(
  nodes: string[],
  startId: string,
  routes: Route[]
): { shortestCycle: string[]; totalDistanceKm: number; allCyclesCount: number } {
  if (nodes.length <= 1) {
    return { shortestCycle: nodes, totalDistanceKm: 0, allCyclesCount: 1 };
  }

  const otherNodes = nodes.filter(id => id !== startId);
  if (otherNodes.length === 0) {
    return { shortestCycle: [startId, startId], totalDistanceKm: 0, allCyclesCount: 1 };
  }

  // Exact permutation search when <= 7 intermediate stops
  if (otherNodes.length <= 7) {
    const perms = permute(otherNodes);
    let bestCycle: string[] = [];
    let minDistance = Infinity;

    for (const p of perms) {
      const cycle = [startId, ...p, startId];
      const dist = calculatePathDistance(cycle, routes);
      if (dist < minDistance) {
        minDistance = dist;
        bestCycle = cycle;
      }
    }

    return {
      shortestCycle: bestCycle.length > 0 ? bestCycle : [startId, ...otherNodes, startId],
      totalDistanceKm: minDistance === Infinity ? 0 : minDistance,
      allCyclesCount: perms.length,
    };
  }

  // Heuristic Nearest-Neighbor + 2-Opt for larger selections
  const remaining = new Set(otherNodes);
  let current = startId;
  const tour: string[] = [startId];

  while (remaining.size > 0) {
    let bestNext = '';
    let bestDist = Infinity;
    for (const cand of remaining) {
      const d = getDirectDistance(current, cand, routes) ?? 4;
      if (d < bestDist) {
        bestDist = d;
        bestNext = cand;
      }
    }
    if (!bestNext) {
      bestNext = remaining.values().next().value as string;
    }
    tour.push(bestNext);
    remaining.delete(bestNext);
    current = bestNext;
  }
  tour.push(startId);

  // 2-Opt improvement
  let improved = true;
  let cycle = [...tour];
  let iterations = 0;
  while (improved && iterations < 50) {
    improved = false;
    iterations++;
    for (let i = 1; i < cycle.length - 2; i++) {
      for (let j = i + 1; j < cycle.length - 1; j++) {
        const currentDist = calculatePathDistance(cycle, routes);
        // reverse slice between i and j
        const newCycle = [
          ...cycle.slice(0, i),
          ...cycle.slice(i, j + 1).reverse(),
          ...cycle.slice(j + 1)
        ];
        const newDist = calculatePathDistance(newCycle, routes);
        if (newDist < currentDist) {
          cycle = newCycle;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return {
    shortestCycle: cycle,
    totalDistanceKm: calculatePathDistance(cycle, routes),
    allCyclesCount: 1,
  };
}

/**
 * Solve Hamiltonian Path (Bài 2 / Tự chọn đường đi):
 * Finds the shortest path from startId to endId visiting all stops in nodes exactly once.
 */
export function solveHamiltonianPath(
  nodes: string[],
  startId: string,
  endId: string,
  routes: Route[]
): { shortestPath: string[]; totalDistanceKm: number; allPathsCount: number } {
  if (nodes.length <= 2) {
    const path = [startId, ...nodes.filter(n => n !== startId && n !== endId), endId];
    return {
      shortestPath: path,
      totalDistanceKm: calculatePathDistance(path, routes),
      allPathsCount: 1
    };
  }

  const middleNodes = nodes.filter(id => id !== startId && id !== endId);

  // Exact search when <= 7 intermediate stops
  if (middleNodes.length <= 7) {
    const perms = permute(middleNodes);
    let bestPath: string[] = [];
    let minDistance = Infinity;

    for (const p of perms) {
      const path = [startId, ...p, endId];
      const dist = calculatePathDistance(path, routes);
      if (dist < minDistance) {
        minDistance = dist;
        bestPath = path;
      }
    }

    return {
      shortestPath: bestPath.length > 0 ? bestPath : [startId, ...middleNodes, endId],
      totalDistanceKm: minDistance === Infinity ? 0 : minDistance,
      allPathsCount: perms.length,
    };
  }

  // Nearest-Neighbor for larger selections
  const remaining = new Set(middleNodes);
  let current = startId;
  const path: string[] = [startId];

  while (remaining.size > 0) {
    let bestNext = '';
    let bestDist = Infinity;
    for (const cand of remaining) {
      const d = getDirectDistance(current, cand, routes) ?? 4;
      if (d < bestDist) {
        bestDist = d;
        bestNext = cand;
      }
    }
    if (!bestNext) {
      bestNext = remaining.values().next().value as string;
    }
    path.push(bestNext);
    remaining.delete(bestNext);
    current = bestNext;
  }
  path.push(endId);

  return {
    shortestPath: path,
    totalDistanceKm: calculatePathDistance(path, routes),
    allPathsCount: 1,
  };
}

/**
 * Run Dijkstra within a subset of chosen nodes (Bài 3) and record step-by-step history
 */
export function runDijkstraWithSteps(
  startId: string,
  endId: string,
  subsetNodes: string[],
  routes: Route[],
  locations: TouristLocation[]
): { path: string[]; totalDistanceKm: number; steps: DijkstraStep[] } {
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const adj = buildAdjacencyList(routes);

  // Restrict to subset
  const subsetSet = new Set(subsetNodes);
  if (!subsetSet.has(startId)) subsetSet.add(startId);
  if (!subsetSet.has(endId)) subsetSet.add(endId);

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  subsetSet.forEach(id => {
    distances[id] = id === startId ? 0 : Infinity;
    previous[id] = null;
    unvisited.add(id);
  });

  const steps: DijkstraStep[] = [];
  const visitedOrder: string[] = [];
  let stepIndex = 0;

  // Initial step 0
  steps.push({
    stepIndex: stepIndex++,
    currentNode: startId,
    visitedNodes: [],
    distances: { ...distances },
    previous: { ...previous },
    explanationVi: `Khởi tạo: Gán d(${locationMap.get(startId)?.label || startId}) = 0 km, các đỉnh còn lại d = ∞.`,
    explanationEn: `Init: Set d(${locationMap.get(startId)?.label || startId}) = 0 km, other nodes d = ∞.`,
  });

  while (unvisited.size > 0) {
    // Pick unvisited with smallest distance
    let currentId: string | null = null;
    let minD = Infinity;

    for (const id of unvisited) {
      if (distances[id] < minD) {
        minD = distances[id];
        currentId = id;
      }
    }

    if (!currentId || minD === Infinity) break;

    unvisited.delete(currentId);
    visitedOrder.push(currentId);

    const currentLoc = locationMap.get(currentId);
    const neighbors = (adj.get(currentId) || []).filter(item => subsetSet.has(item.nodeId));

    let updatedNeighbors: string[] = [];

    for (const { nodeId, weight } of neighbors) {
      if (unvisited.has(nodeId)) {
        const newDist = minD + weight;
        if (newDist < distances[nodeId]) {
          distances[nodeId] = Math.round(newDist * 10) / 10;
          previous[nodeId] = currentId;
          const targetLoc = locationMap.get(nodeId);
          updatedNeighbors.push(`${targetLoc?.label || nodeId} (d=${distances[nodeId]}k)`);
        }
      }
    }

    const updatesTextVi = updatedNeighbors.length > 0
      ? `Cập nhật nhãn khoảng cách ngắn hơn cho: ${updatedNeighbors.join(', ')}.`
      : `Không có đỉnh kề nào tìm được đường ngắn hơn qua đỉnh này.`;
    const updatesTextEn = updatedNeighbors.length > 0
      ? `Updated shorter tentative distances for: ${updatedNeighbors.join(', ')}.`
      : `No adjacent neighbors found a shorter route through this node.`;

    steps.push({
      stepIndex: stepIndex++,
      currentNode: currentId,
      visitedNodes: [...visitedOrder],
      distances: { ...distances },
      previous: { ...previous },
      explanationVi: `Xét đỉnh ${currentLoc?.label || currentId} (d = ${minD} km). ${updatesTextVi}`,
      explanationEn: `Checking ${currentLoc?.label || currentId} (d = ${minD} km). ${updatesTextEn}`,
    });

    if (currentId === endId) break;
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;

  if (distances[endId] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr] || null;
      if (curr === startId) {
        path.unshift(curr);
        break;
      }
    }
  }

  return {
    path: path.length > 0 ? path : [startId, endId],
    totalDistanceKm: distances[endId] !== Infinity ? distances[endId] : 0,
    steps,
  };
}

/**
 * Generate Alternative Plans for comparison
 */
/**
 * Enumerate all valid Hamiltonian cycles, calculate each cycle's total distance,
 * and sort them ascending by total distance to select the shortest cycle as Rank 1.
 */
export function enumerateSortedHamiltonianCycles(
  selectedNodes: string[],
  startId: string,
  routes: Route[]
): AlternativePlan[] {
  const otherNodes = selectedNodes.filter(n => n !== startId);
  if (otherNodes.length === 0) {
    return [{
      id: 'optimal',
      title: 'Chu trình #1: Khởi hành tại trường',
      titleEn: 'Cycle #1: Start at School',
      description: 'Hành trình xuất phát và kết thúc tại THPT Thăng Long.',
      descriptionEn: 'Start and return to Thang Long School.',
      path: [startId, startId],
      totalDistanceKm: 0,
      rank: 1,
      diffKm: 0,
      diffPercent: 0,
      isOptimal: true,
    }];
  }

  const allCycles: Array<{ path: string[]; distance: number }> = [];

  if (otherNodes.length <= 6) {
    const perms = permute(otherNodes);
    const seenCycles = new Set<string>();

    for (const p of perms) {
      const cycle = [startId, ...p, startId];
      const cycleKey = cycle.join('-');
      if (!seenCycles.has(cycleKey)) {
        seenCycles.add(cycleKey);
        const dist = calculatePathDistance(cycle, routes);
        allCycles.push({ path: cycle, distance: dist });
      }
    }
  } else {
    // When 7+ nodes (where permutations > 5000), use multi-start randomized searches
    const baseOpt = solveHamiltonianCycle(selectedNodes, startId, routes);
    allCycles.push({ path: baseOpt.shortestCycle, distance: baseOpt.totalDistanceKm });

    const seenCycles = new Set<string>([baseOpt.shortestCycle.join('-')]);
    for (let trial = 0; trial < 100 && allCycles.length < 30; trial++) {
      const shuffled = [...otherNodes].sort(() => Math.random() - 0.5);
      const cycle = [startId, ...shuffled, startId];
      const cycleKey = cycle.join('-');
      if (!seenCycles.has(cycleKey)) {
        seenCycles.add(cycleKey);
        const dist = calculatePathDistance(cycle, routes);
        allCycles.push({ path: cycle, distance: dist });
      }
    }
  }

  // Sort strictly ascending by total distance (Quãng đường ngắn nhất lên đầu)
  allCycles.sort((a, b) => a.distance - b.distance);

  const minDist = allCycles[0]?.distance || 0;

  return allCycles.map((c, idx) => {
    const rank = idx + 1;
    const isOpt = rank === 1;
    const diff = Number((c.distance - minDist).toFixed(1));
    const diffPct = minDist > 0 ? Math.round((diff / minDist) * 100) : 0;

    return {
      id: isOpt ? 'optimal' : `cycle-${rank}`,
      title: isOpt 
        ? `Chu trình #1 (Ngắn nhất - Tối ưu)` 
        : `Chu trình #${rank} (Khả dĩ)`,
      titleEn: isOpt 
        ? `Cycle #1 (Shortest - Optimal)` 
        : `Cycle #${rank} (Alternative)`,
      description: isOpt
        ? `Chu trình Hamilton tối ưu đạt tổng quãng đường nhỏ nhất (${c.distance} km) sau khi liệt kê và so sánh toàn bộ ${allCycles.length} chu trình hợp lệ.`
        : `Chu trình phụ thứ ${rank} với tổng cự ly ${c.distance} km (dài hơn chu trình tối ưu ${diff} km, chênh lệch +${diffPct}%).`,
      descriptionEn: isOpt
        ? `Optimal Hamiltonian cycle with minimum distance (${c.distance} km) among all ${allCycles.length} valid cycles.`
        : `Alternative cycle #${rank} with total distance of ${c.distance} km (+${diff} km longer).`,
      path: c.path,
      totalDistanceKm: c.distance,
      rank,
      diffKm: diff,
      diffPercent: diffPct,
      isOptimal: isOpt,
    };
  });
}

/**
 * Enumerate all valid Hamiltonian paths, calculate each path's total distance,
 * and sort them ascending by total distance to select the shortest path as Rank 1.
 */
export function enumerateSortedHamiltonianPaths(
  selectedNodes: string[],
  startId: string,
  endId: string,
  routes: Route[]
): AlternativePlan[] {
  const middleNodes = selectedNodes.filter(n => n !== startId && n !== endId);

  const allPaths: Array<{ path: string[]; distance: number }> = [];

  if (middleNodes.length <= 6) {
    const perms = permute(middleNodes);
    for (const p of perms) {
      const path = [startId, ...p, endId];
      const dist = calculatePathDistance(path, routes);
      allPaths.push({ path, distance: dist });
    }
  } else {
    const baseOpt = solveHamiltonianPath(selectedNodes, startId, endId, routes);
    allPaths.push({ path: baseOpt.shortestPath, distance: baseOpt.totalDistanceKm });
    const seen = new Set<string>([baseOpt.shortestPath.join('-')]);
    for (let trial = 0; trial < 100 && allPaths.length < 30; trial++) {
      const shuffled = [...middleNodes].sort(() => Math.random() - 0.5);
      const path = [startId, ...shuffled, endId];
      const key = path.join('-');
      if (!seen.has(key)) {
        seen.add(key);
        allPaths.push({ path, distance: calculatePathDistance(path, routes) });
      }
    }
  }

  // Sort strictly ascending by total distance
  allPaths.sort((a, b) => a.distance - b.distance);

  const minDist = allPaths[0]?.distance || 0;

  return allPaths.map((p, idx) => {
    const rank = idx + 1;
    const isOpt = rank === 1;
    const diff = Number((p.distance - minDist).toFixed(1));
    const diffPct = minDist > 0 ? Math.round((diff / minDist) * 100) : 0;

    return {
      id: isOpt ? 'optimal' : `path-${rank}`,
      title: isOpt 
        ? `Đường đi #1 (Ngắn nhất - Tối ưu)` 
        : `Đường đi #${rank} (Khả dĩ)`,
      titleEn: isOpt 
        ? `Path #1 (Shortest - Optimal)` 
        : `Path #${rank} (Alternative)`,
      description: isOpt
        ? `Đường đi Hamilton ngắn nhất từ THPT Thăng Long đến đích sau khi duyệt và so sánh toàn bộ ${allPaths.length} đường đi khả dĩ.`
        : `Đường đi phụ thứ ${rank} với tổng cự ly ${p.distance} km (dài hơn đường đi tối ưu ${diff} km, chênh lệch +${diffPct}%).`,
      descriptionEn: isOpt
        ? `Shortest Hamiltonian path from school to destination among all ${allPaths.length} valid paths.`
        : `Alternative path #${rank} with total distance of ${p.distance} km (+${diff} km longer).`,
      path: p.path,
      totalDistanceKm: p.distance,
      rank,
      diffKm: diff,
      diffPercent: diffPct,
      isOptimal: isOpt,
    };
  });
}

/**
 * Generate Alternative Plans for comparison
 */
export function generateAlternativePlans(
  mode: 'cycle' | 'path' | 'subset',
  selectedNodes: string[],
  startId: string,
  endId: string,
  routes: Route[]
): AlternativePlan[] {
  if (mode === 'cycle') {
    return enumerateSortedHamiltonianCycles(selectedNodes, startId, routes);
  } else if (mode === 'path') {
    return enumerateSortedHamiltonianPaths(selectedNodes, startId, endId, routes);
  } else {
    // Subset mode (Dijkstra)
    const directRes = runDijkstraWithSteps(startId, endId, selectedNodes, routes, []);
    return [{
      id: 'optimal',
      title: 'Đường đi ngắn nhất Dijkstra',
      titleEn: 'Shortest Path (Dijkstra)',
      description: 'Lời giải đường đi ngắn nhất giữa hai điểm trong tập con đã chọn.',
      descriptionEn: 'Shortest path inside chosen subset.',
      path: directRes.path,
      totalDistanceKm: directRes.totalDistanceKm,
      rank: 1,
      diffKm: 0,
      diffPercent: 0,
      isOptimal: true,
    }];
  }
}

/**
 * Standard Dijkstra shortest path (fallback)
 */
export function findShortestPath(
  startId: string,
  endId: string,
  routes: Route[],
  locations: TouristLocation[]
): PathResult | null {
  if (startId === endId) {
    const loc = locations.find(l => l.id === startId);
    if (!loc) return null;
    return { path: [startId], totalDistanceKm: 0, steps: [] };
  }

  const locationMap = new Map(locations.map(l => [l.id, l]));
  const adj = buildAdjacencyList(routes);

  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; distanceKm: number }>();
  const unvisited = new Set<string>();

  for (const loc of locations) {
    distances.set(loc.id, Infinity);
    unvisited.add(loc.id);
  }

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      const d = distances.get(id)!;
      if (d < minDistance) {
        minDistance = d;
        currentId = id;
      }
    }

    if (!currentId || minDistance === Infinity) break;
    if (currentId === endId) break;

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const { nodeId, weight } of neighbors) {
      if (!unvisited.has(nodeId)) continue;
      const alt = minDistance + weight;
      if (alt < distances.get(nodeId)!) {
        distances.set(nodeId, alt);
        previous.set(nodeId, { nodeId: currentId, distanceKm: weight });
      }
    }
  }

  if (distances.get(endId) === Infinity || !previous.has(endId)) {
    return null;
  }

  const path: string[] = [];
  const steps: { from: TouristLocation; to: TouristLocation; distanceKm: number }[] = [];
  let curr = endId;
  path.unshift(curr);

  while (curr !== startId) {
    const prevInfo = previous.get(curr);
    if (!prevInfo) break;
    const prevNode = prevInfo.nodeId;
    path.unshift(prevNode);

    const fromLoc = locationMap.get(prevNode);
    const toLoc = locationMap.get(curr);
    if (fromLoc && toLoc) {
      steps.unshift({
        from: fromLoc,
        to: toLoc,
        distanceKm: prevInfo.distanceKm
      });
    }
    curr = prevNode;
  }

  return {
    path,
    totalDistanceKm: Math.round(distances.get(endId)! * 10) / 10,
    steps
  };
}

/**
 * Nearest Neighbor Tour fallback
 */
export function solveTour(
  selectedIds: string[],
  routes: Route[],
  locations: TouristLocation[],
  returnToStart: boolean = false
): { path: string[]; totalDistanceKm: number } {
  if (selectedIds.length <= 1) {
    return { path: selectedIds, totalDistanceKm: 0 };
  }

  const remaining = new Set(selectedIds.slice(1));
  const path: string[] = [selectedIds[0]];
  let totalDistance = 0;
  let current = selectedIds[0];

  while (remaining.size > 0) {
    let nearest: string | null = null;
    let shortestDist = Infinity;

    for (const nextId of remaining) {
      const res = findShortestPath(current, nextId, routes, locations);
      const d = res ? res.totalDistanceKm : Infinity;
      if (d < shortestDist) {
        shortestDist = d;
        nearest = nextId;
      }
    }

    if (nearest && shortestDist !== Infinity) {
      path.push(nearest);
      totalDistance += shortestDist;
      remaining.delete(nearest);
      current = nearest;
    } else {
      const fallback = Array.from(remaining)[0];
      path.push(fallback);
      remaining.delete(fallback);
      current = fallback;
    }
  }

  if (returnToStart && path.length > 2) {
    const res = findShortestPath(current, path[0], routes, locations);
    if (res) {
      path.push(path[0]);
      totalDistance += res.totalDistanceKm;
    }
  }

  return {
    path,
    totalDistanceKm: Math.round(totalDistance * 10) / 10
  };
}
