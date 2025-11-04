# OneKH - Coming Soon Page
[OneKh](https://kh1.net/)
One place for Khmer office & text-processing tools.

## 🚀 Deploy to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `kh1.net`)

2. **Initialize and push the code:**
   ```bash
   git init
   git add .
   git commit -m "Add coming soon page"
   git branch -M main
   git remote add origin https://github.com/kunthet/kh1.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Click **Save**
   - Your site will be live at: `https://kh1.net/`

## 📱 Features

- ✨ Modern, responsive design
- 📱 Mobile-friendly
- 🎨 Beautiful gradient styling
- 💬 Direct Telegram contact link
- 🚀 Fast loading (minimal dependencies)
- 👍 **Firebase voting widget** - Let users vote to support the project

## 🗳️ Firebase Voting Widget Setup

The site includes a lightweight voting widget powered by Firebase Realtime Database.

**Quick Setup:**
1. Create a Firebase project (free tier)
2. Enable Realtime Database
3. Update `vote-widget.js` with your Firebase config

📖 **[Full Setup Guide](FIREBASE_SETUP.md)** - Detailed instructions with security best practices

**Benefits:**
- ⚡ Zero impact on page load (async loading)
- 🔍 SEO-friendly (no content blocking)
- 📊 Real-time vote counting
- 🚫 Anti-spam protection (localStorage + database rules)
- 💰 Free tier sufficient for most sites

**Note:** Keep GitHub Pages hosting! Only use Firebase for the voting database.

## 📞 Contact

Telegram: [@kh1tools](https://t.me/kh1tools)

## 📄 License

All rights reserved.
