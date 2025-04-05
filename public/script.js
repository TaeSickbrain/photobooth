let videoElement = document.getElementById('video'); 
let overlayElement = document.getElementById('overlay'); 
let canvasElement = document.getElementById('canvas');
let countdownElement = document.getElementById('countdown');
let photoStripElement = document.getElementById('photoStrip');
let downloadBtn = document.getElementById('downloadBtn');
let currentFilter = 'none';
let currentOverlay = 'none';
let captureCount = 0;
let capturedImages = [''];
let countdownDuration = 3;
let isCountingDown = false;

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
        })
        .catch(err => console.error('Error accessing webcam:', err));
}

function applyFilter(filter) {
    currentFilter = filter;
    videoElement.style.filter = currentFilter;
}

function applyOverlay(overlay) {
    currentOverlay = overlay;
    overlayElement.src = currentOverlay;
}

function startSession() {
    if (isCountingDown) return;
    captureCount = 0;
    capturedImages = [''];
    photoStripElement.innerHTML = '';
    downloadBtn.style.display = 'none';
    takePhotoWithCountdown();
}

function takePhotoWithCountdown() {
    if (captureCount >= 1) {
        isCountingDown = false;
        createPhotoStrip();
        return;
    }

    let countdownTime = countdownDuration;
    countdownElement.textContent = countdownTime;
    countdownElement.style.display = 'block';
    isCountingDown = true;

    let countdownInterval = setInterval(() => {
        countdownTime--;
        if (countdownTime > 0) {
            countdownElement.textContent = countdownTime;
        } else {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    let ctx = canvasElement.getContext('2d');
    ctx.filter = currentFilter;
    ctx.drawImage(videoElement, 0, 90, canvasElement.width, canvasElement.height - 180);
    ctx.drawImage(overlayElement, 0, 0, canvasElement.width, canvasElement.height);

    let imageData = canvasElement.toDataURL('image/png');
    capturedImages[captureCount] = imageData;

    updatePhotoStrip();

    captureCount++;

    if (captureCount < 1) {
        setTimeout(() => {
            takePhotoWithCountdown();
        }, 1000);
    } else {
        isCountingDown = false;
        createPhotoStrip();
    }
}
function downloadPhotoStrip() {
    let link = document.createElement('a');
    link.href = photoStripElement.firstChild.src;
    link.download = 'photo_booth_strip.png';
    link.click();
}
function updatePhotoStrip() {
    photoStripElement.innerHTML = '';

    for (let i = 0; i < 1; i++) {
        let imgElement = document.createElement('img');
        imgElement.id = 'result';
        imgElement.style.width = '150px';
        imgElement.style.border = '2px solid black';
        imgElement.style.borderRadius = '10px';

        if (capturedImages[i]) {
            imgElement.src = capturedImages[i];
        } else {
            imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAC…';
        }

        photoStripElement.appendChild(imgElement);
    }
}

function createPhotoStrip() {
    let finalCanvas = document.createElement('canvas');
    let ctx = finalCanvas.getContext('2d');
    let width = 960;
    let height = 720;

    finalCanvas.width = width;
    finalCanvas.height = height;

    let img = new Image();
    img.src = capturedImages[0];
    img.onload = () => {
        ctx.drawImage(img, 0, 0, width, 720);
        let finalImage = finalCanvas.toDataURL('image/png');
        const formData = new FormData()
        finalCanvas.toBlob((b) => {
            formData.append('photostrip', b, 'photostrip.png')
            fetch("/upload", {
                method: "POST",
                headers: {
                },
                body: formData
            })
        })
        let finalImgElement = document.createElement('img');
        finalImgElement.src = finalImage;
        finalImgElement.style.width = '200px';
        photoStripElement.innerHTML = '';
        photoStripElement.appendChild(finalImgElement);
        downloadBtn.style.display = 'block';
    };
}