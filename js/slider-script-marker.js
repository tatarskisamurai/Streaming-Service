// slider-script-marker
const DEFAULT_SLIDES = [
    {
        rating: "8.5",
        name: "Peaky Blinders: The Immortal Man",
        duration: "1h 52m",
        genres: ["Action", "Adventure", "Drama"],
        poster: "../img/slider-card-1775312159233.png",
        className: "shelby"
    },
    {
        rating: "8.9",
        name: "Dune: Part Two",
        duration: "2h 46m",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        poster: "../img/dune2.jpg",
        className: "dune"
    },
    {
        rating: "9.2",
        name: "Oppenheimer",
        duration: "3h 1m",
        genres: ["Biography", "Drama", "History"],
        poster: "../img/Oppenheimer.png",
        className: "oppenheimer"
    },
    {
        rating: "8.7",
        name: "John Wick: Chapter 4",
        duration: "2h 49m",
        genres: ["Action", "Thriller"],
        poster: "../img/JohnWickChapter4.png",
        className: "johnwick"
    },
    {
        rating: "7.9",
        name: "The Batman",
        duration: "2h 56m",
        genres: ["Action", "Crime", "Drama"],
        poster: "../img/TheBatman.webp",
        className: "batman"
    }
];

function generateSlides() {
    const track = document.querySelector('.carousel .track');
    if (!track) return;
    
    track.innerHTML = '';
    
    DEFAULT_SLIDES.forEach((movie) => {
        const slide = document.createElement('div');
        slide.className = `slide ${movie.className}`;
        
        // Устанавливаем фоновую картинку через style
        slide.style.backgroundImage = `url('${movie.poster}')`;
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
        slide.style.backgroundRepeat = 'no-repeat';
        
        // Контент без лишних обёрток, которые ломают aspect-ratio
        slide.innerHTML = `
            <div class="slide-content">
                <div class="rating">
                    <img src="icons/starRating.svg" alt="starRating">
                    <div class="rating_var inter-Medium">${movie.rating}</div>
                </div>
                <div class="movie_name inter-Medium">${movie.name}</div>
                <div class="movie_duration inter-Medium">Duration: ${movie.duration}</div>
                <div class="genres inter-Medium">
                    ${movie.genres.map((genre) => `<span>${genre}</span>`).join("")}
                </div>
                <div class="cta">
                    <button class="btn play inter-Bold" type="button">
                        <img src="icons/play.svg" alt="play">
                        <div class="text">Play Now</div>
                    </button>
                    <button class="btn trailer inter-Bold" type="button">
                        <div class="text">Trailer</div>
                    </button>
                </div>
            </div>
        `;
        
        track.appendChild(slide);
    });
}

document.addEventListener('DOMContentLoaded', generateSlides);