#!/usr/bin/env node

/**
 * Slot Generation Script
 * Run this script to generate time slots for all practitioners
 *
 * Usage:
 * node generate-slots.js [--regenerate]
 *
 * Options:
 * --regenerate  Delete existing slots and regenerate them
 */

const dotenv = require("dotenv");
dotenv.config();

const { generateAllPractitionersSlots, initializeDatabase } = require('./slotGenerator');

async function main() {
  try {
    console.log('Initializing database connection...');
    await initializeDatabase();

    const regenerate = process.argv.includes('--regenerate');

    if (regenerate) {
      console.log('Regenerating all slots...');
    } else {
      console.log('Generating slots for all practitioners...');
    }

    await generateAllPractitionersSlots(regenerate);

    console.log('Slot generation completed successfully!');
  } catch (error) {
    console.error('Slot generation failed:', error);
    process.exit(1);
  }
}

main();
