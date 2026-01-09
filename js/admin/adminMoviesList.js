window.onload = function() {
    displayMovies();
}

let currentPage = 1;
const itemsPerPage = 10; // how many movies per page

function openAddMovie() {
    clearForm();
    document.getElementById("addMovie").showPopover();
}

function closeAddMovie() {
    clearForm();
    document.getElementById("addMovie").hidePopover();
}


function btnDashboard(){
    location.href="/admin/adminDashboard.html";
}

function btnMovieList(){
    location.href="/admin/adminMoviesList.html";
}

function btnUsersList(){
    location.href="/admin/adminUserList.html";
}

function adminAccount(){
    location.href="/admin/adminAccount.html";
}

function addAdmin(){
    location.href="/admin/addAdmin.html";
}

function logout(){
    sessionStorage.clear();
    location.href="/index.html";
}

function displayMovies() {
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const tbody = document.querySelector("#movieTable tbody");
    const pagination = document.getElementById("pagination");

    tbody.innerHTML = "";
    pagination.innerHTML = "";

    const totalPages = Math.ceil(movies.length / itemsPerPage);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const pageMovies = movies.slice(start, end);

    pageMovies.forEach(movie => {
        const row = `
            <tr>
                <td>${movie.id}</td>
                <td><img src="${movie.poster_path}" width="80"></td>
                <td>${movie.original_title}</td>
                <td class="overview">${movie.overview}</td>
                <td>${movie.release_date}</td>
                <td>${movie.vote_average}</td>
                <td>${ movie.genre_names || getGenreNames(movie.genre_ids)}</td>
                <td class="action">
                    <button class="edit" onclick="editData('${movie.id}')">Edit</button>
                    <button class="delete" onclick="deleteData('${movie.id}')">Delete</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += row;
    });

    // PAGINATION BUTTONS
    if (totalPages > 1) {

        // Prev
        pagination.innerHTML += `
            <button onclick="changePage(${currentPage - 1})"
                ${currentPage === 1 ? "disabled" : ""}>Prev</button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <button onclick="changePage(${i})"
                    ${i === currentPage ? "style='background:black;color:white'" : ""}>
                    ${i}
                </button>
            `;
        }

        // Next
        pagination.innerHTML += `
            <button onclick="changePage(${currentPage + 1})"
                ${currentPage === totalPages ? "disabled" : ""}>Next</button>
        `;
    }
}

function getGenreNames(genreIds) {
    const genreMap = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
        80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
        14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
        9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    };
    
    if (!genreIds || !Array.isArray(genreIds)) return "Unknown";
    return genreIds.map(id => genreMap[id] || 'Unknown').join(', ');
}

function changePage(page) {
    currentPage = page;
    displayMovies();
}

function addMovie() {
    const movieId = document.getElementById("id").value.trim();
    const imgInput = document.getElementById("img");
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const rating = document.getElementById("rate").value.trim();
    const year = document.getElementById("releaseDate").value.trim();
    const editId = document.getElementById("isEdit").value;

    // Get selected genre IDs from multi-select
    const genreSelect = document.getElementById("genres");
    const selectedGenreIds = Array.from(genreSelect.selectedOptions)
        .map(option => parseInt(option.value));
    
    // Convert genre IDs to genre names
    const selectedGenreNames = convertGenreIdsToNames(selectedGenreIds);

    if (!movieId || !title || !desc) {
        alert("Please fill in all text fields");
        return;
    }

    if (selectedGenreIds.length === 0) {
        alert("Please select at least one genre");
        return;
    }
    

    let movies = JSON.parse(localStorage.getItem("movies")) || [];

    // ✅ EDIT MODE
    if (editId) {
        const index = movies.findIndex(movie => movie.id === editId);

        if (index === -1) {
            alert("Movie not found.");
            return;
        }

        if (movieId !== editId && movies.some(movie => movie.id === movieId)) {
            alert(`Movie with ID ${movieId} already exists!`);
            return;
        }

        // if user selected a new image
        if (imgInput.files && imgInput.files.length > 0) {
            const file = imgInput.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                movies[index] = {
                    ...movies[index],
                    id: movieId,
                    original_title: title,
                    overview: desc,
                    release_date: year,
                    vote_average: Number(rating),
                    genre_ids: selectedGenreIds,
                    genre_names: selectedGenreNames, // Add genre_names
                    poster_path: e.target.result
                };

                localStorage.setItem("movies", JSON.stringify(movies));
                location.reload();
            };

            reader.readAsDataURL(file);

        } else {
            // no new image, keep old one
            movies[index] = {
                ...movies[index],
                id: movieId,
                original_title: title,
                release_date: year,
                vote_average: Number(rating),
                overview: desc, genre_ids: selectedGenreIds,
                genre_names: selectedGenreNames // Add genre_names
            };

            localStorage.setItem("movies", JSON.stringify(movies));
            location.reload();
        }

        return;
    }

    // ✅ ADD MODE
    if (movies.some(movie => movie.id === movieId)) {
        alert(`Movie with ID ${movieId} already exists!`);
        return;
    }

    if (!imgInput.files || imgInput.files.length === 0) {
        alert("Please select an image");
        return;
    }

    const file = imgInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        movies.push({
            id: movieId,
            poster_path: e.target.result,
            original_title: title,
            release_date: year,
            vote_average: Number(rating),
            overview: desc,
            genre_ids: selectedGenreIds,
            genre_names: selectedGenreNames, // Add genre_names
        });

        localStorage.setItem("movies", JSON.stringify(movies));
        location.reload();
    };

    reader.readAsDataURL(file);
}

// Helper function to convert genre IDs to names
function convertGenreIdsToNames(genreIds) {
    const genreMap = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
        80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
        14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
        9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    };
    
    return genreIds.map(id => genreMap[id] || 'Unknown').join(', ');
}

function deleteData(id){
    let movieData = JSON.parse(localStorage.getItem("movies")) || [];
    movieData = movieData.filter(movieID => movieID.id !== id);

    localStorage.setItem("movies", JSON.stringify(movieData));

    location.reload();
}

function editData(id){
    const allMovies = JSON.parse(localStorage.getItem("movies")) || [];
    const movieToEdit = allMovies.find(m => m.id === Number(id) || m.id === id);
    clearForm();
    document.getElementById("addMovie").showPopover();


    if(movieToEdit){
        document.getElementById("id").value = movieToEdit.id;
        document.getElementById("title").value = movieToEdit.original_title;
        document.getElementById("desc").value = movieToEdit.overview;
        document.getElementById("img").value = '';
        document.getElementById("releaseDate").value = movieToEdit.release_date;
        document.getElementById("rate").value = movieToEdit.vote_average;
        document.getElementById("isEdit").value = id;

        // Pre-select genres in the multi-select
        const genreSelect = document.getElementById("genres");
        
        // Clear previous selections
        Array.from(genreSelect.options).forEach(option => {
            option.selected = false;
        });

         // Select the genres that match the movie's genre_ids
         if (movieToEdit.genre_ids && Array.isArray(movieToEdit.genre_ids)) {
            Array.from(genreSelect.options).forEach(option => {
                if (movieToEdit.genre_ids.includes(parseInt(option.value))) {
                    option.selected = true;
                }
            });
        }
    }
}

function clearForm() {
    document.getElementById("id").value = '';
    document.getElementById("title").value = '';
    document.getElementById("desc").value = '';
    document.getElementById("img").value = '';
    document.getElementById("releaseDate").value = '';
    document.getElementById("rate").value = '';
    document.getElementById("isEdit").value = '';
}