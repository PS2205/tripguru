/* app.js - Central SPA Orchestrator, Router & Dialog Controllers */


// Application Global State
let currentUser = null;
const appContent = document.getElementById('app-content');

// Toast Notification Engine
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon selector depending on type
  let icon = "✦";
  if (type === 'success') icon = "✓";
  else if (type === 'error') icon = "✕";
  else if (type === 'warning') icon = "⚠";

  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem;">
      <span style="font-weight:bold; font-size:1.1rem; color:var(--text-primary);">${icon}</span>
      <span class="toast-content">${message}</span>
    </div>
    <button class="toast-close">&times;</button>
  `;

  // Auto remove after 3.5s
  const timer = setTimeout(() => {
    fadeAndRemove(toast);
  }, 3500);

  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    fadeAndRemove(toast);
  });

  container.appendChild(toast);
}

function fadeAndRemove(toast) {
  toast.style.transform = 'translateX(120%)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s ease';
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Router Definition
const routes = {
  '/': renderLanding,
  '/plan': renderPlanner,
  '/trip': renderTrip,
  '/dashboard': renderDashboard
};

// Scroll Storytelling background controller state variables
let storyBgObserver = null;
let revealObserver = null;

function initScrollStoryteller() {
  const bgContainer = document.getElementById('story-bg-container');
  if (!bgContainer) return;

  // Render story background container visible on homepage
  bgContainer.style.display = 'block';
  bgContainer.style.opacity = '1';

  const sections = document.querySelectorAll('.scroll-story-section');
  const slides = document.querySelectorAll('.story-bg-slide');

  // Disconnect any existing observer instances safely
  if (storyBgObserver) storyBgObserver.disconnect();
  if (revealObserver) revealObserver.disconnect();

  // 1. Observer for changing the storytelling background smoothly as sections enter the viewport
  storyBgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bgId = entry.target.getAttribute('data-bg');
        if (bgId) {
          // Remove active state from all slides
          slides.forEach(slide => slide.classList.remove('active'));
          
          // Add active state to target slide to trigger high-fidelity fade & scale transition
          const targetSlide = document.getElementById(bgId);
          if (targetSlide) {
            targetSlide.classList.add('active');
          }
        }
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '-10% 0px -40% 0px'
  });

  sections.forEach(sec => storyBgObserver.observe(sec));

  // 2. Observer for Stripe/Apple-style reveals (.scroll-trigger-element)
  const revealElements = document.querySelectorAll('.scroll-trigger-element');
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -10% 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

function hideScrollStoryteller() {
  const bgContainer = document.getElementById('story-bg-container');
  if (bgContainer) {
    bgContainer.style.opacity = '0';
    setTimeout(() => {
      // Clean up layout display if user is still on another page
      const currentPath = (window.location.hash || '#/').split('?')[0].substr(1) || '/';
      if (currentPath !== '/' && bgContainer) {
        bgContainer.style.display = 'none';
      }
    }, 500);
  }

  if (storyBgObserver) {
    storyBgObserver.disconnect();
    storyBgObserver = null;
  }
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}

async function router() {
  const hash = window.location.hash || '#/';
  
  // Parse base path and parameters (e.g. #/trip?id=123 -> path: /trip)
  const pathPart = hash.split('?')[0].substr(1) || '/';
  
  // Update Active navigation links highlight in shell header
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const pageAttr = link.getAttribute('data-page');
    if ((pathPart === '/' && pageAttr === 'landing') || 
        (pathPart === '/plan' && pageAttr === 'planner') ||
        (pathPart === '/dashboard' && pageAttr === 'dashboard')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Load appropriate renderer
  const renderer = routes[pathPart] || renderLanding;
  
  // Scroll window to top smoothly on page swap
  window.scrollTo(0, 0);

  try {
    await renderer(appContent);
    
    // Toggle scroll storyteller background state based on current page path
    if (pathPart === '/') {
      initScrollStoryteller();
    } else {
      hideScrollStoryteller();
    }
  } catch (err) {
    console.error("Routing execution failed.", err);
    appContent.innerHTML = `
      <div class="loader-container" style="color:var(--color-danger)">
        <p>A routing exception occurred during curation.</p>
        <a href="#/" class="premium-btn secondary-btn" style="margin-top:1rem">Go Home</a>
      </div>
    `;
  }
}

// Authentication State Change Sync Trigger
function handleAuthStateChange(user) {
  currentUser = user;
  const authBtnText = document.getElementById('auth-btn-text');
  const navDashboard = document.getElementById('nav-dashboard');

  if (user) {
    // User is active (Live Firebase or local simulated session)
    authBtnText.innerText = user.displayName || user.email.split('@')[0];
    if (navDashboard) navDashboard.classList.remove('hidden');
    
    console.log(`Auth synchronized: User [${user.displayName}] logged in. mode=[${user.isLiveUser ? 'Live' : 'Sandbox'}]`);
  } else {
    // Logged out
    authBtnText.innerText = "Sign In";
    if (navDashboard) navDashboard.classList.add('hidden');
    
    console.log("Auth synchronized: Guest session.");
    // If user is currently sitting in dashboard, kick them back home safely
    const currentHash = window.location.hash;
    if (currentHash.includes('/dashboard')) {
      window.location.hash = '#/';
    }
  }
}

// Initialize Shell Trigger Dialog Bindings
function initDialogControls() {
  const settingsModal = document.getElementById('settings-modal');
  const authModal = document.getElementById('auth-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const footerSettings = document.getElementById('footer-settings-link');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const authBtn = document.getElementById('auth-btn');
  const closeAuthBtn = document.getElementById('close-auth-btn');

  // Toggle Settings Modal
  const openSettings = (e) => {
    e.preventDefault();
    // Pre-populate settings form
    const settings = getSettings();
    document.getElementById('gemini-key').value = settings.geminiKey;
    document.getElementById('fb-apikey').value = settings.fbApiKey;
    document.getElementById('fb-authdomain').value = settings.fbAuthDomain;
    document.getElementById('fb-projectid').value = settings.fbProjectId;
    document.getElementById('fb-storage').value = settings.fbStorageBucket;

    settingsModal.classList.remove('hidden');
  };

  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
  if (footerSettings) footerSettings.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

  // Toggle Auth Modal
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      if (currentUser) {
        // Active session exists - treat click as "Sign Out"
        if (confirm("Are you sure you want to sign out?")) {
          await signOutUser();
          showToast("Signed out successfully.", "success");
        }
      } else {
        // No session - open dialog
        authModal.classList.remove('hidden');
      }
    });
  }
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));

  // Modal overlays close clicking outside cards
  [settingsModal, authModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Settings form submission handler
  const settingsForm = document.getElementById('settings-form');
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settings = {
      geminiKey: document.getElementById('gemini-key').value.trim(),
      fbApiKey: document.getElementById('fb-apikey').value.trim(),
      fbAuthDomain: document.getElementById('fb-authdomain').value.trim(),
      fbProjectId: document.getElementById('fb-projectid').value.trim(),
      fbStorageBucket: document.getElementById('fb-storage').value.trim()
    };

    saveSettings(settings);
    settingsModal.classList.add('hidden');
    
    showToast("Integration settings updated.", "success");

    // Dynamic database reload with new credentials!
    showToast("Connecting drivers...", "info");
    const isLive = await initBackend(handleAuthStateChange);
    if (isLive) {
      showToast("Live cloud integration established!", "success");
    } else {
      showToast("Offline Sandbox initialized.", "warning");
    }
    
    // Refresh page router to sync dashboard and view components
    router();
  });

  // Clear credentials helper
  document.getElementById('clear-settings-btn').addEventListener('click', async () => {
    if (confirm("Reset configurations back to offline Sandbox?")) {
      clearSettings();
      settingsModal.classList.add('hidden');
      showToast("Settings reset to default.", "success");
      
      await initBackend(handleAuthStateChange);
      router();
    }
  });

  // Auth Dialog tab swaps
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;

    try {
      const user = await signIn(email, pass);
      authModal.classList.add('hidden');
      showToast(`Welcome back, ${user.displayName}!`, "success");
      loginForm.reset();
      
      // Redirect to saved trip archives dashboard
      window.location.hash = '#/dashboard';
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Signup Form Submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;

    try {
      const user = await signUp(name, email, pass);
      authModal.classList.add('hidden');
      showToast(`Account registered: Welcome, ${user.displayName}!`, "success");
      signupForm.reset();
      
      // Redirect to saved trip archives dashboard
      window.location.hash = '#/dashboard';
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// Interactive chatbot global logic
function initChatbot() {
  const bubble = document.getElementById('chatbot-bubble');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const inputForm = document.getElementById('chatbot-input-form');
  const input = document.getElementById('chatbot-input');
  const messagesContainer = document.getElementById('chatbot-messages');
  const suggestions = document.getElementById('chatbot-suggestions');

  if (!bubble || !container) return;

  // Toggle chatbot
  bubble.addEventListener('click', () => {
    container.classList.toggle('hidden');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  closeBtn.addEventListener('click', () => {
    container.classList.add('hidden');
  });

  // Handle messages
  const addMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerText = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    
    // Resolve context destination if we are viewing a trip
    let destination = "your destination";
    let activeTrip = window.currentTrip;
    
    if (window.location.hash.includes('/trip')) {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const demoKey = urlParams.get('demo');
      if (demoKey && typeof getDemoTripData === 'function') {
        activeTrip = getDemoTripData(demoKey);
      }
    }

    if (activeTrip && activeTrip.destination) {
      destination = activeTrip.destination;
    }

    // Context questions
    if (text.includes("pack")) {
      if (activeTrip && activeTrip.packingList) {
        return `🎒 Recommended Packing List for ${destination}:\n\n` + activeTrip.packingList.map(item => `• ${item}`).join('\n');
      }
      return `🎒 For ${destination}, I recommend packing:\n• Lightweight comfortable outfits\n• Walking shoes or strap-on sandals\n• Sunscreen & polarized sunglasses\n• Powerbank and charger adapters\n• Any personal prescription medicines`;
    }
    
    if (text.includes("family") || text.includes("kid") || text.includes("parent")) {
      if (destination.toLowerCase().includes("goa")) {
        return "👨‍👩‍👧 Goa is exceptionally family friendly! South Goa offers calm beaches (Varca, Benaulim), UNESCO spice plantations, and dolphin spotting cruises which kids and elderly parents adore. North Goa shacks are lively, so South Goa is better for peaceful family stays.";
      }
      if (destination.toLowerCase().includes("manali")) {
        return "👨‍👩‍👧 Yes, Manali is wonderful for families! Children will love playing in the snow at Solang Valley, exploring Sissu waterfalls, and taking short treks. Keep warm layers, as temperatures drop rapidly.";
      }
      if (destination.toLowerCase().includes("jaipur")) {
        return "👨‍👩‍👧 Absolutely! Jaipur is a vibrant family destination. Children enjoy the magnificent forts, puppet shows, and regional feasts at Chokhi Dhani, while adults love the rich history and block-printing workshops.";
      }
      if (destination.toLowerCase().includes("kerala")) {
        return "👨‍👩‍👧 Kerala is the ultimate family rejuvenator. Private Alleppey houseboats, Munnar tea plantation drives, and wild elephant spotting at Periyar Lake are perfectly curated for all age brackets.";
      }
      return `👨‍👩‍👧 Yes! ${destination} is an excellent family-friendly getaway. We customize itineraries to avoid hectic transits so travelers of all age groups stay comfortable.`;
    }

    if (text.includes("cash") || text.includes("money") || text.includes("pay") || text.includes("upi")) {
      return "💵 Cash Tip: UPI digital payments (Google Pay, PhonePe, Paytm) are widely accepted by almost 99% of cafes, hotels, and local street vendors in India. However, we suggest carrying around ₹3,000 - ₹5,000 in cash for emergency tips, remote auto rides, or shopping in local village markets.";
    }

    if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("namaste")) {
      return `🙏 Namaste! Welcome to TripGenius Assistant. I am ready to guide you on your journey to ${destination}. Ask me about packing lists, local food, cash tips, or safety!`;
    }

    if (text.includes("food") || text.includes("eat") || text.includes("dish") || text.includes("restaurant") || text.includes("cafe")) {
      if (activeTrip && activeTrip.food) {
        return `🍲 Culinary Highlights for ${destination}:\n\n` + activeTrip.food.map(f => `• ${f.dishName} (${f.type}) - recommended at "${f.recommendedPlace}"`).join('\n');
      }
      return `🍲 You must explore local regional flavors! In India, look out for busy local diners with high turnover to enjoy fresh and authentic ingredients safely.`;
    }

    if (text.includes("safety") || text.includes("safe") || text.includes("emergency") || text.includes("hospital")) {
      if (activeTrip && activeTrip.emergencyCard) {
        return `🚨 Safety Measures for ${destination}:\n\n` + activeTrip.emergencyCard.localSafetyTips.map(tip => `• ${tip}`).join('\n') + `\n\nTourist Helpline: ${activeTrip.emergencyCard.touristHelpline}`;
      }
      return "🚨 Always map your directions offline, keep your emergency contacts updated, carry a personal first-aid kit, and use registered cabs rather than unverified transport.";
    }

    return `✨ That's a great question! For ${destination}, I suggest reviewing our curated timeline, checking local weather guidelines, or planning transport connections ahead of time. Let me know if I can detail any other aspect!`;
  };

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    input.value = '';

    // Typing simulation
    setTimeout(() => {
      const reply = getBotResponse(query);
      addMessage(reply, 'bot');
    }, 500);
  });

  suggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const query = btn.getAttribute('data-q');
    addMessage(query, 'user');
    setTimeout(() => {
      const reply = getBotResponse(query);
      addMessage(reply, 'bot');
    }, 500);
  });
}

// System Entry point bootstrapper
async function initializeApp() {
  // 1. Hook router events
  window.addEventListener('hashchange', router);
  
  // 2. Initialize modal click listeners
  initDialogControls();

  // Initialize global chatbot
  initChatbot();

  // 3. Connect DB & Auth backend drivers on load
  console.log("TripGenius launching core drivers...");
  const isLive = await initBackend(handleAuthStateChange);
  
  if (isLive) {
    showToast("TripGenius connected to live Firebase.", "success");
  } else {
    showToast("Sandbox active. Try demo destinations!", "success");
  }

  // 4. Initial Route evaluation
  router();
}

// Start application
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeApp();
} else {
  window.addEventListener('DOMContentLoaded', initializeApp);
}
