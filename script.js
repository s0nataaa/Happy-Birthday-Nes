const track = document.getElementById('carouselTrack');
const itemsOriginal = document.querySelectorAll('.carousel-item');
const itemWidth = 330; // 300px + 15px + 15px
const totalItems = itemsOriginal.length;

// Clone items (tetap pakai logika lo karena udah bener buat loop)
itemsOriginal.forEach(item => {
    const clone = item.cloneNode(true);
    track.insertBefore(clone, track.firstChild);
});
itemsOriginal.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
});

const items = document.querySelectorAll('.carousel-item');
let currentIndex = totalItems; 

function updateCarouselVisuals() {
    items.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        if (index === currentIndex) {
            item.classList.add('active');
        } else if (index === currentIndex - 1) {
            item.classList.add('prev');
        } else if (index === currentIndex + 1) {
            item.classList.add('next');
        }
    });
    
    // RUMUS MATI: 
    // - (Index * Jarak) = memposisikan SISI KIRI foto di tengah layar.
    // - 150 = menarik foto ke kiri setengah lebarnya supaya TITIK TENGAHNYA pas di tengah layar.
    // - 15 = kompensasi margin kiri foto pertama.
    const moveX = -(currentIndex * itemWidth) - 165;
    
    // Kita pakai translate(X, -50%) karena Y-nya harus center vertikal
    track.style.transform = `translate(${moveX}px, -50%)`;
}

function updateCarousel() {
    currentIndex++;
    track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    updateCarouselVisuals();

    // Reset loop seamless tanpa jeda visual
    if (currentIndex >= totalItems * 2) {
        setTimeout(() => {
            // Disable transition untuk reset yang instant
            track.style.transition = 'none';
            
            // Juga disable transition di items sementara
            items.forEach(item => {
                item.style.transition = 'none';
            });
            
            currentIndex = totalItems;
            updateCarouselVisuals();
            
            // Delay sebentar buat browser re-paint, baru enable transition lagi
            setTimeout(() => {
                items.forEach(item => {
                    item.style.transition = 'all 0.8s ease-in-out';
                });
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 50);
        }, 800);
    }
}

// Jalankan pertama kali
updateCarouselVisuals();
setInterval(updateCarousel, 3000);


const audio = document.getElementById('main-audio');
const vinylWrapper = document.querySelector('.player-card');
const currentCover = document.getElementById('current-cover');

// track current file to avoid string-matching issues and improve toggling
audio.dataset.current = audio.dataset.current || '';

audio.addEventListener('playing', () => vinylWrapper.classList.add('playing'));
audio.addEventListener('pause', () => vinylWrapper.classList.remove('playing'));

// Create and show fullscreen overlay on page load
window.addEventListener('load', () => {
    const overlay = document.createElement('div');
    overlay.id = 'music-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';

    const button = document.createElement('button');
    button.textContent = 'Enable Music 🎵';
    button.style.padding = '16px 32px';
    button.style.fontSize = '20px';
    button.style.fontWeight = '600';
    button.style.borderRadius = '10px';
    button.style.border = 'none';
    button.style.background = '#F90C88';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';

    button.addEventListener('click', () => {
        // Set up audio directly on user interaction
        const autoFile = 'music/song2.mp3';
        const autoCover = 'song2.jpg';
        const autoItem = document.querySelector('.song-item[data-bg="song2.jpg"]');

        // Set audio properties
        audio.loop = true;
        audio.volume = 0.6;
        audio.dataset.current = autoFile;
        audio.src = autoFile;
        if (currentCover) currentCover.src = autoCover;

        // Mark song2 as active
        if (autoItem) {
            document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
            autoItem.classList.add('active');
        }

        // Load and play directly (no async, no setTimeout)
        audio.load();
        audio.play();

        // Remove overlay
        overlay.remove();
    });

    overlay.appendChild(button);
    document.body.appendChild(overlay);
});

function playSong(file, element, coverUrl) {
    const items = document.querySelectorAll('.song-item');
    
    // Jika lagu yang sama diklik lagi, pause/play
    if (audio.dataset.current === file) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        return;
    }

    // Ganti lagu baru
    items.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    audio.dataset.current = file;
    audio.src = file;
    if (currentCover) currentCover.src = coverUrl;
    audio.load();
    audio.play();
}

// Tambahan: Kalau lagu habis, animasi berhenti
audio.onended = () => {
    vinylWrapper.classList.remove('playing');
};
