// engine_cli.cpp
// Thin CLI wrapper so the Node.js backend can invoke the real C++
// Graph / RoutePlanner / QueueManager classes as a child process and
// get JSON back. This keeps ALL DSA logic (Dijkstra, Queue, Priority
// Queue/Heap, HashMap-based lookups) implemented purely in C++, while
// Node.js only orchestrates the call and MongoDB/HTTP layer.
//
// Usage:
//   route_engine route <start> <edgeCount> <u v w>... <stopCount> <s1 s2 ...>
//   route_engine queue <counterCount> <id name queueLen avgServiceTime>...
//
// Output: a single line of hand-built JSON on stdout.

#include "../include/Graph.h"
#include "../include/RoutePlanner.h"
#include "../include/QueueManager.h"
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

static std::string jsonEscape(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"' || c == '\\') out += '\\';
        out += c;
    }
    return out;
}

int runRoute(int argc, char** argv) {
    int idx = 2;
    int start = std::stoi(argv[idx++]);
    int edgeCount = std::stoi(argv[idx++]);

    Graph storeGraph;
    for (int i = 0; i < edgeCount; i++) {
        int u = std::stoi(argv[idx++]);
        int v = std::stoi(argv[idx++]);
        double w = std::stod(argv[idx++]);
        storeGraph.addEdge(u, v, w);
    }

    int stopCount = std::stoi(argv[idx++]);
    std::vector<int> stops;
    for (int i = 0; i < stopCount; i++) {
        stops.push_back(std::stoi(argv[idx++]));
    }

    RoutePlanner planner(storeGraph);
    RouteResult result = planner.shortestRouteForStops(start, stops);

    std::ostringstream out;
    out << "{\"path\":[";
    for (size_t i = 0; i < result.path.size(); i++) {
        out << result.path[i];
        if (i + 1 < result.path.size()) out << ",";
    }
    out << "],\"distance\":" << result.totalDistance << "}";
    std::cout << out.str() << std::endl;
    return 0;
}

int runQueue(int argc, char** argv) {
    int idx = 2;
    int counterCount = std::stoi(argv[idx++]);

    QueueManager qm;
    for (int i = 0; i < counterCount; i++) {
        int id = std::stoi(argv[idx++]);
        std::string name = argv[idx++];
        int qLen = std::stoi(argv[idx++]);
        double avgTime = std::stod(argv[idx++]);
        qm.addCounter({id, name, qLen, avgTime});
    }

    auto sorted = qm.getAllCounters();

    std::ostringstream out;
    out << "{\"counters\":[";
    for (size_t i = 0; i < sorted.size(); i++) {
        const auto& c = sorted[i];
        out << "{\"counterId\":" << c.counterId
            << ",\"cashierName\":\"" << jsonEscape(c.cashierName) << "\""
            << ",\"queueLength\":" << c.queueLength
            << ",\"avgServiceTime\":" << c.avgServiceTime
            << ",\"estimatedWait\":" << c.priority() << "}";
        if (i + 1 < sorted.size()) out << ",";
    }
    out << "]";
    if (!sorted.empty()) {
        out << ",\"recommended\":" << sorted[0].counterId;
    }
    out << "}";
    std::cout << out.str() << std::endl;
    return 0;
}

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cout << "{\"error\":\"no command provided\"}" << std::endl;
        return 1;
    }

    std::string command = argv[1];
    try {
        if (command == "route") return runRoute(argc, argv);
        if (command == "queue") return runQueue(argc, argv);
    } catch (const std::exception& e) {
        std::cout << "{\"error\":\"" << jsonEscape(e.what()) << "\"}" << std::endl;
        return 1;
    }

    std::cout << "{\"error\":\"unknown command\"}" << std::endl;
    return 1;
}
