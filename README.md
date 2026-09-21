# AI-Based Weather Forecasting System

A responsive weather forecasting web application built with Python Flask, JavaScript, HTML, CSS, and the Open-Meteo API.

## Overview
The AI-Based Weather Forecasting System is a web application that provides real-time weather information, hourly forecasts, weekly outlooks, and automated lifestyle recommendations. Built using Python Flask on the backend and JavaScript, HTML, and CSS on the frontend, the application retrieves live meteorological data from the Open-Meteo API and presents it through an interactive, responsive web interface.

## Features
- Location-Based Weather Search: Global city search with debounced real-time autocomplete suggestions.
- Current Weather Information: Real-time temperature readout, feels-like temperature, weather condition summary, daily high/low range, air pressure, and cloud cover.
- Detailed Meteorological Metrics: Relative humidity percentage, wind speed and direction compass, UV index risk rating, precipitation probability and accumulation, daylight schedule (sunrise/sunset timeline), dew point, and visibility.
- Smart Weather Insights: Automated, rule-based algorithms generating outfit suggestions, outdoor fitness suitability scores, UV protection guidance, and city travel recommendations based on live weather parameters.
- 24-Hour Forecast: Horizontal scrollable track with hourly temperature, condition icons, and rain probability.
- 7-Day Forecast: Daily forecast cards featuring min-max temperature range bar visualizers and rain indicators.
- Unit Switching: Dynamic toggle between metric (°C, km/h, mm) and imperial (°F, mph, in) measurement units with local storage state persistence.
- Error Handling: Network error toast alerts and skeleton loading indicators during API requests.
- Responsive Interface: Glassmorphic UI layout adapted for desktop, tablet, and mobile screens.

## Technologies Used
- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Open-Meteo API

## Project Structure
```
weather-forecasting-system/
├── app.py                  # Flask backend application and REST proxy routes
├── run.py                  # Application launcher script
├── requirements.txt        # Python dependencies (Flask, requests)
├── .gitignore              # Git file exclusion configuration
├── static/
│   ├── css/
│   │   └── style.css       # Design system, glassmorphic styles, and responsive layout
│   └── js/
│       ├── app.js          # Client application logic and weather calculation algorithms
│       └── chart.min.js    # Charting utility script
├── templates/
│   └── index.html          # Main HTML5 dashboard template
└── README.md               # Project documentation
```

## How It Works
1. The user enters a location in the search bar or selects a location pill.
2. The Flask application receives the request and queries the Open-Meteo Geocoding API to resolve coordinates.
3. Flask fetches meteorological metrics from the Open-Meteo Weather Forecast API.
4. The backend formats and proxies the JSON payload to the frontend.
5. JavaScript processes the data, calculates rule-based lifestyle insights, and updates the HTML/CSS interface dynamically.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/akunuriramu/weather-forecasting-system.git
```

2. Open the project directory:
```bash
cd weather-forecasting-system
```

3. Create and activate a virtual environment (optional but recommended):
On Windows:
```cmd
python -m venv venv
venv\Scripts\activate
```
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

4. Install required dependencies:
```bash
pip install -r requirements.txt
```

5. Run the application:
```bash
python app.py
```

6. Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

## API
This project utilizes the free Open-Meteo API and OpenStreetMap Nominatim API for weather and location data:
- Open-Meteo Geocoding API: Resolves location names to latitude, longitude, and timezone.
- Open-Meteo Forecast API: Retrieves current weather parameters, 24-hour predictions, and 7-day daily forecasts.
- Nominatim Reverse Geocoding API: Converts latitude and longitude coordinates to city names during browser geolocation lookup.

No API key is required to run this application.

## Future Improvements
- Weather Alerts: Severe weather notifications for thunderstorms and extreme heat.
- Historical Weather Data: Comparison of current conditions against historical averages.
- Additional Weather Visualizations: Interactive radar maps for cloud cover and precipitation tracking.
- User Preferences: Saved favorite locations and default unit settings across browser sessions.

## Author
Rama Shivanjaneyulu
GitHub: https://github.com/akunuriramu
