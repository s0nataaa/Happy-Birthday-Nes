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

// ==================== AUDIO SETUP ====================

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/s0nataaa/Happy-Birthday-Nes/main';

// Playlist configuration
const PLAYLIST = [
    {
        id: 'song1',
        title: 'I Just Couldn\'t Save You Tonight',
        artist: 'Ardhito Pramono',
        audioFile: `${GITHUB_RAW_URL}/music/song1.mp3`,
        coverImage: `${GITHUB_RAW_URL}/song1.jpg`,
        dataAttr: 'song1.jpg'
    },
    {
        id: 'song2',
        title: 'the way things go',
        artist: 'beabadoobee',
        audioFile: `${GITHUB_RAW_URL}/music/song2.mp3`,
        coverImage: `${GITHUB_RAW_URL}/song2.jpg`,
        dataAttr: 'song2.jpg'
    },
    {
        id: 'song3',
        title: 'Glue Song',
        artist: 'beabadoobee',
        audioFile: `${GITHUB_RAW_URL}/music/song3.mp3`,
        coverImage: `${GITHUB_RAW_URL}/song3.jpg`,
        dataAttr: 'song3.jpg'
    }
];

// ==================== AUDIO STATE ====================
// Global flag to track if audio has been unlocked by user interaction
let audioUnlocked = false;

const audio = document.getElementById('main-audio');
const vinylWrapper = document.querySelector('.player-card');
const currentCover = document.getElementById('current-cover');

// Track current song
audio.dataset.currentId = '';

audio.addEventListener('playing', () => vinylWrapper.classList.add('playing'));
audio.addEventListener('pause', () => vinylWrapper.classList.remove('playing'));

// ==================== OVERLAY & INITIAL UNLOCK ====================
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
        // UNLOCK AUDIO: Set the global flag to true
        // This must be done in the user interaction context
        audioUnlocked = true;

        // Now play default song (song2)
        playSongById('song2');

        // Remove overlay
        overlay.remove();
    });

    overlay.appendChild(button);
    document.body.appendChild(overlay);
});

// ==================== AUDIO CONTROL FUNCTIONS ====================

/**
 * Safely play audio only if it has been unlocked
 * @returns {Promise} - The play() promise if unlocked, otherwise null
 */
function safePlay() {
    if (!audioUnlocked) {
        console.warn('⚠️ Audio not yet unlocked by user interaction. Click "Enable Music" first.');
        return null;
    }
    console.log(`▶️ Attempting to play: ${audio.dataset.currentId}`);
    return audio.play().catch(err => {
        console.error('❌ Failed to play audio:', err);
    });
}

/**
 * Play a song by ID from the PLAYLIST array
 * Only attempts to play if audio is already unlocked
 * @param {string} songId - The song ID (e.g., 'song1', 'song2', 'song3')
 * @param {HTMLElement} [element] - Optional DOM element to mark as active
 */
function playSongById(songId, element) {
    const song = PLAYLIST.find(s => s.id === songId);
    if (!song) {
        console.warn(`Song with ID "${songId}" not found in playlist`);
        return;
    }

    // If same song is clicked again, toggle pause/play
    if (audio.dataset.currentId === songId) {
        if (audio.paused) {
            safePlay();
        } else {
            audio.pause();
        }
        return;
    }

    // Mark element as active if provided
    if (element) {
        document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }

    // Update audio source and properties
    audio.dataset.currentId = songId;
    audio.src = song.audioFile;
    audio.loop = true;
    audio.volume = 0.6;
    
    if (currentCover) currentCover.src = song.coverImage;

    // Load and attempt to play (respects audioUnlocked flag)
    audio.load();
    safePlay();
}

/**
 * Wrapper function for HTML onclick (passes 'this' as the element)
 * Used in HTML: onclick="playSongByElement('song1', this)"
 */
function playSongByElement(songId, element) {
    console.log(`🎵 Song click detected: ${songId}, audioUnlocked: ${audioUnlocked}`);
    playSongById(songId, element);
}

/**
 * BACKWARD COMPATIBILITY: Legacy function name
 * If HTML uses old format: onclick="playSong('music/song1.mp3', this, 'song1.jpg')"
 * This will map it to the new playSongById() system
 */
function playSong(url, element, coverUrl) {
    // Find song by URL or assume legacy format
    if (url.includes('song1')) {
        playSongByElement('song1', element);
    } else if (url.includes('song2')) {
        playSongByElement('song2', element);
    } else if (url.includes('song3')) {
        playSongByElement('song3', element);
    } else {
        console.warn(`❌ Could not identify song from URL: ${url}`);
    }
}

// Expose all functions to global window object (for HTML onclick)
window.playSongByElement = playSongByElement;
window.playSong = playSong;
window.safePlay = safePlay;
window.playSongById = playSongById;

// Handle end of song
audio.onended = () => {
    vinylWrapper.classList.remove('playing');
};

// Debug info
console.log('✅ Audio player script loaded');
console.log(`📋 Playlist items: ${PLAYLIST.length}`);
console.log(`🔊 Audio element found: ${!!audio}`);
console.log(`🎨 Vinyl wrapper found: ${!!vinylWrapper}`);
