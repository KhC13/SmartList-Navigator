#ifndef QUEUE_MANAGER_H
#define QUEUE_MANAGER_H

#include <vector>
#include <string>
#include <stdexcept>
#include <algorithm>

// ------------------------------------------------------------------
// Generic Queue implemented manually using std::vector as backing store
// (FIFO) -> demonstrates custom DSA implementation (not std::queue)
// ------------------------------------------------------------------
template <typename T>
class Queue {
private:
    std::vector<T> data;
    size_t frontIndex = 0;

public:
    void enqueue(const T& value) {
        data.push_back(value);
    }

    T dequeue() {
        if (isEmpty()) throw std::runtime_error("Queue is empty");
        T val = data[frontIndex];
        frontIndex++;
        // Reclaim space occasionally to avoid unbounded growth
        if (frontIndex > 64 && frontIndex * 2 > data.size()) {
            data.erase(data.begin(), data.begin() + frontIndex);
            frontIndex = 0;
        }
        return val;
    }

    bool isEmpty() const {
        return frontIndex >= data.size();
    }

    size_t size() const {
        return data.size() - frontIndex;
    }

    T peek() const {
        if (isEmpty()) throw std::runtime_error("Queue is empty");
        return data[frontIndex];
    }
};

// ------------------------------------------------------------------
// Manual Min Binary Heap based Priority Queue
// Lower "priority" value = served first (e.g. fewer items in cart => faster)
// ------------------------------------------------------------------
struct CheckoutCounter {
    int counterId;
    std::string cashierName;
    int queueLength;   // number of customers waiting
    double avgServiceTime; // seconds per customer

    // Priority score: lower is better (recommended first)
    double priority() const {
        return queueLength * avgServiceTime;
    }
};

class PriorityQueue {
private:
    std::vector<CheckoutCounter> heap;

    int parent(int i) { return (i - 1) / 2; }
    int leftChild(int i) { return 2 * i + 1; }
    int rightChild(int i) { return 2 * i + 2; }

    void heapifyUp(int i) {
        while (i > 0 && heap[parent(i)].priority() > heap[i].priority()) {
            std::swap(heap[parent(i)], heap[i]);
            i = parent(i);
        }
    }

    void heapifyDown(int i) {
        int smallest = i;
        int l = leftChild(i), r = rightChild(i);

        if (l < (int)heap.size() && heap[l].priority() < heap[smallest].priority())
            smallest = l;
        if (r < (int)heap.size() && heap[r].priority() < heap[smallest].priority())
            smallest = r;

        if (smallest != i) {
            std::swap(heap[i], heap[smallest]);
            heapifyDown(smallest);
        }
    }

public:
    void insert(const CheckoutCounter& counter) {
        heap.push_back(counter);
        heapifyUp((int)heap.size() - 1);
    }

    CheckoutCounter extractMin() {
        if (heap.empty()) throw std::runtime_error("PriorityQueue is empty");
        CheckoutCounter top = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) heapifyDown(0);
        return top;
    }

    CheckoutCounter peekMin() const {
        if (heap.empty()) throw std::runtime_error("PriorityQueue is empty");
        return heap[0];
    }

    bool isEmpty() const { return heap.empty(); }
    size_t size() const { return heap.size(); }

    std::vector<CheckoutCounter> getAllSorted() const {
        std::vector<CheckoutCounter> copy = heap;
        std::sort(copy.begin(), copy.end(), [](const CheckoutCounter& a, const CheckoutCounter& b) {
            return a.priority() < b.priority();
        });
        return copy;
    }
};

// ------------------------------------------------------------------
// QueueManager -> manages multiple checkout counters, recommends fastest
// Demonstrates COMPOSITION (has-a PriorityQueue)
// ------------------------------------------------------------------
class QueueManager {
private:
    PriorityQueue counterQueue; // composition

public:
    void addCounter(const CheckoutCounter& counter) {
        counterQueue.insert(counter);
    }

    CheckoutCounter recommendFastestCounter() {
        return counterQueue.peekMin();
    }

    std::vector<CheckoutCounter> getAllCounters() const {
        return counterQueue.getAllSorted();
    }

    bool isEmpty() const { return counterQueue.isEmpty(); }
};

#endif // QUEUE_MANAGER_H
