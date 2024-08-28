// main.js
import { createHandLandmarker, enableCam } from './handlandmark.js';

const demosSection = document.getElementById("demos");
let handLandmarker = undefined;

// Initialize the hand landmarker
createHandLandmarker().then((landmarker) => {
    handLandmarker = landmarker;
    demosSection.classList.remove("invisible");
});

const imageContainers = document.getElementsByClassName("detectOnClick");

// Add click event listeners for images
for (let i = 0; i < imageContainers.length; i++) {
    imageContainers[i].children[0].addEventListener("click", (event) => handleClick(event, handLandmarker));
}

const enableWebcamButton = document.getElementById("webcamButton");
enableWebcamButton.addEventListener("click", () => enableCam(handLandmarker));
