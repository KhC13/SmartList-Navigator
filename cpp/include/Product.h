#ifndef PRODUCT_H
#define PRODUCT_H

#include <string>
#include <iostream>

// Abstract base class -> demonstrates ABSTRACTION
class Item {
protected:
    std::string id;
    std::string name;

public:
    Item(std::string id, std::string name) : id(id), name(name) {}
    virtual ~Item() {}

    std::string getId() const { return id; }
    std::string getName() const { return name; }

    // Pure virtual function -> forces derived classes to implement
    virtual void display() const = 0;
    virtual double getPrice() const = 0;
};

// Product inherits from Item -> demonstrates INHERITANCE
// Fields are private -> demonstrates ENCAPSULATION (accessed via getters/setters)
class Product : public Item {
private:
    double price;
    int stock;
    int aisle;          // aisle/node id in the store graph
    std::string category;

public:
    Product(std::string id, std::string name, double price, int stock,
            int aisle, std::string category = "general")
        : Item(id, name), price(price), stock(stock), aisle(aisle), category(category) {}

    // Getters (encapsulated access)
    double getPrice() const override { return price; }
    int getStock() const { return stock; }
    int getAisle() const { return aisle; }
    std::string getCategory() const { return category; }

    // Setters
    void setPrice(double p) { price = p; }
    void setStock(int s) { stock = s; }
    void addStock(int qty) { stock += qty; }
    bool removeStock(int qty) {
        if (qty > stock) return false;
        stock -= qty;
        return true;
    }

    // Polymorphism -> overriding virtual display()
    void display() const override {
        std::cout << "[" << id << "] " << name
                  << " | Price: " << price
                  << " | Stock: " << stock
                  << " | Aisle: " << aisle
                  << " | Category: " << category << std::endl;
    }
};

// Example of POLYMORPHISM: a discounted product overriding getPrice()
class DiscountedProduct : public Product {
private:
    double discountPercent;

public:
    DiscountedProduct(std::string id, std::string name, double price, int stock,
                       int aisle, double discountPercent, std::string category = "general")
        : Product(id, name, price, stock, aisle, category), discountPercent(discountPercent) {}

    double getPrice() const override {
        return Product::getPrice() * (1.0 - discountPercent / 100.0);
    }

    void display() const override {
        std::cout << "[DISCOUNTED] ";
        Product::display();
        std::cout << "  -> Final Price after " << discountPercent
                  << "% off: " << getPrice() << std::endl;
    }
};

#endif // PRODUCT_H
