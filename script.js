document.addEventListener('DOMContentLoaded', function() {
    const starfield = document.getElementById('starfield');
    const speedInfo = document.getElementById('speed-info');
    const stars = [];
    const starCount = 1500;
    let speed = 0;
    let maxZ = 5000;
    
    // Načítať obrázok vopred pre lepší výkon
    const starImage = new Image();
    starImage.src = 'https://i.ibb.co/XGzqjyN/66c00b19-2931-4258-9b3e-a4f55c3ce066-removebg-preview.png';

    function createStars() {
        for (let i = 0; i < starCount; i++) {
            addStar(Math.random() * maxZ);
        }
    }

    function addStar(z) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const x = (Math.random() - 0.5) * window.innerWidth * 3;
        const y = (Math.random() - 0.5) * window.innerHeight * 3;
        const sizeMultiplier = 0.2 + Math.random() * 0.8;
        
        star.dataset.x = x;
        star.dataset.y = y;
        star.dataset.z = z;
        star.dataset.size = sizeMultiplier;
        star.dataset.boost = Math.random() > 0.9 ? 2 : 1;
        
        if (z > maxZ * 0.7) {
            star.classList.add('far');
        }
        
        starfield.appendChild(star);
        stars.push(star);
        updateStarPosition(star);
    }

    function updateStarPosition(star) {
        const z = parseFloat(star.dataset.z);
        const boost = parseFloat(star.dataset.boost);
        const sizeBase = parseFloat(star.dataset.size);
        
        let scale = Math.min(30, 2000 / z) * boost * sizeBase;
        if (z < 500 && boost > 1) {
            scale *= 1 + (500 - z)/500 * 3;
        }
        
        const size = Math.max(10, scale);
        const opacity = Math.min(1, 1.5 - z/maxZ);
        
        const x = (parseFloat(star.dataset.x) / z * 1000 + window.innerWidth/2;
        const y = (parseFloat(star.dataset.y) / z * 1000 + window.innerHeight/2;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.opacity = opacity;
        star.style.filter = `brightness(${1 + (1 - z/maxZ)})`;
    }

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

    window.addEventListener('wheel', (e) => {
        speed = Math.min(50, Math.max(0, speed + e.deltaY * 0.1));
        speedInfo.textContent = `Rýchlosť: ${Math.round(speed/50*100)}%`;
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('resize', () => {
        stars.forEach(updateStarPosition);
    });

    // Počkáme na načítanie obrázka
    starImage.onload = function() {
        createStars();
        animate();
    };
});
