import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let webcamRunning = false; // Define webcamRunning at a higher scope so it's accessible in both functions

export async function createHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    return await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
}

export async function enableCam(handLandmarker) {
    const video = document.getElementById("webcam");
    const canvasElement = document.getElementById("output_canvas");
    const canvasCtx = canvasElement.getContext("2d");
    const enableWebcamButton = document.getElementById("webcamButton"); // Define the button here

    if (!handLandmarker) {
        console.log("Wait! HandLandmarker not loaded yet.");
        return;
    }

    if (webcamRunning) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }

    const constraints = {
        video: true
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.addEventListener("loadeddata", () => predictWebcam(handLandmarker, video, canvasElement, canvasCtx));
}

async function predictWebcam(handLandmarker, video, canvasElement, canvasCtx) {
    canvasElement.style.width = `${video.videoWidth}px`;
    canvasElement.style.height = `${video.videoHeight}px`;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    if (handLandmarker.runningMode === "IMAGE") {
        handLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    let lastVideoTime = -1;
    const startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const results = await handLandmarker.detectForVideo(video, startTimeMs);

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 5
                });
                drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
            }
        }
        canvasCtx.restore();
    }

    if (webcamRunning) {
        window.requestAnimationFrame(() => predictWebcam(handLandmarker, video, canvasElement, canvasCtx));
    }
}
