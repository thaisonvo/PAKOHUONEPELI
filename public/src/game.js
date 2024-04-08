// Fetch information about the selected escape room.
fetch(`/game/introduction`)
  .then((response) => response.json())
  .then((data) => updateContent(data))
  .catch((error) => {
    console.error(error);
    window.location.href = "/";
  });

// Event listener for the 'start game' button.
const startButton = document.getElementById("startGameButton");
startButton.addEventListener("click", async () => {
  try {
    await fetch("/game/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Fetch the first question of the escape room.
    const response = await fetch("/game/questions/current");
    const data = await response.json();

    // Update the content of the page.
    updateContent(data);
    document.querySelector(".buttons").style.display = "block";
    startButton.style.display = "none";

    updateHintIndicators();

    //Starts the timer check
    checkTime();

    if (!timerInterval) {
      setInterval(checkTime, 60000);
    }
  } catch (error) {
    console.error(error);
  }
});

// Event listener for handling answer submissions.
const submitAnswer = document.getElementById("checkTheCode");
submitAnswer.addEventListener("click", async () => {
  try {
    // Extract the inputted answer.
    const answer = document.getElementById("codeInput").value;
    // Send a request to the server with the inputted answer for validation.
    const response = await fetch("/game/questions/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    });
    const data = await response.json();

    if (data.finished) {
      window.location.href = `/congratulations/?escapeRoom=${data.escapeRoom}`;
      return;
    }

    if (!data.correct) {
      alert("Väärä vastaus! Yritä uudelleen.");
      document.getElementById("codeInput").value = "";
    } else {
      //If answer is right and there's problems left, hide codeInput and check+hint buttons -> Show continue -button
      document.getElementById("continueButton").style.display = "block";
      document.getElementById("codeInput").style.display = "none";
      document.getElementById("checkTheCode").style.display = "none";
      document.getElementById("vihje").style.display = "none";
      document.getElementById("minimizedHintBox").style.display = "none";
    }
  } catch (error) {
    console.error(error);
  }

  //The eventlistener for the continue-button
  const continueButton = document.getElementById("continueButton");
  continueButton.addEventListener("click", async () => {
    try {
      const nextQuestion = await fetch("/game/questions/current");
      const nextData = await nextQuestion.json();
      updateContent(nextData);

      document.getElementById("codeInput").style.display = "block";
      document.getElementById("checkTheCode").style.display = "inline-block";
      document.getElementById("vihje").style.display = "inline-block";
      document.getElementById("continueButton").style.display = "none";
      document.getElementById("codeInput").value = "";

      const hintButton = document.getElementById("vihje");
      hintButton.disabled = false;
      hintButton.style.backgroundColor = "";

      document.getElementById("minimizedHintBox").style.display = "none";
      document.getElementById("hintModal").style.display = "none";
      isHintModalOpen = false;

      updateHintIndicators();
    } catch (error) {
      console.error("Virhe ladattaessa seuraavaa kysymystä: ", error);
    }
  });
});

// Is hint-modal open
let isHintModalOpen = false;
// Event listener for showing a hint.
const showHint = document.getElementById("vihje");
showHint.addEventListener("click", async () => {
  if (!isHintModalOpen) {
    try {
      // Fetch a hint from the server.
      const response = await fetch("/game/hints/current", {
        method: "GET",
      });
      const data = await response.json();

      if (data.hint) {
        // Display the hint in the hint window.
        document.getElementById("modalHintText").innerText = data.hint;
        document.getElementById("hintModal").style.display = "block";

        updateHintIndicators();
        isHintModalOpen = true;

        showHint.disabled = true;
        showHint.style.backgroundColor = "grey";
      } else {
        alert("Vihjeen hankkimisessa tapahtui virhe.");
      }
    } catch (error) {
      console.error("Virhe hakiessa vihjettä: ", error);
    }
  }
});

// Event listener for minimizing the hint window.
const minimizeButton = document.querySelector(".minimize-button");
minimizeButton.addEventListener("click", () => {
  document.getElementById("hintModal").style.display = "none";
  document.getElementById("minimizedHintBox").style.display = "block";
});

document.getElementById("expandHint").addEventListener("click", () => {
  document.getElementById("hintModal").style.display = "block";
  document.getElementById("minimizedHintBox").style.display = "none";
});

async function updateHintIndicators() {
  try {
    // Optionally, fetch the latest hint count from the server, or maintain it in client state.
    const response = await fetch("/game/hints/count");
    const data = await response.json();
    const hintCount = data.hintsLeft;

    const hintIndicators = document.getElementById("hintIndicators");
    hintIndicators.innerHTML = ""; // Clear current indicators

    // Generate and display new indicators
    for (let i = 0; i < hintCount; i++) {
      let indicator = document.createElement("span");
      indicator.className = "hintIndicator";
      indicator.textContent = "★";
      hintIndicators.appendChild(indicator);
    }

    const hintButton = document.getElementById("vihje");
    if (hintCount === 0) {
      hintButton.disabled = true;
      hintButton.style.backgroundColor = "grey";
    } else {
      hintButton.disabled = false;
      hintButton.style.backgroundColor = "";
    }
  } catch (error) {
    console.error("Virhe päivittäessä vihjeindikaattoreita: ", error);
  }
}

async function requestHint(questionIndex) {
  if (!isHintModalOpen) {
    try {
      const response = await fetch(`/game/hints/${questionIndex}`);
      const data = await response.json();

      if (data.hint) {
        updateHintIndicators();
        isHintModalOpen = true;

        document.getElementById("modalHintText").innerText = data.hint;
        document.getElementById("hintModal").style.display = "block";
      } else {
        alert(data.hint);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

// Updates the title, description and video of the page.
function updateContent(data) {
  // Set the game title and instructions content from the data object
  document.getElementById("gameTitle").innerText = data.title;
  document.getElementById("instructionsContent").innerHTML = data.description;

  // Select the video container element
  const videoContainer = document.getElementById("escapeRoomVideo");

  // Check if a video URL is provided and if it's a valid HTTP URL
  if (data.video && isValidHttpUrl(data.video)) {
    // Parse the video URL to handle different YouTube link formats
    const videoUrl = new URL(data.video);
    let videoId;

    // Extract video ID for "youtu.be" short links
    if (videoUrl.host === "youtu.be") {
      videoId = videoUrl.pathname.substring(1);
    }
    // Extract video ID for standard "youtube.com" links
    else if (videoUrl.host.includes("youtube.com")) {
      videoId = videoUrl.searchParams.get("v");
    }

    // If a video ID was successfully extracted, configure the video container
    if (videoId) {
      videoContainer.src = `https://www.youtube.com/embed/${videoId}`;
      videoContainer.style.pointerEvents = "auto";
      videoContainer.style.background = "none";
      videoContainer.style.height = "99%";
    } else {
      // If no valid video ID is found, display a black box instead
      displayBlackBox(videoContainer);
    }
  } else {
    // If no video URL is provided or it's invalid, display a black box
    displayBlackBox(videoContainer);
  }
}

// Display a black box in place of the video container
function displayBlackBox(videoContainer) {
  videoContainer.src = "";
  videoContainer.style.pointerEvents = "none";
  videoContainer.style.background = "rgba(13, 17, 23, 0.8)";
  videoContainer.style.height = "99%";
}

// Check if the provided string is a valid HTTP or HTTPS URL
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string); // Attempt to create a URL object
  } catch (_) {
    return false; // Return false if the string is not a valid URL
  }

  // Check if the URL's protocol is either HTTP or HTTPS
  return url.protocol === "http:" || url.protocol === "https:";
}

let timerInterval;

//Function to check the remaining game time
function checkTime() {
  //Sends a GET request to the endpoint on the server
  fetch("/game/time")
    .then((response) => response.json())
    .then((data) => {
      //Checks is the timeIsUp -in the response true
      if (data.timeIsUp) {
        alert("Aikasi on päättynyt!");
        clearInterval(timerInterval);
      } else {
        startLocalCountdown(data.timeLeft);
      }
    })
    .catch((error) => console.error("Error checking time:", error));
}

//Calls the checkTime -function periodically in every minute
setInterval(checkTime, 60000); // 60 000 ms = 1min

function startLocalCountdown(timeLeftInSeconds) {
  clearInterval(timerInterval);
  const endTimestamp = Date.now() + timeLeftInSeconds * 1000;

  timerInterval = setInterval(() => {
    const secondsLeft = Math.round((endTimestamp - Date.now()) / 1000);
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timerDisplay").textContent = "00:00:00";
    } else {
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      document.getElementById("timerDisplay").textContent = `${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }, 1000);
}

const answerField = document.getElementById('codeInput');
const inputHint = document.getElementById('inputHint');
answerField.addEventListener('input', () => {
  const answerLength = answerField.value.length;
  const maxLength = 5;

  if (answerLength > maxLength) {
    console.log('adding show class to inputhint');
    inputHint.textContent = `Vastaus on ${maxLength} merkkiä pitkä`;
    inputHint.style.display = 'block';
  } else {
    inputHint.style.display = 'none';
  }
});
