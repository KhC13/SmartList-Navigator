#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <unordered_map>
#include <string>
#include <queue>
#include <limits>

// Represents a weighted edge between two aisles/nodes in the store
struct Edge {
    int to;
    double weight;
    Edge(int to, double weight) : to(to), weight(weight) {}
};

// Graph class -> demonstrates ENCAPSULATION (adjacency list is private)
// Implemented manually using STL vector + unordered_map (acts as our HashMap)
class Graph {
private:
    int numNodes;
    std::unordered_map<int, std::vector<Edge>> adjList; // custom HashMap-like structure

public:
    Graph(int numNodes = 0);

    void addNode(int nodeId);
    void addEdge(int u, int v, double weight, bool bidirectional = true);

    int getNumNodes() const;
    const std::vector<Edge>& getNeighbors(int node) const;
    bool hasNode(int node) const;

    // BFS traversal (demonstrates Queue usage)
    std::vector<int> bfs(int start) const;

    void printGraph() const;
};

#endif // GRAPH_H
