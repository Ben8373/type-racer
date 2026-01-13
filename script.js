// TypeRacer timing logic
// Records time between Start and Stop, updates UI, and manages buttons

(function () {
  let startTime = null;
  let isRunning = false;
  let originalSampleText = ''; // Store original text for resetting

  function getElement(id) {
    return document.getElementById(id);
  }

  function setButtonStates({ startDisabled, stopDisabled, retryDisabled }) {
    const startBtn = getElement('start-btn');
    const stopBtn = getElement('stop-btn');
    const retryBtn = getElement('retry-btn');
    if (startBtn) startBtn.disabled = !!startDisabled;
    if (stopBtn) stopBtn.disabled = !!stopDisabled;
    if (retryBtn) retryBtn.disabled = !!retryDisabled;
  }

  function updateTimeDisplay(seconds) {
    const timeSpan = getElement('time');
    if (timeSpan) {
      timeSpan.textContent = seconds.toFixed(2);
    }
  }

  function getNormalizedWords(text) {
    return (text || '')
      .trim()
      .split(/\s+/)
      .map(w => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, ''))
      .filter(Boolean);
  }

  function countCorrectWords(sampleText, typedText) {
    const sampleWords = getNormalizedWords(sampleText);
    const typedWords = getNormalizedWords(typedText);
    const len = Math.min(sampleWords.length, typedWords.length);
    let correct = 0;
    for (let i = 0; i < len; i++) {
      if (typedWords[i] === sampleWords[i]) correct++;
    }
    return correct;
  }

  function updateWPMDisplay(wpm) {
    const wpmSpan = getElement('wpm');
    if (wpmSpan) wpmSpan.textContent = String(Math.round(wpm));
  }

  function updateLevelDisplay() {
    const select = getElement('difficulty');
    const levelSpan = getElement('level');
    if (select && levelSpan) {
      const label = select.value.charAt(0).toUpperCase() + select.value.slice(1);
      levelSpan.textContent = label;
    }
  }

  function highlightSampleText() {
    const sampleDiv = getElement('sample-text');
    const userInput = getElement('user-input');
    if (!sampleDiv || !userInput) return;

    // Use stored original text to avoid losing punctuation
    const sampleText = originalSampleText || sampleDiv.textContent || '';
    const typedText = userInput.value || '';

    const sampleWords = sampleText.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    // Build highlighted HTML
    const highlightedWords = sampleWords.map((word, index) => {
      if (index >= typedWords.length) {
        // Not yet typed - default color
        return `<span>${word}</span>`;
      }
      
      const typed = typedWords[index];
      const sampleNorm = word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
      const typedNorm = typed.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');

      if (sampleNorm === typedNorm) {
        // Correct word - blue
        return `<span style="color: #0d6efd; font-weight: bold;">${word}</span>`;
      } else {
        // Incorrect word - red
        return `<span style="color: #dc3545; font-weight: bold;">${word}</span>`;
      }
    });

    sampleDiv.innerHTML = highlightedWords.join(' ');
  }

  function resetSampleTextHighlight() {
    const sampleDiv = getElement('sample-text');
    if (!sampleDiv) return;
    // Reset to original plain text
    sampleDiv.innerHTML = '';
    sampleDiv.textContent = originalSampleText;
  }

  function storeSampleText() {
    const sampleDiv = getElement('sample-text');
    if (sampleDiv) {
      originalSampleText = sampleDiv.textContent || '';
    }
  }

  function startTest() {
    if (isRunning) return;
    isRunning = true;
    startTime = performance.now();
    setButtonStates({ startDisabled: true, stopDisabled: false, retryDisabled: true });
    
    // Store original text before highlighting starts
    storeSampleText();
    
    // Enable real-time highlighting
    const userInput = getElement('user-input');
    if (userInput) {
      userInput.addEventListener('input', highlightSampleText);
      userInput.focus();
    }
  }

  function stopTest() {
    if (!isRunning) return;
    const endTime = performance.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    updateTimeDisplay(elapsedSeconds);

    // Use original text for WPM calculation
    const sampleText = originalSampleText || (getElement('sample-text')?.textContent) || '';
    const typedText = (getElement('user-input')?.value) || '';
    const correctWords = countCorrectWords(sampleText, typedText);
    const wpm = elapsedSeconds > 0 ? (correctWords / elapsedSeconds) * 60 : 0;
    updateWPMDisplay(wpm);
    updateLevelDisplay();

    isRunning = false;
    setButtonStates({ startDisabled: false, stopDisabled: true, retryDisabled: false });

    // Disable real-time highlighting
    const userInput = getElement('user-input');
    if (userInput) {
      userInput.removeEventListener('input', highlightSampleText);
    }
  }

  function resetTest() {
    isRunning = false;
    startTime = null;
    updateTimeDisplay(0);
    updateWPMDisplay(0);
    setButtonStates({ startDisabled: false, stopDisabled: true, retryDisabled: true });
    const input = getElement('user-input');
    if (input) {
      input.value = '';
      input.focus();
      input.removeEventListener('input', highlightSampleText);
    }
    resetSampleTextHighlight();
  }

  function wireEvents() {
    const startBtn = getElement('start-btn');
    const stopBtn = getElement('stop-btn');
    const retryBtn = getElement('retry-btn');

    if (startBtn) startBtn.addEventListener('click', startTest);
    if (stopBtn) stopBtn.addEventListener('click', stopTest);
    if (retryBtn) retryBtn.addEventListener('click', resetTest);
  }

  function init() {
    wireEvents();
    setButtonStates({ startDisabled: false, stopDisabled: true, retryDisabled: true });
    updateTimeDisplay(0);
    updateWPMDisplay(0);
    updateLevelDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose named functions for clarity/testing if needed
  window.TypeRacerTimer = {
    startTest,
    stopTest,
    resetTest,
    updateTimeDisplay,
    updateLevelDisplay,
    storeSampleText, // Expose for external text updates
  };
})();
document.addEventListener('DOMContentLoaded', function() {
    const easyTexts = [
        "The cat sat on the mat.",
        "A quick brown fox jumps over the lazy dog.",
        "She sells seashells by the seashore."
    ];

    const mediumTexts = [
        "To be or not to be, that is the question.",
        "All that glitters is not gold.",
        "A journey of a thousand miles begins with a single step."
    ];

    const hardTexts = [
        "It was the best of times, it was the worst of times.",
        "In the beginning God created the heavens and the earth.",
        "The only thing we have to fear is fear itself."

    ];

    const difficultySelect = document.getElementById('difficulty');
    const sampleTextDiv = document.getElementById('sample-text');

    function getRandomText(textArray) {
        const randomIndex = Math.floor(Math.random() * textArray.length);
        return textArray[randomIndex];
    }

    function updateSampleText() {
        let selectedDifficulty = difficultySelect.value;
        let selectedText;

        if (selectedDifficulty === 'easy') {
            selectedText = getRandomText(easyTexts);
        } else if (selectedDifficulty === 'medium') {
            selectedText = getRandomText(mediumTexts);
        } else if (selectedDifficulty === 'hard') {
            selectedText = getRandomText(hardTexts);
        }

        sampleTextDiv.textContent = selectedText;

        // Update level display and store the new sample text
        if (window.TypeRacerTimer) {
            if (typeof window.TypeRacerTimer.updateLevelDisplay === 'function') {
                window.TypeRacerTimer.updateLevelDisplay();
            }
            if (typeof window.TypeRacerTimer.storeSampleText === 'function') {
                window.TypeRacerTimer.storeSampleText();
            }
        }
    }

    difficultySelect.addEventListener('change', updateSampleText);

    // Initialize with a random text from the default difficulty level
    updateSampleText();
});
const userInput = getElement('user-input');
if (userInput) {
  userInput.addEventListener('input', highlightSampleText);
}