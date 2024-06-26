// Variable to track if translation is on or off
let isTranslationOn = false;

// Custom translations for specific terms and phrases
const customTranslations = {
  'Superior': {
    'ja': 'スーペリア' // Custom translation for Superior in Japanese
  }
};

// Function to toggle translation mode
function toggleTranslation() {
  isTranslationOn = !isTranslationOn; // Flip the toggle
  setTranslationPreference(isTranslationOn); // Store in local storage

  if (isTranslationOn) {
    translatePage('ja'); // If translation is on, translate to Japanese
  } else {
    resetToOriginal(); // If off, reset to original text
  }
}

// Function to store translation preference in local storage
function setTranslationPreference(translationState) {
  localStorage.setItem('translation', translationState ? 'on' : 'off');
}

// Function to get translation preference from local storage
function getTranslationPreference() {
  return localStorage.getItem('translation') === 'on';
}

// Function to toggle visibility of language buttons based on translation state
function toggleLanguageButtons() {
  const englishButton = document.getElementById('englishButton');
  const japaneseButton = document.getElementById('japaneseButton');
  const jpinputNamePronouce = document.getElementById('forJapanese');
  const jp_version = document.getElementById('jp_version');
  const english_version = document.getElementById('english_version');

  if (isTranslationOn) {
    if (englishButton) englishButton.style.display = 'inline-block'; // Offer "Off" button when translation is on
    if (japaneseButton) japaneseButton.style.display = 'none';
    if (english_version) english_version.style.display = 'none';
    console.log('Translation is ON');
  } else {
    if (japaneseButton) japaneseButton.style.display = 'inline-block'; // Offer "On" button when translation is off
    if (englishButton) englishButton.style.display = 'none';
    if (jpinputNamePronouce) jpinputNamePronouce.style.display = 'none';
    if (jp_version) jp_version.style.display = 'none'; // Hide the Japanese version
    console.log('Translation is OFF');
  }
}


// Function to reset elements to original text
function resetToOriginal() {
  const elementsToTranslate = document.querySelectorAll('.translate');

  elementsToTranslate.forEach(element => {
    const originalHTML = element.getAttribute('data-original-html') || element.innerHTML.trim(); // Get original HTML
    element.innerHTML = originalHTML; // Reset to original
  });

  toggleLanguageButtons(); // Update button visibility
}

// Function to translate specific elements on the page with proper synchronization
async function translatePage(targetLanguage) {
  toggleLanguageButtons(); // Adjust button visibility

  const elementsToTranslate = document.querySelectorAll('.translate');

  for (const element of elementsToTranslate) {
    // Store original HTML for reverting later
    if (!element.hasAttribute('data-original-html')) {
      element.setAttribute('data-original-html', element.innerHTML.trim());
    }

    const originalHTML = element.innerHTML.trim();

    // Check if the originalHTML matches any custom translation
    let translatedHTML = customTranslations[originalHTML]?.[targetLanguage];

    if (!translatedHTML) {
      // If no custom translation, perform the translation
      const segments = originalHTML.split(/(<br>)/i); // Split by <br> tags
      translatedHTML = '';

      for (const segment of segments) {
        if (segment.toLowerCase() === '<br>') {
          translatedHTML += segment; // Preserve the <br> tags
        } else {
          const sentences = segment.split(/[.!?]/).filter(sentence => sentence.trim());

          for (const sentence of sentences) {
            let translatedSentence;

            // Check if the sentence has a custom translation
            if (customTranslations[sentence]) {
              translatedSentence = customTranslations[sentence][targetLanguage];
            } else {
              translatedSentence = await googleTranslate(targetLanguage, sentence.trim());
            }

            translatedHTML += `${translatedSentence}  `;
          }
        }
      }
    }

    element.innerHTML = translatedHTML.trim(); // Translate and update
  }

  manualAdjustments(targetLanguage); // Perform manual adjustments after translation
}

// Google Translate function with promise-based approach
function googleTranslate(targetLanguage, text) {
  return new Promise((resolve, reject) => {
    const baseUrl = 'https://translate.googleapis.com/translate_a/single';
    const apiUrl = `${baseUrl}?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const translatedText = data[0][0][0];
        resolve(translatedText);
      })
      .catch(error => {
        console.error('Error translating:', error);
        reject(error);
      });
  });
}

// Manual adjustments for specific translations
function manualAdjustments(targetLanguage) {
  const elementsToAdjust = document.querySelectorAll('.translate');

  elementsToAdjust.forEach(element => {
    if (element.innerHTML.includes('excellent') && targetLanguage === 'ja') {
      element.innerHTML = element.innerHTML.replace('excellent', 'スーペリア');
    }
  });
}

// Event listeners for language buttons
document.getElementById('englishButton').addEventListener('click', () => {
  toggleTranslation(); // Toggle translation mode
});

document.getElementById('japaneseButton').addEventListener('click', () => {
  toggleTranslation(); // Toggle translation mode
});

// Initial call to check translation preference and translate or reset accordingly
isTranslationOn = getTranslationPreference(); // Get stored preference
if (isTranslationOn) {
  translatePage('ja'); // Translate if preference is "on"
} else {
  resetToOriginal(); // Otherwise, reset to original text
}
