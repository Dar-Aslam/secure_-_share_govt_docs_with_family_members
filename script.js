// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAIiWgBWM8cA1pO8IEsIHybcKEc7Iu2vJ0",
  authDomain: "govtdatashare.firebaseapp.com",
  projectId: "govtdatashare",
  storageBucket: "govtdatashare.appspot.com",
  messagingSenderId: "297935547319",
  appId: "1:297935547319:web:a617bf10e2e1f188aad632"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Simple logger
function logAction(action) {
  const logList = document.getElementById("log-list");
  const item = document.createElement("li");
  item.textContent = `[${new Date().toLocaleTimeString()}] ${action}`;
  logList.prepend(item); // latest on top
}

// Registration with Email/Password
function registerUser() {
  const email = document.getElementById("register-email").value;
  const pass = document.getElementById("register-pass").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(function(userCredential) {
      logAction("User registered with email");
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
      showUserDetails();
      loadDocuments();
    })
    .catch(function(error) {
      alert(error.message);
      logAction("Registration failed: " + error.message);
    });
}

// Email login
function loginUser() {
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-pass").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(function(userCredential) {
      logAction("User logged in via email");
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
      showUserDetails();
      loadDocuments();
    })
    .catch(function(error) {
      alert(error.message);
      logAction("Login failed: " + error.message);
    });
}

function logoutUser() {
  auth.signOut().then(function() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
    logAction("User logged out");
    document.getElementById("user-email").textContent = '';
    document.getElementById("doc-list").innerHTML = '';
  });
}

// Show logged-in user's email
function showUserDetails() {
  const user = auth.currentUser;
  if (user) {
    document.getElementById("user-email").textContent = `Logged in as: ${user.email}`;
  }
}

// List documents from Firestore
function loadDocuments() {
  const user = auth.currentUser;
  if (!user) return;
  const docList = document.getElementById("doc-list");
  docList.innerHTML = '';
  db.collection('users').doc(user.uid).collection('documents').orderBy('addedAt', 'desc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        docList.innerHTML = '<li>No documents found.</li>';
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          const li = document.createElement('li');
          li.textContent = `${data.name} (${data.type || 'unknown'})`;
          docList.appendChild(li);
        });
      }
      logAction("Document list loaded");
    })
    .catch(error => {
      logAction("Failed to load documents: " + error.message);
      docList.innerHTML = '<li>Error loading documents</li>';
    });
}

// Add dummy document (simulate upload)
function addDummyDocument() {
  const user = auth.currentUser;
  if (!user) return;
  const docName = "Dummy Document " + Math.floor(Math.random() * 1000);
  db.collection('users').doc(user.uid).collection('documents').add({
    name: docName,
    type: 'dummy',
    addedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    logAction(`Added document: ${docName}`);
    loadDocuments();
  }).catch(error => {
    logAction("Failed to add document: " + error.message);
  });
}

// Listen to auth state changes
auth.onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    showUserDetails();
    loadDocuments();
    logAction("User session active");
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("user-email").textContent = '';
    document.getElementById("doc-list").innerHTML = '';
  }
});