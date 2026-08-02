#include "../include/Product.h"
#include "../include/Graph.h"
#include "../include/RoutePlanner.h"
#include "../include/InventoryManager.h"
#include "../include/QueueManager.h"
#include <iostream>
#include <memory>

// forward declaration from QueueManager.cpp
void demoQueueManager();

int main() {
    std::cout << "========================================\n";
    std::cout << "   SmartStore Navigator - C++ DSA Demo\n";
    std::cout << "========================================\n";

    // ---------------- OOP Demo: Product hierarchy ----------------
    std::cout << "\n--- Product / Inheritance / Polymorphism Demo ---\n";
    InventoryManager inventory;

    inventory.addProduct(std::make_shared<Product>("P1", "Milk", 2.5, 40, 1, "dairy"));
    inventory.addProduct(std::make_shared<Product>("P2", "Bread", 1.5, 25, 2, "bakery"));
    inventory.addProduct(std::make_shared<DiscountedProduct>("P3", "Shampoo", 8.0, 15, 3, 20.0, "personal care"));
    inventory.addProduct(std::make_shared<Product>("P4", "Rice 5kg", 6.0, 30, 4, "grocery"));
    inventory.addProduct(std::make_shared<Product>("P5", "Eggs (12)", 3.2, 50, 5, "dairy"));

    inventory.printInventory();

    // Polymorphic call via base class pointer
    Item* item = new DiscountedProduct("P6", "Toothpaste", 4.0, 20, 6, 10.0);
    item->display();
    delete item;

    // ---------------- Graph + Dijkstra Demo ----------------
    std::cout << "\n--- Store Layout Graph + Dijkstra Route Planner ---\n";
    Graph storeGraph;
    // Nodes represent aisles 0 (entrance) .. 6
    storeGraph.addEdge(0, 1, 4);
    storeGraph.addEdge(0, 2, 2);
    storeGraph.addEdge(1, 2, 1);
    storeGraph.addEdge(1, 3, 5);
    storeGraph.addEdge(2, 3, 8);
    storeGraph.addEdge(2, 4, 10);
    storeGraph.addEdge(3, 4, 2);
    storeGraph.addEdge(3, 5, 6);
    storeGraph.addEdge(4, 5, 3);
    storeGraph.addEdge(5, 6, 1);
    storeGraph.addEdge(4, 6, 5);

    storeGraph.printGraph();

    RoutePlanner planner(storeGraph);
    std::vector<int> stopsToVisit = {1, 4, 5}; // aisles for Milk, Rice, Eggs
    RouteResult route = planner.shortestRouteForStops(0, stopsToVisit);

    std::cout << "\nOptimal shopping route from entrance (0): ";
    for (int node : route.path) std::cout << node << " -> ";
    std::cout << "END\n";
    std::cout << "Total distance: " << route.totalDistance << "\n";

    // BFS demo
    std::cout << "\nBFS traversal from node 0: ";
    for (int n : storeGraph.bfs(0)) std::cout << n << " ";
    std::cout << "\n";

    // Binary search demo
    std::vector<int> sortedAisles = {0, 1, 2, 3, 4, 5, 6};
    int idx = RoutePlanner::binarySearchAisle(sortedAisles, 4);
    std::cout << "Binary search for aisle 4 -> index " << idx << "\n";

    // ---------------- Queue / Priority Queue Demo ----------------
    demoQueueManager();

    std::cout << "\n========================================\n";
    std::cout << "   Demo complete.\n";
    std::cout << "========================================\n";
    return 0;
}
