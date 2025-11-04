/**
 * Lightweight Firebase Voting Widget
 * Loads asynchronously to avoid blocking page render
 * SEO-friendly with no initial JS dependency
 */

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB0JYYZORal3fiOo12xoTZk5GSa2FFjGTs",
  authDomain: "onekh-voting.firebaseapp.com",
  databaseURL: "https://onekh-voting-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "onekh-voting",
  storageBucket: "onekh-voting.firebasestorage.app",
  messagingSenderId: "1058196661068",
  appId: "1:1058196661068:web:e36447a0be86e0734025e9"
};

class VoteWidget {
  constructor() {
    this.voted = localStorage.getItem('onekh_voted') === 'true';
    this.voteCount = 0;
    this.db = null;
    this.isLoading = true;
  }

  async init() {
    try {
      // Lazy load Firebase SDK
      await this.loadFirebase();
      
      // Initialize Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.db = firebase.database();
      
      // Listen to vote count changes
      this.setupVoteListener();
      this.isLoading = false;
      this.updateUI();
    } catch (error) {
      console.error('Error initializing vote widget:', error);
      this.showError();
    }
  }

  async loadFirebase() {
    // Load Firebase scripts dynamically
    if (typeof firebase === 'undefined') {
      await this.loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
      await this.loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupVoteListener() {
    const voteRef = this.db.ref('votes/total');
    voteRef.on('value', (snapshot) => {
      this.voteCount = snapshot.val() || 0;
      this.updateUI();
    });
  }

  async handleVote() {
    if (this.voted || this.isLoading) return;

    try {
      // Increment vote count
      const voteRef = this.db.ref('votes/total');
      await voteRef.transaction((currentValue) => {
        return (currentValue || 0) + 1;
      });

      // Mark as voted
      this.voted = true;
      localStorage.setItem('onekh_voted', 'true');
      this.updateUI();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    }
  }

  updateUI() {
    const container = document.getElementById('vote-widget');
    if (!container) return;

    const voteButton = container.querySelector('.vote-btn');
    const voteCount = container.querySelector('.vote-count');
    const voteText = container.querySelector('.vote-text');

    if (voteCount) {
      voteCount.textContent = this.formatNumber(this.voteCount);
    }

    if (voteButton) {
      if (this.isLoading) {
        voteButton.disabled = true;
        voteButton.innerHTML = '⏳';
      } else if (this.voted) {
        voteButton.disabled = true;
        voteButton.innerHTML = '✓';
        voteButton.classList.add('voted');
      } else {
        voteButton.disabled = false;
        voteButton.innerHTML = '👍';
      }
    }

    if (voteText) {
      if (this.voted) {
        voteText.textContent = container.getAttribute('data-voted-text') || 'Thanks for voting!';
      } else {
        voteText.textContent = container.getAttribute('data-vote-text') || 'Vote for this project';
      }
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  showError() {
    const container = document.getElementById('vote-widget');
    if (container) {
      container.innerHTML = '<p style="color: #888; font-size: 0.9rem;">Vote widget unavailable</p>';
    }
  }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

function initWidget() {
  const widget = new VoteWidget();
  widget.init();

  // Attach vote handler
  const voteBtn = document.querySelector('#vote-widget .vote-btn');
  if (voteBtn) {
    voteBtn.addEventListener('click', () => widget.handleVote());
  }
}
