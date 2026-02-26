import ".//ScrollSlider/ScrollSlider.js";
import "./ScrollSlider/ScrollSliderTrack.js";

//глоб переменные
const apiKey = "ad4bd249c67941033714a1851c8bd49e";
const clock = document.getElementById("clock");
const searchForm = document.querySelector("form");
const inputCity = document.getElementById("search__input");
const btnSearch = document.getElementById("search__button");
const blockWithActiveWeather = document.querySelector(".weather-card"); // нужно ли это?
const nameCity = document.getElementById("weather-city-name");
const temperature = document.getElementById("weather-card__temperature");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const icon = document.getElementById("weather-card__weather-icon");
const date = document.getElementById("weather-card__date");
function getNow() {
  return new Date();
}
let currentTempC = null; // температура в цельсиях
let isFahrenheit = false; // текущее состояние переключателя
const scrollSlider = document.querySelector("scroll-slider");

//автоматическая погода для определяемого города по координатам
//сначала определим коорд --> с пом обратного геокодирования получим город --> получим погоду
function getUsersCoords() {
  const MoscowCoord = { lat: 55.75583, lon: 37.6173 }; //по умолчанию
  if (!navigator.geolocation) {
    console.log(
      "Геолокация не поддерживается, используем координаты по умолчанию"
    );
    return MoscowCoord;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        resolve({ lat, lon });
        console.log({ lat, lon });
      },
      (err) => {
        console.log("Ошибка:", err.message);
        resolve(MoscowCoord);
      }
    );
  });
}
//____________________________________
//функция для обновл с цельсия на фаренгейт
function updateTemperature() {
  if (currentTempC === null) return;

  if (isFahrenheit) {
    const tempF = Math.round((currentTempC * 9) / 5 + 32);
    temperature.textContent = `${tempF}°F`;
  } else {
    temperature.textContent = `${currentTempC}°C`;
  }
}
//переключатель с Цельсия на фаренгейт: изменяет цифровые значения
const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");

  isFahrenheit = !isFahrenheit; // меняем состояние
  updateTemperature(); // обновляем значение
  showWeatherNextHours();
});

//функция для загрузки погоды для города
function getWeather(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      currentTempC = Math.round(data.main.temp);
      nameCity.textContent = data.name;
      // temperature.textContent = `${currentTemp}°C`;
      updateTemperature(); //вызов для фаренгейта
      showWeatherNextHours(); //функция для генерации погоды по часам
      scrollSlider?.handleScroll();
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      humidity.textContent = `${data.main.humidity}%`;
      const pressureMm = Math.round(data.main.pressure * 0.750062);
      pressure.textContent = `${pressureMm} мм рт. ст.`;
      wind.textContent = `${Math.round(data.wind.speed)} м/сек`;
    })
    .catch((error) => {
      showError();
    });
}
//функция для ошибки, если не удалось найти/загрузить город
function showError() {
  nameCity.textContent = "Упс, не удалось найти город...";
  temperature.textContent = "--";
  icon.src = "";
  icon.alt = "пусто😭";
  humidity.textContent = "--";
  pressure.textContent = "--";
  wind.textContent = "--";
}
//___________________________
//текущее время
function updateTime() {
  const hours = String(getNow().getHours()).padStart(2, "0");
  const minutes = String(getNow().getMinutes()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}`;
}
function startClock() {
  updateTime();
  const delay = (60 - getNow().getSeconds()) * 1000;
  setTimeout(() => {
    updateTime();
    setInterval(updateTime, 60000);
  }, delay);
}
//выбор дня для погоды: сегодня, завтра

//текущая дата
function updateDate() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();

  date.textContent = `${day}.${month}.${year}`;
}

//функция которая генерирует погоду для будущих часов
function generateTempByHour(hour, nowTemp) {
  if (hour >= 6 && hour < 18) {
    let newDayTemp = nowTemp + Math.floor(Math.random() * 5);
    return newDayTemp;
  } else {
    let newNightTemp = nowTemp - Math.floor(Math.random() * 5);
    return newNightTemp;
  }
}

//функци для картинки погоды
function getWeatherIconByHour(hour) {
  if (hour >= 0 && hour < 6) return "./assets/weatherIcons/01n.png";
  if (hour >= 6 && hour < 12) return "./assets/weatherIcons/03d.png";
  if (hour >= 12 && hour < 18) return "./assets/weatherIcons/01d.png";
  return "./assets/weatherIcons/04d.png";
}

//функция которая показывает погоду через каждые 3 часа
function showWeatherNextHours() {
  if (currentTempC === null) return;
  const hour = getNow().getHours();
  let firstCardHour = (Math.ceil(hour / 3) * 3) % 24; //час для 1-карточки

  const list = document.querySelector(".weather-hour__list");
  list.innerHTML = ""; // очищаем перед перерисовкой

  for (let i = 0; i < 8; i++) {
    let nextCardHours = (firstCardHour + i * 3) % 24;
    const tempС = generateTempByHour(nextCardHours, currentTempC);
    const displayTemp = isFahrenheit ? Math.round((tempС * 9) / 5 + 32) : tempС;
    const unit = isFahrenheit ? "°F" : "°C";
    const iconSrc = getWeatherIconByHour(nextCardHours);
    const card = document.createElement("div");
    card.classList.add("weather-hour__list-card");
    card.innerHTML = `
    <div class="weather-hour__info">
      <span>${nextCardHours.toString().padStart(2, "0")}:00</span>
      <img class="weather-hour__info-icon"
            src="${iconSrc}"
            alt="погода" />
      <span>${displayTemp}${unit}</span>
    </div>
    <div class="weather-hour__dark-bottom"></div>
  `;

    list.appendChild(card);
  }
  requestAnimationFrame(() => {});
}

//________________вызовы___________________________
updateDate(); //обн даты
startClock(); // для врем

getUsersCoords().then(({ lat, lon }) => {
  console.log("Используемые координаты:", lat, lon);
  fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      const nameRu = data[0].local_names.ru;
      getWeather(nameRu);
    })
    .catch((err) => {
      console.error("Ошибка при получении данных:", err);
    });
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // чтобы страница не перезагружалась
  const city = inputCity.value.trim();
  if (city) {
    getWeather(city);
  }
});

// showWeatherNextHours(currentTemp);
