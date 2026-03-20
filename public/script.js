// Supabase Initialization
const supabaseUrl = 'https://styyowwhpmizpktkoptw.supabase.co';
const supabaseKey = 'sb_publishable_XCllAJL_RAxakFUrLrpOcA_0rOvUnqd';

// Protect against CDN not being loaded (Cached index.html)
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

const API_URL = '/api/tasks';

// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authMessage = document.getElementById('authMessage');
const authSubtitle = document.getElementById('authSubtitle');
const logoutBtn = document.getElementById('logoutBtn');

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
let tasks = [];
let currentFilter = 'all';
let isLoginMode = true;
let session = null;

// Initialize
async function init() {
    try {
        if (!supabaseClient) {
            throw new Error("Supabase não carregou. Por favor, dê um Ctrl+F5 para atualizar a página completamente e limpar o cache.");
        }
        
        // Check for existing session
        const { data: { session: existingSession } } = await supabaseClient.auth.getSession();
        
        if (existingSession) {
            session = existingSession;
            showApp();
        } else {
            showAuth();
        }
    } catch (error) {
        console.error("Initialization error:", error);
        showAuth();
        authMessage.style.color = '#ef4444';
        authMessage.textContent = error.message;
    }
    
    setupEventListeners();
}

function showAuth() {
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';
    emailInput.value = '';
    passwordInput.value = '';
    authMessage.textContent = '';
}

async function showApp() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'block';
    await fetchTasks();
}

// Event Listeners
function setupEventListeners() {
    // Auth events
    toggleAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            authSubtitle.textContent = 'Login to manage your tasks';
            authSubmitBtn.textContent = 'Login';
            toggleAuthMode.textContent = 'Sign Up (Cadastro)';
        } else {
            authSubtitle.textContent = 'Create an account to start';
            authSubmitBtn.textContent = 'Sign Up (Cadastro)';
            toggleAuthMode.textContent = 'Back to Login';
        }
        authMessage.textContent = '';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        authSubmitBtn.disabled = true;
        authMessage.textContent = '';
        authMessage.style.color = '#ef4444'; // Red for errors

        try {
            if (isLoginMode) {
                // Login
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                session = data.session;
                showApp();
            } else {
                // Sign Up (Cadastro)
                const { data, error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                
                // If email confirmation is required, session might be null
                if (data.session) {
                    session = data.session;
                    showApp();
                } else {
                    isLoginMode = true;
                    // Manually switch UI to login without triggering the click event that clears the message
                    authSubtitle.textContent = 'Login to manage your tasks';
                    authSubmitBtn.textContent = 'Login';
                    toggleAuthMode.textContent = 'Sign Up (Cadastro)';
                    
                    authMessage.style.color = '#10b981'; // Green for success
                    authMessage.textContent = 'Cadastro realizado! Por favor, confirme seu email ou faça login com sua senha.';
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            authMessage.style.color = '#ef4444';
            authMessage.textContent = 'Erro: ' + error.message;
        } finally {
            authSubmitBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        session = null;
        showAuth();
    });

    // Task events
    addBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set current filter and re-render
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

// Fetch tasks from API
async function fetchTasks() {
    if (!session) return;
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const data = await response.json();
        tasks = data.tasks;
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        taskList.innerHTML = `<div class="empty-state">Failed to load tasks. Please try again later.</div>`;
    }
}

// Add a new task
async function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    try {
        // Disable input while adding
        taskInput.disabled = true;
        addBtn.disabled = true;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ task: taskText })
        });

        if (!response.ok) throw new Error('Failed to add task');

        const newTask = await response.json();
        
        // Add to beginning of local array using unshift (matching DESC order from API)
        tasks.unshift(newTask);
        
        // Create actual full object from response
        const fullTask = {
            id: newTask.id,
            task: newTask.task,
            status: newTask.status
        };

        // Clear input and re-render
        taskInput.value = '';
        renderTasks();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Could not add task. Please try again.');
    } finally {
        taskInput.disabled = false;
        addBtn.disabled = false;
        taskInput.focus();
    }
}

// Toggle task status
async function toggleTask(id, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    // Optimistic UI update
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        renderTasks();
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        // Revert optimistic update
        if (taskIndex !== -1) {
            tasks[taskIndex].status = currentStatus;
            renderTasks();
        }
        alert('Could not update task. Please try again.');
    }
}

// Delete task
async function deleteTask(id) {
    // Optimistic UI update
    const originalTasks = [...tasks];
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        // Revert optimistic update
        tasks = originalTasks;
        renderTasks();
        alert('Could not delete task. Please try again.');
    }
}

// Render tasks to the DOM
function renderTasks() {
    let filteredTasks = tasks;

    // Apply filter
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => t.status === 'pending');
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.status === 'completed');
    }

    // Update counter
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    taskCount.textContent = pendingCount;
    // Update counter text (singular vs plural)
    taskCount.nextSibling.textContent = pendingCount === 1 ? ' task pending' : ' tasks pending';

    // Render HTML
    if (filteredTasks.length === 0) {
        if (tasks.length === 0) {
            taskList.innerHTML = `<div class="empty-state">No tasks yet. Add one above!</div>`;
        } else {
            taskList.innerHTML = `<div class="empty-state">No ${currentFilter} tasks found.</div>`;
        }
        return;
    }

    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-check" onclick="toggleTask(${task.id}, '${task.status}')">
                <i class="fas fa-check"></i>
            </div>
            <span class="task-text">${escapeHTML(task.task)}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        taskList.appendChild(li);
    });
}

// Helper to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Start application
init();
