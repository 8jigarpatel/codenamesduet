(function() {
    var seed;
    var sides = [];
    var flips = document.querySelectorAll('.flip');
    var game = document.getElementById('game');
    var boxes = document.querySelectorAll('.box');

    for (var flip of flips) {
        flip.addEventListener('click', function() {
            setFlip(this.classList.contains('active') ? -1 : this.value);
        });
    }

    game.addEventListener('focus', function() {
        this.value = '';
    });
    game.addEventListener('blur', function() {
        this.value = seed;
    });
    game.addEventListener('change', function() {
        if (this.value) {
            setGame(this.value);
            setFlip(1);
            setTimeout(function() {
                game.blur();
            }, 0);
        }
    });

    document.getElementById('new').addEventListener('click', function() {
        setGame(Math.floor(Math.random() * 1000));
        setFlip(0);
    });

    setGame(localStorage.getItem('game') || Math.floor(Math.random() * 1000));
    setFlip(localStorage.getItem('flip') || 0);

    function setGame(value) {
        seed = game.value = value;
        sides[0] = shuffle([...Array(25).keys()]);
        sides[1] = mirrorCard(sides[0]);
        seed = value;
        localStorage.setItem('game', value);
    }

    function setFlip(value) {
        for (var i = 0; i < 25; i++) {
            boxes[i].className = 'box';
        }
        for (var flip of flips) {
            flip.classList.remove('active');
            flip.disabled = false;
        }
        if (value != -1) {
            flips[value].classList.add('active');
            flips[value^1].disabled = true;
            var arr = sides[value];
            for (var i = 0; i < 9; i++) {
                boxes[arr[i]].classList.add('green');
            }
            for (var i = 9; i < 12; i++) {
                boxes[arr[i]].classList.add('black');
            }
        }
        localStorage.setItem('flip', value);
    }

    function mirrorCard(arr) {
        var otherSide = new Array(25);
        for (var i = 0; i < 25; i++) {
            otherSide[i] = 24 - arr[i];
        }
        otherSide[10] = otherSide[0];
        for (var i = 11; i < 17; i++) {
            otherSide[i - 11] = otherSide[i];
        }
        otherSide[11] = otherSide[18];
        return otherSide;
    }

    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    // a seedable randomization function
    function random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
})();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
