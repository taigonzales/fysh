# FYSH AI Services - Quick Start Guide

## 🚀 Dev Server

The dev server is running on **http://localhost:3001**

```bash
# Start dev server (if not running)
npm run dev

# Run tests
npm test

# Test AI services specifically
npm test -- catch-of-day
npm test -- game-preview
npm test -- parlay-evaluator
```

---

## 📡 API Endpoints (Ready to Use)

### Catch of the Day 🎣
```bash
# Get today's catch
curl http://localhost:3001/api/catch-of-day

# Get catch for NBA
curl http://localhost:3001/api/catch-of-day?sport=NBA

# Generate new catch
curl -X POST http://localhost:3001/api/catch-of-day/generate \
  -H "Content-Type: application/json" \
  -d '{"sport":"NBA"}'

# Batch generate (all sports)
curl -X POST http://localhost:3001/api/catch-of-day/batch
```

### Game Preview 🏀
```bash
# Get game preview
curl http://localhost:3001/api/games/GAME_ID/preview

# Generate game preview
curl -X POST http://localhost:3001/api/games/GAME_ID/preview

# Batch generate (next 48 hours)
curl -X POST http://localhost:3001/api/games/preview/batch \
  -H "Content-Type: application/json" \
  -d '{"sport":"NBA","hoursAhead":24}'
```

### Parlay Evaluator 🎲
```bash
# Evaluate a parlay
curl -X POST http://localhost:3001/api/parlay/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {"propId": "PROP_ID_1"},
      {"propId": "PROP_ID_2"}
    ]
  }'
```

---

## 🧪 Test Endpoints

```bash
# Run the test script
bash scripts/test-ai-endpoints.sh
```

---

## 📂 Import Services in Code

```typescript
// Import all services
import {
  // Catch of the Day
  generateCatchOfTheDay,
  getTodaysCatch,
  selectCatchOfTheDay,
  batchGenerateDailyCatches,

  // Game Preview
  generateGamePreview,
  getGamePreview,
  batchGenerateGamePreviews,

  // Parlay Evaluator
  evaluateParlay,

  // Types
  CatchOfTheDayResult,
  GamePreviewResult,
  ParlayEvaluationResult,
  ParlayLegInput,
} from '@/lib/services/ai';

// Example: Use in a React component
const catch_ = await getTodaysCatch('NBA');

// Example: Use in an API route
const evaluation = await evaluateParlay([
  { propId: 'prop-1' },
  { propId: 'prop-2' },
]);
```

---

## 📊 Database Setup (for testing with real data)

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema to database
npm run db:push

# 3. Seed database with test data
npm run db:seed
```

---

## 🎯 Next Steps

### 1. Test with Real Data
```bash
# After seeding database, generate catches
curl -X POST http://localhost:3001/api/catch-of-day/batch
```

### 2. Frontend Integration
Create components in `app/components/ai/`:
- `CatchOfTheDayCard.tsx`
- `GamePreviewModal.tsx`
- `ParlayEvaluator.tsx`

### 3. Set Up Cron Jobs (Production)
```bash
# Add to crontab
0 9 * * * curl -X POST https://fysh.bet/api/catch-of-day/batch
0 */6 * * * curl -X POST https://fysh.bet/api/games/preview/batch
```

---

## 📖 Documentation

- **Full API Docs**: `docs/API.md`
- **Implementation Summary**: `AI_SERVICES_IMPLEMENTATION.md`
- **Test Results**: Run `npm test` to see current status

---

## ✅ What's Working

- ✅ All three AI services implemented
- ✅ 6 unit tests passing
- ✅ 7 API endpoints live
- ✅ Error handling and validation
- ✅ Database integration
- ✅ Dev server running on localhost:3001

---

## 🔍 Debugging

```bash
# Check dev server logs
# (server is running in background task b65aa28)

# Test individual service
npm test -- catch-of-day.test.ts

# Check database
npx prisma studio
```

---

## 📞 Support

Issues? Check:
1. Dev server is running (should be on port 3001)
2. Database is accessible
3. Environment variables are set (`.env.local`)
4. Prisma client is generated (`npm run db:generate`)

---

**Ready to use! 🎉**

Dev Server: http://localhost:3001
API Base: http://localhost:3001/api
