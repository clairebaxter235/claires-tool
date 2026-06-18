const queryInput = document.querySelector(”#query”);
const activeLink = document.querySelector(”#active-link”);
const soldLink = document.querySelector(”#sold-link”);
const linkStatus = document.querySelector(”#link-status”);
const activeCountInput = document.querySelector(”#active-count”);
const soldCountInput = document.querySelector(”#sold-count”);
const rateValue = document.querySelector(”#rate-value”);
const verdict = document.querySelector(”#verdict”);
const recentSearches = document.querySelector(”#recent-searches”);
const clearRecent = document.querySelector(”#clear-recent”);

const storageKey = “clairesEbayCheckerRecentSearches”;
const maxRecentSearches = 8;

function buildEbayUrls(query) {
const encodedQuery = encodeURIComponent(query.trim());
const baseUrl = https://www.ebay.com/sch/i.html?_nkw=${encodedQuery};

return {
active: baseUrl,
sold: ${baseUrl}&LH_Sold=1&LH_Complete=1,
};
}

function getRecentSearches() {
try {
return JSON.parse(localStorage.getItem(storageKey)) || [];
} catch {
return [];
}
}

function saveRecentSearch(query) {
const cleanQuery = query.trim();
if (!cleanQuery) return;

const recent = getRecentSearches().filter(
item => item.toLowerCase() !== cleanQuery.toLowerCase()
);

recent.unshift(cleanQuery);
localStorage.setItem(storageKey, JSON.stringify(recent.slice(0, maxRecentSearches)));
renderRecentSearches();
}

function renderRecentSearches() {
const recent = getRecentSearches();
recentSearches.innerHTML = “”;
clearRecent.hidden = recent.length === 0;

if (recent.length === 0) {
const empty = document.createElement(“p”);
empty.className = “empty”;
empty.textContent = “No recent searches yet.”;
recentSearches.append(empty);
return;
}

recent.forEach(search => {
const button = document.createElement(“button”);
button.className = “recent-item”;
button.type = “button”;
button.textContent = search;
button.addEventListener(“click”, () => {
queryInput.value = search;
generateLinks(search);
});
recentSearches.append(button);
});
}

function generateLinks(rawQuery) {
const query = rawQuery.trim();

if (!query) {
activeLink.href = “#”;
soldLink.href = “#”;
activeLink.classList.add(“disabled”);
soldLink.classList.add(“disabled”);
linkStatus.textContent = “Enter a query to create eBay links.”;
return;
}

const urls = buildEbayUrls(query);

activeLink.href = urls.active;
soldLink.href = urls.sold;
activeLink.classList.remove(“disabled”);
soldLink.classList.remove(“disabled”);
linkStatus.textContent = Links ready for "${query}". Tap Active or Sold below.;

saveRecentSearch(query);
}

function parseCount(value) {
return Number(String(value).replace(/,/g, “”));
}

function updateSellThroughRate() {
const activeCount = parseCount(activeCountInput.value);
const soldCount = parseCount(soldCountInput.value);

verdict.className = “verdict muted”;

if (!activeCountInput.value || !soldCountInput.value) {
rateValue.textContent = “–”;
verdict.textContent = “Add counts”;
return;
}

if (activeCount <= 0) {
rateValue.textContent = “–”;
verdict.textContent = “Active must be over 0”;
return;
}

const rate = (soldCount / activeCount) * 100;
rateValue.textContent = ${rate.toFixed(1)}%;

if (rate > 100) {
verdict.textContent = “Excellent demand”;
verdict.className = “verdict excellent”;
} else if (rate >= 50) {
verdict.textContent = “Good demand”;
verdict.className = “verdict good”;
} else if (rate >= 20) {
verdict.textContent = “Okay / be selective”;
verdict.className = “verdict okay”;
} else {
verdict.textContent = “Slow or saturated”;
verdict.className = “verdict slow”;
}
}

document.addEventListener(“DOMContentLoaded”, () => {
const generateButton = document.querySelector(”#generate-button”) || document.querySelector(”#search-form button”);

if (generateButton) {
generateButton.addEventListener(“click”, event => {
event.preventDefault();
generateLinks(queryInput.value);
});
}

const form = document.querySelector(”#search-form”);
if (form && form.tagName.toLowerCase() === “form”) {
form.addEventListener(“submit”, event => {
event.preventDefault();
generateLinks(queryInput.value);
});
}

queryInput.addEventListener(“input”, () => {
if (!queryInput.value.trim()) {
generateLinks(””);
}
});

activeCountInput.addEventListener(“input”, updateSellThroughRate);
soldCountInput.addEventListener(“input”, updateSellThroughRate);

clearRecent.addEventListener(“click”, () => {
localStorage.removeItem(storageKey);
renderRecentSearches();
});

renderRecentSearches();
updateSellThroughRate();
});
