async function fetchFromAPI(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json', ...options.headers
        },
        ...options
    })
    
    if (!response.ok) {
        throw new Error(`Request failed to: ${endpoint}`);
    }

    if (response.status !== 204 && response.headers.get('Content-Type').includes('application/json')) {
        try {
            return await response.json();
        } catch(error) {
            throw new Error(`Failed to parse JSON from: ${endpoint}. Error: ${error}`);
        }
    }

    return null;
}

export const API = {
    // index.js API requests
    getEscapeRooms: () => fetchFromAPI('/escape-rooms'),
    initializeGame: (data) => fetchFromAPI('/game/initialize', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // index.js and congratulations.js API requests
    getLeaderboardOfRoom: (escapeRoom) => fetchFromAPI(`/leaderboard?escapeRoom=${escapeRoom}`),
   
    // congratulations.js API requests
    submitScoreToLeaderboard: () => fetchFromAPI('/leaderboard/submit-score', {
        method: 'POST'
    }),

    // index.js admin password
    checkAdminPassword: (password) => fetchFromAPI('/api/checkPassword', {
        method: 'POST',
        body: JSON.stringify({ password })
    }),

    // game.js API requests
    getIntroduction: () => fetchFromAPI('/game/introduction'),
    startGame: () => fetchFromAPI('/game/start', {
        method: 'POST'
    }),
    getQuestion: () => fetchFromAPI('/game/questions/current'),
    checkAnswer: (answer) => fetchFromAPI('/game/questions/answer', {
        method: 'POST',
        body: JSON.stringify(answer)
    }),
    getHint: () => fetchFromAPI('/game/hints/current'),
    getHintCount: () => fetchFromAPI('/game/hints/count'),
    getTime: () => fetchFromAPI('/game/time'),
    getAnswerLength: () => fetchFromAPI("/game/questions/answer-length")

}
