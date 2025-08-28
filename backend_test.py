#!/usr/bin/env python3
"""
Backend API Testing for Catalog Hub Angular Application
Tests the dummyjson.com API endpoints used by the application
"""

import requests
import sys
from datetime import datetime

class CatalogHubAPITester:
    def __init__(self, base_url="https://dummyjson.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Print some response data for verification
                if method == 'GET' and 'products' in endpoint:
                    try:
                        json_data = response.json()
                        if 'products' in json_data:
                            print(f"   📦 Found {len(json_data['products'])} products")
                        elif isinstance(json_data, list):
                            print(f"   📦 Found {len(json_data)} categories")
                    except:
                        pass
                        
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_products(self):
        """Test getting all products"""
        return self.run_test(
            "Get All Products",
            "GET",
            "products?limit=100",
            200
        )

    def test_search_products(self):
        """Test product search"""
        return self.run_test(
            "Search Products",
            "GET",
            "products/search?q=phone",
            200
        )

    def test_get_single_product(self):
        """Test getting a single product"""
        return self.run_test(
            "Get Single Product",
            "GET",
            "products/1",
            200
        )

    def test_get_categories(self):
        """Test getting product categories"""
        return self.run_test(
            "Get Categories",
            "GET",
            "products/categories",
            200
        )

    def test_create_product(self):
        """Test creating a new product"""
        test_product = {
            "title": "Test Product",
            "description": "This is a test product for the catalog hub application",
            "price": 99.99,
            "stock": 10,
            "category": "electronics",
            "brand": "TestBrand"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products/add",
            201,
            data=test_product
        )
        
        return response.get('id') if success else None

    def test_update_product(self, product_id=1):
        """Test updating a product"""
        update_data = {
            "title": "Updated Test Product",
            "description": "This is an updated test product description",
            "price": 149.99,
            "stock": 5,
            "category": "electronics",
            "brand": "UpdatedBrand"
        }
        
        return self.run_test(
            "Update Product",
            "PUT",
            f"products/{product_id}",
            200,
            data=update_data
        )

    def test_delete_product(self, product_id=1):
        """Test deleting a product"""
        return self.run_test(
            "Delete Product",
            "DELETE",
            f"products/{product_id}",
            200
        )

def main():
    print("🚀 Starting Catalog Hub API Tests...")
    print("=" * 50)
    
    # Setup
    tester = CatalogHubAPITester()
    
    # Run core API tests
    print("\n📋 Testing Core API Endpoints:")
    
    # Test basic product operations
    tester.test_get_products()
    tester.test_search_products()
    tester.test_get_single_product()
    tester.test_get_categories()
    
    print("\n🔧 Testing CRUD Operations:")
    
    # Test CRUD operations
    new_product_id = tester.test_create_product()
    tester.test_update_product()
    tester.test_delete_product()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed! The backend endpoints are working correctly.")
        return 0
    else:
        print("⚠️  Some API tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())