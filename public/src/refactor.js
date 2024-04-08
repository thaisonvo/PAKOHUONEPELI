import { API } from './API/api.js';

async function initGame() {
    try {
        const introductionData = API.getIntroduction();
        updateContent(introductionData);
    } catch (error) {
        console.error(`Failed to fetch data for introduction and updating content: ${error}`);
        window.location.href = '/';
    }
}



