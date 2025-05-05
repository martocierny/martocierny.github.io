document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const body = document.body;
    const starCountElement = document.getElementById('starCount');
    const phaseElement = document.getElementById('phase');
    const toggleDayNightBtn = document.getElementById('toggleDayNight');
    const starSearch = document.getElementById('starSearch');
    const searchBtn = document.getElementById('searchBtn');
    const showFavoritesBtn = document.getElementById('showFavoritesBtn');
    const starDetails = document.getElementById('starDetails');
    const closeBtn = starDetails.querySelector('.close-btn');
    const toggleFavoriteBtn = document.getElementById('toggleFavoriteBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');

    // State
    let stars = [];
    let starData = {};
    let isDay = false;
    let zoomLevel = 1;
    let selectedStarId = null;
    let favoritesMode = false;
    let animationFrameId;
    let starCreationInterval;
    let starRemovalInterval;
    let lifespanUpdateInterval;

    // Configuration
    const config = {
        maxStars: 2500,
        creationSpeed: 167, // 2500 stars / 15 seconds ≈ 167 stars/second
        minSize: 1,
        maxSize: 3.5,
        minOpacity: 0.4,
        maxOpacity: 0.95,
        minLifespan: 45000, // 45 seconds
        maxLifespan: 120000, // 2 minutes
        clickZoomThreshold: 2.5,
        starColors: [
            { temp: 30000, color: '#9bb0ff', name: 'Modrobiela' },
            { temp: 10000, color: '#a6c7ff', name: 'Biela' },
            { temp: 7500, color: '#cad7ff', name: 'Svetlomodrá' },
            { temp: 6000, color: '#fff4ea', name: 'Žltobiela' },
            { temp: 5000, color: '#fff1e0', name: 'Žltá' },
            { temp: 3500, color: '#ffdfc2', name: 'Oranžová' },
            { temp: 2000, color: '#ffb6a3', name: 'Červená' }
        ]
    };

    // Initialize
    function init() {
        setupEventListeners();
        createStars();
        startLifespanUpdates();
        updatePhaseText('Vytváram hviezdy...');
    }

    function setupEventListeners() {
        toggleDayNightBtn.addEventListener('click', toggleDayNight);
        searchBtn.addEventListener('click', searchStar);
        starSearch.addEventListener('keypress', (e) => e.key === 'Enter' && searchStar());
        closeBtn.addEventListener('click', closeStarDetails);
        toggleFavoriteBtn.addEventListener('click', toggleFavorite);
        showFavoritesBtn.addEventListener('click', toggleFavoritesMode);
        zoomInBtn.addEventListener('click', () => adjustZoom(0.5));
        zoomOutBtn.addEventListener('click', () => adjustZoom(-0.5));
        document.addEventListener('wheel', handleWheelZoom, { passive: false });
    }

    function createStars() {
        let starsCreated = 0;
        const totalStars = config.maxStars;
        
        starCreationInterval = setInterval(() => {
            if (starsCreated >= totalStars) {
                clearInterval(starCreationInterval);
                updatePhaseText('Hviezdy vytvorené');
                startStarRemoval();
                return;
            }
            
            addStar();
            starsCreated++;
            starCountElement.textContent = starsCreated;
            
            // Update progress
            const progress = Math.floor((starsCreated / totalStars) * 100);
            updatePhaseText(`Vytváram hviezdy... ${progress}%`);
        }, 1000 / config.creationSpeed);
    }

    function addStar() {
        const starId = 'star-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const star = document.createElement('div');
        star.className = 'star';
        star.id = starId;
        
        const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        const colorData = getStarColorData(Math.random() * 40000 + 2000);
        star.style.backgroundColor = colorData.color;
        
        // Save star data
        starData[starId] = {
            id: starId,
            name: `${colorData.name} ${stars.length + 1}`,
            temp: Math.round(colorData.temp),
            color: colorData.color,
            colorName: colorData.name,
            size: size.toFixed(1),
            creationTime: Date.now(),
            lifespan: Math.random() * (config.maxLifespan - config.minLifespan) + config.minLifespan,
            isFavorite: false
        };
        
        star.style.opacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
        star.addEventListener('click', handleStarClick);
        
        body.appendChild(star);
        stars.push(star);
        animateStar(star);
    }

    function getStarColorData(temperature) {
        return config.starColors.find(c => temperature >= c.temp) || config.starColors[config.starColors.length - 1];
    }

    function animateStar(star) {
        const animate = () => {
            const duration = Math.random() * 2000 + 1000;
            const targetOpacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
            
            star.style.transition = `opacity ${duration/1000}s ease`;
            star.style.opacity = targetOpacity;
            
            setTimeout(animate, duration);
        };
        animate();
    }

    function startStarRemoval() {
        starRemovalInterval = setInterval(() => {
            if (stars.length === 0) {
                clearInterval(starRemovalInterval);
                updatePhaseText('Všetky hviezdy zhasli');
                return;
            }
            
            // Remove random star
            const randomIndex = Math.floor(Math.random() * stars.length);
            const star = stars[randomIndex];
            delete starData[star.id];
            star.remove();
            stars.splice(randomIndex, 1);
            
            starCountElement.textContent = stars.length;
            
            // Update removal progress
            const progress = Math.floor((1 - (stars.length / config.maxStars)) * 100);
            updatePhaseText(`Zhasínanie... ${progress}%`);
        }, 100);
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
            });
        }, 1000);
    }

    function handleStarClick(e) {
        e.stopPropagation();
        const starId = this.id;
        
        // Highlight the star
        stars.forEach(s => s.classList.remove('highlighted'));
        this.classList.add('highlighted');
        
        // Show details
        showStarDetails(starId);
    }

    function showStarDetails(starId) {
        selectedStarId = starId;
        updateStarDetails(starId);
        starDetails.style.display = 'block';
    }

    function updateStarDetails(starId) {
        const star = starData[starId];
        if (!star) return;
        
        document.getElementById('detail-id').textContent = star.id;
        document.getElementById('detail-name').textContent = star.name;
        document.getElementById('detail-age').textContent = formatTime(Date.now() - star.creationTime);
        document.getElementById('detail-lifespan').textContent = formatTime(star.remainingTime);
        document.getElementById('detail-temp').textContent = `${star.temp} K (${star.colorName})`;
        
        // Update favorite button
        toggleFavoriteBtn.textContent = star.isFavorite ? '❤ Odobrať z obľúbených' : '❤ Pridať k obľúbeným';
        toggleFavoriteBtn.classList.toggle('favorited', star.isFavorite);
    }

    function closeStarDetails() {
        stars.forEach(star => star.classList.remove('highlighted'));
        starDetails.style.display = 'none';
        selectedStarId = null;
    }

    function toggleFavorite() {
        if (!selectedStarId) return;
        
        const star = starData[selectedStarId];
        star.isFavorite = !star.isFavorite;
        
        const starElement = document.getElementById(selectedStarId);
        if (starElement) {
            starElement.classList.toggle('favorite', star.isFavorite);
        }
        
        updateStarDetails(selectedStarId);
    }

    function toggleFavoritesMode() {
        favoritesMode = !favoritesMode;
        
        if (favoritesMode) {
            // Show only favorites
            stars.forEach(star => {
                star.style.display = starData[star.id]?.isFavorite ? 'block' : 'none';
            });
            showFavoritesBtn.textContent = '★ Zobraziť všetky';
            updatePhaseText('Zobrazené obľúbené hviezdy');
        } else {
            // Show all stars
            stars.forEach(star => star.style.display = 'block');
            showFavoritesBtn.textContent = '★ Obľúbené';
            updatePhaseText('Zobrazené všetky hviezdy');
        }
    }

    function searchStar() {
        const query = starSearch.value.trim().toLowerCase();
        if (!query) return;
        
        // Find star by ID or name
        let foundStar = null;
        
        for (const starId in starData) {
            const star = starData[starId];
            if (star.id.toLowerCase().includes(query) || star.name.toLowerCase().includes(query)) {
                foundStar = document.getElementById(starId);
                break;
            }
        }
        
        if (foundStar) {
            // Highlight and show details
            stars.forEach(s => s.classList.remove('highlighted'));
            foundStar.classList.add('highlighted');
            showStarDetails(foundStar.id);
            
            // Center in view
            foundStar.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        } else {
            alert("Hviezda nebola nájdená");
        }
    }

    function toggleDayNight() {
        isDay = !isDay;
        body.classList.toggle('day-mode', isDay);
        
        stars.forEach(star => {
            star.style.opacity = isDay ? '0.1' : 
                (Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity);
        });
    }

    function handleWheelZoom(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.002;
        adjustZoom(delta);
    }

    function adjustZoom(delta) {
        zoomLevel = Math.min(Math.max(1, zoomLevel + delta), 5);
        applyZoom();
    }

    function applyZoom() {
        body.style.transform = `scale(${zoomLevel})`;
        
        // Update star clickability based on zoom level
        stars.forEach(star => {
            star.classList.toggle('clickable', zoomLevel >= config.clickZoomThreshold);
        });
    }

    function updatePhaseText(text) {
        phaseElement.textContent = text;
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

    // Initialize
    init();
});