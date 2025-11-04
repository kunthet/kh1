# Firebase Vote & Visitor Widget Setup Guide

## Overview

This widget allows users to vote for your project and automatically tracks unique visitors. It displays both metrics in real-time. It's designed to be:
- ⚡ **Lightweight**: Scripts load asynchronously, no impact on initial page load
- 🔍 **SEO-friendly**: Static HTML content remains crawlable
- 📱 **Responsive**: Works on all devices
- 🚀 **Fast**: Uses localStorage to prevent duplicate votes/visits, minimal Firebase calls
- 📊 **Analytics**: Tracks both votes and unique visitors

## Should You Move to Firebase Hosting?

**NO** - You can keep GitHub Pages! The widget only uses:
- **Firebase Realtime Database** for storing vote & visitor counts
- Your site stays on GitHub Pages (free, fast, great SEO)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name (e.g., "onekh-voting")
4. Disable Google Analytics (optional, not needed for voting)
5. Click **"Create project"**

## Step 2: Set Up Realtime Database

1. In Firebase Console, go to **"Build" → "Realtime Database"**
2. Click **"Create Database"**
3. Choose a location (e.g., `us-central1` or closest to your users)
4. Start in **"Test mode"** (for development)

### Important: Configure Database Rules

After creating the database, set up security rules:

1. Go to **"Rules"** tab in Realtime Database
2. Replace the rules with this (allows reads, prevents spam):

```json
{
  "rules": {
    "votes": {
      ".read": true,
      "total": {
        ".write": "!data.exists() || newData.val() == data.val() + 1",
        ".validate": "newData.isNumber() && newData.val() >= 0"
      }
    },
    "visitors": {
      ".read": true,
      "total": {
        ".write": "!data.exists() || newData.val() == data.val() + 1",
        ".validate": "newData.isNumber() && newData.val() >= 0"
      }
    }
  }
}
```

**Or simply copy the rules from `firebase-rules.json` in your project root.**

This configuration:
- ✅ Anyone can read the vote & visitor counts
- ✅ Anyone can increment by 1 (vote or visit)
- ❌ Cannot decrease or set arbitrary numbers
- ❌ Prevents spam by limiting increments to +1 only

3. Click **"Publish"**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **"Web" icon** (`</>`)
4. Register your app:
   - App nickname: `OneKH Website`
   - **DO NOT** check "Set up Firebase Hosting"
5. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Update vote-widget.js

1. Open `vote-widget.js`
2. Find the `firebaseConfig` object (lines 8-15)
3. Replace the placeholder values with your actual Firebase config:

```javascript
// REPLACE THESE VALUES with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_ACTUAL_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Deploy to GitHub Pages

1. Commit all changes:
```bash
git add .
git commit -m "Add Firebase voting widget"
git push origin main
```

2. Your site will automatically update on GitHub Pages
3. Test the voting widget at `https://kh1.net/`

## Step 6: Test the Widget

1. Open your website in a browser
2. You should see:
   - Vote count (starts at 0)
   - Visitor count (automatically increments on first visit)
   - A clickable vote button (👍)
   - "Vote to support this project!" text
3. The visitor count should increment automatically (once per browser)
4. Click the vote button
5. The button should change to ✓ and vote count should increase
6. Try refreshing - you shouldn't be able to vote again or be counted as a new visitor

**How it works:**
- **Visitors**: Tracked automatically on first page load using localStorage key `onekh_visited`
- **Votes**: Tracked when user clicks the vote button using localStorage key `onekh_voted`
- Both counts update in real-time across all connected browsers

## Security Considerations

### API Key Security
The Firebase API key in your code is **safe to expose**. It's designed to be public for web apps. Real security comes from:
- Database Rules (set in Step 2)
- Firebase Authentication (if you add it later)

### Preventing Vote & Visitor Manipulation

Current protection:
- ✅ LocalStorage prevents same browser from voting twice (`onekh_voted`)
- ✅ LocalStorage prevents same browser from being counted as visitor twice (`onekh_visited`)
- ✅ Database rules prevent arbitrary number changes
- ✅ Can only increment by 1 per transaction
- ✅ Separate tracking for votes and visitors

For stronger protection (optional):
1. Add Firebase Authentication
2. Require sign-in to vote
3. Track votes by user ID in database
4. Implement rate limiting with Cloud Functions

### Advanced: Spam Protection with Cloud Functions

If you experience spam, you can add serverless functions:

1. Enable Cloud Functions for Firebase
2. Create a function to validate votes:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.recordVote = functions.https.onCall(async (data, context) => {
  // Add IP-based rate limiting
  // Add CAPTCHA verification
  // Add timestamp tracking
  
  const voteRef = admin.database().ref('votes/total');
  await voteRef.transaction(current => (current || 0) + 1);
  
  return { success: true };
});
```

## Monitoring & Analytics

### View Metrics in Firebase Console
1. Go to **Realtime Database**
2. Navigate to see:
   - `/votes/total` - Total vote count
   - `/visitors/total` - Total unique visitors
3. See real-time updates as users interact with your site

### Export Data
```javascript
// In Firebase Console → Realtime Database → Export JSON
// Or programmatically:
const votesSnapshot = await firebase.database().ref('votes/total').once('value');
const visitorsSnapshot = await firebase.database().ref('visitors/total').once('value');

console.log(`Total votes: ${votesSnapshot.val()}`);
console.log(`Total visitors: ${visitorsSnapshot.val()}`);
console.log(`Vote rate: ${(votesSnapshot.val() / visitorsSnapshot.val() * 100).toFixed(1)}%`);
```

## Troubleshooting

### Widget shows "Vote widget unavailable"
- Check browser console for errors
- Verify Firebase config is correct
- Check database rules allow reads
- Ensure databaseURL is correct

### Vote button doesn't work
- Check browser console for errors
- Verify database rules allow writes
- Check if you've already voted (localStorage)
- Clear browser cache and localStorage

### Vote count doesn't update
- Check internet connection
- Verify databaseURL in config
- Check Firebase Console for database status
- Look for errors in browser console

### LocalStorage not working
- Check if browser allows localStorage
- Try in incognito/private mode
- Clear browser data
- Check for browser extensions blocking storage

## Performance Metrics

This setup is **very lightweight**:
- 📦 **CSS**: ~1.5 KB (lazy loaded)
- 📦 **JavaScript**: ~3 KB (your code) + ~120 KB (Firebase SDK, cached)
- 🚀 **First Load**: 0ms blocking (async loading)
- 🚀 **Subsequent Loads**: Firebase SDK cached, < 1ms
- 📊 **Database Reads**: 1 per page load + real-time updates
- 📊 **Database Writes**: 1 per vote

## Cost Estimate

Firebase Free Tier (Spark Plan):
- ✅ **Realtime Database**: 1 GB storage (more than enough)
- ✅ **Simultaneous connections**: 100
- ✅ **GB downloaded**: 10 GB/month

For a simple voting widget, you'll stay within free tier unless you have millions of visitors.

## Customization

### Change Widget Text
Edit the `data-vote-text` and `data-voted-text` attributes in HTML:

```html
<div id="vote-widget" 
     data-vote-text="Your custom text here"
     data-voted-text="Thank you message here">
```

### Change Widget Style
Edit `vote-widget.css` to match your design:
- Colors: Modify gradient values
- Size: Change button width/height
- Position: Adjust margins/padding

### Track Individual Votes
To track who voted, modify `vote-widget.js`:

```javascript
// Add vote tracking
const voteData = {
  timestamp: Date.now(),
  userAgent: navigator.userAgent
};
await this.db.ref('votes/records').push(voteData);
```

## FAQ

**Q: Will this slow down my site?**
A: No. Scripts load asynchronously after page content. Zero impact on initial load.

**Q: Can users vote multiple times?**
A: No. LocalStorage prevents re-voting from the same browser. For stronger security, add authentication.

**Q: What if someone clears localStorage?**
A: They can vote again. For production, implement server-side tracking with authentication.

**Q: Is Firebase free?**
A: Yes, for this use case. The free tier is generous enough for most small-medium sites.

**Q: Can I use Firestore instead of Realtime Database?**
A: Yes, but Realtime Database is lighter and better for simple counters.

**Q: Do I need to move my site to Firebase Hosting?**
A: No! Keep GitHub Pages. Only use Firebase for the database.

## Support

For issues or questions:
- 📧 Open an issue on GitHub
- 💬 Contact via Telegram: [@kh1tools](https://t.me/kh1tools)

## Next Steps

After setup, consider:
1. ✅ Monitor vote count in Firebase Console
2. ✅ Add Firebase Authentication for stronger security
3. ✅ Implement Cloud Functions for spam protection
4. ✅ Add Analytics to track user engagement
5. ✅ Export vote data periodically for backup

---

**Remember**: Keep your GitHub Pages hosting. Firebase is only for the voting database! 🚀
