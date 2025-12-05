// === DOM References ===
const selectTag         = document.querySelectorAll("select");
const fromText          = document.querySelector("#fromText");
const toText            = document.querySelector("#toText");
const translateBtn      = document.querySelector("#translateBtn");
const clearBtn          = document.querySelector("#clearBtn");
const copyBtn           = document.querySelector("#copyBtn");
const languageContainer = document.querySelector("#language-container");
const languageSelect    = document.querySelector("#languageSelect");
const errorMessage      = document.querySelector(".error-message");

// Stores selected target languages
let selectedLanguages = [];

// === Populate all <select> elements ===
selectTag.forEach(tag => {
  const optionsHTML = Object.entries(countries)
    .map(([code, name]) => `<option value="${code}">${name}</option>`)
    .join("");

  tag.insertAdjacentHTML("beforeend", optionsHTML);
});

// === Add selected language to list ===
languageSelect.addEventListener("change", () => {
  const code = languageSelect.value;
  const lang = countries[code];

  // Prevent duplicates
  const exists = Array.from(languageContainer.children)
    .some(child => child.dataset.code === code);

  if (exists) return;

  selectedLanguages.push(code);

  languageContainer.insertAdjacentHTML(
    "beforeend",
    `<p class="language" data-code="${code}">${lang}</p>`
  );
});

// === Clear all input/output & selected languages ===
clearBtn.addEventListener("click", () => {
  fromText.value = "";
  toText.value = "";
  selectedLanguages = [];
  languageContainer.innerHTML = "";
});

// === Copy to clipboard ===
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(toText.value);
  copyBtn.innerHTML = "Copied!";
  copyBtn.className = "primary";

  setTimeout(() => {
    copyBtn.innerHTML = "Copy";
    copyBtn.className = "secondary";
  }, 1000);
});

// === Translate keywords ===
translateBtn.addEventListener("click", async () => {
  errorMessage.innerHTML = "Loading...";

  const keywords = getKeywords(fromText.value);
  const translationsByLanguage = await translateToAllLanguages(keywords.join(", "));
  const merged = mergeTranslations(translationsByLanguage, selectedLanguages, keywords.length);
  const result = removeDuplicatesAndOriginals(merged, keywords);

  errorMessage.innerHTML = "";
  toText.value = result.join(", ");
});

function getKeywords(text) {
  return text.trim().split(", ");
}

async function translateToAllLanguages(text) {
  const translations = {};

  for (const code of selectedLanguages) {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${code}&de=galenko.vladislav@gmail.com`;
    const translatedSentence = await translate(apiUrl);

    translations[code] = translatedSentence.split(/[,\u060C\u3001\uFF0C\uFE50\uFE51\u201A]\s*/);
  }

  return translations;
}

function mergeTranslations(translations, languages, count) {
  const finalList = [];

  for (let i = 0; i < count; i++) {
    for (const code of languages) {
      finalList.push(translations[code][i]);
    }
  }

  return finalList;
}

function removeDuplicatesAndOriginals(list, keywords) {
  const unique = list.filter(
    (item, index) => list.indexOf(item) === index
  );

  return unique.filter(item => !keywords.includes(item));
}

// === API translate function ===
async function translate(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    return data?.responseData?.translatedText || "[translation unavailable]";
  } catch (err) {
    errorMessage.textContent = "Translation error.";
    console.error(err);
    return "[translation unavailable]";
  }
}