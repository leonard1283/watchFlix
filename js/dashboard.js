// dashboard.js - FIXED version with working filters
let user = sessionStorage.getItem("loginUser");
let movies = [];
let filteredMovies = [];
let currentPage = 1;
const moviesPerPage = 20;

// TMDB Configuration
const TMDB_API_KEY = '22dda02fb771e4cc0024479039a20db0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const STORAGE_KEY = 'movies';

// DOM Elements
let searchInput, genreFilter, sortBy, movieGrid, pagination;
let movieCount, currentFilters, clearFiltersBtn, filterStats;

// Filter state
let currentFiltersState = {
    searchText: '',
    genre: '',
    sortBy: ''
};

// TMDB Genre Map
const TMDB_GENRES = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard initializing...");
    initializeDashboard();
});

async function initializeDashboard() {
    console.log("Initializing dashboard...");
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Show loading message
    if (movieGrid) {
        movieGrid.innerHTML = `<div style="text-align:center;padding:40px;color:#ccc;">Loading movies...</div>`;
    }
    
    // Load movies from localStorage or fetch from TMDB
    await loadMovies();
    
    if (movies.length === 0) {
        console.error("No movies available to display");
        showNoMoviesMessage();
        return;
    }
    
    console.log("Setting up dashboard with", movies.length, "movies");
    
    // Initialize filter dropdowns
    populateGenreFilter();
    setupEventListeners();
    
    // Apply initial filters and display
    applyFilters();
    loadMoviesToGrid();
    premAcc();
    
    
}

// Initialize DOM elements - FIXED
function initializeDOMElements() {
    searchInput = document.getElementById("searchInput");
    genreFilter = document.getElementById("genreFilter");
    sortBy = document.getElementById("sortBy");
    movieGrid = document.getElementById("movieGrid");
    pagination = document.getElementById("pagination");
    movieCount = document.getElementById("movieCount");
    currentFilters = document.getElementById("currentFilters");
    clearFiltersBtn = document.getElementById("clearFilters");
    filterStats = document.getElementById("filterStats");
    
    console.log("DOM Elements initialized:", {
        searchInput: !!searchInput,
        genreFilter: !!genreFilter,
        sortBy: !!sortBy,
        movieGrid: !!movieGrid
    });
}

async function loadMovies() {
    console.log("Loading movies...");
    
    // Try to get from localStorage
    const storedMovies = localStorage.getItem(STORAGE_KEY);
    
    if (storedMovies) {
        try {
            movies = JSON.parse(storedMovies);
            console.log(`Loaded ${movies.length} movies from localStorage`);
        } catch (e) {
            console.error("Error parsing localStorage movies:", e);
            await fetchMoviesFromTMDB();
        }
    } else {
        console.log("No movies in localStorage, fetching from TMDB...");
        await fetchMoviesFromTMDB();
    }
}

async function fetchMoviesFromTMDB() {
    console.log("Fetching movies from TMDB API...");
    
    try {
        // Calculate how many pages we need for 50 movies (20 per page)
        // Movies Needed
        // Leonard Dagwayan
        const totalMoviesNeeded = 500;
        const pagesNeeded = Math.ceil(totalMoviesNeeded / moviesPerPage);
        
        // Fetch required pages
        const pagePromises = [];
        for (let page = 1; page <= pagesNeeded; page++) {
            pagePromises.push(
                fetch(
                    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
                ).then(response => {
                    if (!response.ok) {
                        throw new Error(`TMDB API error: ${response.status}`);
                    }
                    return response.json();
                })
            );
        }
        
        // Wait for all pages
        const pagesData = await Promise.all(pagePromises);
        
        // Combine all movies
        let allMovies = [];
        pagesData.forEach(pageData => {
            if (pageData.results) {
                allMovies = [...allMovies, ...pageData.results];
            }
        });
        
        // Take exactly 50 movies
        // Leonard Dagwayan
        const selectedMovies = allMovies.slice(0, 500);
        
        // Format movie data
        movies = selectedMovies.map(movie => formatMovieData(movie));
        
        // Store in localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
        console.log(`Successfully fetched and stored ${movies.length} movies from TMDB`);
        
    } catch (error) {
        console.error("Error fetching movies from TMDB:", error);
        showErrorMessage("Error fetching movies from TMDB API");
    }
}

function formatMovieData(movie) {
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'img/placeholder.jpg';
    
    return {
        id: movie.id,
        title: movie.title || 'Untitled',
        original_title: movie.original_title || 'Untitled',
        overview: movie.overview || 'No description available.',
        release_date: movie.release_date || 'Unknown',
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        popularity: movie.popularity || 0,
        poster_path: posterPath,
        backdrop_path: movie.backdrop_path || '',
        genre_ids: movie.genre_ids || [],
        genre_names: getGenreNames(movie.genre_ids || []),
        adult: movie.adult || false,
        original_language: movie.original_language || 'en',
        video: movie.video || false,
        fetched_at: new Date().toISOString()
    };
}

function getGenreNames(genreIds) {
    if (!genreIds || !Array.isArray(genreIds)) return '';
    return genreIds
        .map(id => TMDB_GENRES[id])
        .filter(name => name)
        .join(', ');
}

function populateGenreFilter() {
    if (!genreFilter) {
        console.error("genreFilter element not found");
        return;
    }
    
    // Collect all unique genres from movies
    const allGenres = new Set();
    movies.forEach(movie => {
        if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
            movie.genre_ids.forEach(genreId => {
                allGenres.add(genreId);
            });
        }
    });
    
    // Clear existing options except the first one
    while (genreFilter.options.length > 1) {
        genreFilter.remove(1);
    }
    
    // Convert to array and sort by genre name
    const sortedGenres = Array.from(allGenres)
        .filter(id => TMDB_GENRES[id])
        .sort((a, b) => TMDB_GENRES[a].localeCompare(TMDB_GENRES[b]));
    
    // Add option for each genre
    sortedGenres.forEach(genreId => {
        const option = document.createElement('option');
        option.value = genreId;
        option.textContent = TMDB_GENRES[genreId];
        genreFilter.appendChild(option);
    });
    
    console.log("Populated genre filter with", sortedGenres.length, "genres");
}

function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        console.log("Search input listener added");
    }
    
    // Genre filter
    if (genreFilter) {
        genreFilter.addEventListener('change', handleGenreChange);
        console.log("Genre filter listener added");
    }
    
    // Sort by
    if (sortBy) {
        sortBy.addEventListener('change', handleSortChange);
        console.log("Sort by listener added");
    }
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        console.log("Clear filters listener added");
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch() {
    console.log("Search input changed:", searchInput.value);
    currentFiltersState.searchText = searchInput.value.toLowerCase().trim();
    applyFilters();
}

function handleGenreChange() {
    console.log("Genre filter changed:", genreFilter.value);
    currentFiltersState.genre = genreFilter.value;
    applyFilters();
}

function handleSortChange() {
    console.log("Sort by changed:", sortBy.value);
    currentFiltersState.sortBy = sortBy.value;
    applyFilters();
}

// FIXED FILTERING FUNCTION
function applyFilters() {
    console.log("Applying filters with state:", currentFiltersState);
    
    // Start with all movies
    filteredMovies = [...movies];
    
    // Apply search filter
    if (currentFiltersState.searchText) {
        filteredMovies = filteredMovies.filter(m => {
            const searchLower = currentFiltersState.searchText.toLowerCase();
            return (
                (m.title && m.title.toLowerCase().includes(searchLower)) ||
                (m.original_title && m.original_title.toLowerCase().includes(searchLower)) ||
                (m.overview && m.overview.toLowerCase().includes(searchLower))
            );
        });
        console.log(`After search filter: ${filteredMovies.length} movies`);
    }
    
    // Apply genre filter - FIXED: Check if array contains the genre
    if (currentFiltersState.genre) {
        const genreId = parseInt(currentFiltersState.genre);
        filteredMovies = filteredMovies.filter(m => {
            if (!m.genre_ids || !Array.isArray(m.genre_ids)) return false;
            return m.genre_ids.includes(genreId);
        });
        console.log(`After genre filter: ${filteredMovies.length} movies`);
    }
    
    // Apply sorting
    if (currentFiltersState.sortBy) {
        console.log("Sorting by:", currentFiltersState.sortBy);
        filteredMovies.sort((a, b) => {
            switch(currentFiltersState.sortBy) {
                case 'title_asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'title_desc':
                    return (b.title || '').localeCompare(a.title || '');
                case 'rating_desc':
                    return (b.vote_average || 0) - (a.vote_average || 0);
                case 'rating_asc':
                    return (a.vote_average || 0) - (b.vote_average || 0);
                case 'year_desc':
                    return (b.release_date || '').localeCompare(a.release_date || '');
                case 'year_asc':
                    return (a.release_date || '').localeCompare(b.release_date || '');
                case 'popularity_desc':
                    return (b.popularity || 0) - (a.popularity || 0);
                default:
                    return 0;
            }
        });
    }
    
    console.log("Total filtered movies:", filteredMovies.length);
    
    // Update filter stats
    updateFilterStats();
    
    // Reset to first page and display
    currentPage = 1;
    loadMoviesToGrid();
}

function updateFilterStats() {
    const hasActiveFilters = currentFiltersState.searchText || currentFiltersState.genre || currentFiltersState.sortBy;
    
    if (hasActiveFilters && filterStats) {
        filterStats.style.display = 'block';
        
        // Update movie count
        if (movieCount) {
            movieCount.textContent = `Showing ${filteredMovies.length} of ${movies.length} movies`;
        }
        
        // Update active filters display
        if (currentFilters) {
            const activeFilters = [];
            if (currentFiltersState.searchText) {
                activeFilters.push(`Search: "${currentFiltersState.searchText}"`);
            }
            if (currentFiltersState.genre) {
                const genreName = TMDB_GENRES[currentFiltersState.genre] || currentFiltersState.genre;
                activeFilters.push(`Genre: ${genreName}`);
            }
            if (currentFiltersState.sortBy) {
                const sortText = {
                    'title_asc': 'Title (A-Z)',
                    'title_desc': 'Title (Z-A)',
                    'rating_desc': 'Rating (High to Low)',
                    'rating_asc': 'Rating (Low to High)',
                    'year_desc': 'Year (Newest)',
                    'year_asc': 'Year (Oldest)',
                    'popularity_desc': 'Popularity'
                }[currentFiltersState.sortBy] || currentFiltersState.sortBy;
                activeFilters.push(`Sorted by: ${sortText}`);
            }
            
            currentFilters.textContent = activeFilters.join(' • ');
        }
    } else if (filterStats) {
        filterStats.style.display = 'none';
    }
}

function clearAllFilters() {
    console.log("Clearing all filters");
    
    if (searchInput) searchInput.value = '';
    if (genreFilter) genreFilter.value = '';
    if (sortBy) sortBy.value = '';
    
    currentFiltersState = {
        searchText: '',
        genre: '',
        sortBy: ''
    };
    
    applyFilters();
}

function loadMoviesToGrid() {
    if (!movieGrid) {
        console.error("movieGrid element not found");
        return;
    }
    
    const activeMovies = filteredMovies.length > 0 ? filteredMovies : movies;
    const totalPages = Math.ceil(activeMovies.length / moviesPerPage);
    
    // Clamp current page to valid range
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    const start = (currentPage - 1) * moviesPerPage;
    const end = Math.min(start + moviesPerPage, activeMovies.length);
    const pageMovies = activeMovies.slice(start, end);
    
    // Clear previous content
    movieGrid.innerHTML = "";
    
    if (pagination) {
        pagination.innerHTML = "";
    }
    
    if (pageMovies.length === 0) {
        movieGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>No movies found matching your filters.</p>
                <button onclick="clearAllFilters()" style="margin-top: 10px; padding: 8px 20px; background: #2ECC71; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }
    
    // Render movie cards
    pageMovies.forEach(movie => {
        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const posterUrl = movie.poster_path || 'img/placeholder.jpg';
        const title = movie.title || movie.original_title || 'Untitled Movie';
        
        movieGrid.innerHTML += `
            <div class="anime-card" data-movie-id="${movie.id}" data-plans="Basic, Standard, Premium">
                <img src="${posterUrl}" alt="${title}" loading="lazy" onerror="this.src='img/placeholder.jpg'">
                <div class="card-overlay">
                    <div class="card-badges">
                        <span class="badge badge-tv">${year}</span>
                        <span class="badge badge-sub">⭐ ${rating}</span>
                        ${movie.adult ? '<span class="badge badge-dub">18+</span>' : ''}
                    </div>
                    <div class="card-info">
                        <div class="anime-title" title="${title}">
                            ${title}
                        </div>
                        <div class="play-btn">▶</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Render pagination if needed
    if (totalPages > 1 && pagination) {
        renderPagination(totalPages, activeMovies.length, start, end);
    }
    
    setupMovieCardListeners();
    setupHoverTrailer();
    console.log("Displayed", pageMovies.length, "movies on page", currentPage);
}

function renderPagination(totalPages, totalMovies, start, end) {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(startPage + maxVisible - 1, totalPages);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // Previous button
    pagination.innerHTML += `
        <button class="btnPag btnPN" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
            ← Prev
        </button>
    `;
    
    // First page button (if not in visible range)
    if (startPage > 1) {
        pagination.innerHTML += `
            <button class="btnPag" onclick="changePage(1)">
                1
            </button>
            ${startPage > 2 ? '<span style="color:#ccc; margin:0 5px;">...</span>' : ''}
        `;
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pagination.innerHTML += `
            <button class="btnPag" onclick="changePage(${i})"
                ${isActive ? 'style="background:#814c09cf;color:white;transform:scale(1.1);"' : ""}>
                ${i}
            </button>
        `;
    }
    
    // Last page button (if not in visible range)
    if (endPage < totalPages) {
        pagination.innerHTML += `
            ${endPage < totalPages - 1 ? '<span style="color:#ccc; margin:0 5px;">...</span>' : ''}
            <button class="btnPag" onclick="changePage(${totalPages})">
                ${totalPages}
            </button>
        `;
    }
    
    // Next button
    pagination.innerHTML += `
        <button class="btnPag btnPN" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
            Next →
        </button>
    `;
    
    // Page info
    pagination.innerHTML += `
        <div style="margin-top:10px;color:#ccc;font-size:0.9rem;">
            Showing ${start + 1}-${end} of ${totalMovies} movies
        </div>
    `;
}

function changePage(page) {
    const activeMovies = filteredMovies.length > 0 ? filteredMovies : movies;
    const totalPages = Math.ceil(activeMovies.length / moviesPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    loadMoviesToGrid();
    
    // Smooth scroll to top of grid
    if (movieGrid) {
        movieGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Rest of your existing functions...
function showNoMoviesMessage() {
    if (!movieGrid) return;
    
    movieGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p>No movies available. Please check your connection and refresh.</p>
        </div>
    `;
}

function showErrorMessage(message) {
    if (!movieGrid) return;
    
    movieGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p style="color: #ff6b6b;">${message}</p>
            <button onclick="refreshMovies()" style="margin-top: 10px; padding: 10px 25px; background: #2ECC71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Try Again
            </button>
        </div>
    `;
}

async function fetchTMDBTrailer(movieId) {
    const cacheKey = `tmdb_trailer_${movieId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();

        const trailer = data.results?.find(v =>
            v.site === "YouTube" && v.type === "Trailer"
        );

        if (trailer) {
            localStorage.setItem(cacheKey, JSON.stringify(trailer));
            return trailer;
        }
    } catch (err) {
        console.error("TMDB trailer fetch failed", err);
    }

    return null;
}



async function refreshMovies() {
    console.log("Refreshing movies...");
    if (movieGrid) {
        movieGrid.innerHTML = `<div style="text-align:center;padding:40px;color:#ccc;">Refreshing movies...</div>`;
    }
    
    await fetchMoviesFromTMDB();
    
    if (movies.length > 0) {
        populateGenreFilter();
        applyFilters();
        loadMoviesToGrid();
    }
}

function retryFetch() {
    refreshMovies();
}

// Your other existing functions...
function btnLogout() {
    sessionStorage.clear();
    location.href = "/index.html";
}

// Redirect to payment page
function toPayment() {
    const logUser = JSON.parse(sessionStorage.getItem("loginUser"));
    const userData = JSON.parse(localStorage.getItem("users")) || [];
    
    const user = userData.find(u => u.Email === logUser.Email);
   
    //check if users email is verified
    if (user && user.EmailStatus === "Verified") {
        location.href = "/payment/plan.html";
    } else {
        location.href = "/emailVerification/otpEmailInput.html";
    }
}

function premAcc() {
    if (!user) return;
    
    const plan = JSON.parse(user);
    const msgFree = document.getElementById("msgFree");
    const header = document.querySelector(".header");
    
    if (plan.Plan === "Premium" || plan.Plan === "Basic" || plan.Plan === "Standard") {
        msgFree.classList.add("premiumAcc");
        header.style.top = "0";
    } else {
        msgFree.classList.remove("premiumAcc");
    }
    
    setupMovieCardListeners();
}

function setupMovieCardListeners() {
    if (!movieGrid) return;
    
    // Remove existing listeners
    movieGrid.removeEventListener('click', handleMovieCardClick);
    // Add new listener
    movieGrid.addEventListener('click', handleMovieCardClick);
}

function setupHoverTrailer() {
    document.querySelectorAll(".anime-card").forEach(card => {
        let trailerDiv;
        let hoverTimeout;

        card.addEventListener("mouseenter", () => {
            hoverTimeout = setTimeout(async () => {
                const movieId = card.dataset.movieId;
                const trailer = await fetchTMDBTrailer(movieId);
                if (!trailer) return;

                card.classList.add("hovering");

                trailerDiv = document.createElement("div");
                trailerDiv.className = "trailer-preview";

                trailerDiv.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&start=0&end=15&loop=1&playlist=${trailer.key}&enablejsapi=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                    allow="autoplay; encrypted-media"
                    frameborder="0"
                    style="width:100%; height:100%; position:absolute; top:0; left:0;"
                    allowfullscreen
                ></iframe>
                `;

                card.appendChild(trailerDiv);
            }, 400);
        });

        card.addEventListener("mouseleave", () => {
            clearTimeout(hoverTimeout);
            card.classList.remove("hovering");

            if (trailerDiv) {
                trailerDiv.remove();
                trailerDiv = null;
            }
        });
    });
}



function handleMovieCardClick(e) {
    const card = e.target.closest('.anime-card');
    if (!card) return;
    
    const movieId = card.dataset.movieId;
    const requiredPlans = card.getAttribute('data-plans');
    const loginUser = JSON.parse(sessionStorage.getItem("loginUser")) || {};
    const userPlan = loginUser.Plan || "Free";
    
    // Convert requiredPlans string to array and check if user's plan is included
    const allowedPlans = requiredPlans 
        ? requiredPlans.toLowerCase().split(',').map(p => p.trim())
        : [];
    
    // Also check if user's plan exists (might be undefined)
    if (!allowedPlans.includes(userPlan.toLowerCase())) {
        openStream(movieId);
    } else {
    }
}

function showUpgradeModal(requiredPlan, currentPlan) {
    document.getElementById("requiredPlan").textContent = requiredPlan;
    document.getElementById("currentPlan").textContent = currentPlan;
    document.getElementById("subscriptionModal").style.display = "block";
}

function closeModal() {
    document.getElementById("subscriptionModal").style.display = "none";
}

function redirectToUpgrade() {
    closeModal();
    toPayment();
}

function openStream(movieId) {
    window.location.href = `stream.html?id=${movieId}`;
}

async function fetchKinoCheckTrailer(tmdbId) {
    const cacheKey = `trailer_${tmdbId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
        const res = await fetch(`https://api.kinocheck.com/trailers?tmdb_id=${tmdbId}`);
        const data = await res.json();

        const trailer = data.trailers?.find(t =>
            t.categories?.includes("Trailer") &&
            t.youtube_video_id
        );

        if (trailer) {
            localStorage.setItem(cacheKey, JSON.stringify(trailer));
            return trailer;
        }
    } catch (err) {
        console.error("Trailer fetch failed", err);
    }

    return null;
}




