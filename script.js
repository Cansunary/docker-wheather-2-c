let currentCity = "";

/* ======================
   DOM ELEMENTLERİ
====================== */
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("icon");
const favoritesList = document.getElementById("favoritesList");
const page = document.getElementById("page");

/* ======================
   FAVORİLER
====================== */
function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(data) {
    localStorage.setItem("favorites", JSON.stringify(data));
}

/* ======================
   HAVA DURUMU
====================== */
async function getWeather(cityFromFav = null) {
    const city = cityFromFav || cityInput.value.trim();
    if (!city) return;

    weatherCard.classList.add("hidden");

    try {
        // 1) Geocoding
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("❌ Şehir bulunamadı");
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];
        currentCity = name;

        // 2) Weather
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const weatherData = await weatherRes.json();
        const weather = weatherData.current_weather;

        updateUI(name, weather.temperature, weather.windspeed);

    } catch (err) {
        console.error(err);
        alert("⚠️ Bir hata oluştu, lütfen tekrar deneyin.");
    }
}

/* ======================
   UI GÜNCELLEME
====================== */
function updateUI(city, temp, wind) {
    cityNameEl.textContent = city;
    tempEl.textContent = `🌡️ ${temp} °C`;
    windEl.textContent = `🌬️ ${wind} km/s`;

    // Tema & ikon (CSS ileride taşınabilir)
    if (temp >= 25) {
        iconEl.textContent = "☀️";
        page.style.background = "linear-gradient(to bottom, #fddb92, #d1fdff)";
    } else if (wind >= 20) {
        iconEl.textContent = "🌬️";
        page.style.background = "linear-gradient(to bottom, #cfd9df, #e2ebf0)";
    } else {
        iconEl.textContent = "⛅";
        page.style.background = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
    }

    weatherCard.classList.remove("hidden");
}

/* ======================
   FAVORİ İŞLEMLERİ
====================== */
function addFavorite() {
    if (!currentCity) return;

    const favs = getFavorites();
    if (!favs.includes(currentCity)) {
        favs.push(currentCity);
        saveFavorites(favs);
        renderFavorites();
    }
}

function renderFavorites() {
    favoritesList.innerHTML = "";

    getFavorites().forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.className = "favorite-item";

        li.addEventListener("click", () => {
            getWeather(city);
        });

        favoritesList.appendChild(li);
    });
}

/* ======================
   EVENTLER
====================== */
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        getWeather();
    }
});

/* ======================
   BAŞLANGIÇ
====================== */
renderFavorites();
