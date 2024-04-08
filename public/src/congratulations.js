import { API } from './API/api.js';

function displayRanking(ranking) {
    if (!ranking) return;

    document.getElementById('ranking').textContent = `Sijoitut aikasi perusteella sijalle ${ranking}!`;
}

async function submitScoreAndGetRank() {
    try {
        const data = await API.submitScoreToLeaderboard();
        return data.rank;
    } catch (error) {
        console.error(`Error submitting score and fetching rank: ${error}`);
        return null;
    }
}

async function fetchLeaderboard() {
    const escapeRoom = new URLSearchParams(window.location.search).get('escapeRoom');
    if (!escapeRoom) {
        console.error('No escape room specified in URL query parameter');
        return [];
    }

    try {
        return await API.getLeaderboardOfRoom(escapeRoom);
    } catch (error) {
        console.error(`Error fetching leaderboard: ${error}`);
        return [];
    }
}

function displayLeaderboard(leaderboard) {
    if (!leaderboard || leaderboard.length === 0) return;

    const leaderboardTable = document.getElementById("leaderboardTable");

    const rowsHtml = leaderboard.map((entry, index) => `
        <tr>
            <td>${index + 1} </td>
            <td>${entry.playerName}</td>
            <td>${entry.time}</td>
        </tr>
    `).join('');

    leaderboardTable.innerHTML = rowsHtml;
}


document.addEventListener('DOMContentLoaded', async () => {
    const ranking = await submitScoreAndGetRank();
    displayRanking(ranking);

    const leaderboard = await fetchLeaderboard();
    displayLeaderboard(leaderboard);
});