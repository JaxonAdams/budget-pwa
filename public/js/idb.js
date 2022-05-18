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

// On successful connection
request.onsuccess = function(event) {
    // Save db reference in global variable
    db = event.target.result;

    // Check if app is online, if yes send stored data to database
    if (navigator.online) {
        uploadData();
    }
};

request.onerror = function(event) {
    // Errors logged here
    console.log(event.target.errorCode);
};

// This function executed on submit with no connection
function saveRecord(record) {
    // Open new transaction with the database with read/write permission
    const transaction = db.transaction(['income_or_expense'], 'readwrite');

    // Access object store for 'income_or_expense'
    const recordObjectStore = transaction.objectStore('income_or_expense');

    // Add record to store with add method
    recordObjectStore.add(record);
};

// Send stored data to database
function uploadData() {
    // Open transaction on db
    const transaction = db.transaction(['income_or_expense'], 'readwrite');

    // Access object store
    const recordObjectStore = transaction.objectStore('income_or_expense');

    // Get all records from store and set to a variable
    const getAll = recordObjectStore.getAll();

    // The following executes on a successful getAll execution
    getAll.onsuccess = function() {
        // If data in idb store, send to mongodb
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                // Open another transaction
                const transaction = db.transaction(['income_or_expense'], 'readwrite');

                // Access object store
                const recordObjectStore = transaction.objectStore('income_or_expense');

                // Clear store
                recordObjectStore.clear();

                if (localStorage.getItem('notifpermission') === 'true') {
                    sendNotification(true);
                } else {
                    return console.log('notifpermission not true');
                }

                console.log('IndexedDB stored data sent to server.');
            })
            .catch(err => console.log(err));
        }
    };
};

// Listen for app coming back online
window.addEventListener('online', uploadData);