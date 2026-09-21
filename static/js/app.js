/**
 * CineVault Weather - Ultra-Accurate & Premium Weather Application
 * Open-Meteo API Integration, Smart Weather Suggestions & City Advisor, 7-Day Forecast
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Application State & Variables
    // ----------------------------------------------------------------------
    const state = {
        currentLocation: {
            name: 'Tokyo',
            country: 'Japan',
            latitude: 35.6895,
            longitude: 139.6917,
            timezone: 'Asia/Tokyo'
        },
        unit: localStorage.getItem('weather_unit') || 'C', // 'C' or 'F'
        rawData: null,
        searchDebounceTimeout: null,
        particlesAnimationId: null
    };

    // ----------------------------------------------------------------------
    // 2. DOM Elements Selector
    // ----------------------------------------------------------------------
    const elements = {
        body: document.body,
        ambientBackdrop: document.getElementById('ambient-backdrop'),
        particlesCanvas: document.getElementById('weather-particles-canvas'),
        searchInput: document.getElementById('location-search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        searchDropdown: document.getElementById('search-results-dropdown'),
        geoLocationBtn: document.getElementById('geo-location-btn'),
        unitCBtn: document.getElementById('unit-c-btn'),
        unitFBtn: document.getElementById('unit-f-btn'),
        cityPills: document.querySelectorAll('.city-pill'),
        toastContainer: document.getElementById('toast-container'),
        skeletonLoader: document.getElementById('skeleton-loader'),
        weatherDashboard: document.getElementById('weather-dashboard'),

        // Hero Card
        currentLocationName: document.getElementById('current-location-name'),
        currentLocationMeta: document.getElementById('current-location-meta'),
        localTimeStr: document.getElementById('local-time-str'),
        currentWeatherIcon: document.getElementById('current-weather-icon'),
        currentTempVal: document.getElementById('current-temp-val'),
        tempUnitSymbol: document.getElementById('temp-unit-symbol'),
        currentConditionText: document.getElementById('current-condition-text'),
        feelsLikeVal: document.getElementById('feels-like-val'),
        tempMaxVal: document.getElementById('temp-max-val'),
        tempMinVal: document.getElementById('temp-min-val'),
        cloudCoverVal: document.getElementById('cloud-cover-val'),
        pressureVal: document.getElementById('pressure-val'),

        // Metrics Grid
        humidityVal: document.getElementById('humidity-val'),
        humidityBadge: document.getElementById('humidity-badge'),
        humidityProgress: document.getElementById('humidity-progress'),
        humidityDesc: document.getElementById('humidity-desc'),

        windSpeedVal: document.getElementById('wind-speed-val'),
        windUnit: document.getElementById('wind-unit'),
        windDirectionArrow: document.getElementById('wind-direction-arrow'),
        windDirText: document.getElementById('wind-dir-text'),
        windGustsVal: document.getElementById('wind-gusts-val'),

        uvVal: document.getElementById('uv-val'),
        uvBadge: document.getElementById('uv-badge'),
        uvProgress: document.getElementById('uv-progress'),
        uvDesc: document.getElementById('uv-desc'),

        precipVal: document.getElementById('precip-val'),
        precipUnit: document.getElementById('precip-unit'),
        precipBadge: document.getElementById('precip-badge'),
        precipProbVal: document.getElementById('precip-prob-val'),

        sunriseTime: document.getElementById('sunrise-time'),
        sunsetTime: document.getElementById('sunset-time'),
        daylightDurationStr: document.getElementById('daylight-duration-str'),
        sunPositionDot: document.getElementById('sun-position-dot'),

        visibilityVal: document.getElementById('visibility-val'),
        visibilityUnit: document.getElementById('visibility-unit'),
        visibilityDesc: document.getElementById('visibility-desc'),

        dewpointVal: document.getElementById('dewpoint-val'),
        dewpointDesc: document.getElementById('dewpoint-desc'),

        // Smart Suggestions & Forecast Containers
        smartSuggestionsContainer: document.getElementById('smart-suggestions-container'),
        hourlyTrack: document.getElementById('hourly-forecast-track'),
        dailyList: document.getElementById('daily-forecast-list')
    };

    // ----------------------------------------------------------------------
    // 3. WMO Weather Code Interpreter
    // ----------------------------------------------------------------------
    const WMO_CODES = {
        0: { desc: 'Clear Sky', dayIcon: 'fa-sun icon-sunny', nightIcon: 'fa-moon icon-night', theme: 'sunny' },
        1: { desc: 'Mainly Clear', dayIcon: 'fa-cloud-sun icon-sunny', nightIcon: 'fa-cloud-moon icon-night', theme: 'sunny' },
        2: { desc: 'Partly Cloudy', dayIcon: 'fa-cloud-sun icon-cloudy', nightIcon: 'fa-cloud-moon icon-cloudy', theme: 'cloudy' },
        3: { desc: 'Overcast', dayIcon: 'fa-cloud icon-cloudy', nightIcon: 'fa-cloud icon-cloudy', theme: 'cloudy' },
        45: { desc: 'Foggy', dayIcon: 'fa-smog icon-cloudy', nightIcon: 'fa-smog icon-cloudy', theme: 'cloudy' },
        48: { desc: 'Depositing Rime Fog', dayIcon: 'fa-smog icon-cloudy', nightIcon: 'fa-smog icon-cloudy', theme: 'cloudy' },
        51: { desc: 'Light Drizzle', dayIcon: 'fa-cloud-rain icon-rainy', nightIcon: 'fa-cloud-rain icon-rainy', theme: 'rainy' },
        53: { desc: 'Moderate Drizzle', dayIcon: 'fa-cloud-rain icon-rainy', nightIcon: 'fa-cloud-rain icon-rainy', theme: 'rainy' },
        55: { desc: 'Dense Drizzle', dayIcon: 'fa-cloud-showers-heavy icon-rainy', nightIcon: 'fa-cloud-showers-heavy icon-rainy', theme: 'rainy' },
        61: { desc: 'Slight Rain', dayIcon: 'fa-cloud-rain icon-rainy', nightIcon: 'fa-cloud-rain icon-rainy', theme: 'rainy' },
        63: { desc: 'Moderate Rain', dayIcon: 'fa-cloud-showers-heavy icon-rainy', nightIcon: 'fa-cloud-showers-heavy icon-rainy', theme: 'rainy' },
        65: { desc: 'Heavy Rain', dayIcon: 'fa-cloud-showers-water icon-rainy', nightIcon: 'fa-cloud-showers-water icon-rainy', theme: 'rainy' },
        71: { desc: 'Slight Snow', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        73: { desc: 'Moderate Snow', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        75: { desc: 'Heavy Snow', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        77: { desc: 'Snow Grains', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        80: { desc: 'Light Rain Showers', dayIcon: 'fa-cloud-sun-rain icon-rainy', nightIcon: 'fa-cloud-moon-rain icon-rainy', theme: 'rainy' },
        81: { desc: 'Moderate Rain Showers', dayIcon: 'fa-cloud-showers-heavy icon-rainy', nightIcon: 'fa-cloud-showers-heavy icon-rainy', theme: 'rainy' },
        82: { desc: 'Violent Rain Showers', dayIcon: 'fa-cloud-showers-water icon-rainy', nightIcon: 'fa-cloud-showers-water icon-rainy', theme: 'rainy' },
        85: { desc: 'Slight Snow Showers', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        86: { desc: 'Heavy Snow Showers', dayIcon: 'fa-snowflake icon-snowy', nightIcon: 'fa-snowflake icon-snowy', theme: 'snowy' },
        95: { desc: 'Thunderstorm', dayIcon: 'fa-bolt-lightning icon-stormy', nightIcon: 'fa-bolt-lightning icon-stormy', theme: 'stormy' },
        96: { desc: 'Thunderstorm & Hail', dayIcon: 'fa-cloud-bolt icon-stormy', nightIcon: 'fa-cloud-bolt icon-stormy', theme: 'stormy' },
        99: { desc: 'Heavy Thunderstorm', dayIcon: 'fa-cloud-bolt icon-stormy', nightIcon: 'fa-cloud-bolt icon-stormy', theme: 'stormy' }
    };

    function getWeatherMeta(code, isDay = 1) {
        const info = WMO_CODES[code] || { desc: 'Weather', dayIcon: 'fa-cloud icon-cloudy', nightIcon: 'fa-cloud icon-cloudy', theme: 'cloudy' };
        const iconClass = isDay === 1 ? info.dayIcon : info.nightIcon;
        const themeClass = isDay === 0 ? 'theme-night' : `theme-${info.theme}`;
        return { desc: info.desc, iconClass, themeClass };
    }

    // ----------------------------------------------------------------------
    // 4. Utility Functions & Unit Converters
    // ----------------------------------------------------------------------
    function cToF(c) {
        if (c === null || c === undefined) return 0;
        return (c * 9 / 5) + 32;
    }

    function formatTemp(cVal) {
        if (cVal === null || cVal === undefined) return '--';
        const val = state.unit === 'F' ? cToF(cVal) : cVal;
        return Math.round(val);
    }

    function kmhToMph(kmh) { return kmh * 0.621371; }

    function formatSpeed(kmhVal) {
        if (kmhVal === null || kmhVal === undefined) return '--';
        const val = state.unit === 'F' ? kmhToMph(kmhVal) : kmhVal;
        return Math.round(val);
    }

    function mmToInches(mm) { return mm * 0.0393701; }

    function formatPrecip(mmVal) {
        if (mmVal === null || mmVal === undefined) return '0.0';
        if (state.unit === 'F') {
            return (mmVal * 0.0393701).toFixed(2);
        }
        return mmVal.toFixed(1);
    }

    function degreesToCompass(deg) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round((deg % 360) / 22.5) % 16;
        return directions[index];
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function updateUnitUI() {
        if (state.unit === 'C') {
            elements.unitCBtn.classList.add('active');
            elements.unitFBtn.classList.remove('active');
            elements.tempUnitSymbol.textContent = '°C';
            elements.windUnit.textContent = 'km/h';
            elements.precipUnit.textContent = 'mm';
            elements.visibilityUnit.textContent = 'km';
            document.querySelectorAll('.temp-unit-symbol').forEach(el => el.textContent = '°C');
        } else {
            elements.unitFBtn.classList.add('active');
            elements.unitCBtn.classList.remove('active');
            elements.tempUnitSymbol.textContent = '°F';
            elements.windUnit.textContent = 'mph';
            elements.precipUnit.textContent = 'in';
            elements.visibilityUnit.textContent = 'mi';
            document.querySelectorAll('.temp-unit-symbol').forEach(el => el.textContent = '°F');
        }
        document.querySelectorAll('.wind-unit-small').forEach(el => el.textContent = state.unit === 'F' ? 'mph' : 'km/h');
    }

    // ----------------------------------------------------------------------
    // 5. API Fetch Methods
    // ----------------------------------------------------------------------
    async function fetchWeather(lat, lon, timezone = 'auto') {
        elements.skeletonLoader.style.display = 'block';
        elements.weatherDashboard.style.opacity = '0.3';

        try {
            const url = `/api/weather?lat=${lat}&lon=${lon}&timezone=${encodeURIComponent(timezone)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch weather forecast.');

            const data = await res.json();
            state.rawData = data;
            renderWeatherData(data);
        } catch (err) {
            console.error(err);
            showToast('Unable to load weather forecast. Please check server connection.', 'error');
        } finally {
            elements.skeletonLoader.style.display = 'none';
            elements.weatherDashboard.style.opacity = '1';
        }
    }

    async function searchLocations(query) {
        if (!query || query.length < 2) {
            elements.searchDropdown.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return;

            const data = await res.json();
            renderSearchResults(data.results || []);
        } catch (err) {
            console.error('Search error:', err);
        }
    }

    async function handleGeolocation() {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }

        elements.geoLocationBtn.disabled = true;
        elements.geoLocationBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                try {
                    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
                    const geoData = await res.json();

                    state.currentLocation = {
                        name: geoData.name || 'Current Location',
                        country: geoData.country || '',
                        latitude: lat,
                        longitude: lon,
                        timezone: 'auto'
                    };

                    updateLocationPillsUI(state.currentLocation.name);
                    fetchWeather(lat, lon);
                    showToast(`Updated location to ${state.currentLocation.name}`);
                } catch (e) {
                    fetchWeather(lat, lon);
                } finally {
                    elements.geoLocationBtn.disabled = false;
                    elements.geoLocationBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i><span class="btn-text">My Location</span>`;
                }
            },
            (err) => {
                elements.geoLocationBtn.disabled = false;
                elements.geoLocationBtn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i><span class="btn-text">My Location</span>`;
                showToast('Unable to retrieve location. Permission denied.', 'error');
            }
        );
    }

    // ----------------------------------------------------------------------
    // 6. UI Rendering & Smart Suggestions Logic
    // ----------------------------------------------------------------------
    function renderSearchResults(results) {
        if (results.length === 0) {
            elements.searchDropdown.innerHTML = `<div class="search-item"><span class="search-item-meta">No locations found</span></div>`;
            elements.searchDropdown.style.display = 'block';
            return;
        }

        elements.searchDropdown.innerHTML = results.map((loc, idx) => `
            <div class="search-item" data-idx="${idx}" data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-name="${loc.name}" data-country="${loc.country}" data-tz="${loc.timezone}">
                <div class="search-item-info">
                    <span class="search-item-name">${loc.name}</span>
                    <span class="search-item-meta">${[loc.admin1, loc.country].filter(Boolean).join(', ')}</span>
                </div>
                <span class="search-item-badge">${loc.timezone.split('/')[0]}</span>
            </div>
        `).join('');

        elements.searchDropdown.style.display = 'block';

        elements.searchDropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                const name = item.dataset.name;
                const country = item.dataset.country;
                const tz = item.dataset.tz;

                state.currentLocation = { name, country, latitude: lat, longitude: lon, timezone: tz };
                elements.searchInput.value = '';
                elements.clearSearchBtn.style.display = 'none';
                elements.searchDropdown.style.display = 'none';

                updateLocationPillsUI(name);
                fetchWeather(lat, lon, tz);
            });
        });
    }

    function updateLocationPillsUI(selectedName) {
        elements.cityPills.forEach(pill => {
            if (pill.dataset.name.toLowerCase() === selectedName.toLowerCase()) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    function renderWeatherData(data) {
        if (!data || !data.current) return;

        const current = data.current;
        const daily = data.daily || {};
        const hourly = data.hourly || {};

        // 1. Hero & Meta Setup
        try {
            const code = current.weather_code;
            const isDay = current.is_day;
            const meta = getWeatherMeta(code, isDay);
            elements.body.className = meta.themeClass;

            elements.currentLocationName.textContent = state.currentLocation.name;
            elements.currentLocationMeta.textContent = [state.currentLocation.country, data.timezone].filter(Boolean).join(' • ');

            if (current.time) {
                const timeObj = new Date(current.time);
                elements.localTimeStr.textContent = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            elements.currentWeatherIcon.innerHTML = `<i class="fa-solid ${meta.iconClass}"></i>`;
            elements.currentConditionText.textContent = meta.desc;
            elements.currentTempVal.textContent = formatTemp(current.temperature_2m);
            elements.feelsLikeVal.textContent = formatTemp(current.apparent_temperature);

            if (daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
                elements.tempMaxVal.textContent = formatTemp(daily.temperature_2m_max[0]);
                elements.tempMinVal.textContent = formatTemp(daily.temperature_2m_min[0]);
            }

            elements.cloudCoverVal.textContent = `${current.cloud_cover}%`;
            elements.pressureVal.textContent = `${Math.round(current.pressure_msl || current.surface_pressure || 1013)} hPa`;
        } catch (e) {
            console.error('Error rendering hero card:', e);
        }

        // 2. Metrics Grid Setup
        try {
            const hum = current.relative_humidity_2m || 0;
            elements.humidityVal.textContent = hum;
            elements.humidityProgress.style.width = `${hum}%`;
            let humRating = 'Optimal';
            if (hum < 30) humRating = 'Dry Air';
            else if (hum > 70) humRating = 'High Moisture';
            elements.humidityBadge.textContent = humRating;
            elements.humidityDesc.textContent = hum < 30 ? 'Low humidity level' : (hum > 70 ? 'Muggy environment' : 'Comfortable relative air');

            const speed = current.wind_speed_10m || 0;
            const deg = current.wind_direction_10m || 0;
            const gusts = current.wind_gusts_10m || speed * 1.25;
            elements.windSpeedVal.textContent = formatSpeed(speed);
            elements.windDirectionArrow.style.transform = `rotate(${deg}deg)`;
            elements.windDirText.textContent = degreesToCompass(deg);
            elements.windGustsVal.textContent = formatSpeed(gusts);

            const uvMax = (daily.uv_index_max && daily.uv_index_max.length > 0) ? daily.uv_index_max[0] : 0;
            const uvVal = Math.round(uvMax * 10) / 10;
            elements.uvVal.textContent = uvVal;
            elements.uvProgress.style.width = `${Math.min((uvVal / 12) * 100, 100)}%`;
            let uvStatus = 'Low Risk';
            if (uvVal >= 3 && uvVal <= 5) uvStatus = 'Moderate';
            else if (uvVal >= 6 && uvVal <= 7) uvStatus = 'High Risk';
            else if (uvVal >= 8 && uvVal <= 10) uvStatus = 'Very High';
            else if (uvVal >= 11) uvStatus = 'Extreme';
            elements.uvBadge.textContent = uvStatus;
            elements.uvDesc.textContent = uvVal < 3 ? 'Minimal sun protection needed' : 'Sunscreen & shade recommended';

            const precip = current.precipitation || 0;
            const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max.length > 0) ? daily.precipitation_probability_max[0] : 0;
            elements.precipVal.textContent = formatPrecip(precip);
            elements.precipBadge.textContent = precipProb > 0 ? `${precipProb}% Rain` : 'No Rain';
            elements.precipProbVal.textContent = `${precipProb}%`;

            if (daily.sunrise && daily.sunrise.length > 0 && daily.sunset && daily.sunset.length > 0) {
                const riseObj = new Date(daily.sunrise[0]);
                const setObj = new Date(daily.sunset[0]);
                elements.sunriseTime.textContent = riseObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                elements.sunsetTime.textContent = setObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const durationMs = setObj - riseObj;
                const hours = (durationMs / (1000 * 60 * 60)).toFixed(1);
                elements.daylightDurationStr.textContent = `${hours} hrs daylight`;

                const now = new Date();
                let pct = ((now - riseObj) / durationMs) * 100;
                pct = Math.max(0, Math.min(100, pct));
                elements.sunPositionDot.style.left = `${pct}%`;
            }

            if (hourly.visibility && hourly.visibility.length > 0) {
                const visKm = hourly.visibility[0] / 1000;
                elements.visibilityVal.textContent = state.unit === 'F' ? (visKm * 0.621371).toFixed(1) : visKm.toFixed(1);
                elements.visibilityDesc.textContent = visKm >= 10 ? 'Clear distance vision' : 'Reduced sight distance';
            }

            if (hourly.dew_point_2m && hourly.dew_point_2m.length > 0) {
                elements.dewpointVal.textContent = formatTemp(hourly.dew_point_2m[0]);
            }
        } catch (e) {
            console.error('Error rendering metrics grid:', e);
        }

        // 3. Render Smart Weather Suggestions & Lifestyle Advisor
        try { renderSmartSuggestions(current, daily, hourly); } catch (e) { console.error('Smart suggestions error:', e); }

        // 4. Render 24-Hour Forecast Carousel
        try { renderHourlyCarousel(hourly); } catch (e) { console.error('Hourly carousel error:', e); }

        // 5. Render 7-Day Outlook List (GUARANTEED ACCURACY)
        try { renderDailyList(daily); } catch (e) { console.error('Daily list error:', e); }
    }

    function renderSmartSuggestions(current, daily, hourly) {
        if (!elements.smartSuggestionsContainer) return;

        const tempC = current.temperature_2m || 0;
        const precip = current.precipitation || 0;
        const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max.length > 0) ? daily.precipitation_probability_max[0] : 0;
        const windKmh = current.wind_speed_10m || 0;
        const uvMax = (daily.uv_index_max && daily.uv_index_max.length > 0) ? daily.uv_index_max[0] : 0;

        // 1. Outfit Recommendation Algorithm
        let outfitIcon = 'fa-shirt text-blue';
        let outfitTitle = 'What to Wear';
        let outfitAdvice = '';
        let outfitBadge = 'Recommended';

        if (tempC < 5) {
            outfitIcon = 'fa-mitten text-rose';
            outfitAdvice = 'Wear a heavy winter coat, thermal inner layers, gloves, and a beanie to stay warm.';
            outfitBadge = 'Bundle Up!';
        } else if (tempC >= 5 && tempC < 15) {
            outfitIcon = 'fa-vest text-amber';
            outfitAdvice = 'Wear a warm jacket, coat, or cozy hoodie over layered clothing.';
            outfitBadge = 'Cool Weather';
        } else if (tempC >= 15 && tempC < 22) {
            outfitIcon = 'fa-shirt text-teal';
            outfitAdvice = 'Comfortable long sleeves, a light cardigan, or a lightweight hoodie are ideal.';
            outfitBadge = 'Mild & Pleasant';
        } else if (tempC >= 22 && tempC < 28) {
            outfitIcon = 'fa-shirt text-emerald';
            outfitAdvice = 'Wear a light t-shirt, breathable cotton clothes, and shorts or jeans.';
            outfitBadge = 'Warm Comfort';
        } else {
            outfitIcon = 'fa-glasses text-yellow';
            outfitAdvice = 'Wear ultra-light summer attire, sunglasses, and a sunhat to stay cool.';
            outfitBadge = 'Summer Wear';
        }

        if (precip > 0 || precipProb > 30) {
            outfitAdvice += ' ☔ Pack a sturdy umbrella or waterproof raincoat!';
        }

        // 2. Outdoor Fitness & Activity Score
        let fitnessScore = 90;
        if (tempC < 5 || tempC > 32) fitnessScore -= 25;
        if (precipProb > 30) fitnessScore -= 30;
        if (windKmh > 25) fitnessScore -= 20;
        fitnessScore = Math.max(20, Math.min(100, fitnessScore));

        let fitnessBadge = 'Ideal';
        let fitnessColor = 'bg-blue';
        if (fitnessScore < 50) { fitnessBadge = 'Challenging'; fitnessColor = 'bg-uv'; }
        else if (fitnessScore < 75) { fitnessBadge = 'Good'; fitnessColor = 'bg-blue'; }

        let fitnessDesc = `Outdoor activity score is ${fitnessScore}%. `;
        if (precipProb > 30) fitnessDesc += 'Watch out for rain showers if jogging or cycling.';
        else if (tempC >= 15 && tempC <= 24 && windKmh < 20) fitnessDesc += 'Perfect day for running, outdoor dining, and park walks!';
        else fitnessDesc += 'Great conditions for light outdoor exercise.';

        // 3. UV & Sun Protection Advice
        let uvTitle = 'Sun Care & Protection';
        let uvBadgeStr = 'Low Risk';
        let uvAdvice = 'Minimal UV exposure. Standard daily skin care is sufficient.';
        if (uvMax >= 3 && uvMax <= 5) {
            uvBadgeStr = 'Moderate SPF 30+';
            uvAdvice = 'Moderate solar UV. Apply SPF 30+ sunscreen if spending time outside.';
        } else if (uvMax >= 6 && uvMax <= 7) {
            uvBadgeStr = 'High Risk SPF 50+';
            uvAdvice = 'High UV risk! Apply SPF 50+, wear sunglasses & a wide-brim hat.';
        } else if (uvMax >= 8) {
            uvBadgeStr = 'Extreme Caution';
            uvAdvice = 'Extreme UV radiation! Limit direct sunlight exposure between 11 AM - 3 PM.';
        }

        // 4. City Travel & Sightseeing Recommendation
        const cityName = state.currentLocation.name;
        let cityAdvice = `Current weather in <strong>${cityName}</strong> is ${formatTemp(tempC)}° (${getWeatherMeta(current.weather_code, current.is_day).desc}). `;
        if (precipProb > 40) {
            cityAdvice += 'Ideal day for indoor activities such as visiting museums, art galleries, or local cafes.';
        } else if (tempC >= 15 && tempC <= 27) {
            cityAdvice += 'Fantastic weather for sightseeing, outdoor landmarks, and exploring the city on foot!';
        } else {
            cityAdvice += 'Great weather to explore local attractions and enjoy city dining.';
        }

        const html = `
            <!-- Card 1: Outfit Advisor -->
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-title"><i class="fa-solid ${outfitIcon}"></i> ${outfitTitle}</span>
                    <span class="suggestion-badge">${outfitBadge}</span>
                </div>
                <div class="suggestion-body">
                    ${outfitAdvice}
                </div>
            </div>

            <!-- Card 2: Outdoor Activity Rating -->
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-title"><i class="fa-solid fa-person-running text-teal"></i> Outdoor Fitness Score</span>
                    <span class="suggestion-badge">${fitnessBadge}</span>
                </div>
                <div class="suggestion-body">
                    ${fitnessDesc}
                    <div class="activity-score-wrapper">
                        <div class="score-row">
                            <span>Activity Index</span>
                            <span>${fitnessScore}%</span>
                        </div>
                        <div class="score-bar-bg">
                            <div class="score-bar-fill ${fitnessColor}" style="width: ${fitnessScore}%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: UV & Skin Protection -->
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-title"><i class="fa-solid fa-sun-plant-wilt text-amber"></i> ${uvTitle}</span>
                    <span class="suggestion-badge">${uvBadgeStr}</span>
                </div>
                <div class="suggestion-body">
                    ${uvAdvice}
                </div>
            </div>

            <!-- Card 4: City Travel Tip -->
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <span class="suggestion-title"><i class="fa-solid fa-compass text-indigo"></i> City Travel Advisor</span>
                    <span class="suggestion-badge">${cityName} Tip</span>
                </div>
                <div class="suggestion-body">
                    ${cityAdvice}
                </div>
            </div>
        `;

        elements.smartSuggestionsContainer.innerHTML = html;
    }

    function renderHourlyCarousel(hourly) {
        if (!hourly.time) return;

        const nowStr = new Date().toISOString().substring(0, 13);
        let startIndex = hourly.time.findIndex(t => t.startsWith(nowStr));
        if (startIndex === -1) startIndex = 0;

        const sliceEnd = Math.min(startIndex + 24, hourly.time.length);
        const hourlyHTML = [];

        for (let i = startIndex; i < sliceEnd; i++) {
            const dateObj = new Date(hourly.time[i]);
            const timeLabel = i === startIndex ? 'Now' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = formatTemp(hourly.temperature_2m[i]);
            const code = hourly.weather_code[i];
            const isDay = (dateObj.getHours() >= 6 && dateObj.getHours() < 20) ? 1 : 0;
            const meta = getWeatherMeta(code, isDay);
            const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

            hourlyHTML.push(`
                <div class="hourly-item">
                    <span class="hourly-time">${timeLabel}</span>
                    <i class="fa-solid ${meta.iconClass} hourly-icon"></i>
                    <span class="hourly-temp">${temp}°</span>
                    ${rainProb > 0 ? `<span class="hourly-rain"><i class="fa-solid fa-droplet"></i>${rainProb}%</span>` : `<span class="hourly-rain" style="opacity: 0.3;">0%</span>`}
                </div>
            `);
        }

        elements.hourlyTrack.innerHTML = hourlyHTML.join('');
    }

    function renderDailyList(daily) {
        if (!daily || !daily.time || daily.time.length === 0) return;

        const allMaxTemps = daily.temperature_2m_max || [];
        const allMinTemps = daily.temperature_2m_min || [];

        const overallMax = Math.max(...allMaxTemps);
        const overallMin = Math.min(...allMinTemps);
        const tempRange = overallMax - overallMin || 1;

        const listHTML = [];

        for (let i = 0; i < daily.time.length; i++) {
            const timeStr = daily.time[i].includes('T') ? daily.time[i].split('T')[0] : daily.time[i];
            const dateObj = new Date(timeStr + 'T00:00:00');
            const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            const code = daily.weather_code[i];
            const meta = getWeatherMeta(code, 1);
            
            const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[i] !== undefined) ? daily.precipitation_probability_max[i] : 0;
            const precipSum = (daily.precipitation_sum && daily.precipitation_sum[i] !== undefined) ? daily.precipitation_sum[i] : 0;

            const minTemp = daily.temperature_2m_min[i];
            const maxTemp = daily.temperature_2m_max[i];

            const leftPct = ((minTemp - overallMin) / tempRange) * 100;
            const widthPct = Math.max(((maxTemp - minTemp) / tempRange) * 100, 12);

            let rainBadgeHTML = `<span class="no-rain-pill"><i class="fa-solid fa-sun text-amber"></i> No Rain (0%)</span>`;
            if (rainProb > 0 || precipSum > 0) {
                const precipStr = formatPrecip(precipSum);
                const unitLabel = state.unit === 'F' ? 'in' : 'mm';
                rainBadgeHTML = `<span class="rain-pill"><i class="fa-solid fa-cloud-showers-heavy text-blue"></i> ${rainProb}% (${precipStr} ${unitLabel})</span>`;
            }

            listHTML.push(`
                <div class="daily-row">
                    <div class="daily-day-info">
                        <span class="daily-name">${dayName}</span>
                        <span class="daily-date">${dateStr}</span>
                    </div>

                    <div class="daily-condition">
                        <i class="fa-solid ${meta.iconClass} daily-icon"></i>
                        <span>${meta.desc}</span>
                    </div>

                    <div class="daily-rain-container">
                        ${rainBadgeHTML}
                    </div>

                    <div class="daily-temp-bar-wrapper">
                        <span class="daily-min">${formatTemp(minTemp)}°</span>
                        <div class="daily-bar-bg">
                            <div class="daily-bar-fill" style="margin-left: ${leftPct}%; width: ${widthPct}%;"></div>
                        </div>
                        <span class="daily-max">${formatTemp(maxTemp)}°</span>
                    </div>
                </div>
            `);
        }

        elements.dailyList.innerHTML = listHTML.join('');
    }

    // ----------------------------------------------------------------------
    // 7. Background Particles Animation
    // ----------------------------------------------------------------------
    function initParticles() {
        const canvas = elements.particlesCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            vx: Math.random() * 0.4 - 0.2,
            vy: Math.random() * 0.4 - 0.2,
            alpha: Math.random() * 0.5 + 0.2
        }));

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
                ctx.fill();
            });
            state.particlesAnimationId = requestAnimationFrame(animate);
        }

        animate();
    }

    // ----------------------------------------------------------------------
    // 8. Event Listeners & Controls
    // ----------------------------------------------------------------------
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        elements.clearSearchBtn.style.display = query ? 'block' : 'none';

        clearTimeout(state.searchDebounceTimeout);
        state.searchDebounceTimeout = setTimeout(() => searchLocations(query), 300);
    });

    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        elements.searchDropdown.style.display = 'none';
        elements.searchInput.focus();
    });

    document.addEventListener('click', (e) => {
        if (!elements.searchInput.contains(e.target) && !elements.searchDropdown.contains(e.target)) {
            elements.searchDropdown.style.display = 'none';
        }
    });

    elements.cityPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const name = pill.dataset.name;
            const country = pill.dataset.country;
            const lat = parseFloat(pill.dataset.lat);
            const lon = parseFloat(pill.dataset.lon);

            state.currentLocation = { name, country, latitude: lat, longitude: lon, timezone: 'auto' };
            updateLocationPillsUI(name);
            fetchWeather(lat, lon);
        });
    });

    elements.unitCBtn.addEventListener('click', () => {
        if (state.unit === 'C') return;
        state.unit = 'C';
        localStorage.setItem('weather_unit', 'C');
        updateUnitUI();
        if (state.rawData) renderWeatherData(state.rawData);
    });

    elements.unitFBtn.addEventListener('click', () => {
        if (state.unit === 'F') return;
        state.unit = 'F';
        localStorage.setItem('weather_unit', 'F');
        updateUnitUI();
        if (state.rawData) renderWeatherData(state.rawData);
    });

    elements.geoLocationBtn.addEventListener('click', handleGeolocation);

    // ----------------------------------------------------------------------
    // 9. Initialization
    // ----------------------------------------------------------------------
    updateUnitUI();
    initParticles();
    updateLocationPillsUI(state.currentLocation.name);
    fetchWeather(state.currentLocation.latitude, state.currentLocation.longitude, state.currentLocation.timezone);
});
