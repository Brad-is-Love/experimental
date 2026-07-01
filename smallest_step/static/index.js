// Global App State
const AppState = {
    appState: 'INPUT_GOAL', // INPUT_GOAL, GENERATING_STEPS, TIMELINE_ACTIVE, ASSISTANT_ACTIVE
    currentGoal: null,
    currentStreak: parseInt(localStorage.getItem('smallestStepStreak')) || 0,
    lastCompletedDate: localStorage.getItem('smallestStepLastCompletedDate') || null,
    timelineSteps: [],
    currentActiveStepIndex: 0,
    activeChatStep: null
};

// DOM Elements
const screens = {
    'INPUT_GOAL': document.getElementById('screen-input'),
    'GENERATING_STEPS': document.getElementById('screen-loading'),
    'TIMELINE_ACTIVE': document.getElementById('screen-timeline'),
};

const ui = {
    goalInput: document.getElementById('goal-input'),
    btnSubmitGoal: document.getElementById('btn-submit-goal'),
    currentGoalDisplay: document.getElementById('current-goal-display'),
    timelineList: document.getElementById('timeline-list'),
    streakTracker: document.getElementById('streak-tracker'),
    streakCount: document.getElementById('streak-count'),

    // Modal
    modalAssistant: document.getElementById('modal-assistant'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    assistantContext: document.getElementById('assistant-context'),
    chatHistory: document.getElementById('chat-history'),
    assistantInput: document.getElementById('assistant-input'),
    btnSendMessage: document.getElementById('btn-send-message'),
};

// Initialization
function init() {
    updateStreakUI();

    ui.btnSubmitGoal.addEventListener('click', handleGoalSubmit);
    ui.goalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGoalSubmit();
    });

    ui.btnCloseModal.addEventListener('click', closeModal);
    ui.btnSendMessage.addEventListener('click', handleChatSubmit);
    ui.assistantInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') handleChatSubmit();
    });
}

// State Management
function setAppState(newState) {
    AppState.appState = newState;

    // Hide all screens
    Object.values(screens).forEach(screen => {
        if(screen) screen.classList.remove('active');
    });

    // Show active screen
    if (screens[newState]) {
        screens[newState].classList.add('active');
    }

    if (newState === 'TIMELINE_ACTIVE') {
        renderTimeline();
    }
}

// Actions
async function handleGoalSubmit() {
    const goal = ui.goalInput.value.trim();
    if (!goal) return;

    AppState.currentGoal = goal;
    ui.currentGoalDisplay.textContent = goal;

    setAppState('GENERATING_STEPS');

    try {
        const response = await fetch('/api/generate-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal })
        });
        const data = await response.json();

        if (data.status === 'success') {
            AppState.timelineSteps = data.steps;
            AppState.currentActiveStepIndex = 0;

            // Generate mock sub-steps if missing to fulfill spec "mock data"
            if (AppState.timelineSteps.length === 0) {
                 AppState.timelineSteps = [
                    { id: '1', title: "Create a new folder on your desktop called 'App Project'.", level: 1, completed: false },
                    { id: '2', title: "Open a text editor and create a file named 'ideas.txt'.", level: 1, completed: false },
                    { id: '3', title: "Write down 3 core features of your app.", level: 2, completed: false }
                 ];
            }

            setAppState('TIMELINE_ACTIVE');
        } else {
            alert('Failed to generate steps: ' + data.message);
            setAppState('INPUT_GOAL');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred. Using mock data.');

        AppState.timelineSteps = [
            { id: '1', title: "Create a new folder on your desktop called 'App Project'.", level: 1, completed: false },
            { id: '2', title: "Open a text editor and create a file named 'ideas.txt'.", level: 1, completed: false },
            { id: '3', title: "Write down 3 core features of your app.", level: 2, completed: false }
        ];
        AppState.currentActiveStepIndex = 0;
        setAppState('TIMELINE_ACTIVE');
    }
}

// Rendering
function renderTimeline() {
    ui.timelineList.innerHTML = '';

    AppState.timelineSteps.forEach((step, index) => {
        if (index < AppState.currentActiveStepIndex) return; // Skip completed

        const relativeIndex = index - AppState.currentActiveStepIndex;

        const card = document.createElement('div');
        card.className = 'step-card';
        if (relativeIndex > 0) {
            card.classList.add(`step-future-${Math.min(relativeIndex, 3)}`);
        }

        card.id = `step-card-${step.id}`;

        const title = document.createElement('h3');
        title.textContent = step.title;
        card.appendChild(title);

        if (relativeIndex === 0) {
            const actions = document.createElement('div');
            actions.className = 'step-actions';

            const btnComplete = document.createElement('button');
            btnComplete.className = 'primary-btn btn-complete';
            btnComplete.textContent = 'Complete';
            btnComplete.onclick = () => completeStep(step.id);
            actions.appendChild(btnComplete);

            const btnHelp = document.createElement('button');
            btnHelp.className = 'secondary-btn';
            btnHelp.textContent = 'Help me execute';
            btnHelp.onclick = () => openAssistant(step);
            actions.appendChild(btnHelp);

            if (step.level > 1) {
                const btnBreakdown = document.createElement('button');
                btnBreakdown.className = 'secondary-btn';
                btnBreakdown.textContent = 'Break down further';
                btnBreakdown.onclick = () => refineStep(step.id);
                actions.appendChild(btnBreakdown);
            }

            card.appendChild(actions);
        }

        ui.timelineList.appendChild(card);
    });
}

// Step Operations
function completeStep(stepId) {
    const card = document.getElementById(`step-card-${stepId}`);
    if (card) {
        card.classList.add('step-completed');
    }

    setTimeout(() => {
        AppState.currentActiveStepIndex++;
        updateStreak();
        renderTimeline();

        if (AppState.currentActiveStepIndex >= AppState.timelineSteps.length) {
            // Reached the end of current steps
            alert("Amazing job! You've built incredible momentum. Let's set a new goal or generate more steps.");
            setAppState('INPUT_GOAL');
        }
    }, 500); // Wait for animation
}

async function refineStep(stepId) {
    const step = AppState.timelineSteps.find(s => s.id === stepId);
    if(!step) return;

    try {
         const response = await fetch('/api/refine-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step_id: stepId, step_title: step.title })
        });
        const data = await response.json();

        if (data.status === 'success') {
             // Replace current step with sub-steps
             AppState.timelineSteps.splice(AppState.currentActiveStepIndex, 1, ...data.sub_steps);
             renderTimeline();
        } else {
            alert('Failed to refine step.');
        }
    } catch (e) {
        console.error(e);
        // Mock refinement
        const mockSub = [
            { id: 'sub-1', title: "Think about the main aspect of: " + step.title, level: 3, completed: false },
            { id: 'sub-2', title: "Write down one sentence.", level: 3, completed: false }
        ];
        AppState.timelineSteps.splice(AppState.currentActiveStepIndex, 1, ...mockSub);
        renderTimeline();
    }
}

// Streak Management
function updateStreak() {
    const today = new Date().toISOString().split('T')[0];

    if (AppState.lastCompletedDate !== today) {
        if (AppState.lastCompletedDate) {
            const lastDate = new Date(AppState.lastCompletedDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                AppState.currentStreak++; // Consecutive day
            } else if (diffDays > 1) {
                AppState.currentStreak = 1; // Streak broken
            }
        } else {
             AppState.currentStreak = 1; // First completion
        }

        AppState.lastCompletedDate = today;
        localStorage.setItem('smallestStepStreak', AppState.currentStreak);
        localStorage.setItem('smallestStepLastCompletedDate', AppState.lastCompletedDate);

        updateStreakUI();
    }
}

function updateStreakUI() {
    if (AppState.currentStreak > 0) {
        ui.streakTracker.style.display = 'flex';
        ui.streakCount.textContent = AppState.currentStreak;
        if (AppState.currentStreak > 2) {
            ui.streakTracker.classList.add('glow');
        }
    } else {
        ui.streakTracker.style.display = 'none';
        ui.streakTracker.classList.remove('glow');
    }
}

// Assistant Modal
function openAssistant(step) {
    AppState.activeChatStep = step;
    ui.assistantContext.textContent = `Task: ${step.title}`;
    ui.chatHistory.innerHTML = ''; // clear history
    ui.modalAssistant.classList.add('active');

    // Add initial greeting
    addChatMessage("Hi! I'm here to help you with this step. What's blocking you?", 'ai');
}

function closeModal() {
    ui.modalAssistant.classList.remove('active');
    AppState.activeChatStep = null;
}

async function handleChatSubmit() {
    const msg = ui.assistantInput.value.trim();
    if (!msg || !AppState.activeChatStep) return;

    addChatMessage(msg, 'user');
    ui.assistantInput.value = '';

    try {
        const response = await fetch('/api/assistant-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                step_title: AppState.activeChatStep.title,
                message: msg
             })
        });
        const data = await response.json();

        if (data.status === 'success') {
             addChatMessage(data.reply, 'ai');
        } else {
             addChatMessage("Sorry, I'm having trouble connecting right now.", 'ai');
        }
    } catch (e) {
        console.error(e);
        addChatMessage("Try focusing on just one tiny part of it right now. What's the very first thing you can click or write?", 'ai');
    }
}

function addChatMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = text;
    ui.chatHistory.appendChild(msgDiv);
    ui.chatHistory.scrollTop = ui.chatHistory.scrollHeight;
}

// Boot
init();