'use strict';

var GameOfShells = function() {
    this._dom = {
        'ball': document.getElementById('ball'),
        'shell-1': document.getElementById('shell-1'),
        'shell-2': document.getElementById('shell-2'),
        'shell-3': document.getElementById('shell-3')
    }

    this._settings = {
        'difficulty': {
            'easy': {
                'moves': 5,
                'transition': 400
            },
            'medium': {
                'moves': 10,
                'transition': 300
            },
            'hard': {
                'moves': 15,
                'transition': 200
            },
            'extreme': {
                'moves': 30,
                'transition': 100
            }
        },
        'selected_difficulty': 'medium'
    }

    this._vars = {
        'ball_placement': 0,
        'is_moving': false,
        'is_first_guess': false,
        'wins': 0,
        'games': 0
    }

    this._randomise = function(type) {
        if (type === 'ball') {
            return Math.round(Math.random() * (3 - 1)) + 1;
        } else if (type === 'moves') {
            var moves_array = [];
            for (var i = 0; i < this._settings.difficulty[this._settings.selected_difficulty].moves; i++) {
                var rand = Math.round(Math.random() * (2 - 1)) + 1;
                moves_array.push(rand === 1 ? 'left' : 'right');
            }
            return moves_array;
        }
    }

    this.init = function() {
        this.setup();

        // set all event listeners
        this._dom['shell-1'].addEventListener('click', function() { this.peak(1) }.bind(this));
        this._dom['shell-2'].addEventListener('click', function() { this.peak(2) }.bind(this));
        this._dom['shell-3'].addEventListener('click', function() { this.peak(3) }.bind(this));

        document.getElementById('reset').addEventListener('click', function() {
            this.setup();
        }.bind(this));

        document.getElementById('shake').addEventListener('click', function() {
            if (!this._vars.is_moving) {
                this.shake();
            }
        }.bind(this));

        document.getElementById('difficulty').addEventListener('change', function() {
            this.set_difficulty(this.value);
        }.bind(this));
    }

    this.setup = function() {
        this._vars.ball_placement = this._randomise('ball');

        for (var i = 1; i < 4; i++) {
            this._dom['shell-' + i].classList.remove('pos-1', 'pos-2', 'pos-3');
            this._dom['shell-' + i].classList.add('pos-' + i);
        }

        // place the ball
        this._dom.ball.classList.remove('pos-1', 'pos-2', 'pos-3');
        this._dom.ball.classList.add('pos-' + this._vars.ball_placement);

        this.peak();
    }

    this.set_difficulty = function(difficulty) {
        if (difficulty === 'easy' ||
            difficulty === 'medium' ||
            difficulty === 'hard' ||
            difficulty === 'extreme') {
            this._settings.selected_difficulty = difficulty;
        }
    }

    this.peak = function(force) {
        var is_forced = !isNaN(force) && force > 0 && force < 4,
            shell = 'shell-' + (is_forced ? force : this._vars.ball_placement);

        setTimeout(function() {
            this._dom[shell].classList.add('lift');
        }.bind(this), is_forced ? 0 : 300);

        if (this._vars.is_first_guess) {
            if (force === this._vars.ball_placement) {
                this._vars.wins++;
            }

            this._vars.games++;
            this._vars.is_first_guess = false;

            document.getElementById('wins').innerHTML = this._vars.wins + ' wins';
            document.getElementById('games').innerHTML = this._vars.games + ' games';
        }

        setTimeout(function() {
            this._dom[shell].classList.remove('lift');
        }.bind(this), 800);
    }

    this.shake = function() {
        // set speed, depending on selected difficulty
        for (var i = 1; i < 4; i++) {
            this._dom['shell-' + i].style.transition = 'all ' + this._settings.difficulty[this._settings.selected_difficulty].transition / 1000 + 's ease';
        }
       
        this._dom.ball.classList.add('is-hidden');

        var moves = this._randomise('moves'),
            iter = 0;

        this.shake.do_move = function() {

            // make sure this has time to finish before next shake
            this._vars.is_moving = true;

            if (iter === moves.length) {
                // place the ball in the right place
                var shell_class_list = document.getElementById('shell-' + this._vars.ball_placement).classList;

                for (var i = 0; i < shell_class_list.length; i++) {
                    if (!shell_class_list[i].indexOf('pos-')) {
                        this._dom.ball.classList.remove('pos-1', 'pos-2', 'pos-3', 'is-hidden');
                        this._dom.ball.classList.add('pos-' + shell_class_list[i].split('-')[1]);
                    }
                }

                // reset transition to standard value (from stylesheet)
                for (var i = 1; i < 4; i++) {
                    if (this._dom['shell-' + i].style.removeProperty) {
                        this._dom['shell-' + i].style.removeProperty('transition');
                    } else {
                        this._dom['shell-' + i].style.removeAttribute('transition');
                    }
                }

                this._vars.is_moving = false;

                // give one shot at guessing
                this._vars.is_first_guess = true;

                clearInterval(window.timer);
                return;
            }

            if (moves[iter] === 'left') {
                // swap first and second cups
                var shell_out = document.getElementsByClassName('shell pos-1')[0],
                    shell_in = document.getElementsByClassName('shell pos-2')[0];

                shell_in.classList.remove('pos-2');
                shell_out.classList.remove('pos-1');
                shell_in.classList.add('pos-1');
                shell_out.classList.add('pos-2');
            } else {
                // swap second and third cups
                var shell_out = document.getElementsByClassName('shell pos-3')[0],
                    shell_in = document.getElementsByClassName('shell pos-2')[0];

                shell_in.classList.remove('pos-2');
                shell_out.classList.remove('pos-3');
                shell_in.classList.add('pos-3');
                shell_out.classList.add('pos-2');
            }

            iter++;
        }.bind(this)

        window.timer = setInterval(this.shake.do_move, this._settings.difficulty[this._settings.selected_difficulty].transition * 1.5);
    }
}
