

// loadMovies();



function Auth() {
    const userLogin = sessionStorage.getItem("loginUser");
    const requiredRole = document.body.dataset.allow; 
    const requiredPlan = document.body.dataset.plan;
    const requiredVerified = document.body.dataset.verified;

    const user = JSON.parse(userLogin);

    // ---------- ROLE CHECK ----------
    if (user.Role !== requiredRole) {
        alert("Access Denied! Redirecting...");

        if (user.Role === "Admin") {
            location.href = "/admin/adminDashboard.html";
        } else {
            location.href = "/dashboard.html";
        }
        return;
    }

    if(requiredVerified){
        if(user.emailStatus !== requiredVerified){
            if(user.emailStatus === "Unverified"){
                location.href="/emailVerification/otpEmailInput.html";
            }else{
                location.href="/dashboard.html";
            }
        }
    }

    if (requiredPlan) {
        if (user.Plan !== requiredPlan) {
            alert("Access Denied! Redirecting...");

            if (user.Plan === "Free") {
                location.href = "/payment/payment.html";
            } else {
                location.href = "/dashboard.html";            }
        }
    }

    document.body.classList.add('authorized');
}


function initializeMovies() {
    // Sample movie data
    const sampleMovies = [
        {
            id: "tt26443597",
            original_title: "Zootopia 2",
            overview: "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De’Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
            poster_path: "/img/movie_posters_popular/Zootopia_2.jpg",
        },
        {
            id: "tt6604188",
            original_title: "TRON: Ares",
            overview: "A highly sophisticated Program called Ares is sent from the digital world into the real world on a dangerous mission, marking humankind's first encounter with A.I. beings.",
            poster_path: "/img/movie_posters_popular/TRON_Ares.jpg",
        },
        {
            id: "tt29232158",
            original_title: "Troll 2",
            overview: "When a dangerous new troll unleashes devastation across their homeland, Nora, Andreas and Major Kris embark on their most perilous mission yet.",
            poster_path: "/img/movie_posters_popular/Troll_2.jpg",
        },
        {
            id: "tt30274401",
            original_title: "Five Nights at Freddy's 2",
            overview: "One year since the supernatural nightmare at Freddy Fazbear's Pizza, the stories about what transpired there have been twisted into a campy local legend, inspiring the town's first ever Fazfest. With the truth kept from her, Abby sneaks out to reconnect with Freddy, Bonnie, Chica, and Foxy, setting into motion a terrifying series of events that will reveal dark secrets about the real origin of Freddy's, and unleash a decades-hidden horror.",
            poster_path: "/img/movie_posters_popular/Five_Nights_at_Freddys_2.jpg",
        },
        {
            id: "tt1343712",
            original_title: "First Squad: The Moment of Truth",
            overview: "Set during the opening days of World War II on the Eastern Front. Its main cast are a group of Soviet teenagers with extraordinary abilities; the teenagers have been drafted to form a special unit to fight the invading German army. They are opposed by a Schutzstaffel officer who is attempting to raise from the dead a supernatural army of crusaders from the 12th-century Order of the Sacred Cross.",
            poster_path: "/img/movie_posters_popular/Первый_отряд.jpg",
        },
        {
            id: "tt26439764",
            original_title: "Kantara: A Legend - Chapter 1",
            overview: "During the Kadamba reign, King Vijayendra, the ruler of the fictional feudatory land of Bangra, meets his final fate while venturing into the mystical forest of Kantara. Witnessing this, his son Rajashekara seals the borders of their realm. Later, Prince Kulashekara reopens them through a brutal massacre. The protagonist, Berme, in search of prosperity, crosses the divide and ignites a conflict of faith, power, and destiny between the Kingdom and Nature.",
            poster_path: "/img/movie_posters_popular/ಕತರ_ಅಧಯಯ__೧.jpg",
        },
        {
            id: "tt36153493",
            original_title: "Wildcat",
            overview: "An ex-black ops team reunite to pull off a desperate heist in order to save the life of their leader’s eight-year-old daughter.",
            poster_path: "/img/movie_posters_popular/Wildcat.jpg",
        },
        {
            id: "tt31434030",
            original_title: "Dracula",
            overview: "When a 15th-century prince denounces God after the devastating loss of his wife, he inherits an eternal curse: he becomes Dracula. Condemned to wander the centuries, he defies fate and death itself, guided by a single hope — to be reunited with his lost love.",
            poster_path: "/img/movie_posters_popular/Dracula.jpg",
        },
        {
            id: "tt10210064",
            original_title: "Bureau 749",
            overview: "A traumatized young man with physical abnormalities is forced to join a mysterious bureau to confront a disaster spreading across the earth caused by an unknown creature. He embarks on an adventure uncovering mysteries about his life.",
            poster_path: "/img/movie_posters_popular/749局.jpg",
        },
        {
            id: "tt31227572",
            original_title: "Predator: Badlands",
            overview: "Cast out from his clan, a young Predator finds an unlikely ally in a damaged android and embarks on a treacherous journey in search of the ultimate adversary.",
            poster_path: "/img/movie_posters_popular/Predator_Badlands.jpg",
        },
        {
            id: "tt30472557",
            original_title: "Chainsaw Man - The Movie: Reze Arc",
            overview: "In a brutal war between devils, hunters, and secret enemies, a mysterious girl named Reze has stepped into Denji's world, and he faces his deadliest battle yet, fueled by love in a world where survival knows no rules.",
            poster_path: "/img/movie_posters_popular/劇場版_チェンソーマン_レゼ篇.jpg",
        },
        {
            id: "tt34610311",
            original_title: "The Shadow's Edge",
            overview: "Macau Police brings the tracking expert police officer out of retirement to help catch a dangerous group of professional thieves.",
            poster_path: "/img/movie_posters_popular/捕风追影.jpg",
        },
        {
            id: "tt17501870",
            original_title: "High Forces",
            overview: "\"Anyone? There is ......\" A mysterious message from Gao Haojun comes from ten thousand meters in the air. A five-star A380 ultra-luxury airliner was hijacked on its international maiden voyage, and international security expert Gao Haojun stood up to a group of thugs, his daughter Xiaojun was trapped in the cabin, and Mike, the leader of the hijackers, threatened the lives of more than 800 people in the plane as a bargaining chip, and Xiaojun's mother, Fu Yuan, was also in danger. ...... Will the passengers on board be able to land safely and how should this crisis be resolved?",
            poster_path: "/img/movie_posters_popular/危机航线.jpg",
        },
        {
            id: "tt13186306",
            original_title: "War of the Worlds",
            overview: "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
            poster_path: "/img/movie_posters_popular/War_of_the_Worlds.jpg",
        },
        {
            id: "tt38681567",
            original_title: "Stephen",
            overview: "A psychiatrist evaluating a self-confessed serial killer unravels a twisted web of trauma, deceit, and psychological manipulation—only to question if the killer is truly guilty or just another victim in a larger, darker game.",
            poster_path: "/img/movie_posters_popular/ஸடபன.jpg",
        },
        {
            id: "tt1312221",
            original_title: "Frankenstein",
            overview: "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
            poster_path: "/img/movie_posters_popular/Frankenstein.jpg",
        },
        {
            id: "tt32123395",
            original_title: "Altered",
            overview: "In an alternate present, genetically enhanced humans dominate society. Outcasts Leon and Chloe fight for justice against corrupt politicians exploiting genetic disparity, risking everything to challenge the oppressive system.",
            poster_path: "/img/movie_posters_popular/Altered.jpg",
        },
        {
            id: "tt2948356",
            original_title: "Zootopia",
            overview: "Determined to prove herself, Officer Judy Hopps, the first bunny on Zootopia's police force, jumps at the chance to crack her first case - even if it means partnering with scam-artist fox Nick Wilde to solve the mystery.",
            poster_path: "/img/movie_posters_popular/Zootopia.jpg",
        },
        {
            id: "tt19847976",
            original_title: "Wicked: For Good",
            overview: "As an angry mob rises against the Wicked Witch, Glinda and Elphaba will need to come together one final time. With their singular friendship now the fulcrum of their futures, they will need to truly see each other, with honesty and empathy, if they are to change themselves, and all of Oz, for good.",
            poster_path: "/img/movie_posters_popular/Wicked_For_Good.jpg",
        },
        {
            id: "tt34276058",
            original_title: "The Family Plan 2",
            overview: "Now that Dan's assassin days are behind him, all he wants for Christmas is quality time with his kids. But when he learns his daughter has her own plans, he books a family trip to London—putting them all in the crosshairs of an unexpected enemy.",
            poster_path: "img/movie_posters_popular/The_Family_Plan_2.jpg",
        }
    ];
    
    // Get existing movies or create new array
    let existingMovies = JSON.parse(localStorage.getItem("movies")) || [];
    
    // Filter out duplicates
    const existingIds = existingMovies.map(movie => movie.id);
    const newMovies = sampleMovies.filter(movie => !existingIds.includes(movie.id));
    
    // Add new movies
    if (newMovies.length > 0) {
        existingMovies.push(...newMovies);
        localStorage.setItem("movies", JSON.stringify(existingMovies));
        console.log(`✅ Added ${newMovies.length} movies to localStorage`);
    } else {
        console.log("⚠️ All sample movies already exist in localStorage");
    }
    
    return existingMovies;
}

// initializeMovies();
Auth();


