# ⚡ Quick Start: WeatherAPI.com Integration

## 🚀 Get Started in 3 Steps

### Step 1: Get Your API Key (2 minutes)

1. Go to: https://www.weatherapi.com/
2. Click **"Sign Up"** (top right)
3. Complete signup (no credit card needed)
4. Check your email to verify
5. Copy your API key from the dashboard

### Step 2: Add to Your Project (1 minute)

Create `.env.local` in the project root:

```env
VITE_WEATHERAPI_KEY=paste_your_key_here
VITE_OPENAI_API_KEY=your_openai_key
```

### Step 3: Start Building (30 seconds)

```bash
npm run dev
```

Done! ✨

---

## 📍 What Works Now

✅ Ask for weather in any city  
✅ Get outfit recommendations  
✅ Create AI-powered schedules  
✅ See hourly forecasts  
✅ Get activity suggestions

---

## 🔍 Test It

Try these in the chat:

- "What's the weather in London?"
- "Plan my day in NYC"
- "What should I wear tomorrow in philly?"

---

## 📚 Full Docs

- **Setup Guide**: [WEATHERAPI_SETUP.md](./WEATHERAPI_SETUP.md)
- **Code Changes**: [CODE_CHANGES.md](./CODE_CHANGES.md)
- **Migration Info**: [WEATHERAPI_MIGRATION.md](./WEATHERAPI_MIGRATION.md)

---

## ❌ If Something's Wrong

**Error: "VITE_WEATHERAPI_KEY is not defined"**

- Check `.env.local` file exists in root folder
- Verify key is correct
- Restart dev server: `npm run dev`

**Error: "City not found"**

- Try a different city (spell check!)
- Try major cities: London, NYC, Tokyo

**Weather not loading?**

- Check browser console (F12)
- Verify API key is correct
- Check your remaining API calls: https://www.weatherapi.com/my/account.jsp

---

## 💰 Pricing

**Free Tier**:

- 1,000,000 API calls per month
- 10-day forecast
- Hourly data
- Weather alerts
- **No credit card required**

For most users, the free tier is unlimited! 🎉

---

## 📊 Architecture

```
Your App
    ↓
ChatGPT (AI Logic)
    ↓
WeatherAPI.com (Real Data)
```

- **ChatGPT**: Outfit ideas, activity suggestions, scheduling
- **WeatherAPI.com**: Current weather, forecasts, alerts

---

## 🆘 Need Help?

1. Check [WEATHERAPI_SETUP.md](./WEATHERAPI_SETUP.md) for troubleshooting
2. Visit https://www.weatherapi.com/docs/ for API docs
3. Check browser console for error messages

---

**You're ready! Start building awesome weather features! 🌤️**
