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

    if (response.headers.get('Content-Type').length !== 0) {
        try {
            return await response.json();
        } catch(error) {
            console.error(`Failed to parse JSON from: ${endpoint}`, error);
        }
    }

    return null;
}

export const API = {
    // For index.js API requests
    getEscapeRooms: () => fetchFromAPI('/escape-rooms'),
    initializeGame: (data) => fetchFromAPI('/game/initialize', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getLeaderboardOfRoom: (escapeRoom) => fetchFromAPI(`/leaderboard?escapeRoom=${escapeRoom}`),
}
