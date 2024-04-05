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
    } catch(error) {
        console.error(error);
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

        leaderboardData.forEach((player, index) => {
            const row = document.createElement('tr');
            const rank = document.createElement('td');
            const name = document.createElement('td');
            const time = document.createElement('td');
            rank.innerText = `${index + 1}.`;
            name.innerText = player.playerName;
            time.innerText = player.time;
            row.appendChild(rank);
            row.appendChild(name);
            row.appendChild(time);
            leaderboardTable.appendChild(row);
        });
    } catch(error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await  fetchAndRenderDropdownMenu();

    const dropdownMenu = document.getElementById('allEscapeRooms');
    let escapeRoom;
    dropdownMenu.addEventListener('change', async () => {
        escapeRoom = dropdownMenu.value;
        await fetchAndUpdateLeaderboard(escapeRoom);
    });


    const startGameButton = document.getElementById("startGameButton");
    startGameButton.addEventListener("click", async () => {
        escapeRoom = dropdownMenu.value;
        const playerName = document.getElementById("playerName").value;

        if (!escapeRoom || !playerName) {
            alert("Valitse ensin pakohuone ja kirjoita käyttäjänimi.");
            return;
        }

        const nameValidationRegex = /^[A-Za-z0-9 ]+$/;
        if (!nameValidationRegex.test(playerName)) {
            alert("Käyttäjänimi saa sisältää vain kirjaimia, numeroita ja välilyöntejä.");
            document.getElementById("playerName").focus();
            return;
        }

        try {
            await API.initializeGame({ escapeRoom, playerName });
            window.location.href = '/maingamepage';
        } catch(error) {
            console.error(error);
            alert('Pelin aloittaminen epäonnistui. Yritä uudelleen.');
            return;
        }
    });
});
