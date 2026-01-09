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
audio.preload = audio.preload || 'metadata';

audio.addEventListener('playing', () => vinylWrapper.classList.add('playing'));
audio.addEventListener('pause', () => vinylWrapper.classList.remove('playing'));

// Autoplay song2 on page load (attempt). If browser blocks autoplay this will fail silently.
window.addEventListener('load', () => {
    const autoFile = 'music/song2.mp3';
    const autoCover = 'song2.jpg';
    const autoItem = document.querySelector('.song-item[data-bg="song2.jpg"]');
    if (!autoItem) return;

    // mark active visually
    document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
    autoItem.classList.add('active');

    audio.dataset.current = autoFile;
    audio.src = autoFile;
    if (currentCover) currentCover.src = autoCover;
    audio.load();
    audio.play().catch(() => {
        // autoplay blocked by browser — show a small prompt so user can enable audio
        showPlayPrompt(autoFile, autoCover, autoItem);
    });
});

function playSong(file, element, coverUrl) {
    const items = document.querySelectorAll('.song-item');
    
    // Jika lagu yang sama diklik lagi, pause/play
    if (audio.dataset.current === file) {
        if (audio.paused) {
            audio.play().catch(() => {});
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
    // Ensure browser begins loading right away and attempt to play
    audio.load();
    audio.play().catch(() => {
        // play may fail if browser blocks — show prompt to let user start playback
        showPlayPrompt(file, coverUrl, element);
    });
}

function showPlayPrompt(file, coverUrl, element) {
    // avoid duplicate prompt
    if (document.getElementById('audio-unblock')) return;

    const overlay = document.createElement('div');
    overlay.id = 'audio-unblock';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.zIndex = '9999';

    const btn = document.createElement('button');
    btn.textContent = 'Click to enable audio';
    btn.style.padding = '14px 22px';
    btn.style.fontSize = '16px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.background = '#F90C88';
    btn.style.color = 'white';

    btn.addEventListener('click', () => {
        // try to play the requested file
        if (file) {
            audio.dataset.current = file;
            audio.src = file;
        }
        if (coverUrl && currentCover) currentCover.src = coverUrl;
        audio.load();
        audio.play().then(() => {
            // success
            overlay.remove();
            if (element) {
                document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
                element.classList.add('active');
            }
        }).catch(() => {
            // still blocked or failed — keep the prompt so user can try again
        });
    });

    overlay.appendChild(btn);
    document.body.appendChild(overlay);
}

// Tambahan: Kalau lagu habis, animasi berhenti
audio.onended = () => {
    vinylWrapper.classList.remove('playing');
};