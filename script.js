document.addEventListener('DOMContentLoaded', function () {
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
    const timeDisplay = document.getElementById('time');
    const userInput = document.getElementById('user-input');
    const levelDisplay = document.getElementById('level');
    const wpmDisplay = document.getElementById('wpm');
    const retryButton = document.getElementById('retry-btn');

    let startTime;
    let endTime;
    let testStarted = false;

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
    }

    function stopTest() {
        endTime = new Date();
        const timeTaken = (endTime - startTime) / 1000; // time in seconds
        const wpm = calculateWPM(timeTaken);
        
        displayResults(timeTaken, wpm);

        userInput.disabled = true;        
        retryButton.disabled = false;
        testStarted = false;
    }

    function calculateWPM(timeTaken) {
        const sampleText = sampleTextDiv.textContent.trim();
        const userText = userInput.value.trim();
        const sampleWords = sampleText.split(" ");
        const userWords = userText.split(" ");
    
        let correctWords = 0;
        for (let i = 0; i < userWords.length; i++) {
            if (userWords[i] === sampleWords[i]) {
                correctWords++;
            }
        }
    
        return Math.round((correctWords / timeTaken) * 60);
    }

    function displayResults(timeTaken, wpm) {
        timeDisplay.textContent = timeTaken.toFixed(2);
        wpmDisplay.textContent = wpm;
        const selectedDifficulty = difficultySelect.value;
        levelDisplay.textContent = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
    }

    function updateTypingFeedback() {

        if (!testStarted) {
            startTime = new Date();
            testStarted = true;
            retryButton.disabled = true;
        }

        const sampleText = sampleTextDiv.textContent.trim();
        const userText = userInput.value.trim();
        const sampleWords = sampleText.split(" ");
        const userWords = userText.split(" ");
    
        let feedbackHTML = '';
    
        for (let i = 0; i < sampleWords.length; i++) {
            if (userWords[i] === sampleWords[i]) {
                feedbackHTML += `<span class="correct">${sampleWords[i]}</span> `;
            } else if (userWords[i]) {
                feedbackHTML += `<span class="incorrect">${sampleWords[i]}</span> `;
            } else {
                feedbackHTML += `<span>${sampleWords[i]}</span> `;
            }
        }
    
        sampleTextDiv.innerHTML = feedbackHTML.trim();
    }

    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            stopTest();
        }
    }

    function resetTest() {
        userInput.value = '';
        userInput.disabled = false;
        updateSampleText();
        timeDisplay.textContent = '0';
        wpmDisplay.textContent = '0';
        testStarted = false;
        retryButton.disabled = true;
    }

    difficultySelect.addEventListener('change', updateSampleText);
    userInput.addEventListener('input', updateTypingFeedback);
    userInput.addEventListener('keydown', handleEnterKey);
    retryButton.addEventListener('click', resetTest);

    // Initialize with a random text from the default difficulty level
    updateSampleText();
});