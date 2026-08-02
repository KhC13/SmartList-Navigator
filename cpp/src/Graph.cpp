#include "../include/Graph.h"
#include "../include/QueueManager.h"
#include <iostream>

Graph::Graph(int numNodes) : numNodes(numNodes) {
    for (int i = 0; i < numNodes; i++) {
        adjList[i] = std::vector<Edge>();
    }
}

void Graph::addNode(int nodeId) {
    if (adjList.find(nodeId) == adjList.end()) {
        adjList[nodeId] = std::vector<Edge>();
        if (nodeId + 1 > numNodes) numNodes = nodeId + 1;
    }
}

void Graph::addEdge(int u, int v, double weight, bool bidirectional) {
    addNode(u);
    addNode(v);
    adjList[u].push_back(Edge(v, weight));
    if (bidirectional) {
        adjList[v].push_back(Edge(u, weight));
    }
}

int Graph::getNumNodes() const {
    return numNodes;
}

bool Graph::hasNode(int node) const {
    return adjList.find(node) != adjList.end();
}

const std::vector<Edge>& Graph::getNeighbors(int node) const {
    static const std::vector<Edge> empty;
    auto it = adjList.find(node);
    if (it == adjList.end()) return empty;
    return it->second;
}

// BFS using our custom QueueManager (Queue DSA demonstration)
std::vector<int> Graph::bfs(int start) const {
    std::vector<int> order;
    std::unordered_map<int, bool> visited;
    Queue<int> q;

    q.enqueue(start);
    visited[start] = true;

    while (!q.isEmpty()) {
        int curr = q.dequeue();
        order.push_back(curr);

        for (const Edge& e : getNeighbors(curr)) {
            if (!visited[e.to]) {
                visited[e.to] = true;
                q.enqueue(e.to);
            }
        }
    }
    return order;
}

void Graph::printGraph() const {
    for (const auto& pair : adjList) {
        std::cout << "Node " << pair.first << ": ";
        for (const Edge& e : pair.second) {
            std::cout << "(" << e.to << ", w=" << e.weight << ") ";
        }
        std::cout << std::endl;
    }
}
