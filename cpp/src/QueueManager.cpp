#include "../include/QueueManager.h"
#include <iostream>

// Most of QueueManager is templated/header-only (see QueueManager.h).
// This file demonstrates standalone usage and can be linked/tested independently.

void demoQueueManager() {
    QueueManager qm;
    qm.addCounter({1, "Alice", 5, 20.0});
    qm.addCounter({2, "Bob", 2, 25.0});
    qm.addCounter({3, "Charlie", 8, 15.0});

    std::cout << "\n--- Checkout Counters (sorted by wait time) ---\n";
    for (const auto& c : qm.getAllCounters()) {
        std::cout << "Counter " << c.counterId << " (" << c.cashierName << ") "
                  << "| Queue: " << c.queueLength
                  << " | Est. wait: " << c.priority() << "s\n";
    }

    CheckoutCounter best = qm.recommendFastestCounter();
    std::cout << "\nRecommended Counter: " << best.counterId
              << " (" << best.cashierName << ")\n";
}
