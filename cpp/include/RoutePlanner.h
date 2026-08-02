#ifndef ROUTE_PLANNER_H
#define ROUTE_PLANNER_H

#include "Graph.h"
#include <vector>
#include <limits>

struct RouteResult {
    std::vector<int> path;
    double totalDistance;
};

// RoutePlanner -> demonstrates COMPOSITION (has-a Graph reference)
// and ABSTRACTION (hides Dijkstra's internal details behind a clean API)
class RoutePlanner {
private:
    const Graph& storeGraph;

public:
    explicit RoutePlanner(const Graph& graph);

    // Dijkstra's Algorithm: shortest path from start to a single target
    RouteResult shortestPath(int start, int target) const;

    // Computes the shortest overall route visiting ALL given stops
    // (nearest-neighbor heuristic built on top of repeated Dijkstra calls)
    RouteResult shortestRouteForStops(int start, const std::vector<int>& stops) const;

    // Binary search on a sorted array of aisle IDs -> DSA requirement
    static int binarySearchAisle(const std::vector<int>& sortedAisles, int target);
};

#endif // ROUTE_PLANNER_H
