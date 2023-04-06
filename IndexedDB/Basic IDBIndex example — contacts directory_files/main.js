// create an instance of a db object for us to store the IDB data in
var db;

var activeIndex;

var contacts = [
  { id: 10, fName: 'Brian', lName: 'Damage', jTitle: 'Master of Synergies', company: 'Acme', eMail: 'a@acme.com', phone: '+441210000000', age: 37 },
  { id: 20, fName: 'Ted', lName: 'Maul', jTitle: 'Chief Reporter', company: 'Brass eye', eMail: 'b@acme.com', phone: '+442081111111', age: 46 },
  { id: 30, fName: 'Mr', lName: 'Bungle', jTitle: 'Bad Clown', company: 'Stub a Dub', eMail: 'bungle@maiof.com', phone: '+1508888888', age: 50 },
  { id: 40, fName: 'Richard', lName: 'James', jTitle: 'Sound Engineer', company: 'Aphex Twin', eMail: 'richard@drukqs.com', phone: '+1517777777', age: 430 },
  { id: 50, fName: 'Brian', lName: 'Umlaut', jTitle: 'Shredmeister', company: 'Minions of metal', eMail: 'brian@raiseyourhorns.com', phone: '+14086666666', age: 40 },
  { id: 60, fName: 'Jonathan', lName: 'Crane', jTitle: 'Freelance Psychologist', company: 'Arkham', eMail: 'jon@arkham.com', phone: 'n/a', age: 38 },
  { id: 70, fName: 'Julian', lName: 'Day', jTitle: 'Schedule Keeper', company: 'Arkham', eMail: 'julian@arkham.com', phone: 'n/a', age: 41 },
  { id: 80, fName: 'Bolivar', lName: 'Trask', jTitle: 'Head of R&D', company: 'Trask', eMail: 'bolivar@trask.com', phone: '+14095555555', age: 55 },
  { id: 90, fName: 'Cloud', lName: 'Strife', jTitle: 'Weapons Instructor', company: 'Avalanche', eMail: 'cloud@avalanche.com', phone: '+17083333333', age: 24 },
  { id: 100, fName: 'Bilbo', lName: 'Bagshot', jTitle: 'Comic Shop Owner', company: 'Fantasy Bazaar', eMail: 'bilbo@fantasybazaar.co.uk', phone: '+12084444444', age: 43 }
];

// all the variables we need for the app    

var tableEntry = document.querySelector('tbody');


window.onload = function() {
  // In the following line, you should include the prefixes of implementations you want to test.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

  const promise = window.indexedDB.databases()
  promise.then(databases => {
    console.log(databases)
  })
  var DBOpenRequest = window.indexedDB.open('contactsList', 1);

  DBOpenRequest.onsuccess = function(event) {
    console.log("onsuccess");
    db = DBOpenRequest.result;
    populateData();
  };

  DBOpenRequest.onupgradeneeded = function(event) { 
    console.log("onupgradeneeded");
    var db = event.target.result;

    db.onerror = function(event) {
      console.error('Error loading database.', event.srcElement.error);
    };

    var objectStore = db.createObjectStore('contactsList', { autoIncrement: true }); 
    objectStore.createIndex('lName', 'lName', { unique: false }); 
    objectStore.createIndex('fName', 'fName', { unique: false });
    objectStore.createIndex('jTitle', 'jTitle', { unique: false });
    objectStore.createIndex('company', 'company', { unique: false });
    objectStore.createIndex('eMail', 'eMail', { unique: true });
    objectStore.createIndex('phone', 'phone', { unique: false });
    objectStore.createIndex('age', 'age', { unique: false });
  };

  function populateData() {
    var transaction = db.transaction(['contactsList'], 'readwrite');
    var objectStore = transaction.objectStore('contactsList');
    let i=0;
    for(; i < contacts.length-1 ; i++) {
      var request = objectStore.put(contacts[i], "nihao"+i);
    };
    request = objectStore.put(contacts[i]);

    transaction.oncomplete = function() {
      displayDataByKey();
    };
  };

  var thControls = document.querySelectorAll('th');
  for(i = 0; i < thControls.length; i++) {
    var activeThead = thControls[i];
    activeThead.onclick = function(e) {
      activeIndex = e.target.innerHTML;
      if(activeIndex == 'ID') {
        displayDataByKey(); 
      } else {
        if(activeIndex == "Last name") {
          displayDataByIndex('lName');
        } else if(activeIndex == "First name") {
          displayDataByIndex('fName');
        } else if(activeIndex == "Job title") {
          displayDataByIndex('jTitle');
        } else if(activeIndex == "Company") {
          displayDataByIndex('company');
        } else if(activeIndex == "E-mail") {
          displayDataByIndex('eMail');
        } else if(activeIndex == "Phone") {
          displayDataByIndex('phone');
        } else if(activeIndex == "Age") {
          displayDataByIndex('age');
        }
      }
    }
  }

  function displayDataByKey() {
    tableEntry.innerHTML = '';
    var transaction = db.transaction(['contactsList'], 'readonly');
    var objectStore = transaction.objectStore('contactsList');

    ///// testing
    // Make a request to get a record by key from the object store
    var objectStoreRequest = objectStore.get(100);
    objectStoreRequest.onsuccess = function(event) {
      var myRecord = objectStoreRequest.result;
      console.log("bbb get",myRecord);
    };

    let _r = IDBKeyRange.bound(20.3,60);
    var objectStoreRequest2 = objectStore.getKey(_r);
    objectStoreRequest2.onsuccess = function(event) {
      var myRecord = objectStoreRequest2.result;
      console.log("bbb getKey",myRecord);
    };
    //// end testing

    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if(cursor) {
        var tableRow = document.createElement('tr');
        tableRow.innerHTML =   '<td>' + cursor.value.id + '</td>'
          + '<td>' + cursor.value.lName + '</td>'
          + '<td>' + cursor.value.fName + '</td>'
          + '<td>' + cursor.value.jTitle + '</td>'
          + '<td>' + cursor.value.company + '</td>'
          + '<td>' + cursor.value.eMail + '</td>'
          + '<td>' + cursor.value.phone + '</td>'
          + '<td>' + cursor.value.age + '</td>';
        tableEntry.appendChild(tableRow);  

        cursor.continue();
      } else {
        console.error('Entries all displayed.');    
      }
    };
  };

  function displayDataByIndex(activeIndex) {
    tableEntry.innerHTML = '';
    var transaction = db.transaction(['contactsList'], 'readonly');
    var objectStore = transaction.objectStore('contactsList');


    var myIndex = objectStore.index(activeIndex);

    console.log(myIndex.name);
    console.log(myIndex.objectStore);
    console.log(myIndex.keyPath);
    console.log(myIndex.multiEntry);
    console.log(myIndex.unique);

    var countRequest = myIndex.count();
    countRequest.onsuccess = function() {
      console.log(countRequest.result);
    }

    if(activeIndex == 'fName') {
      var getRequest = myIndex.get('Mr');
      getRequest.onsuccess = function() {
        console.log('AAAAA',getRequest.result);
      }
    }

    if(activeIndex == 'lName') {
      var getKeyRequest = myIndex.getKey('Bungle');
      getKeyRequest.onsuccess = function() {
        console.log('AAAAAA',getKeyRequest.result);
      }
    }

    myIndex.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if(cursor) {
        var tableRow = document.createElement('tr');
        tableRow.innerHTML =   '<td>' + cursor.value.id + '</td>'
          + '<td>' + cursor.value.lName + '</td>'
          + '<td>' + cursor.value.fName + '</td>'
          + '<td>' + cursor.value.jTitle + '</td>'
          + '<td>' + cursor.value.company + '</td>'
          + '<td>' + cursor.value.eMail + '</td>'
          + '<td>' + cursor.value.phone + '</td>'
          + '<td>' + cursor.value.age + '</td>';
        tableEntry.appendChild(tableRow);  

        cursor.continue();
      } else {
        console.log('Entries all displayed.');    
      }
    };
  };

};

