// TypeRacer timing logic
// Records time between Start and Stop, updates UI, and manages buttons

(function () {
  let startTime = null;
  let isRunning = false;

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

  function startTest() {
    if (isRunning) return;
    isRunning = true;
    startTime = performance.now();
    setButtonStates({ startDisabled: true, stopDisabled: false, retryDisabled: true });
  }

  function stopTest() {
    if (!isRunning) return;
    const endTime = performance.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    updateTimeDisplay(elapsedSeconds);

    const sampleText = (getElement('sample-text')?.textContent) || '';
    const typedText = (getElement('user-input')?.value) || '';
    const correctWords = countCorrectWords(sampleText, typedText);
    const wpm = elapsedSeconds > 0 ? (correctWords / elapsedSeconds) * 60 : 0;
    updateWPMDisplay(wpm);
    updateLevelDisplay();

    isRunning = false;
    setButtonStates({ startDisabled: false, stopDisabled: true, retryDisabled: false });
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
    }
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

        if (window.TypeRacerTimer && typeof window.TypeRacerTimer.updateLevelDisplay === 'function') {
          window.TypeRacerTimer.updateLevelDisplay();
        }
    }

    difficultySelect.addEventListener('change', updateSampleText);

    // Initialize with a random text from the default difficulty level
    updateSampleText();
});