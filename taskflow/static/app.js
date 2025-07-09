let tasks = [];
let currentFilter = 'all';
let userName = localStorage.getItem('taskflowUsername') || '';
let taskHistory = [];

//const API_BASE = "http://127.0.0.1:5000";
const API_BASE = "https://taskflow-mf12.onrender.com";

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    loadTheme();
    updateClock();
    setInterval(updateClock, 1000);

    if (!userName) {
        document.getElementById('nameModal').style.display = 'flex';
    } else {
        document.getElementById('nameModal').style.display = 'none';
        updateWelcomeMessage();
        loadTasks();
    }
});

function setUserName() {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
        userName = name;
        localStorage.setItem('taskflowUsername', userName);
        document.getElementById('nameModal').style.display = 'none';
        updateWelcomeMessage();
        addToHistory(`Welcome ${name}! 🎉`);
        loadTasks();
    } else {
        alert('Please enter your name');
    }
}

function updateWelcomeMessage() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 21 ? "Good Evening" : "Good Night";
    document.getElementById('welcomeMessage').textContent = `${greeting}, ${userName}! 👋`;
}

function updateClock() {
    const timeString = new Date().toLocaleTimeString();
    document.getElementById('clock').textContent = timeString;
}

function toggleTheme() {
    const current = document.body.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌓 Dark Mode';
}

function loadTheme() {
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
    document.querySelector('.theme-toggle').textContent = saved === 'dark' ? '☀️ Light Mode' : '🌓 Dark Mode';
}

// ---------------------------
// Task CRUD via Flask API
// ---------------------------
async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/tasks`);
        tasks = await res.json();
        renderTasks();
        updateStats();
    } catch (err) {
        console.error("Failed to load tasks:", err);
    }
}

async function addTask(taskText, taskType) {
    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                task: taskText,
                type: taskType,
                createdAt: new Date().toLocaleString()
            })
        });
        const newTask = await res.json();
        tasks.push(newTask);
        addToHistory(`Added "${taskText}" (${taskType})`);
        renderTasks();
        updateStats();
    } catch (err) {
        console.error("Failed to add task:", err);
    }
}

async function toggleTask(taskId) {
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "PUT" });
        const updatedTask = await res.json();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            tasks[index] = updatedTask;
            addToHistory(`${updatedTask.done ? "Completed" : "Reopened"} "${updatedTask.task}"`);
            renderTasks();
            updateStats();
        }
    } catch (err) {
        console.error("Failed to toggle task:", err);
    }
}

async function deleteTask(taskId) {
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
        if (res.ok) {
            const deletedTask = tasks.find(t => t.id === taskId);
            tasks = tasks.filter(t => t.id !== taskId);
            addToHistory(`Deleted "${deletedTask.task}"`);
            renderTasks();
            updateStats();
        }
    } catch (err) {
        console.error("Failed to delete task:", err);
    }
}

// ---------------------------
// Task UI Functions
// ---------------------------
function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'daily': return tasks.filter(t => t.type === 'daily');
        case 'monthly': return tasks.filter(t => t.type === 'monthly');
        case 'yearly': return tasks.filter(t => t.type === 'yearly');
        case 'completed': return tasks.filter(t => t.done);
        case 'pending': return tasks.filter(t => !t.done);
        default: return tasks;
    }
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const filtered = getFilteredTasks();
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No tasks found</h3>
                <p>Add your first task above to get started!</p>
            </div>`;
        return;
    }
    container.innerHTML = filtered.map(task => `
        <div class="task-item ${task.done ? 'completed' : ''}">
            <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <div class="task-text ${task.done ? 'completed' : ''}">${task.task}</div>
            <div class="task-type-badge task-type-${task.type}">${task.type}</div>
            <div class="task-actions">
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

// ---------------------------
// History
// ---------------------------
function addToHistory(action) {
    const item = { action, timestamp: new Date().toLocaleString() };
    taskHistory.unshift(item);
    if (taskHistory.length > 10) taskHistory = taskHistory.slice(0, 10);
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('taskHistory');
    if (taskHistory.length === 0) {
        container.innerHTML = `
            <div class="history-item">
                <span class="history-action">Welcome!</span>
                Start adding tasks to see your activity here.
            </div>`;
        return;
    }
    container.innerHTML = taskHistory.map(h => `
        <div class="history-item">
            <span class="history-action">${h.action}</span>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                ${h.timestamp}
            </div>
        </div>
    `).join('');
}

// ---------------------------
// Form Event Listeners
// ---------------------------
document.getElementById('addTaskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const taskInput = document.getElementById('taskInput');
    const taskType = document.getElementById('taskType');
    const taskText = taskInput.value.trim();

    if (!taskText) return alert("Please enter a task!");
    addTask(taskText, taskType.value);
    taskInput.value = "";
});

document.getElementById('nameInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') setUserName();
});
// AI Assistant Integration for TaskFlow
// Add this to your existing app.js file

// AI Configuration
const OPENAI_API_KEY = ''; // ❗️DO NOT expose keys in frontend. Use secure backend call.
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// AI Assistant State
let aiChatVisible = false;
let aiChatHistory = [];

// Initialize AI Assistant UI
function initializeAIAssistant() {
    // ... [UI setup code remains unchanged]
}

// Toggle AI Chat Visibility
function toggleAIChat() {
    // ... [unchanged]
}

// Send Message to AI
async function sendAIMessage() {
    // ... [unchanged]
}

// ⚠️ API call should ideally be handled by a backend server
async function callOpenAIAPI(userMessage) {
    if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key not set. Please use a secure backend to handle requests.");
    }

    const systemPrompt = `You are TaskFlow AI Assistant, a helpful AI that helps users manage their tasks and time. 

Current user context:
- Username: ${userName}
- Total tasks: ${tasks.length}
- Completed tasks: ${tasks.filter(t => t.done).length}
- Pending tasks: ${tasks.filter(t => !t.done).length}
- Current tasks: ${JSON.stringify(tasks.slice(0, 5))}

Your capabilities:
1. Help organize tasks efficiently
2. Create time schedules and routines
3. Adjust time management strategies
4. Provide reminders and notifications
5. Warn about potential productivity issues

Be concise, helpful, and actionable. If you suggest creating tasks or schedules, format them clearly. Use emojis appropriately.`;

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}` // Will fail if not set
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...aiChatHistory.slice(-6),
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    aiChatHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
    );

    return aiResponse;
}

// ... [All other functions remain unchanged]

// Initialize AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAIAssistant, 1000);
});

// Export functions for global access
window.askAIForTaskSuggestions = askAIForTaskSuggestions;
window.askAIForSchedule = askAIForSchedule;
window.askAIForProductivityTips = askAIForProductivityTips;
