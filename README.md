# 🌧️ INDHRA Weather Forecasting Application

A modern, responsive, real-time weather forecasting web application built with **Python Flask**, HTML5, CSS3, and JavaScript, powered by the free **Open-Meteo API** (No API key required!).

![Flask](https://img.shields.io/badge/Flask-3.x-green) ![Python](https://img.shields.io/badge/Python-3.8+-blue) ![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-blue) ![License](https://img.shields.io/badge/License-MIT-purple)

---

## 📖 Project Overview

**INDHRA Weather** is a full-stack weather forecasting dashboard designed to deliver real-time atmospheric data, hourly predictions, accurate 7-day outlooks, and intelligent lifestyle recommendations. Built with Python Flask on the backend and modern vanilla CSS Glassmorphism on the frontend, the app dynamically changes its visual ambient backdrop depending on current weather conditions (Sunny, Night, Rain, Storm, Snow, Fog, Cloud).

---

## ✨ Features

- 🌧️ **INDHRA Branding & Rain Logo**: Modern glassmorphic interface with custom rain icon badge.
- 🔍 **Real-Time Location Search**: Global city search with debounced real-time autocomplete dropdown.
- 📍 **Browser Geolocation**: One-click "My Location" detection with reverse geocoding.
- 🌡️ **Current Weather Hero**: Displays real-time temperature, weather condition description, feels-like temperature, daily high/low range, pressure, cloud cover, and local time.
- 📊 **Detailed Weather Metrics Grid**:
  - **Humidity**: Relative air moisture percentage with comfort level rating.
  - **Wind Speed & Direction**: Real-time speed, gusts, and animated compass pointer.
  - **UV Index**: 0-12 solar radiation scale with risk level gauge.
  - **Rain & Precipitation**: Rain probability percentage and exact precipitation accumulation (mm / inches).
  - **Daylight Arc**: Sunrise, sunset, daylight duration, and live solar position tracking.
  - **Visibility & Dew Point**: Distance clarity rating and condensation temperature.
- 👕 **Smart Weather Insights & Lifestyle Advisor**:
  - **Outfit Advisor**: Recommends appropriate apparel based on temperature and rain.
  - **Outdoor Fitness Score**: Calculates an outdoor activity rating (0-100%) for running, cycling, and dining.
  - **Sun & UV Care**: Recommends SPF sunscreen levels and protective wear based on UV index.
  - **City Travel Advisor**: Personalized recommendations for outdoor sightseeing vs indoor museum visits.
- ⏰ **24-Hour Forecast Carousel**: Horizontal scrollable track with hourly temperatures, icons, and rain chances.
- 📅 **Accurate 7-Day Outlook**: Daily weather forecast cards with min-max temperature range bar visualizers and precise rain indicators (`No Rain (0%)` vs `Rain % (mm)`).
- 🔄 **°C / °F Unit Switcher**: Instant toggle between metric (°C, km/h, mm) and imperial (°F, mph, in) units with persistent memory.
- 🎨 **Dynamic Glassmorphism**: Smooth CSS keyframe animations, floating icons, background light particles, and frosted glass reflections.

---

## 🛠️ Technologies Used

### Backend
- **Python 3.8+**
- **Flask**: Lightweight WSGI web application server
- **Requests**: HTTP client library for Open-Meteo REST API calls

### Frontend
- **HTML5**: Semantic web markup with accessibility structure
- **CSS3**: Modern Vanilla CSS with HSL design tokens, Glassmorphism, animations, and Flexbox/Grid layouts
- **JavaScript (ES6+)**: Modular client-side logic, debounced search, unit conversion, and particle canvas rendering
- **FontAwesome 6**: High-resolution vector icon library
- **Chart.js**: Client-side charting library

---

## 🛰️ APIs Used (Free, Zero API Key Required)

1. **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
   - Used for global city search, coordinate lookup, and timezone identification.
2. **Open-Meteo Weather Forecast API**: `https://api.open-meteo.com/v1/forecast`
   - Used for current weather, hourly forecast metrics, and daily 7-day outlooks.
3. **Nominatim Reverse Geocoding API**: `https://nominatim.openstreetmap.org/reverse`
   - Used to convert GPS latitude/longitude coordinates to city names during browser geolocation.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
Ensure you have **Python 3.8** or higher installed on your machine.

### 2. Clone Repository
```bash
git clone https://github.com/your-username/indhra-weather.git
cd indhra-weather
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Application
```bash
python app.py
# or
python run.py
```

### 5. Open in Browser
Navigate to `http://127.0.0.1:5000` in your web browser.

---

## 📁 Project Structure

```
Weather forecasting/
├── app.py                  # Flask backend server & REST proxy endpoints
├── run.py                  # Server launcher script
├── requirements.txt        # Python dependencies (Flask, requests)
├── .gitignore              # Git ignore rules
├── static/
│   ├── css/
│   │   └── style.css       # Complete design system, glassmorphism & keyframe animations
│   └── js/
│       ├── app.js          # Client application logic & Smart Weather Advisor algorithms
│       └── chart.min.js    # Charting script
├── templates/
│   └── index.html          # HTML5 dashboard layout
└── README.md               # Documentation & setup guide
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
