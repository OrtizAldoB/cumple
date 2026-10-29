const heartsBg = document.querySelector('.hearts-bg');

function makeHeart() {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 18 + 12) + 'px';
    heart.style.color = Math.random() > 0.5 ? '#ff8fab' : '#ffd93d';
    heart.style.animationDuration = (Math.random() * 8 + 10) + 's';
    heart.style.animationDelay = (Math.random() * 8) + 's';
    heartsBg.appendChild(heart);
}

const colors = ['#ff8fab', '#ffd93d', '#a29bfe', '#74c0fc', '#63e6be', '#ffa94d'];

function makeConfetti() {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 4 + 4) + 's';
    piece.style.animationDelay = (Math.random() * 8) + 's';
    piece.style.width = (Math.random() * 6 + 5) + 'px';
    piece.style.height = (Math.random() * 8 + 8) + 'px';
    heartsBg.appendChild(piece);
}

for (let i = 0; i < 60; i++) {
    makeHeart();
}

for (let i = 0; i < 80; i++) {
    makeConfetti();
}

const intro = document.getElementById('intro');
const introVideo = document.getElementById('introVideo');
const introPlay = document.getElementById('introPlay');
const introTitle = document.getElementById('introTitle');
const burst = document.getElementById('burst');
const bgMusic = document.getElementById('bgMusic');

if (bgMusic) {
    try {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.loop = true;
    } catch (e) {}
}

document.body.classList.add('intro-abierto');

let introNoDisponible = Boolean(introVideo.error);

function mostrarOpcionContinuar() {
    introNoDisponible = true;
    introPlay.textContent = 'Continuar';
    introPlay.style.display = 'block';
}

introVideo.addEventListener('error', mostrarOpcionContinuar);

const playPromise = introVideo.play();
if (playPromise !== undefined) {
    playPromise.catch(() => {
        mostrarOpcionContinuar();
    });
}

introPlay.addEventListener('click', () => {
    if (introNoDisponible || introVideo.error) {
        terminarIntro();
        return;
    }

    introPlay.style.display = 'none';
    const retryPromise = introVideo.play();
    if (retryPromise !== undefined) {
        retryPromise.catch(mostrarOpcionContinuar);
    }
});

function explotar() {
    for (let i = 0; i < 90; i++) {
        const piece = document.createElement('span');
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 380 + 80;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty('--x', Math.cos(angle) * dist + 'px');
        piece.style.setProperty('--y', Math.sin(angle) * dist + 'px');
        piece.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
        piece.style.animationDelay = (Math.random() * 0.3) + 's';
        piece.style.animationDuration = (Math.random() * 0.8 + 0.9) + 's';
        burst.appendChild(piece);
        setTimeout(() => piece.remove(), 2500);
    }
}

function iniciarMusica() {
    if (!bgMusic) return;
    bgMusic.volume = 0.6;
    bgMusic.currentTime = 0;
    const p = bgMusic.play();
    if (p !== undefined) {
        p.catch(() => {});
    }
}

function detenerMusica() {
    if (!bgMusic) return;
    try {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    } catch (e) {}
}

function terminarIntro() {
    introVideo.style.display = 'none';
    introPlay.style.display = 'none';
    introTitle.classList.add('show');
    explotar();
    iniciarMusica();

    setTimeout(() => {
        intro.classList.add('oculto');
        document.body.classList.remove('intro-abierto');
        setTimeout(() => intro.remove(), 900);
    }, 3500);
}

introVideo.addEventListener('ended', terminarIntro);

const track = document.getElementById('carouselTrack');
const slides = Array.from(track.querySelectorAll('.slide'));
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let current = 0;
let autoSlideInterval = null;

const galleryVideos = slides.map(slide => slide.querySelector('video')).filter(Boolean);

galleryVideos.forEach(video => {
    video.addEventListener('play', () => {
        if (bgMusic) bgMusic.pause();
        galleryVideos.forEach(otherVideo => {
            if (otherVideo !== video) otherVideo.pause();
        });
    });

    video.addEventListener('ended', () => {
        if (!bgMusic || document.body.classList.contains('intro-abierto')) return;
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
    });
});

function pausarVideosFuera(indexActivo) {
    slides.forEach((slide, i) => {
        const vid = slide.querySelector('video');
        if (!vid) return;
        if (i !== indexActivo) {
            vid.pause();
        }
    });
}

function manejarVideoActivo(indexActivo) {
    if (!slides[indexActivo]) return;
    pausarVideosFuera(indexActivo);
    if (slides[indexActivo].querySelector('video')) detenerAutoSlide();
}

function detenerAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    dot.addEventListener('click', () => {
        detenerAutoSlide();
        goTo(i);
    });
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);

function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[current].offsetLeft, behavior: 'smooth' });
    updateDots();
    manejarVideoActivo(current);
}

prevBtn.addEventListener('click', () => {
    detenerAutoSlide();
    goTo(current - 1);
});
nextBtn.addEventListener('click', () => {
    detenerAutoSlide();
    goTo(current + 1);
});

track.addEventListener('scroll', () => {
    let nearest = 0;
    let min = Infinity;
    slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (dist < min) {
            min = dist;
            nearest = i;
        }
    });
    if (nearest !== current) {
        current = nearest;
        updateDots();
        manejarVideoActivo(current);
    }
});

updateDots();
pausarVideosFuera(current);

autoSlideInterval = setInterval(() => {
    goTo(current + 1);
}, 2800);
