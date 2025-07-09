// Calculator state
let currentExpression = '';
let displayValue = '0';
let shouldResetDisplay = false;
let isCalculating = false;

// DOM elements
const currentDisplay = document.getElementById('currentDisplay');
const previousDisplay = document.getElementById('previousDisplay');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const themeToggle = document.getElementById('themeToggle');

// Theme management
function initializeTheme() {
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Event listener for theme toggle
themeToggle.addEventListener('change', toggleTheme);

// Update display
function updateDisplay() {
    currentDisplay.textContent = displayValue;
    previousDisplay.textContent = currentExpression;
}

// Get operator symbol for display
function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[op] || op;
}

// Input number
function inputNumber(num) {
    if (shouldResetDisplay) {
        displayValue = num;
        shouldResetDisplay = false;
    } else {
        // Handle decimal point
        if (num === '.' && displayValue.includes('.')) {
            return;
        }
        
        // Handle multiple digits
        if (displayValue === '0' && num !== '.') {
            displayValue = num;
        } else {
            displayValue += num;
        }
    }
    updateDisplay();
}

// Input operator
function inputOperator(op) {
    if (shouldResetDisplay) {
        shouldResetDisplay = false;
    }
    
    // If there's already an expression, append the current value
    if (currentExpression && !currentExpression.endsWith(' ')) {
        currentExpression += ' ' + displayValue;
    } else if (!currentExpression) {
        currentExpression = displayValue;
    }
    
    // Add operator to expression
    currentExpression += ' ' + getOperatorSymbol(op);
    shouldResetDisplay = true;
    updateDisplay();
}

// Calculate expression
async function calculate() {
    if (isCalculating) return;
    
    // Complete the expression with current display value
    let fullExpression = currentExpression;
    if (fullExpression && !fullExpression.endsWith(' ')) {
        fullExpression += ' ' + displayValue;
    } else if (!fullExpression) {
        fullExpression = displayValue;
    } else {
        fullExpression += displayValue;
    }
    
    try {
        isCalculating = true;
        document.querySelector('.calculator').classList.add('loading');
        
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expression: fullExpression })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayValue = data.result.toString();
            currentExpression = '';
            shouldResetDisplay = true;
            updateDisplay();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Network error. Please try again.');
    } finally {
        isCalculating = false;
        document.querySelector('.calculator').classList.remove('loading');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const calculator = document.querySelector('.calculator');
    calculator.insertBefore(errorDiv, calculator.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Clear all
function clearAll() {
    currentExpression = '';
    displayValue = '0';
    shouldResetDisplay = false;
    updateDisplay();
}

// Backspace - delete one character at a time
function backspace() {
    if (displayValue.length > 1) {
        displayValue = displayValue.slice(0, -1);
    } else {
        displayValue = '0';
    }
    updateDisplay();
}

// Show history
async function showHistory() {
    try {
        const response = await fetch('/history');
        const data = await response.json();
        
        renderHistory(data.history);
        historyModal.style.display = 'flex';
    } catch (error) {
        showError('Failed to load history');
    }
}

// Close history modal
function closeHistory() {
    historyModal.style.display = 'none';
}

// Render history
function renderHistory(history) {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations yet!</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="useHistoryResult('${item.result}')">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).join('');
}

// Use history result
function useHistoryResult(result) {
    displayValue = result;
    currentExpression = '';
    shouldResetDisplay = true;
    updateDisplay();
    closeHistory();
}

// Clear history
async function clearHistory() {
    try {
        const response = await fetch('/history', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            renderHistory([]);
        } else {
            showError('Failed to clear history');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Close modal when clicking outside
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        closeHistory();
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
    } else if (e.key === '.') {
        inputNumber('.');
    } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
        inputOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Escape') {
        clearAll();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
    }
});

// Prevent form submission on Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Initialize display and theme
updateDisplay();
initializeTheme();