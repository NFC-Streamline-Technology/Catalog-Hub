#!/usr/bin/env python3
"""
Frontend Testing for Catalog Hub Angular Application
Tests the frontend functionality using requests and basic HTML parsing
"""

import requests
import sys
import time
from datetime import datetime

class CatalogHubFrontendTester:
    def __init__(self, base_url="http://localhost:4200"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, test_func):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            success = test_func()
            if success:
                self.tests_passed += 1
                print(f"✅ Passed")
            else:
                print(f"❌ Failed")
            return success
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_app_loads(self):
        """Test if the main application loads"""
        try:
            response = requests.get(self.base_url, timeout=10)
            if response.status_code == 200:
                html_content = response.text
                
                # Check for essential Angular elements
                checks = [
                    ("HTML structure", "<!doctype html>" in html_content.lower()),
                    ("Angular app-root", "<app-root>" in html_content),
                    ("Title", "Catalog Hub" in html_content),
                    ("CSS styles", "styles.css" in html_content),
                    ("Main JS", "main.js" in html_content),
                    ("Runtime JS", "runtime.js" in html_content),
                    ("Vendor JS", "vendor.js" in html_content),
                    ("Polyfills JS", "polyfills.js" in html_content)
                ]
                
                for check_name, check_result in checks:
                    status = "✅" if check_result else "❌"
                    print(f"   {status} {check_name}")
                
                return all(check[1] for check in checks)
            else:
                print(f"   HTTP Status: {response.status_code}")
                return False
        except Exception as e:
            print(f"   Error: {str(e)}")
            return False

    def test_static_assets(self):
        """Test if static assets are accessible"""
        assets_to_test = [
            "/main.js",
            "/runtime.js", 
            "/polyfills.js",
            "/vendor.js",
            "/styles.css",
            "/assets/i18n/pt-BR.json",
            "/assets/i18n/en-US.json",
            "/assets/i18n/es-ES.json"
        ]
        
        success_count = 0
        for asset in assets_to_test:
            try:
                response = requests.get(f"{self.base_url}{asset}", timeout=5)
                if response.status_code == 200:
                    print(f"   ✅ {asset}")
                    success_count += 1
                else:
                    print(f"   ❌ {asset} - Status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {asset} - Error: {str(e)}")
        
        return success_count == len(assets_to_test)

    def test_api_connectivity(self):
        """Test if the app can connect to the DummyJSON API"""
        api_endpoints = [
            "https://dummyjson.com/products?limit=5",
            "https://dummyjson.com/products/categories"
        ]
        
        success_count = 0
        for endpoint in api_endpoints:
            try:
                response = requests.get(endpoint, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if endpoint.endswith("categories"):
                        print(f"   ✅ Categories API - {len(data)} categories")
                    else:
                        print(f"   ✅ Products API - {len(data.get('products', []))} products")
                    success_count += 1
                else:
                    print(f"   ❌ {endpoint} - Status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {endpoint} - Error: {str(e)}")
        
        return success_count == len(api_endpoints)

    def test_javascript_files(self):
        """Test if JavaScript files contain expected Angular code"""
        js_files = ["/main.js", "/vendor.js"]
        
        success_count = 0
        for js_file in js_files:
            try:
                response = requests.get(f"{self.base_url}{js_file}", timeout=10)
                if response.status_code == 200:
                    content = response.text
                    
                    # Check for Angular-specific content
                    if js_file == "/main.js":
                        angular_indicators = [
                            "AppComponent" in content,
                            "ProductsComponent" in content or "products" in content,
                            "angular" in content.lower()
                        ]
                        if any(angular_indicators):
                            print(f"   ✅ {js_file} contains Angular components")
                            success_count += 1
                        else:
                            print(f"   ❌ {js_file} missing Angular components")
                    elif js_file == "/vendor.js":
                        vendor_indicators = [
                            "@angular" in content,
                            "rxjs" in content,
                            "zone.js" in content
                        ]
                        if any(vendor_indicators):
                            print(f"   ✅ {js_file} contains Angular dependencies")
                            success_count += 1
                        else:
                            print(f"   ❌ {js_file} missing Angular dependencies")
                else:
                    print(f"   ❌ {js_file} - Status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {js_file} - Error: {str(e)}")
        
        return success_count == len(js_files)

    def test_translation_files(self):
        """Test if translation files are properly formatted"""
        translation_files = [
            "/assets/i18n/pt-BR.json",
            "/assets/i18n/en-US.json", 
            "/assets/i18n/es-ES.json"
        ]
        
        success_count = 0
        for trans_file in translation_files:
            try:
                response = requests.get(f"{self.base_url}{trans_file}", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for expected translation structure
                    required_keys = ["generic", "pages"]
                    if all(key in data for key in required_keys):
                        if "products" in data.get("pages", {}):
                            print(f"   ✅ {trans_file} - Valid structure")
                            success_count += 1
                        else:
                            print(f"   ❌ {trans_file} - Missing products translations")
                    else:
                        print(f"   ❌ {trans_file} - Invalid structure")
                else:
                    print(f"   ❌ {trans_file} - Status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {trans_file} - Error: {str(e)}")
        
        return success_count == len(translation_files)

def main():
    print("🚀 Starting Catalog Hub Frontend Tests...")
    print("=" * 50)
    
    # Setup
    tester = CatalogHubFrontendTester()
    
    # Run frontend tests
    print("\n📋 Testing Frontend Application:")
    
    tester.run_test("Application Loads", tester.test_app_loads)
    tester.run_test("Static Assets", tester.test_static_assets)
    tester.run_test("JavaScript Files", tester.test_javascript_files)
    tester.run_test("Translation Files", tester.test_translation_files)
    tester.run_test("API Connectivity", tester.test_api_connectivity)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All frontend tests passed! The application should be working correctly.")
        print("\n📝 Manual Testing Recommendations:")
        print("   1. Open http://localhost:4200 in a browser")
        print("   2. Verify products load from DummyJSON API")
        print("   3. Test search functionality")
        print("   4. Test language switching")
        print("   5. Test CRUD operations (Create, Edit, Delete)")
        print("   6. Test form validation")
        print("   7. Test responsive design on different screen sizes")
        return 0
    else:
        print("⚠️  Some frontend tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())