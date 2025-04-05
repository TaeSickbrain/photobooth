let videoElement = document.getElementById('video');
let canvasElement = document.getElementById('canvas');
let countdownElement = document.getElementById('countdown');
let photoStripElement = document.getElementById('photoStrip');
let downloadBtn = document.getElementById('downloadBtn');
let currentFilter = 'none';
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
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

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
    let width = 640;
    let height = 480;

    finalCanvas.width = width;
    finalCanvas.height = height;

    let loadedImages = 0;

    capturedImages.forEach((src, index) => {
        let img = new Image();
        img.src = src;
        img.onload = () => {
            ctx.drawImage(img, 0, index * 480, width, 480);
            loadedImages++;
            if (loadedImages === 1) {
                let finalImage = finalCanvas.toDataURL('image/png');
                let finalImgElement = document.createElement('img');
                finalImgElement.src = finalImage;
                finalImgElement.style.width = '200px';
                photoStripElement.innerHTML = '';
                photoStripElement.appendChild(finalImgElement);
                downloadBtn.style.display = 'block';
            }
        };
    });
}