(function () {
    let seed;
    let rng;
    let sides = [];
    const flips = document.querySelectorAll('.flip');
    const game = document.getElementById('game');
    const boxes = document.querySelectorAll('.box');

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
        rng = mulberry32(seed);

        // Step 1: select shared cards
        const allIndices = [...Array(25).keys()];
        const shuffled = shuffle(allIndices);

        const sharedGreens = shuffled.slice(0, 3);            // 3 overlapping green cards
        const sharedAssassin = shuffled.find(i => !sharedGreens.includes(i)); // 1 overlapping assassin

        // Step 2: remaining indices (exclude shared)
        let remaining = allIndices.filter(i => !sharedGreens.includes(i) && i !== sharedAssassin);
        remaining = shuffle(remaining);

        // Step 3: assign 6 unique greens per side
        const sideA_uniqueGreens = remaining.slice(0, 6);
        const sideB_uniqueGreens = remaining.slice(6, 12);

        // Step 4: assign 2 unique assassins per side
        const sideA_uniqueAssassins = remaining.slice(12, 14);
        const sideB_uniqueAssassins = remaining.slice(14, 16);

        // Step 5: combine shared + unique for each side
        const sideA = {
            green: [...sharedGreens, ...sideA_uniqueGreens],
            black: [sharedAssassin, ...sideA_uniqueAssassins]
        };
        const sideB = {
            green: [...sharedGreens, ...sideB_uniqueGreens],
            black: [sharedAssassin, ...sideB_uniqueAssassins]
        };

        sides[0] = sideA;
        sides[1] = sideB;

        localStorage.setItem('game', value);
        game.value = value;
    }

    function setFlip(value) {
        // reset all boxes
        boxes.forEach(b => (b.className = 'box'));

        // update flip buttons
        flips.forEach(f => {
            f.classList.remove('active');
            f.disabled = false;
        });

        if (value != -1) {
            flips[value].classList.add('active');
            flips[value ^ 1].disabled = true;

            const side = sides[value];

            // apply greens
            side.green.forEach(i => boxes[i].classList.add('green'));

            // apply blacks
            side.black.forEach(i => boxes[i].classList.add('black'));
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
