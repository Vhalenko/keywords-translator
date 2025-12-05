const selectTag = document.querySelectorAll("select");
const fromText = document.querySelector("#fromText");
const toText = document.querySelector("#toText");
const translateBtn = document.querySelector("#translateBtn");
const clearBtn = document.querySelector("#clearBtn");
const copyBtn = document.querySelector("#copyBtn");
const languageContainer = document.querySelector("#language-container");
const languageOption = document.querySelector(".target-language");
const languageSelect = document.querySelector("#languageSelect");
const errorMessage = document.querySelector(".error-message");
let selectedLanguages = [];

selectTag.forEach((tag) => {
  for (const country_code in countries) {
    let option = `<option class="target-language" value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

languageSelect.addEventListener("change", () => {
  const code = languageSelect.value;
  const lang = countries[code];

  // Prevent duplicates
  const hasLanguage = Array.from(languageContainer.children).some(
    (child) => child.dataset.code === code
  );

  if (hasLanguage) return;

  selectedLanguages.push(code);

  // Add the selected language as a tag
  languageContainer.insertAdjacentHTML(
    "beforeend",
    `<p class="language" data-code="${code}">${lang}</p>`
  );
});

clearBtn.addEventListener('click', () => {
  fromText.value = "";
  toText.value = "";
  selectedLanguages = [];
  languageContainer.innerHTML = "";
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(toText.value);

  copyBtn.innerHTML = "Copied!"
  copyBtn.className  = "primary"
  setTimeout(() => {
    copyBtn.innerHTML = "Copy";
    copyBtn.className = "secondary"
  }, 1000)
});

translateBtn.addEventListener("click", async () => {
  errorMessage.innerHTML = "Loading...";

  const text = fromText.value.trim();
  const keywords = text.split(", ");
  
  const translationsByLanguage = {};

  for (const code of selectedLanguages) {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=en|${code}&de=galenko.vladislav@gmail.com`;
    const translatedSentence = await translate(apiUrl);

    translationsByLanguage[code] = translatedSentence.split(/, |、| و/);
  }
  console.log(translationsByLanguage);

  const finalList = [];
  for (let i = 0; i < keywords.length; i++) {
    for (const code of selectedLanguages) {
      finalList.push(translationsByLanguage[code][i]);
    }
  }

  const uniqueFinalList = finalList.filter(
    (item, index) =>
      finalList.findIndex((x) => x === item) ===
      index
  );

  const result = uniqueFinalList.filter(item => !keywords.includes(item));

  errorMessage.innerHTML = "";
  toText.value = uniqueFinalList.join(", ");
});

async function translate(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    return data?.responseData?.translatedText || "[translation unavailable]";
  } catch (err) {
    errorMessage.innerHTML = "Translation error:", err;
    return "[translation unavailable]";
  }
}
