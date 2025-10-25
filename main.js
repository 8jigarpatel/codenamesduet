(function () {
    let seed;
    let rng;
    let sides = [];
    const flips = document.querySelectorAll('.flip');
    const game = document.getElementById('game');
    const boxes = document.querySelectorAll('.box');
    const debugFlag = true;

    // --- UI bindings ---
    for (const flip of flips) {
        flip.addEventListener('click', function () {
            setFlip(this.classList.contains('active') ? -1 : this.value);
        });
    }

    game.addEventListener('focus', function () {
        this.value = '';
    });
    game.addEventListener('blur', function () {
        this.value = seed;
    });
    game.addEventListener('change', function () {
        if (this.value) {
            setGame(this.value);
            setFlip(1);
            setTimeout(() => game.blur(), 0);
        }
    });

    document.getElementById('new').addEventListener('click', function () {
        setGame(Math.floor(Math.random() * 100000));
        setFlip(0);
    });

    // --- Initialization ---
    setGame(localStorage.getItem('game') || Math.floor(Math.random() * 100000));
    setFlip(localStorage.getItem('flip') || 0);

    // --- Core functions ---

    function setGame(value) {
        seed = parseInt(value);
        rng = mulberry32(seed); // deterministic PRNG

        // Base shuffled indices
        const allIndices = [...Array(25).keys()];
        const shuffled = shuffle(allIndices);

        // Step 1: pick overlapping cards
        const sharedGreens = shuffled.slice(0, 3);   // 3 shared green agents
        const sharedAssassin = shuffled[3];          // 1 shared assassin

        // Step 2: generate both sides
        const sideA = generateSide(sharedGreens, sharedAssassin);
        const sideB = generateSide(sharedGreens, sharedAssassin);

        sides[0] = sideA;
        sides[1] = sideB;

        localStorage.setItem('game', value);
        game.value = value;
    }

    function generateSide(sharedGreens, sharedAssassin) {
        const indices = shuffle([...Array(25).keys()]);
        const greens = new Set(sharedGreens);
        const blacks = new Set([sharedAssassin]);

        // Add 6 unique greens (9 total)
        for (let i = 0; greens.size < 9; i++) {
            const idx = indices[i];
            if (!greens.has(idx) && !blacks.has(idx)) greens.add(idx);
        }

        // Add 2 more assassins unique to this side (3 total)
        for (let i = 0; blacks.size < 3; i++) {
            const idx = indices[greens.size + i];
            if (!greens.has(idx)) blacks.add(idx);
        }

        return { green: [...greens], black: [...blacks] };
    }

    function setFlip(value) {
        boxes.forEach(b => (b.className = 'box'));
        flips.forEach(f => {
            f.classList.remove('active');
            f.disabled = false;
        });

        if (value != -1) {
            flips[value].classList.add('active');
            flips[value ^ 1].disabled = true;

            const side = sides[value];
            const debug = debugFlag;

            // apply greens
            side.green.forEach(i => {
                boxes[i].classList.add('green');

                // DEBUG: highlight shared green cards in orange
                if (debug) {
                    const otherSide = sides[value ^ 1];
                    if (otherSide.green.includes(i)) {
                        boxes[i].classList.add('debug-shared');
                    }
                }
            });

            // apply blacks
            side.black.forEach(i => boxes[i].classList.add('black'));

            // DEBUG: highlight shared assassin in red border
            if (debug) {
                const otherSide = sides[value ^ 1];
                side.black.forEach(i => {
                    if (otherSide.black.includes(i)) {
                        boxes[i].classList.add('debug-shared-assassin');
                    }
                });
            }
        }

        localStorage.setItem('flip', value);
    }


    // --- Helper functions ---

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Deterministic RNG (Mulberry32)
    function mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
})();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
