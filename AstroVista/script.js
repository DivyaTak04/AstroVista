const apiKey = "dHRzcXzHf1koAyUUFQUAwAl7ZXsqE2GNg7mEeVag";

const dateInput = document.getElementById("dateInput");
const getPicBtn = document.getElementById("getPicBtn");
const apodCard = document.getElementById("apodCard");
const titleEl = document.getElementById("apodTitle");
const dateEl = document.getElementById("apodDate");
const imageEl = document.getElementById("apodImage");
const videoEl = document.getElementById("apodVideo");
const explanationEl = document.getElementById("apodExplanation");
const downloadBtn = document.getElementById("downloadBtn");
const favBtn = document.getElementById("favBtn");
const favoritesGrid = document.getElementById("favoritesGrid");
const noFavoritesMsg = document.getElementById("noFavoritesMsg");
const loader = document.getElementById("loader");
const errorEl = document.getElementById("error");
const themeToggle = document.getElementById("themeToggle");
const shareBtn = document.getElementById("shareBtn");

document.addEventListener("DOMContentLoaded", () => {
  dateInput.max = new Date().toISOString().split("T")[0];
  loadTheme();
  loadFavorites();
  getAPOD();
});

themeToggle.addEventListener("click", toggleTheme);
getPicBtn.addEventListener("click", getAPOD);
favBtn.addEventListener("click", saveFavorite);

// Theme loading
function loadTheme() {
  const savedTheme = localStorage.getItem("astroTheme");
  const isDark = savedTheme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  document.getElementById("tooltipText").textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  document.getElementById("tooltipText").textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  localStorage.setItem("astroTheme", isDark ? "dark" : "light");
}

// Main API fetch
async function getAPOD() {
  errorEl.style.display = "none";
  loader.style.display = "block";
  apodCard.style.display = "none";
  apodCard.classList.remove("show");

  const date = dateInput.value;
  let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  if (date) url += `&date=${date}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch API");
    const data = await res.json();
    displayAPOD(data);
  } catch {
    errorEl.textContent = "Error fetching data. Please try again.";
    errorEl.style.display = "block";
  } finally {
    loader.style.display = "none";
  }
}

// Show APOD content
function displayAPOD(data) {
  titleEl.textContent = data.title;
  dateEl.textContent = data.date;
  explanationEl.textContent = data.explanation;

  apodCard.dataset.date = data.date;
  apodCard.dataset.title = data.title;
  apodCard.dataset.url = data.url;

  if (data.media_type === "image") {
    imageEl.src = data.url;
    imageEl.style.display = "block";
    downloadBtn.href = data.url;
    downloadBtn.style.display = "inline-block";
    videoEl.style.display = "none";
    videoEl.src = "";
  } else {
    videoEl.src = data.url;
    videoEl.style.display = "block";
    imageEl.style.display = "none";
    downloadBtn.style.display = "none";
  }

  apodCard.style.display = "flex";
  apodCard.classList.add("show");
  apodCard.focus();
}

// Save favorites
function saveFavorite() {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const newFav = {
    title: apodCard.dataset.title,
    date: apodCard.dataset.date,
    url: apodCard.dataset.url,
  };
  if (!favs.find((f) => f.date === newFav.date)) {
    favs.push(newFav);
    localStorage.setItem("favorites", JSON.stringify(favs));
    loadFavorites();
    alert("Saved to favorites!");
  } else {
    alert("Already saved.");
  }
}

// Load favorites
function loadFavorites() {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesGrid.innerHTML = "";

  if (favs.length === 0) {
    noFavoritesMsg.style.display = "block";
    return;
  }
  noFavoritesMsg.style.display = "none";

  favs
    .slice()
    .reverse()
    .forEach((fav) => {
      const card = document.createElement("div");
      card.className = "favCard";
      card.tabIndex = 0;
      card.innerHTML = `
        <img src="${fav.url}" alt="${fav.title}" class="favImage" />
        <div class="favContent">
          <h4 class="favTitle">${fav.title}</h4>
          <p class="favDate">${fav.date}</p>
          <button class="removeFavBtn" data-date="${fav.date}">🗑 Remove</button>
        </div>
      `;

      card.addEventListener("click", () => selectFavorite(fav));
      card.querySelector(".removeFavBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        removeFavorite(fav.date);
      });

      favoritesGrid.appendChild(card);
    });
}

function removeFavorite(date) {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const updated = favs.filter(f => f.date !== date);
  localStorage.setItem("favorites", JSON.stringify(updated));
  loadFavorites();
  alert("Removed from favorites.");
}


// Load favorite when clicked
function selectFavorite(fav) {
  dateInput.value = fav.date;
  getAPOD();
}

// Share current APOD
shareBtn?.addEventListener("click", () => {
  const title = titleEl.textContent;
  const url = window.location.href;
  const shareText = `Check out today's NASA image: "${title}" - ${url}`;
  navigator.clipboard.writeText(shareText);
  alert("Link copied to clipboard!");
});

// Zoom full image in new window
imageEl.addEventListener("click", function () {
  if (imageEl.style.display !== "none") {
    const imgSrc = imageEl.src;
    const win = window.open();
    win.document.write(`<img src="${imgSrc}" style="width:100%;height:auto;">`);
  }
});

// Add this in your main JS file
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


