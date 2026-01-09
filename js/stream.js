// Global variables
let currentMovieId = null;
let currentServer = '2embed';
let currentQuality = 'auto';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentMovieId = urlParams.get('id');
    
    if (!currentMovieId) {
        showErrorMessage('Movie ID not found in URL');
        return;
    }

    // Load movies from localStorage
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    
    if (movies.length === 0) {
        showErrorMessage('No movies found in database');
        return;
    }

    // Find the movie by ID
    const movie = movies.find(m => m.id == currentMovieId);
    
    if (!movie) {
        showErrorMessage('Movie not found in database');
        return;
    }

    // Display movie information
    displayMovieInfo(movie);
    
    // Load 2embed stream
    load2EmbedStream(currentMovieId);
    
    // Add event listener for iframe load
    document.getElementById('embedFrame').addEventListener('load', function() {
        document.getElementById('videoLoading').style.display = 'none';
        document.getElementById('videoError').style.display = 'none';
    });
    
    document.getElementById('embedFrame').addEventListener('error', function() {
        document.getElementById('videoLoading').style.display = 'none';
        document.getElementById('videoError').style.display = 'flex';
    });
});

function showErrorMessage(message) {
    document.getElementById('movieTitle').textContent = 'Error';
    document.getElementById('movieOverview').textContent = message;
    document.getElementById('videoLoading').style.display = 'none';
    document.getElementById('videoError').style.display = 'flex';
}

function displayMovieInfo(movie) {
    // Set movie title
    document.getElementById('movieTitle').textContent = movie.original_title;
    
    // Set movie poster
    if (movie.poster_path) {
        document.getElementById('moviePoster').src = movie.poster_path;
        document.getElementById('moviePoster').alt = movie.title;
    }

    // Set overview
    document.getElementById('movieOverview').textContent = movie.overview || 'No description available.';
}

function load2EmbedStream(movieId) {
    const embedFrame = document.getElementById('embedFrame');
    const videoLoading = document.getElementById('videoLoading');
    const videoError = document.getElementById('videoError');
    
    // Show loading
    videoLoading.style.display = 'flex';
    videoError.style.display = 'none';
    
    // Build 2embed URL with current server
    let embedUrl = '';
    
    if (currentServer === '2embed') {
        // Main 2embed server
        
        // https://www.zxcstream.xyz/embed/movie/
        embedUrl = `https://111movies.com/movie/${movieId}`;
    }
    
    // Set iframe source
    embedFrame.src = embedUrl;
    
    // Hide loading after a timeout (in case iframe events don't fire)
    setTimeout(() => {
        videoLoading.style.display = 'none';
    }, 5000);
}

function changeServer(server) {
    // Update active button
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Change server and reload stream
    currentServer = server;
    if (currentMovieId) {
        load2EmbedStream(currentMovieId);
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Space bar for play/pause (when iframe is focused)
    if (e.code === 'Space') {
        e.preventDefault();
        // This would require iframe communication, which 2embed might not allow
    }
    // F for fullscreen
    if (e.code === 'KeyF') {
        const iframe = document.getElementById('embedFrame');
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }
});

function back(){
    location.href = "/index.html";
}