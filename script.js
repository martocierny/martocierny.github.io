document.addEventListener('DOMContentLoaded', function() {
    const starfield = document.getElementById('starfield');
    const speedDisplay = document.querySelector('#speed span');
    const hyperjumpBtn = document.getElementById('hyperjump');
    const distanceDisplay = document.getElementById('distance');
    const sound = document.getElementById('sound');
    
    const stars = [];
    const starCount = 400;
    let speed = 0;
    let distance = 0;
    let hyperjumpActive = false;
    
    // Vytvorenie hviezd
    function createStars() {
        for(let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Náhodná 3D pozícia
            star.dataset.x = (Math.random() - 0.5) * 3000;
            star.dataset.y = (Math.random() - 0.5) * 3000;
            star.dataset.z = Math.random() * 5000;
            star.dataset.speed = 0.5 + Math.random() * 2;
            
            // Náhodná rotácia
            star.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            starfield.appendChild(star);
            stars.push(star);
        }
    }
    
    // Aktualizácia pozície hviezd
    function updateStars() {
        stars.forEach(star => {
            let z = parseFloat(star.dataset.z) - speed * parseFloat(star.dataset.speed);
            
            // Hyperjump efekt
            if(hyperjumpActive) {
                z -= 50;
                star.style.filter = `hue-rotate(${distance/10}deg) brightness(3)`;
            }
            
            if(z < 0) {
                z = 5000;
                star.dataset.x = (Math.random() - 0.5) * 3000;
                star.dataset.y = (Math.random() - 0.5) * 3000;
                distance += 0.1;
            }
            
            star.dataset.z = z;
            
            // 3D projekcia
            const scale = 1000 / (z + 1000);
            const x = parseFloat(star.dataset.x) * scale + window.innerWidth/2;
            const y = parseFloat(star.dataset.y) * scale + window.innerHeight/2;
            
            star.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${distance * 2}deg)`;
            star.style.opacity = Math.min(1, scale * 2);
        });
        
        distanceDisplay.textContent = `Preleteli ste: ${distance.toFixed(2)} svetelných rokov`;
    }
    
    // Animácia
    function animate() {
        updateStars();
        requestAnimationFrame(animate);
    }
    
    // Ovládanie rýchlosti
    window.addEventListener('wheel', e => {
        speed += e.deltaY * 0.01;
        speed = Math.max(0, Math.min(20, speed));
        speedDisplay.textContent = speed.toFixed(1);
        e.preventDefault();
    }, { passive: false });
    
    // Hyperjump efekt
    hyperjumpBtn.addEventListener('click', function() {
        hyperjumpActive = !hyperjumpActive;
        
        if(hyperjumpActive) {
            sound.currentTime = 0;
            sound.play();
            this.textContent = "ZASTAVIŤ HYPERJUMP";
            document.body.classList.add('hyperjump-active');
        } else {
            this.textContent = "HYPERJUMP!";
            document.body.classList.remove('hyperjump-active');
        }
    });
    
    // Inicializácia
    createStars();
    animate();
    
    // Auto-rotate efekt
    setInterval(() => {
        if(speed > 0) {
            distance += speed * 0.01;
        }
    }, 100);
});
