// Variable to hold idb connection
let db;
// Establish connection and set version 1
const request = indexedDB.open('budget_tracker', 1);

// Event triggers when update needed
request.onupgradeneeded = function(event) {
    // Save reference to the database
    const db = event.target.result;
    // Create object store, set incrementing primary key
    db.createObjectStore('income_or_expense', { autoIncrement: true });
};