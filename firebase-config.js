/* firebase-config.js - Unified Backend & Auth Manager (Sandbox + Live Firestore) */

// Global state holding Firebase references if loaded
let fbApp = null;
let fbAuth = null;
let fbDb = null;
let liveMode = false;
let authStateCallback = null;

// Mock database storage in localStorage for Sandbox mode
const LOCAL_TRIPS_KEY = 'tripgenius_trips';
const LOCAL_USER_KEY = 'tripgenius_user';
const LOCAL_USERS_DB_KEY = 'tripgenius_users_db'; // Store registered users in sandbox

// Read API keys and configs from localStorage
function getSettings() {
  return {
    geminiKey: localStorage.getItem('tripgenius_gemini_key') || '',
    fbApiKey: localStorage.getItem('tripgenius_fb_apikey') || '',
    fbAuthDomain: localStorage.getItem('tripgenius_fb_authdomain') || '',
    fbProjectId: localStorage.getItem('tripgenius_fb_projectid') || '',
    fbStorageBucket: localStorage.getItem('tripgenius_fb_storage') || ''
  };
}

function saveSettings(settings) {
  localStorage.setItem('tripgenius_gemini_key', settings.geminiKey);
  localStorage.setItem('tripgenius_fb_apikey', settings.fbApiKey);
  localStorage.setItem('tripgenius_fb_authdomain', settings.fbAuthDomain);
  localStorage.setItem('tripgenius_fb_projectid', settings.fbProjectId);
  localStorage.setItem('tripgenius_fb_storage', settings.fbStorageBucket);
}

function clearSettings() {
  localStorage.removeItem('tripgenius_gemini_key');
  localStorage.removeItem('tripgenius_fb_apikey');
  localStorage.removeItem('tripgenius_fb_authdomain');
  localStorage.removeItem('tripgenius_fb_projectid');
  localStorage.removeItem('tripgenius_fb_storage');
}

// Check if live Firebase settings are available
function hasFirebaseConfig() {
  const config = getSettings();
  return !!(config.fbApiKey && config.fbProjectId);
}

// Initialise Backend Service
async function initBackend(onAuthChangeCallback) {
  authStateCallback = onAuthChangeCallback;

  if (hasFirebaseConfig()) {
    try {
      const config = getSettings();
      const firebaseConfig = {
        apiKey: config.fbApiKey,
        authDomain: config.fbAuthDomain,
        projectId: config.fbProjectId,
        storageBucket: config.fbStorageBucket
      };

      // Dynamically load Firebase client SDK modules from ESM CDN
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

      fbApp = initializeApp(firebaseConfig);
      fbAuth = getAuth(fbApp);
      fbDb = getFirestore(fbApp);
      liveMode = true;

      // Listen to live Auth updates
      onAuthStateChanged(fbAuth, (user) => {
        if (user) {
          onAuthChangeCallback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isLiveUser: true
          });
        } else {
          onAuthChangeCallback(null);
        }
      });
      console.log("TripGenius successfully connected to live Firebase!");
      return true;

    } catch (e) {
      console.error("Live Firebase initialization failed, falling back to local Sandbox mode.", e);
      initSandboxAuth(onAuthChangeCallback);
      return false;
    }
  } else {
    // No Firebase configuration - engage Offline Sandbox mode
    initSandboxAuth(onAuthChangeCallback);
    console.log("TripGenius running in Offline LocalStorage Sandbox Mode.");
    return false;
  }
}

// Setup local sandbox auth state listeners
function initSandboxAuth(callback) {
  liveMode = false;
  // Get active session user from localStorage
  const user = JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
  setTimeout(() => {
    callback(user);
  }, 100);
}

function isLiveMode() {
  return liveMode;
}

// Authentication Actions
async function signUp(name, email, password) {
  if (liveMode && fbAuth) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    const userCredential = await createUserWithEmailAndPassword(fbAuth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      isLiveUser: true
    };
  } else {
    // Sandbox Signup
    const usersDb = JSON.parse(localStorage.getItem(LOCAL_USERS_DB_KEY)) || [];
    if (usersDb.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists in the sandbox.");
    }
    const newUser = {
      uid: 'sandbox_' + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: name,
      isLiveUser: false,
      password: password // In mock sandbox, we store plaintext for demo verification
    };
    usersDb.push(newUser);
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(usersDb));
    
    // Log the user in
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    if (authStateCallback) authStateCallback(newUser);
    return newUser;
  }
}

async function signIn(email, password) {
  if (liveMode && fbAuth) {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    const userCredential = await signInWithEmailAndPassword(fbAuth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || email.split('@')[0],
      isLiveUser: true
    };
  } else {
    // Sandbox Signin
    const usersDb = JSON.parse(localStorage.getItem(LOCAL_USERS_DB_KEY)) || [];
    const foundUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!foundUser) {
      // Create a default demo user if they enter demo credentials so sandbox is easy
      if (email.toLowerCase() === 'demo@tripgenius.com' && password === 'demo123') {
        const demoUser = {
          uid: 'sandbox_demo_user',
          email: 'demo@tripgenius.com',
          displayName: 'Demo Explorer',
          isLiveUser: false
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
        if (authStateCallback) authStateCallback(demoUser);
        return demoUser;
      }
      throw new Error("Invalid credentials. Try using 'demo@tripgenius.com' and password 'demo123' in Sandbox Mode.");
    }
    
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(foundUser));
    if (authStateCallback) authStateCallback(foundUser);
    return foundUser;
  }
}

async function signOutUser() {
  if (liveMode && fbAuth) {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    await signOut(fbAuth);
  } else {
    // Sandbox Signout
    localStorage.removeItem(LOCAL_USER_KEY);
    if (authStateCallback) authStateCallback(null);
  }
}

// Database Actions: Trips Curation & Persistence
async function saveTrip(tripData) {
  // Ensure we have a valid logged in user, mock one in sandbox if needed
  let user = null;
  if (liveMode && fbAuth) {
    user = fbAuth.currentUser;
  } else {
    user = JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
    if (!user) {
      // Auto-assign sandbox user for quick saves
      user = { uid: 'sandbox_guest', displayName: 'Guest Explorer' };
    }
  }

  const enrichedTrip = {
    ...tripData,
    id: tripData.id || 'trip_' + Date.now() + Math.random().toString(36).substr(2, 5),
    userId: user.uid || user.id,
    createdAt: new Date().toISOString()
  };

  if (liveMode && fbDb) {
    const { collection, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const docRef = doc(fbDb, "trips", enrichedTrip.id);
    await setDoc(docRef, enrichedTrip);
    return enrichedTrip;
  } else {
    // Sandbox Save (LocalStorage array)
    const trips = JSON.parse(localStorage.getItem(LOCAL_TRIPS_KEY)) || [];
    // If it exists, update it. Otherwise add new
    const idx = trips.findIndex(t => t.id === enrichedTrip.id);
    if (idx >= 0) {
      trips[idx] = enrichedTrip;
    } else {
      trips.push(enrichedTrip);
    }
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips));
    return enrichedTrip;
  }
}

async function getSavedTrips() {
  let user = null;
  if (liveMode && fbAuth) {
    user = fbAuth.currentUser;
  } else {
    user = JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
  }

  if (!user) return [];

  const uid = user.uid;

  if (liveMode && fbDb) {
    const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const tripsRef = collection(fbDb, "trips");
    const q = query(tripsRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push(doc.data());
    });
    // Sort in-memory to prevent requiring composite index creation in firestore
    return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // Sandbox retrieval
    const trips = JSON.parse(localStorage.getItem(LOCAL_TRIPS_KEY)) || [];
    return trips
      .filter(t => t.userId === uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

async function getTripById(tripId) {
  if (liveMode && fbDb) {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const docRef = doc(fbDb, "trips", tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } else {
    // Sandbox retrieval
    const trips = JSON.parse(localStorage.getItem(LOCAL_TRIPS_KEY)) || [];
    return trips.find(t => t.id === tripId) || null;
  }
}

async function deleteTrip(tripId) {
  if (liveMode && fbDb) {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const docRef = doc(fbDb, "trips", tripId);
    await deleteDoc(docRef);
    return true;
  } else {
    // Sandbox delete
    let trips = JSON.parse(localStorage.getItem(LOCAL_TRIPS_KEY)) || [];
    trips = trips.filter(t => t.id !== tripId);
    localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(trips));
    return true;
  }
}
