document.addEventListener('DOMContentLoaded', function() {
    const starfield = document.getElementById('starfield');
    const speedInfo = document.getElementById('speed-info');
    const stars = [];
    const starCount = 1200; // Viac hviezd
    let speed = 0;
    let maxZ = 5000;
    let scrollY = 0;

    // Vytvorenie hviezd
    function createStars() {
        for (let i = 0; i < starCount; i++) {
            addStar(Math.random() * maxZ);
        }
    }

    // Pridanie novej hviezdy
    function addStar(z) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Širší rozptyl po krajoch (1.5x širšie ako obrazovka)
        const x = (Math.random() - 0.5) * window.innerWidth * 3;
        const y = (Math.random() - 0.5) * window.innerHeight * 3;
        
        star.dataset.x = x;
        star.dataset.y = y;
        star.dataset.z = z;
        star.dataset.boost = Math.random() > 0.9 ? 1.5 : 1; // 10% šanca na boost
        
        // Vzdialené hviezdy blikajú
        if (z > maxZ * 0.7) {
            star.classList.add('far');
        }
        
        starfield.appendChild(star);
        stars.push(star);
        updateStarPosition(star);
    }

    // Aktualizácia pozície hviezdy
    function updateStarPosition(star) {
        const z = parseFloat(star.dataset.z);
        const boost = parseFloat(star.dataset.boost);
        
        // Výpočet veľkosti a opacity
        let scale = Math.min(15, 2000 / z) * boost;
        // Náhodné zväčšenie pri prelete okolo nás
        if (z < 500 && boost > 1) {
            scale *= 1 + (500 - z)/500 * 2;
        }
        
        const size = Math.max(0.5, scale);
        const opacity = Math.min(1, 1.5 - z/maxZ);
        
        // Projekcia 3D -> 2D
        const x = parseFloat(star.dataset.x) / z * 1000 + window.innerWidth/2;
        const y = parseFloat(star.dataset.y) / z * 1000 + window.innerHeight/2;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.opacity = opacity;
    }

    // Animácia
    function animate() {
        stars.forEach(star => {
            let z = parseFloat(star.dataset.z) - speed;
            
            if (z < 50) {
                z = maxZ;
                star.dataset.z = z;
                star.dataset.x = (Math.random() - 0.5) * window.innerWidth * 3;
                star.dataset.y = (Math.random() - 0.5) * window.innerHeight * 3;
                star.classList.toggle('far', z > maxZ * 0.7);
            } else {
                star.dataset.z = z;
            }
            
            updateStarPosition(star);
        });
        
        requestAnimationFrame(animate);
    }

    // Ovládanie rýchlosti
    window.addEventListener('wheel', (e) => {
        speed = Math.min(50, Math.max(0, speed + e.deltaY * 0.1));
        speedInfo.textContent = `Rýchlosť: ${Math.round(speed/50*100)}%`;
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('resize', () => {
        stars.forEach(updateStarPosition);
    });

    createStars();
    animate();
});