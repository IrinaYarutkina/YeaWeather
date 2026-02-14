//глоб переменные
const apiKey = "ad4bd249c67941033714a1851c8bd49e";
const clock = document.getElementById("clock");
const inputCity = document.getElementById("search__input");
const btnSearch = document.getElementById("search__button");
const blockWithActiveWeather = document.querySelector(".weather-card"); // нужно ли это?
const nameCity = document.getElementById("weather-city-name");
const temperature = document.getElementById("weather-card__temperature");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const icon = document.getElementById("weather-card__weather-icon");
const now = new Date();
const date = document.getElementById("weather-card__date");

//автоматическая погода для определяемого города по координатам
//сначала определим коорд --> с пом обратного геокодирования получим город --> получим погоду
function getUsersCoords() {
  const MoscowCoord = { lat: 55.75583, lon: 37.6173 }; //по умолчанию
  console.log(navigator.geolocation);
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
      const currentTemp = Math.round(data.main.temp);
      nameCity.textContent = data.name;
      temperature.textContent = `${currentTemp}°C`;
      showWeatherNextHours(currentTemp); //функция для генерации погоды по часам
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
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}`;
}
function startClock() {
  updateTime();
  const delay = (60 - now.getSeconds()) * 1000;
  setTimeout(() => {
    updateTime();
    setInterval(updateTime, 60000);
  }, delay);
}
//переключатель с Цельсия на фаренгейт: изменяет цифровые значения
const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");
});

//выбор дня для погоды: сегодня, завтра

//текущая дата
function updateDate() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();

  date.textContent = `${day}.${month}.${year}`;
}

//функция которая показывает погоду через каждые 3 часа
//1) округляет до ближайшего целого кратного 3 часа, - первая  карточка
//2) следующие карточки плюс 2(3) часа (00, 03, 06, 09, 12, 15, 18, 21)
//4)
function generateTempByHour(hour, nowTemp) {
  if (hour >= 6 && hour < 18) {
    let newDayTemp = nowTemp + Math.floor(Math.random() * 5);
    return newDayTemp;
  } else {
    let newNightTemp = nowTemp - Math.floor(Math.random() * 5);
    return newNightTemp;
  }
}
function showWeatherNextHours(nowTemp) {
  const hour = now.getHours();
  let firstCardHour = (Math.ceil(hour / 3) * 3) % 24; //1-карточка
  let cardsTime = [];
  for (let i = 0; i < 8; i++) {
    cardsTime.push((firstCardHour + i * 3) % 24);
  }
  console.log(cardsTime);

  cardsTime.forEach((hour) => {
    const temp = generateTempByHour(hour, nowTemp);
    console.log(`${hour.toString().padStart(2, "0")}:00`, temp);
  });
  return;
  //функция возвращает разметку(время, изображение рандом, темпа)
}
//________________вызовы___________________________
updateDate(); //обн даты
startClock(); // для врем
//вызов функции
getUsersCoords().then(({ lat, lon }) => {
  console.log("Используемые координаты:", lat, lon);
  fetch(
    `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
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
//вызов функции при нажатии на кнопку: погода по поиску
btnSearch.addEventListener("click", () => {
  const city = inputCity.value.trim();
  getWeather(city);
});

// showWeatherNextHours(currentTemp);
