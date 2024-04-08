import { API } from './API/api.js';

async function fetchAndRenderDropdownMenu() {
    try {
        const escapeRooms = await API.getEscapeRooms();
        escapeRooms.forEach(escapeRoom => {
            const option = document.createElement('option');
            option.value = escapeRoom;
            option.innerText = escapeRoom;
            const dropdownMenu = document.getElementById('allEscapeRooms');
            dropdownMenu.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert('Pakohuoneiden hakeminen epäonnistui. Ladataan sivu uudelleen.');
        window.location.reload();
    }
}

async function fetchAndUpdateLeaderboard(escapeRoom) {
    try {
        const leaderboardData = await API.getLeaderboardOfRoom(escapeRoom);
        const leaderboardContainer = document.querySelector(".leaderboard");
        const leaderboardTable = document.getElementById("leaderboardTable");
        const leaderboardTitle = document.getElementById("leaderboardTitle");
        leaderboardTable.innerHTML = '';

        if (leaderboardData.length === 0) {
            leaderboardContainer.style.display = 'none';
            return;
        }

        leaderboardContainer.style.display = '';
        leaderboardTitle.innerText = `🏆 Top 10: '${escapeRoom}' 🏆`;

        const rowsHtml = leaderboardData.map((entry, index) => `
            <tr>
                <td>${index + 1} </td>
                <td>${entry.playerName}</td>
                <td>${entry.time}</td>
        `).join('');
        leaderboardTable.innerHTML = rowsHtml;
    } catch (error) {
        console.error(`Could not render leaderboard for room ${escapeRoom}`, error);
    }
}

function validateInput (escapeRoom, playerName) {
    if (!escapeRoom || !playerName) {
        alert("Valitse ensin pakohuone ja kirjoita käyttäjänimi.");
        return false;
    }
    const nameValidationRegex = /^[A-Za-z0-9 ]+$/;
    if (!nameValidationRegex.test(playerName)) {
        alert("Käyttäjänimi saa sisältää vain kirjaimia, numeroita ja välilyöntejä.");
        document.getElementById("playerName").focus();
        return false;
    }
    return true;
}

async function initializeGame() {
    const escapeRoom = document.getElementById('allEscapeRooms').value;
    const playerName = document.getElementById('playerName').value;

    if (!validateInput(escapeRoom, playerName)) return;

    try {
        await API.initializeGame({ escapeRoom, playerName });
        window.location.href = '/maingamepage';
    } catch (error) {
        console.error(error);
        alert('Pelin aloittaminen epäonnistui. Yritä uudelleen.');
    }
}

function setupEventListeners() {
    const dropdownMenu = document.getElementById('allEscapeRooms');
    dropdownMenu.addEventListener('change', () => {
        const escapeRoom = dropdownMenu.value;
        fetchAndUpdateLeaderboard(escapeRoom);
    });

    const startGameButton = document.getElementById('startGameButton');
    startGameButton.addEventListener('click', initializeGame);
}


document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndRenderDropdownMenu();
    setupEventListeners();
});
