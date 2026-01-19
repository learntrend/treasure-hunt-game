# Game Access Control Design

## Overview
This document describes the game access control system that links games to bookings and enforces time-based and one-time play restrictions.

## Key Features

### 1. Booking-Based Game Sessions
- When a player books, a game session is created linked to their booking
- Individual players: One session per booking
- Group players: Multiple devices can access the same session via booking ID

### 2. Time-Based Access Control
- Games can only be started 15 minutes before the booking time
- Players cannot access games before their scheduled slot
- Access is granted based on booking date and time

### 3. One-Time Play Restriction
- Once a game is completed, it cannot be replayed
- If a game is abandoned (player leaves), they have 1 hour to resume
- After 1 hour of abandonment, the game cannot be resumed

## Game Status Flow

```
pending → active → completed (cannot replay)
         ↓
      abandoned (1 hour window to resume, then locked)
```

### Status Definitions:
- **pending**: Game created but not started
- **active**: Game in progress
- **completed**: Game finished successfully (locked)
- **abandoned**: Game stopped mid-way (1 hour window to resume)

## Database Schema Updates

### gameSessions Collection - New Fields:
- `bookingId`: Links to booking document
- `bookingDate`: Date of booking (YYYY-MM-DD)
- `bookingTime`: Time of booking (HH:MM)
- `gameStatus`: 'pending', 'active', 'completed', 'abandoned'
- `lastPlayedAt`: Timestamp of last game activity

## Access Flow

### Starting a New Game:
1. Check if bookingId is provided (via URL parameter or form)
2. Validate booking exists and get booking data
3. Create or get existing game session for booking
4. Check access: Can game be started? (time check, status check)
5. If yes: Initialize game and set status to 'active'
6. If no: Show error message with reason

### Resuming a Game:
1. Check if game session exists
2. Check access: Can game be resumed? (status check, time check)
3. If yes: Restore game state
4. If no: Show error message with reason

### Completing a Game:
1. Set gameStatus to 'completed'
2. Save final stats
3. Lock game from further access

### Abandoning a Game:
1. When player leaves/closes game, mark as 'abandoned' if not completed
2. Set lastPlayedAt timestamp
3. Allow 1 hour window to resume
4. After 1 hour, game is locked

## URL Parameters

### For Individual Players:
```
?bookingId=ABC123
```

### For Group Players:
```
?bookingId=ABC123&group=true
```

## Implementation Notes

- Access checks happen before game start/resume
- Game status is updated automatically during gameplay
- LastPlayedAt is updated on every save
- Abandoned games are checked on resume attempts
