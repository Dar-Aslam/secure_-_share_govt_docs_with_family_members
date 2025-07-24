// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBgiRYIR1otsBmBgmW_NB7BuOb0mEg01kM",
  authDomain: "govtdocshare.firebaseapp.com",
  projectId: "govtdocshare",
  storageBucket: "govtdocshare.firebasestorage.app",
  messagingSenderId: "71040488992",
  appId: "1:71040488992:web:72963992605e7c2015ce45"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      showDashboard(email);
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

// REGISTER
function register() {
  const email = prompt("Enter email:");
  const password = prompt("Enter password:");

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Registered successfully!");
    })
    .catch(error => {
      alert("Registration error: " + error.message);
    });
}

// DASHBOARD
function showDashboard(email) {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("user-email").textContent = email;
  loadDocuments();
}

// SAVE Document Metadata Only
function saveDocMeta() {
  const docName = document.getElementById("docName").value;
  const aadhar = document.getElementById("aadhar").value;

  if (!docName || !aadhar) {
    alert("Please fill all fields.");
    return;
  }

  const user = auth.currentUser;

  db.collection("documents").add({
    name: docName,
    aadhar: aadhar,
    user: user.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Document metadata saved!");
    loadDocuments();
  }).catch(err => {
    alert("Error saving document: " + err.message);
  });
}

// LOAD Metadata
function loadDocuments() {
  const user = auth.currentUser;
  const docList = document.getElementById("doc-list");
  docList.innerHTML = "";

  db.collection("documents").where("user", "==", user.email).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `${data.name} (Aadhar: ${data.aadhar})`;
        docList.appendChild(li);
      });
    });
}

// LOGOUT
function logout() {
  auth.signOut().then(() => {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
  });
}
