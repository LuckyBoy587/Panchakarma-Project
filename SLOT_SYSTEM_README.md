# Doctor Schedule Slot Management System

This system manages doctor's working hours by splitting them into 30-minute slots for appointment scheduling.

## Database Schema

### Slots Table

```sql
CREATE TABLE slots (
    slot_id VARCHAR(36) PRIMARY KEY,
    practitioner_id VARCHAR(36) NOT NULL,
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'free', 'leave') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (practitioner_id) REFERENCES practitioners(practitioner_id) ON DELETE CASCADE,
    INDEX idx_practitioner_day (practitioner_id, day),
    INDEX idx_status (status)
);
```

## Features

- **Automatic Slot Generation**: Generates 30-minute slots based on practitioner's working hours
- **Leave Management**: Handles non-working days by marking slots as 'leave'
- **Flexible Filtering**: Query slots by day, status, or practitioner
- **Regeneration Support**: Ability to regenerate slots when working hours change

## API Endpoints

### Generate Slots for a Practitioner
```
POST /api/slots/generate/:practitionerId
```
- **Authorization**: Admin or Practitioner
- **Body**: `{ "regenerate": true }` (optional, defaults to false)

### Get Slots
```
GET /api/slots/:practitionerId?day=monday&status=free
```
- **Query Parameters**:
  - `day`: Filter by day (monday, tuesday, etc.)
  - `status`: Filter by status (free, booked, leave)

### Update Slot Status
```
PUT /api/slots/:slotId
```
- **Body**: `{ "status": "booked" }`
- **Valid statuses**: free, booked, leave

## Usage Examples

### 1. Generate Slots for All Practitioners

Run the generation script:
```bash
cd backend
node generate-slots.js
```

To regenerate all slots (delete existing and create new):
```bash
node generate-slots.js --regenerate
```

### 2. Generate Slots for Specific Practitioner

```javascript
const { generatePractitionerSlots } = require('./slotGenerator');
await generatePractitionerSlots('prac-profile-001', true); // true for regenerate
```

### 3. Fetch Available Slots

```javascript
// Get all free slots for Monday
GET /api/slots/prac-profile-001?day=monday&status=free

// Get all slots for a practitioner
GET /api/slots/prac-profile-001
```

## Slot Generation Logic

### Working Hours Format
Practitioner's working hours are stored as JSON in the `working_hours` column:

```json
[
  {"day": "monday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "tuesday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "wednesday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "thursday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "friday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "saturday", "start": "09:00", "end": "13:00", "isWorking": true},
  {"day": "sunday", "isWorking": false}
]
```

### Slot Generation Rules

1. **Working Days**: Split working hours into 30-minute intervals
   - Example: 9:00-17:00 generates slots: 9:00-9:30, 9:30-10:00, ..., 16:30-17:00

2. **Non-Working Days**: Create leave slots for standard business hours
   - Example: Sunday creates leave slots from 9:00-17:00

3. **Status Assignment**:
   - Working day slots: `status = 'free'`
   - Non-working day slots: `status = 'leave'`

## Integration with Appointments

When booking an appointment:

1. Find available slot with `status = 'free'`
2. Update slot status to `'booked'`
3. Create appointment record

When canceling an appointment:

1. Update slot status back to `'free'`

## Maintenance

### Regenerating Slots

When a practitioner's working hours change:

```javascript
const { updatePractitionerSlots } = require('./slotGenerator');
await updatePractitionerSlots('practitioner-id');
```

This will:
1. Delete existing slots for the practitioner
2. Generate new slots based on updated working hours

### Periodic Cleanup

Consider running the regeneration script periodically to ensure slots are up-to-date with any changes in working hours.
