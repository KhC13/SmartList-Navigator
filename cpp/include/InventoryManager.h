#ifndef INVENTORY_MANAGER_H
#define INVENTORY_MANAGER_H

#include "Product.h"
#include <unordered_map>
#include <vector>
#include <memory>
#include <string>

// InventoryManager -> demonstrates ENCAPSULATION + COMPOSITION
// Internally uses an unordered_map (HashMap) keyed by product id for O(1) average lookup.
// Holds Product objects via smart pointers (composition, ownership).
class InventoryManager {
private:
    std::unordered_map<std::string, std::shared_ptr<Product>> productMap; // custom HashMap usage

public:
    void addProduct(const std::shared_ptr<Product>& product);
    bool deleteProduct(const std::string& id);
    bool updateStock(const std::string& id, int newStock);
    std::shared_ptr<Product> searchProduct(const std::string& id) const;

    // Linear search by name (used to demonstrate contrast vs hashmap O(1) lookup)
    std::vector<std::shared_ptr<Product>> searchByName(const std::string& name) const;

    std::vector<std::shared_ptr<Product>> getAllProducts() const;
    int totalProducts() const;

    void printInventory() const;
};

#endif // INVENTORY_MANAGER_H
