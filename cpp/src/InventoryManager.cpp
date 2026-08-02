#include "../include/InventoryManager.h"
#include <iostream>
#include <algorithm>

void InventoryManager::addProduct(const std::shared_ptr<Product>& product) {
    productMap[product->getId()] = product;
}

bool InventoryManager::deleteProduct(const std::string& id) {
    return productMap.erase(id) > 0;
}

bool InventoryManager::updateStock(const std::string& id, int newStock) {
    auto it = productMap.find(id);
    if (it == productMap.end()) return false;
    it->second->setStock(newStock);
    return true;
}

std::shared_ptr<Product> InventoryManager::searchProduct(const std::string& id) const {
    auto it = productMap.find(id); // O(1) average -> HashMap lookup
    if (it == productMap.end()) return nullptr;
    return it->second;
}

std::vector<std::shared_ptr<Product>> InventoryManager::searchByName(const std::string& name) const {
    std::vector<std::shared_ptr<Product>> results;
    for (const auto& pair : productMap) {
        std::string lowerName = pair.second->getName();
        std::string lowerQuery = name;
        std::transform(lowerName.begin(), lowerName.end(), lowerName.begin(), ::tolower);
        std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);
        if (lowerName.find(lowerQuery) != std::string::npos) {
            results.push_back(pair.second);
        }
    }
    return results;
}

std::vector<std::shared_ptr<Product>> InventoryManager::getAllProducts() const {
    std::vector<std::shared_ptr<Product>> all;
    for (const auto& pair : productMap) all.push_back(pair.second);
    return all;
}

int InventoryManager::totalProducts() const {
    return (int)productMap.size();
}

void InventoryManager::printInventory() const {
    std::cout << "\n--- Current Inventory (" << totalProducts() << " products) ---\n";
    for (const auto& pair : productMap) {
        pair.second->display();
    }
}
