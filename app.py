import os
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Open-Meteo API Endpoints
GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast"
REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse"

HEADERS = {
    "User-Agent": "INDHRAWeatherApp/1.0 (contact: admin@indhra.local)"
}


@app.route("/")
def index():
    """Render the INDHRA weather forecasting web application."""
    return render_template("index.html")


@app.route("/api/search")
def search_location():
    """
    Search for cities/locations by query name using Open-Meteo Geocoding API.
    Query Param: q (string)
    """
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"results": []})

    try:
        params = {
            "name": query,
            "count": 10,
            "language": "en",
            "format": "json"
        }
        response = requests.get(GEOCODING_API_URL, params=params, headers=HEADERS, timeout=8)
        response.raise_for_status()
        data = response.json()

        results = []
        for item in data.get("results", []):
            results.append({
                "id": item.get("id"),
                "name": item.get("name"),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "country": item.get("country", ""),
                "country_code": item.get("country_code", ""),
                "admin1": item.get("admin1", ""),
                "timezone": item.get("timezone", "UTC"),
                "elevation": item.get("elevation", 0)
            })

        return jsonify({"results": results})

    except requests.RequestException as e:
        app.logger.error(f"Geocoding API error: {e}")
        return jsonify({"error": "Failed to fetch locations from geocoding service.", "details": str(e)}), 502


@app.route("/api/weather")
def get_weather():
    """
    Fetch comprehensive current, hourly, and 7-day weather forecasts.
    Query Params: lat (float), lon (float), timezone (string, optional)
    """
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    timezone = request.args.get("timezone", "auto")

    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude parameter."}), 400

    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "cloud_cover",
                "pressure_msl",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m"
            ],
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "dew_point_2m",
                "apparent_temperature",
                "precipitation_probability",
                "precipitation",
                "weather_code",
                "pressure_msl",
                "cloud_cover",
                "visibility",
                "wind_speed_10m",
                "wind_direction_10m",
                "uv_index"
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "apparent_temperature_max",
                "apparent_temperature_min",
                "sunrise",
                "sunset",
                "uv_index_max",
                "precipitation_sum",
                "precipitation_probability_max",
                "wind_speed_10m_max",
                "wind_gusts_10m_max",
                "wind_direction_10m_dominant"
            ],
            "timezone": timezone
        }

        response = requests.get(FORECAST_API_URL, params=params, headers=HEADERS, timeout=10)
        response.raise_for_status()
        weather_data = response.json()

        return jsonify(weather_data)

    except requests.RequestException as e:
        app.logger.error(f"Weather API error: {e}")
        return jsonify({"error": "Failed to retrieve forecast data from weather service.", "details": str(e)}), 502


@app.route("/api/reverse-geocode")
def reverse_geocode():
    """
    Reverse geocode latitude and longitude to get location name for browser geolocation.
    Query Params: lat (float), lon (float)
    """
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude."}), 400

    try:
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json"
        }
        response = requests.get(REVERSE_GEOCODE_URL, params=params, headers=HEADERS, timeout=8)
        response.raise_for_status()
        data = response.json()

        address = data.get("address", {})
        city = (
            address.get("city") or
            address.get("town") or
            address.get("village") or
            address.get("municipality") or
            address.get("suburb") or
            address.get("county") or
            "Current Location"
        )
        country = address.get("country", "")
        country_code = address.get("country_code", "").upper()
        admin1 = address.get("state", "")

        return jsonify({
            "name": city,
            "country": country,
            "country_code": country_code,
            "admin1": admin1,
            "latitude": float(lat),
            "longitude": float(lon)
        })

    except requests.RequestException as e:
        app.logger.error(f"Reverse geocode error: {e}")
        return jsonify({
            "name": "Current Location",
            "country": "",
            "country_code": "",
            "latitude": float(lat),
            "longitude": float(lon)
        })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
