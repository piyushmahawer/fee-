document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dynamic Greeting & Date ---
    const greetingElement = document.getElementById('greeting');
    const dateElement = document.getElementById('current-date');
    
    function updateHeader() {
        const now = new Date();
        const hour = now.getHours();
        
        // Update Greeting
        let greetingText = 'Good Evening';
        let emoji = '🌙';

        if (hour >= 5 && hour < 12) {
            greetingText = 'Good Morning';
            emoji = '🌤️';
        } else if (hour >= 12 && hour < 18) {
            greetingText = 'Good Afternoon';
            emoji = '☕';
        }

        greetingElement.textContent = `${greetingText}, Student! ${emoji}`;

        // Update Date
        const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
    
    function updateClock() {
        const timeElement = document.getElementById('current-time');
        const now = new Date();
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        
        // Also update the greeting and date continuously so they flip over automatically
        updateHeader();
    }
    
    updateClock();
    setInterval(updateClock, 1000);

    // --- Task Manager (Basic JavaScript & LocalStorage) ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // 1. Initialize tasks from LocalStorage (or use an empty array if none exist)
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem('semesterTasks')) || [
            { text: 'Read Chapter 3 of Economics', completed: false },
            { text: 'Organize study desk', completed: true }
        ];
    } catch (e) {
        tasks = [
            { text: 'Read Chapter 3 of Economics', completed: false },
            { text: 'Organize study desk', completed: true }
        ];
    }

    // 2. Save tasks to LocalStorage
    function saveTasks() {
        localStorage.setItem('semesterTasks', JSON.stringify(tasks));
    }

    // 3. Render tasks to the DOM
    function renderTasks() {
        taskList.innerHTML = ''; // Clear current list
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                    <span>${task.text}</span>
                </div>
                <button class="delete-btn" data-index="${index}" title="Delete Task">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;
            taskList.appendChild(li);
        });
    }

    // 4. Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text !== '') {
            tasks.push({ text: text, completed: false });
            saveTasks();
            renderTasks();
            taskInput.value = ''; // Clear input field
        } else {
            alert('Please enter a task description before adding!');
            taskInput.focus();
        }
    }

    // Event Listeners for adding tasks
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // 5. Handle Checkbox toggle and Delete button clicks (Event Delegation)
    taskList.addEventListener('click', (e) => {
        // Toggle complete
        if (e.target.classList.contains('task-checkbox')) {
            const index = e.target.getAttribute('data-index');
            tasks[index].completed = e.target.checked;
            saveTasks();
            renderTasks();
        } 
        // Delete task
        else if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const index = btn.getAttribute('data-index');
            tasks.splice(index, 1); // Remove from array
            saveTasks();
            renderTasks();
        }
    });

    // Initial render call to show tasks on load
    renderTasks();

    // --- Deadlines Manager (LocalStorage) ---
    const deadlineTitleInput = document.getElementById('deadline-title');
    const deadlineDateInput = document.getElementById('deadline-date');
    const addDeadlineBtn = document.getElementById('add-deadline-btn');
    const deadlinesList = document.getElementById('deadlines-list');

    let deadlines = [];
    try {
        deadlines = JSON.parse(localStorage.getItem('semesterDeadlines')) || [
            { id: 1, title: 'Math Assignment', date: '2023-11-15', completed: false },
            { id: 2, title: 'CS 101 Quiz', date: '2023-11-20', completed: false }
        ];
    } catch (e) {
        deadlines = [
            { id: 1, title: 'Math Assignment', date: '2023-11-15', completed: false },
            { id: 2, title: 'CS 101 Quiz', date: '2023-11-20', completed: false }
        ];
    }

    let editingDeadlineId = null;

    function saveDeadlines() {
        localStorage.setItem('semesterDeadlines', JSON.stringify(deadlines));
    }

    function formatDeadlineDate(dateString) {
        if (!dateString) return 'No Date Set';
        // Parse date as local time to avoid timezone shifts
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
        return dateString;
    }

    function renderDeadlines() {
        deadlinesList.innerHTML = '';
        
        // Sort by date (completed at the bottom)
        const sortedDeadlines = [...deadlines].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });

        sortedDeadlines.forEach((dl) => {
            const li = document.createElement('li');
            li.className = dl.completed ? 'completed' : '';
            
            li.innerHTML = `
                <div class="deadline-content">
                    <input type="checkbox" class="deadline-checkbox" data-id="${dl.id}" ${dl.completed ? 'checked' : ''}>
                    <div class="reminder-info">
                        <strong>${dl.title}</strong>
                        <span><i class="fa-regular fa-calendar"></i> ${formatDeadlineDate(dl.date)}</span>
                    </div>
                </div>
                <div class="deadline-actions">
                    <button class="edit-deadline-btn" data-id="${dl.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-deadline-btn" data-id="${dl.id}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            `;
            deadlinesList.appendChild(li);
        });
    }

    function addOrUpdateDeadline() {
        const title = deadlineTitleInput.value.trim();
        const date = deadlineDateInput.value;
        
        if (title !== '') {
            if (editingDeadlineId) {
                // Update existing
                const index = deadlines.findIndex(d => d.id === editingDeadlineId);
                if (index !== -1) {
                    deadlines[index].title = title;
                    deadlines[index].date = date;
                }
                editingDeadlineId = null;
                addDeadlineBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            } else {
                // Add new
                deadlines.push({
                    id: Date.now(),
                    title: title,
                    date: date,
                    completed: false
                });
            }
            saveDeadlines();
            renderDeadlines();
            deadlineTitleInput.value = '';
            deadlineDateInput.value = '';
        } else {
            alert('Please enter a deadline title before adding!');
            deadlineTitleInput.focus();
        }
    }

    addDeadlineBtn.addEventListener('click', addOrUpdateDeadline);
    
    deadlineTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addOrUpdateDeadline();
    });

    deadlinesList.addEventListener('click', (e) => {
        // Toggle complete
        if (e.target.classList.contains('deadline-checkbox')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const index = deadlines.findIndex(d => d.id === id);
            if (index !== -1) {
                deadlines[index].completed = e.target.checked;
                saveDeadlines();
                renderDeadlines();
            }
        } 
        // Edit deadline
        else if (e.target.closest('.edit-deadline-btn')) {
            const btn = e.target.closest('.edit-deadline-btn');
            const id = parseInt(btn.getAttribute('data-id'));
            const deadline = deadlines.find(d => d.id === id);
            
            if (deadline) {
                deadlineTitleInput.value = deadline.title;
                deadlineDateInput.value = deadline.date || '';
                editingDeadlineId = id;
                addDeadlineBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                deadlineTitleInput.focus();
            }
        }
        // Delete deadline
        else if (e.target.closest('.delete-deadline-btn')) {
            const btn = e.target.closest('.delete-deadline-btn');
            const id = parseInt(btn.getAttribute('data-id'));
            deadlines = deadlines.filter(d => d.id !== id);
            
            // If deleting the one currently being edited, reset the form
            if (editingDeadlineId === id) {
                editingDeadlineId = null;
                deadlineTitleInput.value = '';
                deadlineDateInput.value = '';
                addDeadlineBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            }
            
            saveDeadlines();
            renderDeadlines();
        }
    });

    // Initial render call
    renderDeadlines();


    // --- Quick Notes Section (Directory System) ---
    const notesArea = document.getElementById('notes-area');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const savedNotesList = document.getElementById('saved-notes-list');

    let notesDirectory = [];
    let currentNoteId = null;

    // Load from local storage, handling transition from previous string version
    try {
        const storedNotes = localStorage.getItem('semesterNotesDir');
        if (storedNotes) {
            notesDirectory = JSON.parse(storedNotes);
        } else {
            // Check for legacy single note
            const legacyNote = localStorage.getItem('semesterNotes');
            if (legacyNote && legacyNote.trim() !== '') {
                notesDirectory.push({
                    id: Date.now(),
                    title: legacyNote.split('\n')[0].substring(0, 20) || 'Imported Note',
                    content: legacyNote,
                    date: new Date().toLocaleDateString()
                });
                localStorage.removeItem('semesterNotes'); // Cleanup legacy
            }
        }
    } catch (e) {
        notesDirectory = [];
    }

    function saveNotesDirectory() {
        localStorage.setItem('semesterNotesDir', JSON.stringify(notesDirectory));
    }

    function renderNotesDirectory() {
        savedNotesList.innerHTML = '';
        notesDirectory.forEach(note => {
            const li = document.createElement('li');
            li.className = `saved-note-item ${note.id === currentNoteId ? 'active' : ''}`;
            li.innerHTML = `
                <div class="saved-note-title">${note.title || 'Untitled Note'}</div>
                <div class="saved-note-date">${note.date}</div>
            `;
            li.addEventListener('click', () => loadNote(note.id));
            savedNotesList.appendChild(li);
        });
    }

    function loadNote(id) {
        const note = notesDirectory.find(n => n.id === id);
        if (note) {
            currentNoteId = id;
            notesArea.value = note.content;
            renderNotesDirectory(); // Re-render to update the 'active' highlight class
        }
    }

    function createNewNote() {
        currentNoteId = null;
        notesArea.value = '';
        notesArea.focus();
        renderNotesDirectory(); // Clear active highlight
    }

    newNoteBtn.addEventListener('click', createNewNote);

    saveNoteBtn.addEventListener('click', () => {
        const content = notesArea.value.trim();
        if (content === '') return; // Don't save completely empty notes
        
        let title = content.split('\n')[0].substring(0, 20); // First line as title
        if (content.length > 20 && title.length === 20) title += '...';

        if (currentNoteId) {
            // Update existing note
            const noteIndex = notesDirectory.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                notesDirectory[noteIndex].content = content;
                notesDirectory[noteIndex].title = title;
                notesDirectory[noteIndex].date = new Date().toLocaleDateString();
            }
        } else {
            // Create brand new note
            const newNote = {
                id: Date.now(),
                title: title,
                content: content,
                date: new Date().toLocaleDateString()
            };
            notesDirectory.unshift(newNote); // Add to the top of the list
            currentNoteId = newNote.id;
        }

        saveNotesDirectory();
        renderNotesDirectory();
        
        // Provide user feedback that it saved
        const originalText = saveNoteBtn.textContent;
        saveNoteBtn.innerHTML = 'Saved! <i class="fa-solid fa-check"></i>';
        saveNoteBtn.style.backgroundColor = 'var(--pastel-green-dark)';
        saveNoteBtn.style.color = 'white';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveNoteBtn.textContent = originalText;
            saveNoteBtn.style.backgroundColor = '';
            saveNoteBtn.style.color = '';
        }, 2000);
    });

    // Initial render for notes
    renderNotesDirectory();
    if (notesDirectory.length > 0) {
        loadNote(notesDirectory[0].id); // Automatically load the most recent note
    }

});