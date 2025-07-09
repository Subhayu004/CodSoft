// Completed JavaScript file: static/app.js

const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const generateBtn = document.getElementById('generateBtn');
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const notification = document.getElementById('notification');
const errorNotification = document.getElementById('errorNotification');
const notificationText = document.getElementById('notificationText');
const errorText = document.getElementById('errorText');
const strengthFeedback = document.getElementById('strengthFeedback');
const feedbackList = document.getElementById('feedbackList');

// API endpoints
const API_BASE = window.location.origin;
const GENERATE_ENDPOINT = `${API_BASE}/generate`;
const STRENGTH_ENDPOINT = `${API_BASE}/strength`;

lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
    updateSliderBackground();
});

function updateSliderBackground() {
    const value = lengthSlider.value;
    const max = lengthSlider.max;
    const percentage = (value / max) * 100;
    lengthSlider.style.background = `linear-gradient(to right, #667eea 0%, #764ba2 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
}

async function generatePassword() {
    const length = parseInt(lengthSlider.value);
    const options = {
        length: length,
        uppercase: uppercaseCheckbox.checked,
        lowercase: lowercaseCheckbox.checked,
        numbers: numbersCheckbox.checked,
        symbols: symbolsCheckbox.checked
    };

    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        showError('Please select at least one character type!');
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch(GENERATE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            passwordOutput.value = data.password;
            updateStrengthMeter(data.strength);

            document.querySelector('.password-display').classList.add('generating');
            setTimeout(() => {
                document.querySelector('.password-display').classList.remove('generating');
            }, 500);

            copyBtn.disabled = false;
        } else {
            showError(data.error || 'Failed to generate password');
        }
    } catch (error) {
        console.error('Error generating password:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    const spinner = generateBtn.querySelector('.loading-spinner');
    const text = generateBtn.querySelector('.btn-text');

    if (isLoading) {
        spinner.style.display = 'inline-block';
        text.style.display = 'none';
        generateBtn.disabled = true;
    } else {
        spinner.style.display = 'none';
        text.style.display = 'inline-block';
        generateBtn.disabled = false;
    }
}

function updateStrengthMeter(strengthInfo) {
    const { percentage, strength, color, feedback } = strengthInfo;

    strengthFill.style.width = `${percentage}%`;
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = strength;
    strengthText.style.color = color;

    if (feedback && feedback.length > 0) {
        feedbackList.innerHTML = '';
        feedback.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            feedbackList.appendChild(li);
        });
        strengthFeedback.style.display = 'block';
    } else {
        feedbackList.innerHTML = '';
        strengthFeedback.style.display = 'none';
    }
}

copyBtn.addEventListener('click', () => {
    passwordOutput.select();
    document.execCommand('copy');
    showNotification('Password copied to clipboard!');
});

function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

function showError(message) {
    errorText.textContent = message;
    errorNotification.classList.add('show');
    setTimeout(() => errorNotification.classList.remove('show'), 3000);
}

generateBtn.addEventListener('click', generatePassword);

// Initial
updateSliderBackground();
