#include "../include/RoutePlanner.h"
#include <unordered_map>
#include <queue>
#include <algorithm>

RoutePlanner::RoutePlanner(const Graph& graph) : storeGraph(graph) {}

RouteResult RoutePlanner::shortestPath(int start, int target) const {
    std::unordered_map<int, double> dist;
    std::unordered_map<int, int> prevNode;

    // min-heap of (distance, node) -> classic Dijkstra with priority queue
    typedef std::pair<double, int> PDI;
    std::priority_queue<PDI, std::vector<PDI>, std::greater<PDI>> pq;

    dist[start] = 0.0;
    pq.push({0.0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (dist.count(u) && d > dist[u]) continue; // stale entry

        if (u == target) break;

        for (const Edge& e : storeGraph.getNeighbors(u)) {
            double newDist = d + e.weight;
            if (!dist.count(e.to) || newDist < dist[e.to]) {
                dist[e.to] = newDist;
                prevNode[e.to] = u;
                pq.push({newDist, e.to});
            }
        }
    }

    RouteResult result;
    if (!dist.count(target)) {
        result.totalDistance = -1; // unreachable
        return result;
    }

    result.totalDistance = dist[target];

    // Reconstruct path by walking back through prevNode
    std::vector<int> path;
    int curr = target;
    path.push_back(curr);
    while (curr != start) {
        curr = prevNode[curr];
        path.push_back(curr);
    }
    std::reverse(path.begin(), path.end());
    result.path = path;
    return result;
}

RouteResult RoutePlanner::shortestRouteForStops(int start, const std::vector<int>& stops) const {
    RouteResult finalRoute;
    finalRoute.totalDistance = 0;
    finalRoute.path.push_back(start);

    std::vector<int> remaining = stops;
    int current = start;

    // Nearest-neighbor heuristic: repeatedly go to the closest unvisited stop
    while (!remaining.empty()) {
        double bestDist = std::numeric_limits<double>::max();
        int bestIdx = -1;
        RouteResult bestSegment;

        for (size_t i = 0; i < remaining.size(); i++) {
            RouteResult seg = shortestPath(current, remaining[i]);
            if (seg.totalDistance >= 0 && seg.totalDistance < bestDist) {
                bestDist = seg.totalDistance;
                bestIdx = (int)i;
                bestSegment = seg;
            }
        }

        if (bestIdx == -1) break; // no reachable stop left

        // Append segment (skip first node since it's already in path)
        for (size_t i = 1; i < bestSegment.path.size(); i++) {
            finalRoute.path.push_back(bestSegment.path[i]);
        }
        finalRoute.totalDistance += bestSegment.totalDistance;
        current = remaining[bestIdx];
        remaining.erase(remaining.begin() + bestIdx);
    }

    return finalRoute;
}

// Binary Search -> DSA requirement, used to quickly locate an aisle
// in a pre-sorted list of aisle IDs (O(log n))
int RoutePlanner::binarySearchAisle(const std::vector<int>& sortedAisles, int target) {
    int lo = 0, hi = (int)sortedAisles.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (sortedAisles[mid] == target) return mid;
        else if (sortedAisles[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; // not found
}
