import "./styles/jass.css";

const API_BASE = "https://weather-dashboard-2-8b3p.onrender.com";

// * DOM Elements
const searchForm = document.getElementById("search-form") as HTMLFormElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const todayContainer = document.querySelector("#today") as HTMLDivElement;
const forecastContainer = document.querySelector("#forecast") as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  "history"
) as HTMLDivElement;
const heading = document.getElementById("search-title") as HTMLHeadingElement;
const weatherIcon = document.getElementById("weather-img") as HTMLImageElement;
const tempEl = document.getElementById("temp") as HTMLParagraphElement;
const windEl = document.getElementById("wind") as HTMLParagraphElement;
const humidityEl = document.getElementById("humidity") as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  const response = await fetch(`${API_BASE}/api/weather`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cityName }),
  });

  const weatherData = await response.json();
  renderCurrentWeather(weatherData[0]);
  renderForecast(weatherData.slice(1));
};

const fetchSearchHistory = async () => {
  return await fetch(`${API_BASE}/api/weather/history`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`${API_BASE}/api/weather/history/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any) => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);

  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = "";
  todayContainer.append(heading, tempEl, windEl, humidityEl);
};

const renderForecast = (forecast: any[]) => {
  const headingCol = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = "5-Day Forecast:";
  headingCol.setAttribute("class", "col-12");
  headingCol.append(title);

  forecastContainer.innerHTML = "";
  forecastContainer.append(headingCol);

  forecast.forEach((data) => renderForecastCard(data));
};

const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    "src",
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};

const renderSearchHistory = async (searchHistory: Response) => {
  const historyList = await searchHistory.json();

  searchHistoryContainer.innerHTML = "";

  if (!historyList.length) {
    searchHistoryContainer.innerHTML = `<p class="text-center">No Previous Search History</p>`;
    return;
  }

  for (let i = historyList.length - 1; i >= 0; i--) {
    const item = buildHistoryListItem(historyList[i]);
    searchHistoryContainer.append(item);
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement("div");
  const card = document.createElement("div");
  const cardBody = document.createElement("div");
  const cardTitle = document.createElement("h5");
  const weatherIcon = document.createElement("img");
  const tempEl = document.createElement("p");
  const windEl = document.createElement("p");
  const humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add("col-auto");
  card.classList.add(
    "forecast-card",
    "card",
    "text-white",
    "bg-primary",
    "h-100"
  );
  cardBody.classList.add("card-body", "p-2");
  cardTitle.classList.add("card-title");
  tempEl.classList.add("card-text");
  windEl.classList.add("card-text");
  humidityEl.classList.add("card-text");

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-controls", "today forecast");
  btn.classList.add("history-btn", "btn", "btn-secondary", "col-10");
  btn.textContent = city;
  return btn;
};

const createDeleteButton = () => {
  const btn = document.createElement("button");
  btn.setAttribute("type", "button");
  btn.classList.add(
    "fas",
    "fa-trash-alt",
    "delete-city",
    "btn",
    "btn-danger",
    "col-2"
  );
  btn.addEventListener("click", handleDeleteHistoryClick);
  return btn;
};

const createHistoryDiv = () => {
  const div = document.createElement("div");
  div.classList.add("display-flex", "gap-2", "col-12", "m-1");
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const container = createHistoryDiv();
  container.append(newBtn, deleteBtn);
  return container;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: SubmitEvent) => {
  event.preventDefault();

  if (!searchInput.value.trim()) {
    throw new Error("City cannot be blank");
  }

  const search = searchInput.value.trim();
  fetchWeather(search).then(getAndRenderHistory);
  searchInput.value = "";
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches(".history-btn")) {
    const city = target.textContent;
    if (city) fetchWeather(city).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const cityData = target.getAttribute("data-city");
  if (cityData) {
    const city = JSON.parse(cityData);
    deleteCityFromHistory(city.id).then(getAndRenderHistory);
  }
};

/*

Initialize App

*/

const getAndRenderHistory = () => {
  fetchSearchHistory().then(renderSearchHistory);
};

searchForm?.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer?.addEventListener("click", handleSearchHistoryClick);
getAndRenderHistory();
