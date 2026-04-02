const STORAGE_KEY = "taskflow-manager-tasks";
const THEME_STORAGE_KEY = "taskflow-manager-theme";

// DOM element references
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const themeToggle = document.querySelector("#theme-toggle");
const emptyState = document.querySelector("#empty-state");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const liveRegion = document.querySelector("#task-updates");
const formMessage = document.querySelector("#form-message");
const filterButtons = document.querySelectorAll(".filter-button");
const filterCounts = document.querySelectorAll(".filter-count");

let tasks = loadTasks();
let currentFilter = "all";
let currentTheme = loadTheme();

// Retrieve saved theme from localStorage, falling back to "light"
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }

        return "light";
    } catch {
        return "light";
    }
}

function saveTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function applyTheme(theme) {
    currentTheme = theme;
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }

    saveTheme(theme);
}

// Parse tasks from localStorage with defensive validation:
// ensures data is an array and each task has required string fields
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);
        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter((task) => typeof task?.id === "string" && typeof task?.title === "string");
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Announce a message to screen readers via the ARIA live region.
// Clears the region first and uses a short delay so assistive tech
// detects the content change as a new announcement.
function announce(message) {
    liveRegion.textContent = "";
    window.setTimeout(() => {
        liveRegion.textContent = message;
    }, 30);
}

function setFormError(message) {
    formMessage.hidden = !message;
    formMessage.textContent = message;
}

function updateSummary() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    totalCount.textContent = String(tasks.length);
    completedCount.textContent = String(completedTasks);

    filterCounts.forEach((count) => {
        if (count.dataset.countFor === "all") {
            count.textContent = String(tasks.length);
        }

        if (count.dataset.countFor === "pending") {
            count.textContent = String(pendingTasks);
        }

        if (count.dataset.countFor === "completed") {
            count.textContent = String(completedTasks);
        }
    });
}

function getFilteredTasks() {
    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
    }

    if (currentFilter === "pending") {
        return tasks.filter((task) => !task.completed);
    }

    return tasks;
}

function updateEmptyState(filteredTasks) {
    const hasAnyTasks = tasks.length > 0;
    const title = emptyState.querySelector("h3");
    const description = emptyState.querySelector("p");

    if (!hasAnyTasks) {
        title.textContent = "No tasks yet";
        description.textContent = "Add your first task to start building momentum.";
        emptyState.hidden = false;
        return;
    }

    if (filteredTasks.length === 0) {
        if (currentFilter === "completed") {
            title.textContent = "No completed tasks";
            description.textContent = "Finish a task to see it appear in this view.";
        } else if (currentFilter === "pending") {
            title.textContent = "No pending tasks";
            description.textContent = "Everything is completed. Clear or add tasks when you are ready.";
        } else {
            title.textContent = "No tasks match this view";
            description.textContent = "Try a different filter to review the rest of your list.";
        }

        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;
}

function updateFilterButtons() {
    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === currentFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function createTaskElement(task) {
    const listItem = document.createElement("li");
    listItem.className = "task-item";
    listItem.dataset.completed = String(task.completed);

    const toggle = document.createElement("input");
    toggle.className = "task-toggle";
    toggle.type = "checkbox";
    toggle.checked = task.completed;
    toggle.setAttribute("aria-label", `Mark \"${task.title}\" as completed`);
    toggle.addEventListener("change", () => toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Completed" : "Open";

    content.append(title, status);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete task \"${task.title}\"`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    listItem.append(toggle, content, deleteButton);
    return listItem;
}

function renderTasks() {
    taskList.innerHTML = "";
    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach((task) => {
        taskList.append(createTaskElement(task));
    });

    updateSummary();
    updateFilterButtons();
    updateEmptyState(filteredTasks);
}

function addTask(title) {
    // Trim leading/trailing whitespace and collapse internal runs of spaces
    const cleanTitle = title.trim().replace(/\s+/g, " ");

    if (!cleanTitle) {
        setFormError("Please enter a task description.");
        return;
    }

    // Insert at the beginning so the newest task appears first
    tasks.unshift({
        id: crypto.randomUUID(),
        title: cleanTitle,
        completed: false,
    });

    saveTasks();
    renderTasks();
    setFormError("");
    announce(`Task added: ${cleanTitle}`);
    taskForm.reset();
    taskInput.focus();
}

function toggleTask(taskId) {
    tasks = tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        const updatedTask = { ...task, completed: !task.completed };
        announce(`${updatedTask.title} marked as ${updatedTask.completed ? "completed" : "open"}.`);
        return updatedTask;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();

    if (taskToDelete) {
        announce(`Task deleted: ${taskToDelete.title}`);
    }
}
themeToggle.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    announce(`Switched to ${nextTheme} mode.`);
});

applyTheme(currentTheme);

function setFilter(nextFilter) {
    currentFilter = nextFilter;
    renderTasks();
    announce(`Showing ${nextFilter} tasks.`);
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(taskInput.value);
});

taskInput.addEventListener("input", () => {
    if (!formMessage.hidden) {
        setFormError("");
    }
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.dataset.filter === currentFilter) {
            return;
        }

        setFilter(button.dataset.filter);
    });
});

renderTasks();