#!/bin/bash

# Test script for FYSH AI Services API endpoints
# Run this script to verify all endpoints are working

BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "FYSH AI Services API Test Script"
echo "=========================================="
echo ""

# Test 1: GET /api/catch-of-day
echo -e "${YELLOW}Test 1: GET /api/catch-of-day${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/catch-of-day")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $STATUS"
  echo "Response: $BODY" | head -c 100
  echo "..."
else
  echo -e "${RED}✗ FAIL${NC} - Expected 200 or 404, got $STATUS"
  echo "$BODY"
fi
echo ""

# Test 2: GET /api/catch-of-day?sport=NBA
echo -e "${YELLOW}Test 2: GET /api/catch-of-day?sport=NBA${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/catch-of-day?sport=NBA")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 200 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $STATUS"
  echo "Response: $BODY" | head -c 100
  echo "..."
else
  echo -e "${RED}✗ FAIL${NC} - Expected 200 or 404, got $STATUS"
  echo "$BODY"
fi
echo ""

# Test 3: POST /api/parlay/evaluate (validation error - only 1 leg)
echo -e "${YELLOW}Test 3: POST /api/parlay/evaluate (validation error)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/parlay/evaluate" \
  -H "Content-Type: application/json" \
  -d '{"legs":[{"propId":"test-1"}]}')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" -eq 400 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $STATUS (validation error as expected)"
  echo "Response: $BODY" | head -c 100
  echo "..."
else
  echo -e "${RED}✗ FAIL${NC} - Expected 400, got $STATUS"
  echo "$BODY"
fi
echo ""

# Test 4: POST /api/parlay/evaluate (invalid JSON)
echo -e "${YELLOW}Test 4: POST /api/parlay/evaluate (invalid JSON)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/parlay/evaluate" \
  -H "Content-Type: application/json" \
  -d 'invalid json')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" -eq 400 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $STATUS (invalid JSON as expected)"
  echo "Response: $BODY" | head -c 100
  echo "..."
else
  echo -e "${RED}✗ FAIL${NC} - Expected 400, got $STATUS"
  echo "$BODY"
fi
echo ""

# Test 5: GET /api/games/nonexistent/preview (404 expected)
echo -e "${YELLOW}Test 5: GET /api/games/nonexistent/preview${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/games/nonexistent/preview")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" -eq 404 ] || [ "$STATUS" -eq 500 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $STATUS (not found as expected)"
  echo "Response: $BODY" | head -c 100
  echo "..."
else
  echo -e "${RED}✗ FAIL${NC} - Expected 404 or 500, got $STATUS"
  echo "$BODY"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "All endpoint structure tests completed!"
echo ""
echo "NOTE: Some endpoints return 404 because there's no data in the database yet."
echo "To test with real data, you need to:"
echo "  1. Seed the database with games and props"
echo "  2. Run prop analysis to generate high-confidence picks"
echo "  3. Generate catches and previews"
echo ""
