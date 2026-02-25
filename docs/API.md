# FYSH AI Services API Documentation

All API endpoints return JSON with the following structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

---

## Catch of the Day

### GET /api/catch-of-day

Get today's featured catch.

**Query Parameters:**
- `sport` (optional): Filter by sport (`NBA`, `NFL`, `MLB`, `NHL`)

**Example Request:**
```bash
curl http://localhost:3001/api/catch-of-day?sport=NBA
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "catch-1234567890",
    "propId": "prop-abc123",
    "playerName": "LeBron James",
    "market": "Points",
    "line": 25.5,
    "verdict": "OVER",
    "confidence": "HIGH",
    "headline": "LeBron Over 25.5 Points - Lock It In",
    "summary": "Strong over play based on recent form...",
    "key_factors": ["Hot streak", "Favorable matchup"],
    "edge_estimate": "60%",
    "value_score": 85,
    "publishedAt": "2026-02-25T10:00:00Z",
    "expiresAt": "2026-02-26T07:59:59Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "No catch of the day available",
  "message": "No catch available for NBA today"
}
```

---

### POST /api/catch-of-day/generate

Generate a new catch of the day (admin/manual trigger).

**Request Body:**
```json
{
  "sport": "NBA"  // optional
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/catch-of-day/generate \
  -H "Content-Type: application/json" \
  -d '{"sport":"NBA"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "message": "Generated catch for NBA"
  }
}
```

---

### POST /api/catch-of-day/batch

Batch generate catches for all sports (cron job).

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/catch-of-day/batch
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "itemsProcessed": 3,
    "itemsSkipped": 1,
    "itemsFailed": 0,
    "errors": [],
    "duration": 15420
  },
  "meta": {
    "message": "Batch catch generation completed",
    "summary": {
      "processed": 3,
      "skipped": 1,
      "failed": 0,
      "duration": "15420ms"
    }
  }
}
```

---

## Game Preview

### GET /api/games/:id/preview

Get AI-generated preview for a specific game.

**Path Parameters:**
- `id`: Game ID

**Example Request:**
```bash
curl http://localhost:3001/api/games/game-123/preview
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "preview-1234567890",
    "gameId": "game-123",
    "headline": "Lakers vs Warriors: Battle for the West",
    "summary": "High-stakes matchup between conference rivals...",
    "key_storylines": [
      "LeBron return from injury",
      "Curry hot streak",
      "AD questionable with ankle injury"
    ],
    "injury_impact": "AD's absence could significantly impact Lakers' rebounding and interior defense",
    "betting_angles": [
      {
        "market": "Spread",
        "angle": "Take Warriors -5.5 with AD out",
        "confidence": "HIGH"
      }
    ],
    "value_plays": ["Warriors ML", "Under 225.5"],
    "publishedAt": "2026-02-25T10:00:00Z",
    "expiresAt": "2026-02-25T23:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "No preview available for game game-123"
}
```

---

### POST /api/games/:id/preview

Generate a new game preview using AI.

**Path Parameters:**
- `id`: Game ID

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/games/game-123/preview
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "message": "Game preview generated successfully"
  }
}
```

---

### POST /api/games/preview/batch

Batch generate previews for upcoming games.

**Request Body:**
```json
{
  "sport": "NBA",      // optional
  "hoursAhead": 48     // optional, default: 48, max: 168
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/games/preview/batch \
  -H "Content-Type: application/json" \
  -d '{"sport":"NBA","hoursAhead":24}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "itemsProcessed": 5,
    "itemsSkipped": 2,
    "itemsFailed": 0,
    "errors": [],
    "duration": 8540
  },
  "meta": {
    "message": "Batch game preview generation completed",
    "summary": {
      "processed": 5,
      "skipped": 2,
      "failed": 0,
      "duration": "8540ms"
    }
  }
}
```

---

## Parlay Evaluator

### POST /api/parlay/evaluate

Evaluate a multi-leg parlay for correlation risks and overall quality.

**Request Body:**
```json
{
  "legs": [
    { "propId": "prop-123" },
    { "propId": "prop-456" },
    { "propId": "prop-789" }
  ]
}
```

**Validation:**
- Minimum 2 legs required
- Maximum 10 legs allowed
- Each leg must have a valid `propId`

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/parlay/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {"propId": "prop-lebron-points"},
      {"propId": "prop-ad-rebounds"}
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overall_grade": "B",
    "confidence": "MEDIUM",
    "summary": "Moderate parlay with some correlation risk. Both players are on the same team which creates negative correlation.",
    "correlation_risks": [
      {
        "legs": [0, 1],
        "risk": "Both players on same team - if Lakers get blown out, both props likely fail",
        "severity": "MEDIUM"
      }
    ],
    "independent_analysis": [
      {
        "legIndex": 0,
        "verdict": "STRONG",
        "reasoning": "LeBron hitting points over consistently with 78% hit rate"
      },
      {
        "legIndex": 1,
        "verdict": "GOOD",
        "reasoning": "AD solid rebounding matchup vs undersized frontcourt"
      }
    ],
    "recommendation": "PROCEED",
    "suggested_improvements": [
      "Consider replacing AD rebounds with a prop from a different game to reduce correlation risk"
    ],
    "evaluatedAt": "2026-02-25T10:00:00Z"
  },
  "meta": {
    "message": "Parlay evaluation completed",
    "legCount": 2
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 2,
      "message": "Parlay must have at least 2 legs",
      "path": ["legs"]
    }
  ]
}
```

---

## Error Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is enforced. This will be added in a future update.

---

## Authentication

Currently no authentication is required. This will be added when moving to production.

---

## Examples

### Complete Workflow Example

```bash
# 1. Generate catch of the day for NBA
curl -X POST http://localhost:3001/api/catch-of-day/generate \
  -H "Content-Type: application/json" \
  -d '{"sport":"NBA"}'

# 2. Get today's catch
curl http://localhost:3001/api/catch-of-day?sport=NBA

# 3. Generate game preview
curl -X POST http://localhost:3001/api/games/game-123/preview

# 4. Evaluate a parlay
curl -X POST http://localhost:3001/api/parlay/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {"propId": "prop-123"},
      {"propId": "prop-456"}
    ]
  }'
```

---

## Cron Jobs

Recommended cron schedule for batch operations:

```
# Generate daily catches every morning at 9 AM
0 9 * * * curl -X POST http://localhost:3001/api/catch-of-day/batch

# Generate game previews every 6 hours
0 */6 * * * curl -X POST http://localhost:3001/api/games/preview/batch
```
