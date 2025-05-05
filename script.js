document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const starCountElement = document.getElementById('starCount');
    const phaseElement = document.getElementById('phase');
    let stars = [];
    let animationId;

    // Konfigurácia
    const config = {
        initialStars: 250,
        maxStars: 4500, // Zmenené z 10000 na 4500
        addDuration: 30000, // 30 sekúnd
        removeSpeed: 100, // 100 hviezd/sekundu
        minOpacity: 0.1,
        maxOpacity: 0.8
    };

    // Stav simulácie
    const state = {
        starCount: 0,
        phase: 'initializing',
        startTime: null
    };

    // Inicializácia
    function init() {
        state.phase = 'adding';
        state.startTime = Date.now();
        createInitialStars();
        updateInfo();
        animate();
    }

    function createInitialStars() {
        for (let i = 0; i < config.initialStars; i++) {
            addStar(true); // Rýchle pridanie bez animácie
        }
    }

    function addStar(instant = false) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        if (instant) {
            star.style.opacity = config.minOpacity;
        } else {
            star.style.opacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
            animateStar(star);
        }
        
        body.appendChild(star);
        stars.push(star);
        state.starCount++;
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

    function removeStar() {
        if (stars.length === 0) return;
        
        const star = stars.pop();
        star.parentNode.removeChild(star);
        state.starCount--;
    }

    function animate() {
        const now = Date.now();
        const elapsed = (now - state.startTime) / 1000;

        if (state.phase === 'adding') {
            const targetStars = Math.min(
                config.initialStars + Math.floor((config.maxStars - config.initialStars) * (elapsed / (config.addDuration/1000))),
                config.maxStars
            );
            
            while (state.starCount < targetStars) {
                addStar();
            }

            if (state.starCount >= config.maxStars) {
                state.phase = 'removing';
                state.startTime = now;
            }
        } 
        else if (state.phase === 'removing') {
            const starsToRemove = Math.min(
                Math.floor(config.removeSpeed * (now - state.startTime) / 1000),
                stars.length
            );
            
            for (let i = 0; i < starsToRemove; i++) {
                removeStar();
            }

            if (stars.length === 0) {
                state.phase = 'complete';
            }
        }

        updateInfo();
        
        if (state.phase !== 'complete') {
            animationId = requestAnimationFrame(animate);
        } else {
            phaseElement.textContent = "Hviezdy zhasli";
        }
    }

    function updateInfo() {
        starCountElement.textContent = state.starCount;
        
        if (state.phase === 'adding') {
            const progress = Math.round((state.starCount - config.initialStars) / (config.maxStars - config.initialStars) * 100);
            phaseElement.textContent = `Rozsvecovanie (${progress}%)`;
        } 
        else if (state.phase === 'removing') {
            const progress = Math.round(stars.length / config.maxStars * 100);
            phaseElement.textContent = `Zhasínanie (${progress}%)`;
        }
    }

    // Spustenie
    init();

    // Čistenie
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
        stars.forEach(star => star.parentNode?.removeChild(star));
    });
});