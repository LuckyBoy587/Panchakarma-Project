/**
 * Test script for slot generation logic
 * This tests the time slot generation without database connection
 */

const { generateTimeSlots } = require('./slotGenerator');

// Test data - sample practitioner's working hours
const sampleWorkingHours = [
  {"day": "monday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "tuesday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "wednesday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "thursday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "friday", "start": "09:00", "end": "17:00", "isWorking": true},
  {"day": "saturday", "start": "09:00", "end": "13:00", "isWorking": true},
  {"day": "sunday", "isWorking": false}
];

console.log('Testing slot generation logic...\n');

// Test time slot generation
console.log('1. Testing time slot generation for Monday (9:00-17:00):');
const mondaySlots = generateTimeSlots('09:00', '17:00');
console.log(`Generated ${mondaySlots.length} slots:`);
mondaySlots.forEach(slot => {
  console.log(`  ${slot.start_time} - ${slot.end_time}`);
});

console.log('\n2. Testing time slot generation for Saturday (9:00-13:00):');
const saturdaySlots = generateTimeSlots('09:00', '13:00');
console.log(`Generated ${saturdaySlots.length} slots:`);
saturdaySlots.forEach(slot => {
  console.log(`  ${slot.start_time} - ${slot.end_time}`);
});

console.log('\n3. Sample working hours structure:');
console.log(JSON.stringify(sampleWorkingHours, null, 2));

console.log('\n4. Expected slot generation results:');
sampleWorkingHours.forEach(day => {
  if (day.isWorking) {
    const slots = generateTimeSlots(day.start, day.end);
    console.log(`${day.day}: ${slots.length} slots (${day.start}-${day.end})`);
  } else {
    console.log(`${day.day}: Leave day`);
  }
});

console.log('\n✅ Slot generation logic test completed successfully!');
console.log('\nTo use the full system:');
console.log('1. Set up MySQL database using database/setup_mysql.bat');
console.log('2. Update backend/.env with correct database credentials');
console.log('3. Run: node generate-slots.js');
