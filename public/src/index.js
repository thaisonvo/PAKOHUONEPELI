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

async function isUsernameTaken(escapeRoom, playerName) {
    try {
        const leaderboardData = await API.getLeaderboardOfRoom(escapeRoom);
        return leaderboardData.some(entry => entry.playerName === playerName);
    } catch (error) {
        console.error(error);
        return false; 
    }
}

async function validateInput (escapeRoom, playerName) {
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

    const usernameTaken = await isUsernameTaken(escapeRoom, playerName);
    if (usernameTaken) {
        alert("Käyttäjänimi on jo käytössä. Valitse toinen käyttäjänimi.");
        document.getElementById("playerName").focus();
        return false;
    }
    return true;
}

async function initializeGame() {
    const escapeRoom = document.getElementById('allEscapeRooms').value;
    const playerName = document.getElementById('playerName').value;

    const isValidInput = await validateInput(escapeRoom, playerName);
    if (!isValidInput) return;

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

document.getElementById('adminButton').addEventListener('click', function() {
    document.getElementById('adminModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminModal').style.display = 'none';
});

document.getElementById('submitPassword').addEventListener('click', async function() {
    const password = document.getElementById('adminPassword').value;
    try {
        const result = await API.checkAdminPassword(password);
        if (result.success) {
            window.location.href = '/admin/page';
        } else {
            alert('Väärä salasana!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Salasanan tarkistus epäonnistui');
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('adminModal');
    if (event.target === modal) {
        document.getElementById('adminPassword').value = '';
        modal.style.display = "none";
    }
}
