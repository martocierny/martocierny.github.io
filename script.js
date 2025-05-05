document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const starCountElement = document.getElementById('starCount');
    const phaseElement = document.getElementById('phase');
    const toggleDayNightBtn = document.getElementById('toggleDayNight');
    const starSearch = document.getElementById('starSearch');
    const searchBtn = document.getElementById('searchBtn');
    const starDetails = document.getElementById('starDetails');
    const closeBtn = starDetails.querySelector('.close-btn');
    const renameBtn = document.getElementById('renameBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const translateBtn = document.getElementById('translateBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = aboutModal.querySelector('.close-modal');
    const miniMap = document.querySelector('.mini-map');
    const viewportIndicator = document.querySelector('.viewport-indicator');
    
    let stars = [];
    let starData = {};
    let animationId;
    let removeInterval;
    let isDay = false;
    let zoomLevel = 1;
    let currentZoom = 1;
    let selectedStarId = null;
    let isEnglish = true;
    let lifespanUpdateInterval;

    // Configuration
    const config = {
        initialStars: 100,
        maxStars: 2500,
        addDuration: 20000,
        removeRate: 2,
        removeInterval: 5000,
        minOpacity: 0.3,
        maxOpacity: 0.9,
        minSize: 1,
        maxSize: 4,
        minLifespan: 30000, // 30 seconds
        maxLifespan: 120000, // 2 minutes
        clickZoomThreshold: 3,
        starColors: [
            { temp: 30000, color: '#9bb0ff', name: 'Blue-white' },
            { temp: 10000, color: '#a6c7ff', name: 'White' },
            { temp: 7500, color: '#cad7ff', name: 'Light blue' },
            { temp: 6000, color: '#fff4ea', name: 'Yellow-white' },
            { temp: 5000, color: '#fff1e0', name: 'Yellow' },
            { temp: 3500, color: '#ffdfc2', name: 'Orange' },
            { temp: 2000, color: '#ffb6a3', name: 'Red' }
        ]
    };

    // Simulation state
    const state = {
        starCount: 0,
        phase: 'initializing',
        startTime: null,
        lastStarAdded: 0
    };

    // Translations
    const translations = {
        en: {
            stars: "Stars",
            phase: "Phase",
            loading: "Loading...",
            adding: "Illuminating",
            removing: "Dimming",
            complete: "Stars faded",
            searchPlaceholder: "Search star (ID/Name)",
            search: "Search",
            toggleDayNight: "Toggle Day/Night",
            about: "About",
            translate: "Translate to Slovak",
            starDetails: "Star Details",
            id: "ID",
            name: "Name",
            age: "Age",
            remaining: "Remaining",
            temperature: "Temperature",
            size: "Size",
            rename: "Rename",
            aboutTitle: "About Star Map",
            aboutText: "This is an interactive star map visualization. Features include:",
            aboutFeatures: [
                "2500 unique stars with realistic properties",
                "Dynamic star lifecycles with real-time countdown",
                "Zoomable interface with mini-map navigation",
                "Searchable stars by ID or custom name",
                "Day/night mode toggle",
                "Detailed star information panel"
            ],
            aboutCreated: "Created with HTML, CSS and JavaScript."
        },
        sk: {
            stars: "Hviezdy",
            phase: "Fáza",
            loading: "Načítava sa...",
            adding: "Rozsvecovanie",
            removing: "Zhasínanie",
            complete: "Hviezdy zhasli",
            searchPlaceholder: "Hľadať hviezdu (ID/Meno)",
            search: "Hľadať",
            toggleDayNight: "Prepnúť deň/noc",
            about: "O stránke",
            translate: "Preložiť do angličtiny",
            starDetails: "Detail hviezdy",
            id: "ID",
            name: "Meno",
            age: "Vek",
            remaining: "Zostáva",
            temperature: "Teplota",
            size: "Veľkosť",
            rename: "Premenovať",
            aboutTitle: "O Hviezdnej Mape",
            aboutText: "Toto je interaktívna vizualizácia hviezdnej oblohy. Ponúka:",
            aboutFeatures: [
                "2500 unikátnych hviezd s realistickými vlastnosťami",
                "Dynamický životný cyklus hviezd s aktuálnym odpočtom",
                "Približovací interface s miniatúrnou mapou",
                "Vyhľadávanie hviezd podľa ID alebo vlastného mena",
                "Prepínanie dňa a noci",
                "Detailný panel s informáciami o hviezdach"
            ],
            aboutCreated: "Vytvorené pomocou HTML, CSS a JavaScript."
        }
    };

    // Initialize
    function init() {
        state.phase = 'adding';
        state.startTime = Date.now();
        createInitialStars();
        updateInfo();
        animate();
        setupEventListeners();
        updateMiniMap();
        startLifespanUpdates();
    }

    function setupEventListeners() {
        toggleDayNightBtn.addEventListener('click', toggleDayNight);
        searchBtn.addEventListener('click', searchStar);
        starSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchStar();
        });
        closeBtn.addEventListener('click', () => {
            stars.forEach(star => star.classList.remove('highlighted'));
            starDetails.style.display = 'none';
        });
        renameBtn.addEventListener('click', renameStar);
        aboutBtn.addEventListener('click', () => {
            aboutModal.style.display = 'block';
        });
        closeModal.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
        translateBtn.addEventListener('click', toggleLanguage);
        
        // Zoom with mouse wheel
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.002;
            zoomLevel = Math.min(Math.max(0.5, zoomLevel + delta), 10);
            applyZoom();
            updateStarClickability();
            updateMiniMap();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }

    function applyZoom() {
        currentZoom = zoomLevel;
        body.style.transform = `scale(${zoomLevel})`;
    }

    function updateStarClickability() {
        stars.forEach(star => {
            if (zoomLevel >= config.clickZoomThreshold) {
                star.classList.add('clickable');
            } else {
                star.classList.remove('clickable');
                star.classList.remove('highlighted');
            }
        });
    }

    function createInitialStars() {
        for (let i = 0; i < config.initialStars; i++) {
            addStar(true);
        }
    }

    function addStar(instant = false) {
        if (state.starCount >= config.maxStars) return;
        
        const starId = 'star-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
        const star = document.createElement('div');
        star.className = 'star';
        star.id = starId;
        
        const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        // Assign star color based on temperature
        const temp = Math.random() * 40000 + 2000;
        const colorData = config.starColors.find(c => temp >= c.temp) || config.starColors[config.starColors.length - 1];
        const color = colorData.color;
        const colorName = colorData.name;
        
        star.style.backgroundColor = color;
        
        // Save star data
        const creationTime = Date.now();
        const lifespan = Math.random() * (config.maxLifespan - config.minLifespan) + config.minLifespan;
        
        starData[starId] = {
            id: starId,
            name: `${colorName} Star ${state.starCount + 1}`,
            temp: Math.round(temp),
            color: color,
            colorName: colorName,
            size: size.toFixed(1),
            creationTime: creationTime,
            lifespan: lifespan,
            remainingTime: lifespan
        };
        
        if (instant) {
            star.style.opacity = config.minOpacity;
        } else {
            star.style.opacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
            animateStar(star);
        }
        
        // Make star interactive when zoomed in
        star.addEventListener('click', (e) => {
            if (zoomLevel >= config.clickZoomThreshold) {
                e.stopPropagation();
                showStarDetails(starId);
                
                // Highlight the star
                stars.forEach(s => s.classList.remove('highlighted'));
                star.classList.add('highlighted');
                
                // Center view on the star
                centerViewOnStar(star);
            }
        });
        
        body.appendChild(star);
        stars.push(star);
        state.starCount++;
        state.lastStarAdded = Date.now();
    }

    function animateStar(star) {
        const animate = () => {
            const duration = Math.random() * 2000 + 1000;
            const targetOpacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
            
            star.style.transition = `opacity ${duration/2000}s ease-in-out`;
            star.style.opacity = targetOpacity;
            
            setTimeout(animate, duration);
        };
        animate();
    }

    function removeStars() {
        for (let i = 0; i < config.removeRate; i++) {
            if (stars.length === 0) {
                clearInterval(removeInterval);
                state.phase = 'complete';
                updatePhaseText();
                return;
            }
            
            const star = stars.pop();
            const starId = star.id;
            delete starData[starId];
            star.parentNode.removeChild(star);
            state.starCount--;
        }
        updateInfo();
    }

    function startRemovingStars() {
        removeInterval = setInterval(removeStars, config.removeInterval);
    }

    function animate() {
        const now = Date.now();
        const elapsed = (now - state.startTime) / 1000;

        if (state.phase === 'adding') {
            const targetStars = Math.min(
                config.initialStars + Math.floor((config.maxStars - config.initialStars) * (elapsed / (config.addDuration/1000))),
                config.maxStars
            );
            
            while (state.starCount < targetStars && (now - state.lastStarAdded) > 10) {
                addStar();
            }

            if (state.starCount >= config.maxStars) {
                state.phase = 'removing';
                startRemovingStars();
            }
        }

        updateInfo();
        
        if (state.phase !== 'removing' && state.phase !== 'complete') {
            animationId = requestAnimationFrame(animate);
        }
    }

    function updateInfo() {
        starCountElement.textContent = state.starCount;
        updatePhaseText();
    }

    function updatePhaseText() {
        const now = Date.now();
        const elapsed = (now - state.startTime) / 1000;
        
        if (state.phase === 'adding') {
            const progress = Math.round((state.starCount - config.initialStars) / (config.maxStars - config.initialStars) * 100);
            phaseElement.textContent = isEnglish ? 
                `Illuminating (${progress}%)` : `Rozsvecovanie (${progress}%)`;
        } 
        else if (state.phase === 'removing') {
            const progress = Math.round(stars.length / config.maxStars * 100);
            phaseElement.textContent = isEnglish ? 
                `Dimming (${progress}%)` : `Zhasínanie (${progress}%)`;
        }
        else if (state.phase === 'complete') {
            phaseElement.textContent = isEnglish ? 'Stars faded' : 'Hviezdy zhasli';
        }
    }

    function startLifespanUpdates() {
        lifespanUpdateInterval = setInterval(() => {
            const now = Date.now();
            Object.keys(starData).forEach(starId => {
                const star = starData[starId];
                const age = now - star.creationTime;
                star.remainingTime = Math.max(0, star.lifespan - age);
                
                // Update details if this star is currently selected
                if (starId === selectedStarId) {
                    updateStarDetails(starId);
                }
                
                // Remove star if its time has come
                if (star.remainingTime <= 0 && stars.some(s => s.id === starId)) {
                    const starElement = document.getElementById(starId);
                    if (starElement) {
                        starElement.remove();
                        stars = stars.filter(s => s.id !== starId);
                        state.starCount--;
                        delete starData[starId];
                    }
                }
            });
            
            updateInfo();
        }, 1000);
    }

    function toggleDayNight() {
        isDay = !isDay;
        body.classList.toggle('day-mode', isDay);
        
        stars.forEach(star => {
            star.style.opacity = isDay ? '0.2' : 
                (Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity);
        });
    }

    function showStarDetails(starId) {
        selectedStarId = starId;
        updateStarDetails(starId);
        starDetails.style.display = 'block';
    }

    function updateStarDetails(starId) {
        const star = starData[starId];
        if (!star) {
            starDetails.style.display = 'none';
            return;
        }
        
        document.getElementById('detail-id').textContent = star.id;
        document.getElementById('detail-name').value = star.name;
        document.getElementById('detail-age').textContent = formatTime(Date.now() - star.creationTime);
        document.getElementById('detail-lifespan').textContent = formatTime(star.remainingTime);
        document.getElementById('detail-temp').textContent = `${star.temp} K (${star.colorName})`;
        document.getElementById('detail-size').textContent = `${star.size} px`;
    }

    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    function searchStar() {
        const query = starSearch.value.trim().toLowerCase();
        if (!query) return;
        
        // Remove highlight from all stars
        stars.forEach(star => star.classList.remove('highlighted'));
        
        // Search by ID or name
        let foundStar = null;
        
        for (const starId in starData) {
            const star = starData[starId];
            if (star.id.toLowerCase().includes(query) || star.name.toLowerCase().includes(query)) {
                foundStar = document.getElementById(starId);
                break;
            }
        }
        
        if (foundStar) {
            // Zoom to required level for clickability
            if (zoomLevel < config.clickZoomThreshold) {
                zoomLevel = config.clickZoomThreshold;
                applyZoom();
                updateStarClickability();
            }
            
            // Center view on the star
            centerViewOnStar(foundStar);
            
            // Highlight the star and show details
            setTimeout(() => {
                foundStar.classList.add('highlighted');
                showStarDetails(foundStar.id);
            }, 500);
        } else {
            alert(isEnglish ? "Star not found" : "Hviezda nebola nájdená");
        }
    }

    function centerViewOnStar(starElement) {
        const starRect = starElement.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = centerX - starRect.left - starRect.width/2;
        const offsetY = centerY - starRect.top - starRect.height/2;
        
        body.style.transform = `scale(${zoomLevel}) translate(${offsetX/zoomLevel}px, ${offsetY/zoomLevel}px)`;
        updateMiniMap();
    }

    function renameStar() {
        if (!selectedStarId) return;
        
        const newName = document.getElementById('detail-name').value.trim();
        if (newName && starData[selectedStarId]) {
            starData[selectedStarId].name = newName;
        }
    }

    function updateMiniMap() {
        // Calculate viewport position and size on the mini-map
        const viewportWidth = (1 / zoomLevel) * 100;
        const viewportHeight = (1 / zoomLevel) * 100;
        
        // Calculate position based on current transform
        const transform = window.getComputedStyle(body).transform;
        let x = 0, y = 0;
        
        if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) {
                const values = matrix[1].split(', ');
                if (values.length === 6) {
                    x = parseFloat(values[4]) / zoomLevel;
                    y = parseFloat(values[5]) / zoomLevel;
                }
            }
        }
        
        // Convert to percentage for mini-map
        const posX = (-x / window.innerWidth) * 100;
        const posY = (-y / window.innerHeight) * 100;
        
        viewportIndicator.style.width = `${viewportWidth}%`;
        viewportIndicator.style.height = `${viewportHeight}%`;
        viewportIndicator.style.left = `${posX}%`;
        viewportIndicator.style.top = `${posY}%`;
    }

    function toggleLanguage() {
        isEnglish = !isEnglish;
        applyLanguage();
    }

    function applyLanguage() {
        const lang = isEnglish ? 'en' : 'sk';
        const t = translations[lang];
        
        // Update UI elements
        document.querySelector('.counter .label').textContent = t.stars + ":";
        document.querySelector('.phase .label').textContent = t.phase + ":";
        starSearch.placeholder = t.searchPlaceholder;
        searchBtn.textContent = t.search;
        toggleDayNightBtn.textContent = t.toggleDayNight;
        aboutBtn.textContent = t.about;
        translateBtn.textContent = t.translate;
        starDetails.querySelector('h3').textContent = t.starDetails;
        document.getElementById('detail-id').previousElementSibling.textContent = t.id + ":";
        document.getElementById('detail-name').previousElementSibling.textContent = t.name + ":";
        document.getElementById('detail-age').previousElementSibling.textContent = t.age + ":";
        document.getElementById('detail-lifespan').previousElementSibling.textContent = t.remaining + ":";
        document.getElementById('detail-temp').previousElementSibling.textContent = t.temperature + ":";
        document.getElementById('detail-size').previousElementSibling.textContent = t.size + ":";
        renameBtn.textContent = t.rename;
        
        // Update about modal
        const modal = aboutModal.querySelector('.modal-content');
        modal.querySelector('h2').textContent = t.aboutTitle;
        modal.querySelector('p').textContent = t.aboutText;
        const features = modal.querySelectorAll('li');
        t.aboutFeatures.forEach((feature, i) => {
            if (features[i]) features[i].textContent = feature;
        });
        modal.querySelectorAll('p')[1].textContent = t.aboutCreated;
        
        // Update phase text
        updatePhaseText();
    }

    // Initialize
    init();
    applyLanguage();

    // Cleanup
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
        clearInterval(removeInterval);
        clearInterval(lifespanUpdateInterval);
        stars.forEach(star => star.parentNode?.removeChild(star));
    });
});