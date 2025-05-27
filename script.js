document.addEventListener('DOMContentLoaded', function() {
    const starfield = document.getElementById('starfield');
    const speedInfo = document.getElementById('speed-info');
    const stars = [];
    const starCount = 400; // Znížený počet
    let speed = 0;
    let maxZ = 4000; // Kratší tunel pre lepší efekt
    
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
        
        // Širšie rozloženie
        const x = (Math.random() - 0.5) * window.innerWidth * 4;
        const y = (Math.random() - 0.5) * window.innerHeight * 4;
        
        // Väčšie rozdiely vo veľkosti
        const sizeMultiplier = 0.5 + Math.random() * 1.5;
        
        star.dataset.x = x;
        star.dataset.y = y;
        star.dataset.z = z;
        star.dataset.size = sizeMultiplier;
        star.dataset.boost = Math.random() > 0.85 ? 3 : 1; // 15% šanca na boost
        
        if (z > maxZ * 0.6) {
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
        
        // Výraznejšie zväčšovanie
        let scale = Math.min(50, 1500 / z) * boost * sizeBase;
        if (z < 400 && boost > 1) {
            scale *= 1 + (400 - z)/400 * 4;
        }
        
        const size = Math.max(20, scale); // Minimálna veľkosť väčšia
        const opacity = Math.min(1, 2 - z/maxZ);
        
        const x = (parseFloat(star.dataset.x) / z * 1000 + window.innerWidth/2;
        const y = (parseFloat(star.dataset.y) / z * 1000 + window.innerHeight/2;
        
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.opacity = opacity;
        star.style.filter = `brightness(${1 + (1.5 - z/maxZ)}) drop-shadow(0 0 5px rgba(255, 255, 255, ${opacity*0.7}))`;
    }

    function animate() {
        stars.forEach(star => {
            let z = parseFloat(star.dataset.z) - speed;
            
            if (z < 30) {
                z = maxZ;
                star.dataset.z = z;
                star.dataset.x = (Math.random() - 0.5) * window.innerWidth * 4;
                star.dataset.y = (Math.random() - 0.5) * window.innerHeight * 4;
                star.classList.toggle('far', z > maxZ * 0.6);
            } else {
                star.dataset.z = z;
            }
            
            updateStarPosition(star);
        });
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('wheel', (e) => {
        speed = Math.min(60, Math.max(0, speed + e.deltaY * 0.15));
        speedInfo.textContent = `Rýchlosť: ${Math.round(speed/60*100)}%`;
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('resize', () => {
        stars.forEach(updateStarPosition);
    });

    starImage.onload = function() {
        createStars();
        animate();
    };
});
