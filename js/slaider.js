import * as THREE from './three.module.js';

// Данные фильмов
const moviesData = [
    {
        rating: "8.5",
        name: "Peaky Blinders: The Immortal Man",
        duration: "1h 52m",
        genres: ["Action", "Adventure", "Drama"],
        poster: "../img/pkb.avif"
    },
    {
        rating: "8.9",
        name: "Dune: Part Two",
        duration: "2h 46m",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        poster: "../img/dune2.jpg"
    },
    {
        rating: "9.2",
        name: "Oppenheimer",
        duration: "3h 1m",
        genres: ["Biography", "Drama", "History"],
        poster: "../img/Oppenheimer.jpg"
    },
    {
        rating: "8.7",
        name: "John Wick: Chapter 4",
        duration: "2h 49m",
        genres: ["Action", "Thriller"],
        poster: "../img/JohnWickChapter4.jpg"
    },
    {
        rating: "7.9",
        name: "The Batman",
        duration: "2h 56m",
        genres: ["Action", "Crime", "Drama"],
        poster: "../img/TheBatman.webp"
    }
];

// Настройки карусели
const CAROUSEL_CONFIG = {
    showPrevNext: true, 
    showDots: false,      // Скрыть точки-индикаторы
    gap: 550,
    autoplay: false,      // Автопрокрутка
    autoplayDelay: 3000   // Задержка между автопрокруткой (мс)
};

let currentIndex = 2;
let slides = [];
let warpInstances = [];
let isAnimating = false;
let autoplayInterval = null;

const sliderContainer = document.querySelector('.carousel-viewport');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

// Функция создания 3D геометрии с warp эффектом
function createWarpGeometry(width, height) {
    const segW = 60;
    const segH = 30;

    const positions = [];
    const uvs = [];
    const indices = [];

    const topY_Edge = 3;
    const topY_Center = 75;
    const bottomY_Edge = height - 8;
    const bottomY_Center = height - 70;

    for (let i = 0; i <= segH; i++) {
        const v = i / segH;

        for (let j = 0; j <= segW; j++) {
            const u = j / segW;
            const curveFactor = Math.cos((u - 0.5) * Math.PI);

            const currentTopY = topY_Edge + (topY_Center - topY_Edge) * curveFactor;
            const currentBottomY = bottomY_Edge + (bottomY_Center - bottomY_Edge) * curveFactor;
            const yPosSVG = currentBottomY + (currentTopY - currentBottomY) * v;
            const xPosSVG = u * width;

            const x3d = xPosSVG - width / 2;
            const y3d = -(yPosSVG - height / 2);

            positions.push(x3d, y3d, 0);
            uvs.push(u, v);
        }
    }

    for (let i = 0; i < segH; i++) {
        for (let j = 0; j < segW; j++) {
            const a = i * (segW + 1) + j;
            const b = i * (segW + 1) + j + 1;
            const c = (i + 1) * (segW + 1) + j;
            const d = (i + 1) * (segW + 1) + j + 1;
            indices.push(a, b, d, a, d, c);
        }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    return geom;
}

// Класс для управления 3D warp эффектом
class WarpEffect {
    constructor(container, imageUrl, width, height) {
        this.container = container;
        this.imageUrl = imageUrl;
        this.width = width;
        this.height = height;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.animationId = null;
    }

    init() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
            this.width / -2, this.width / 2,
            this.height / 2, this.height / -2,
            1, 1000
        );
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 0);

        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.classList.add('warp-canvas');

        this.loadTexture();
    }

    loadTexture() {
        const geometry = createWarpGeometry(this.width, this.height);
        const loader = new THREE.TextureLoader();

        loader.load(this.imageUrl,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });

                this.mesh = new THREE.Mesh(geometry, material);
                this.scene.add(this.mesh);
                this.animate();
            },
            undefined,
            (error) => {
                console.warn(`Не удалось загрузить ${this.imageUrl}:`, error);
            }
        );
    }

    animate() {
        const render = () => {
            this.animationId = requestAnimationFrame(render);
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        render();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        if (this.renderer) {
            this.renderer.setSize(width, height);
        }

        if (this.camera) {
            this.camera.left = width / -2;
            this.camera.right = width / 2;
            this.camera.top = height / 2;
            this.camera.bottom = height / -2;
            this.camera.updateProjectionMatrix();
        }

        if (this.mesh) {
            const oldMap = this.mesh.material.map;
            const newGeometry = createWarpGeometry(width, height);
            const newMaterial = new THREE.MeshBasicMaterial({ map: oldMap });

            this.scene.remove(this.mesh);
            if (this.mesh.material) this.mesh.material.dispose();
            if (this.mesh.geometry) this.mesh.geometry.dispose();

            this.mesh = new THREE.Mesh(newGeometry, newMaterial);
            this.scene.add(this.mesh);
        }
    }

    dispose() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
        if (this.mesh) {
            if (this.mesh.material) {
                if (this.mesh.material.map) this.mesh.material.map.dispose();
                this.mesh.material.dispose();
            }
            if (this.mesh.geometry) this.mesh.geometry.dispose();
        }
    }
}

// Получение класса слайда на основе разницы индексов
function getSlideClass(diff) {
    if (diff === 0) return 'activeSlaide';
    
    const totalSlides = moviesData.length;
    let normalized = diff;
    if (normalized > totalSlides / 2) normalized = normalized - totalSlides;
    if (normalized < -totalSlides / 2) normalized = normalized + totalSlides;
    
    if (normalized === 1) return 'right';
    if (normalized === -1) return 'left';
    return normalized > 0 ? 'far-right' : 'far-left';
}

// Создание слайдов
function createSlides() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    track.innerHTML = '';
    track.style.position = 'relative';
    track.style.display = 'flex';
    track.style.justifyContent = 'center';
    track.style.alignItems = 'center';
    track.style.width = '100%';
    track.style.height = '100%';
    
    slides = [];
    warpInstances = [];

    moviesData.forEach((movie, idx) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slaid1';
        slideDiv.style.position = 'absolute';
        slideDiv.style.transition = 'all 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        slideDiv.style.left = '50%';
        slideDiv.style.top = '50%';
        slideDiv.style.transformOrigin = 'center center';
        
        if (movie.poster) {
            slideDiv.style.backgroundImage = `url('${movie.poster}')`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundPosition = 'center';
        }

        const canvasContainer = document.createElement('div');
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.pointerEvents = 'none';
        canvasContainer.style.zIndex = '1';
        slideDiv.appendChild(canvasContainer);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'slide-content';
        contentDiv.innerHTML = `
            <div class="rating">
                <img src="icons/starRating.svg" alt="starRating">
                <div class="rating_var inter-Medium">${movie.rating}</div>
            </div>
            <div class="movie_name inter-Medium">${movie.name}</div>
            <div class="movie_duration inter-Medium">Duration: ${movie.duration}</div>
            <div class="genres inter-Medium">
                ${movie.genres.map(genre => `<span>${genre}</span>`).join('')}
            </div>
            <div class="cta">
                <button class="btn play inter-Bold">
                    <img src="icons/play.svg" alt="play">
                    <div class="text">Play Now</div>
                </button>
                <button class="btn trailer inter-Bold">
                    <div class="text">Trailer</div>
                </button>
            </div>
        `;
        slideDiv.appendChild(contentDiv);

        slideDiv.addEventListener('click', (e) => {
            if (e.target.closest('.play') || e.target.closest('.trailer')) return;
            if (!isAnimating && idx !== currentIndex) {
                goToSlide(idx);
            }
        });

        const playBtn = contentDiv.querySelector('.play');
        const trailerBtn = contentDiv.querySelector('.trailer');

        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert(`🎬 Воспроизведение: ${movie.name}`);
            });
        }

        if (trailerBtn) {
            trailerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert(`🎥 Трейлер: ${movie.name}`);
            });
        }

        track.appendChild(slideDiv);
        slides.push(slideDiv);
        
        const warp = new WarpEffect(canvasContainer, movie.poster, 1061, 537.88);
        warp.init();
        warpInstances.push(warp);
    });
    
    updateSlidesPosition();
}

// Обновление позиций всех слайдов
function updateSlidesPosition() {
    const centerX = 0;
    const centerY = 0;
    
    // Используем gap из настроек
    const gap = CAROUSEL_CONFIG.gap;
    const leftRightWidth = 1061;
    const offsetStep = leftRightWidth / 2 + gap;
    
    const positions = {
        activeSlaide: {
            width: 1119,
            height: 572,
            transform: `translate(-50%, -50%) translateX(${centerX}px) translateY(${centerY}px) scale(1)`,
            zIndex: 10,
            opacity: 1
        },
        left: {
            width: 1061,
            height: 537.88,
            transform: `translate(-50%, -50%) translateX(${-offsetStep}px) translateY(${centerY}px) scale(0.85)`,
            zIndex: 5,
            opacity: 0.8
        },
        right: {
            width: 1061,
            height: 537.88,
            transform: `translate(-50%, -50%) translateX(${offsetStep}px) translateY(${centerY}px) scale(0.85)`,
            zIndex: 5,
            opacity: 0.8
        },
        'far-left': {
            width: 1061,
            height: 537.88,
            transform: `translate(-50%, -50%) translateX(${-offsetStep * 2}px) translateY(${centerY}px) scale(0.7)`,
            zIndex: 1,
            opacity: 0.4
        },
        'far-right': {
            width: 1061,
            height: 537.88,
            transform: `translate(-50%, -50%) translateX(${offsetStep * 2}px) translateY(${centerY}px) scale(0.7)`,
            zIndex: 1,
            opacity: 0.4
        }
    };
    
    slides.forEach((slide, idx) => {
        const diff = idx - currentIndex;
        const className = getSlideClass(diff);
        const style = positions[className];
        
        if (style) {
            slide.style.width = `${style.width}px`;
            slide.style.height = `${style.height}px`;
            slide.style.transform = style.transform;
            slide.style.zIndex = style.zIndex;
            slide.style.opacity = style.opacity;
            
            slide.classList.remove('activeSlaide', 'left', 'right', 'far-left', 'far-right');
            slide.classList.add(className);
            
            if (warpInstances[idx]) {
                warpInstances[idx].resize(style.width, style.height);
            }
        }
    });
    
    // Обновляем индикаторы (если они видимы)
    if (CAROUSEL_CONFIG.showDots) {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active-dot');
            } else {
                dot.classList.remove('active-dot');
            }
        });
    }
}

// Создание индикаторов
function createIndicators() {
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    // Создаем индикаторы только если они нужны
    if (CAROUSEL_CONFIG.showDots) {
        moviesData.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === currentIndex) dot.classList.add('active-dot');
            dot.addEventListener('click', () => {
                if (!isAnimating && idx !== currentIndex) {
                    goToSlide(idx);
                }
            });
            indicatorsContainer.appendChild(dot);
        });
        indicatorsContainer.style.display = '';
    } else {
        indicatorsContainer.style.display = 'none';
    }
}

// Управление видимостью стрелок
function setupControlsVisibility() {
    if (!CAROUSEL_CONFIG.showPrevNext) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = '';
        if (nextBtn) nextBtn.style.display = '';
    }
}

// Автопрокрутка
function startAutoplay() {
    if (!CAROUSEL_CONFIG.autoplay) return;
    
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
    autoplayInterval = setInterval(() => {
        if (!isAnimating) {
            nextSlide();
        }
    }, CAROUSEL_CONFIG.autoplayDelay);
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

// Переход к слайду
function goToSlide(newIndex) {
    if (isAnimating) return;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= slides.length) newIndex = slides.length - 1;
    if (newIndex === currentIndex) return;

    isAnimating = true;
    currentIndex = newIndex;
    
    updateSlidesPosition();
    
    // При ручном переключении сбрасываем таймер автопрокрутки
    if (CAROUSEL_CONFIG.autoplay) {
        stopAutoplay();
        startAutoplay();
    }
    
    setTimeout(() => {
        isAnimating = false;
    }, 580);
}

function nextSlide() {
    if (isAnimating) return;
    let newIndex = currentIndex + 1;
    if (newIndex >= slides.length) newIndex = 0;
    goToSlide(newIndex);
}

function prevSlide() {
    if (isAnimating) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = slides.length - 1;
    goToSlide(newIndex);
}

// Инициализация
function init() {
    // Убеждаемся, что контейнер позиционирован правильно
    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) {
        viewport.style.position = 'relative';
        viewport.style.overflow = 'visible';
    }
    
    const track = document.getElementById('carouselTrack');
    if (track) {
        track.style.position = 'relative';
        track.style.width = '100%';
        track.style.height = '100%';
    }
    
    createSlides();
    createIndicators();
    setupControlsVisibility();
    
    // Назначаем обработчики только если кнопки существуют и должны быть видны
    if (prevBtn && CAROUSEL_CONFIG.showPrevNext) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn && CAROUSEL_CONFIG.showPrevNext) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // Запускаем автопрокрутку если нужно
    startAutoplay();
    
    // Останавливаем автопрокрутку при наведении на карусель
    if (CAROUSEL_CONFIG.autoplay && viewport) {
        viewport.addEventListener('mouseenter', stopAutoplay);
        viewport.addEventListener('mouseleave', startAutoplay);
    }
    
    // Свайпы для мобильных
    let touchStartX = 0;
    if (viewport) {
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            if (CAROUSEL_CONFIG.autoplay) stopAutoplay();
        });
        viewport.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const delta = touchEndX - touchStartX;
            if (Math.abs(delta) > 50 && !isAnimating) {
                if (delta > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
            if (CAROUSEL_CONFIG.autoplay) startAutoplay();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}