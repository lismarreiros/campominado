let desktop = document.querySelector('.desktop');
let windowTemplate = document.querySelector('#new-window');
let shortCutContainer = document.querySelector('.short-cuts');
let shortCuts = document.querySelector('.short-cut');
let startButton = document.querySelector('.start-button');
let startMenu = document.querySelector('.start-menu');
let taskBarItems = document.querySelector('.task-bar-items');
let taskBarItemTemplate = document.querySelector('#new-task-bar-item');
let clock = document.querySelector('clock');

shortCutContainer.addEventListener('mousedown', ({ target }) => {
    if (target !== shortCutContainer) return;

    deselectAll();
});

function deselectAllIcons() {
    for (let shortCut of shortCuts) {
        shortCut.classList.remove('selected');
    }
}

function deselectAllWindows() {
    windows.forEach(({ win, taskBarItem }) => {
        win.classList.remove('active');
        taskBarItem.classList.remove('active');
    });
}

function deselectAll() {
    deselectAllIcons();
    deselectAllWindows();
}

function openStartMenu() {
    deselectAll();
    startButton.classList.add('active');
    startMenu.classList.remove('hidden');

    onClickOutside = e => {
        if (!startMenu.contains(e.target)) {
            closeStartMenu();
        }
        window.removeEventListener('mousedown', onClickOutside);
    }

    setTimeout(() => window.addEventListener('mousedown', onClickOutside, { passive: true }), 1);
}

function closeStartMenu() {
    startButton.classList.remove('active');
    startMenu.classList.add('hidden');
}

startButton.addEventListener('mousedown', (e) => {
    if (startButton.classList.contains('active')) {
        closeStartMenu();
    } else {
        openStartMenu();
    }
});

function setClock() {
    let now = new Date();
    let hours24 = now.getHours();
    let hours12 = hours24 > 12 ? hours24 - 12 : hours24;
    clock.textContent = `${hours12}:${now.getMinutes()} ${hours24 >= 12 ? 'PM' : 'AM'}`;
}

setClock();
setInterval(setClock, 1000);
