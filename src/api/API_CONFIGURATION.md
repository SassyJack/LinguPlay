# API Configuration Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# API Base URL
REACT_APP_API_URL=https://api.linguaplay.local

# Can also set different URLs for different environments:
# Development
# REACT_APP_API_URL=http://localhost:3000/api

# Staging
# REACT_APP_API_URL=https://staging-api.linguaplay.com

# Production
# REACT_APP_API_URL=https://api.linguaplay.com
```

## Backend API Endpoints

The app expects the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update user profile

### Game Progress
- `POST /game/progress/sync` - Sync game progress
- `GET /game/progress` - Get user's game progress

## Request/Response Format

### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user123",
      "displayName": "John Doe",
      "email": "user@example.com"
    },
    "subscriptionTier": "free"
  }
}
```

### Game Progress Sync Request
```json
{
  "userId": "user123",
  "completedActivities": {
    "activity_1": true,
    "activity_2": true
  },
  "score": 150,
  "stars": 3,
  "streak": 5,
  "totalAttempts": 10,
  "totalCorrect": 8,
  "componentMistakes": {
    "phonological": 2,
    "semantic": 0
  },
  "unlockedAchievements": ["first_activity"],
  "lastSyncAt": "2024-04-14T10:30:00Z"
}
```

### Game Progress Sync Response
```json
{
  "success": true,
  "data": {
    "synced": true,
    "conflictResolution": "server",
    "serverState": {
      "userId": "user123",
      "completedActivities": {...},
      "score": 150,
      ...
    }
  }
}
```

## Offline Support

The app automatically queues API requests when offline and processes them when back online:

1. Activities are queued in `@linguaplay/sync_queue`
2. When network is restored, items are automatically synced
3. Failed items retry up to 3 times
4. Sync status can be checked via `GameSyncService.getSyncQueue()`

## Error Handling

The API client handles the following errors:

- **NETWORK_ERROR**: No internet connection (item queued for later)
- **UNAUTHORIZED (401)**: Auth token expired (user redirected to login)
- **FORBIDDEN (403)**: Access denied
- **SERVER_ERROR (500+)**: Server error
- **API_ERROR**: Generic API error

## Authentication

All authenticated requests include the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is automatically included by the API client if available.

## Testing

To test the backend integration without a real server:

1. Mock the API endpoints using a tool like `json-server`
2. Or use the mock services for development

Example with json-server:

```bash
npm install -g json-server

# Create db.json with mock data
json-server --watch db.json --port 3000

# Update REACT_APP_API_URL to http://localhost:3000/api
```

## Troubleshooting

### "No internet connection" message
- Check device network settings
- Ensure API_URL is correct
- Check firewall/proxy settings

### Auth token expired
- User will be logged out automatically
- Redirect to login screen
- Implement token refresh endpoint on backend

### Sync queue items stuck
- Check `AsyncStorage` for `@linguaplay/sync_queue`
- Use `GameSyncService.clearSyncQueue()` if needed
- Implement backend sync conflict resolution

## Production Checklist

- [ ] API_URL set to production domain
- [ ] HTTPS enabled
- [ ] Auth tokens have expiration
- [ ] Server implements token refresh
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error logging enabled
- [ ] Sync conflict resolution tested
