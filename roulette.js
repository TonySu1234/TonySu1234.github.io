class RouletteGame {
    constructor() {
        this.numbers = Array.from({length: 37}, (_, i) => i); // 0-36
        this.balance = 1000;
        this.currentBets = new Map();
        this.selectedChipValue = null;
        this.isSpinning = false;

        this.initializeWheel();
        this.initializeNumberGrid();
        this.initializeControls();
    }

    initializeWheel() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawWheel();
    }

    drawWheel() {
        const ctx = this.ctx;
        const centerX = 150;
        const centerY = 150;
        const radius = 140;

        // Draw wheel segments
        this.numbers.forEach((number, index) => {
            const startAngle = (index * 2 * Math.PI) / 37;
            const endAngle = ((index + 1) * 2 * Math.PI) / 37;
            const color = this.getNumberColor(number);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            // Add numbers
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + (endAngle - startAngle) / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(number.toString(), radius - 10, 4);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    getNumberColor(number) {
        if (number === 0) return '#0f9d58';
        const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        return redNumbers.includes(number) ? '#C41E3A' : '#1a1a1a';
    }

    initializeNumberGrid() {
        const grid = document.querySelector('.number-grid');
        // Clear existing content
        grid.innerHTML = '';

        // Create grid in reverse order (36 to 1)
        for (let i = 36; i > 0; i--) {
            const cell = document.createElement('div');
            cell.className = `number-cell ${this.getNumberColor(i) === '#C41E3A' ? 'red' : 'black'}`;
            cell.textContent = i;
            cell.dataset.number = i;
            cell.addEventListener('click', () => this.placeBet(i));
            grid.appendChild(cell);
        }

        // Add zero
        const zeroCell = document.createElement('div');
        zeroCell.className = 'number-cell';
        zeroCell.style.backgroundColor = '#0f9d58';
        zeroCell.textContent = '0';
        zeroCell.dataset.number = '0';
        zeroCell.addEventListener('click', () => this.placeBet(0));
        grid.appendChild(zeroCell);
    }

    initializeControls() {
        // Chip selection
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => this.selectChip(parseInt(chip.dataset.value)));
        });

        // Betting options
        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', () => this.placeBet(option.dataset.bet));
        });

        // Spin button
        document.getElementById('spinButton').addEventListener('click', () => this.spin());

        // Clear bets button
        document.getElementById('clearBets').addEventListener('click', () => this.clearBets());

        this.updateBalance();
    }

    selectChip(value) {
        this.selectedChipValue = value;
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.toggle('selected', parseInt(chip.dataset.value) === value);
        });
    }

    placeBet(bet) {
        if (!this.selectedChipValue || this.isSpinning) return;
        if (this.selectedChipValue > this.balance) {
            alert('Insufficient funds!');
            return;
        }

        const betKey = bet.toString();
        const currentBet = this.currentBets.get(betKey) || 0;
        this.currentBets.set(betKey, currentBet + this.selectedChipValue);
        this.balance -= this.selectedChipValue;
        this.updateBalance();
        this.updateBetDisplay(bet);
    }

    updateBetDisplay(bet) {
        const betAmount = this.currentBets.get(bet.toString());
        let element;
        
        if (typeof bet === 'number') {
            element = document.querySelector(`.number-cell[data-number="${bet}"]`);
        } else {
            element = document.querySelector(`.bet-option[data-bet="${bet}"]`);
        }

        if (element) {
            let betDisplay = element.querySelector('.bet-amount');
            if (!betDisplay) {
                betDisplay = document.createElement('div');
                betDisplay.className = 'bet-amount';
                element.appendChild(betDisplay);
            }
            betDisplay.textContent = `$${betAmount}`;
        }
    }

    async spin() {
        if (this.isSpinning || this.currentBets.size === 0) return;
        this.isSpinning = true;
        document.getElementById('spinButton').disabled = true;

        // Animate wheel
        const spins = 5;
        const frames = 360;
        const winningNumber = Math.floor(Math.random() * 37);
        const totalRotation = (spins * 360) + (winningNumber * (360 / 37));
        
        for (let i = 0; i <= frames; i++) {
            const rotation = (i / frames) * totalRotation;
            this.rotateWheel(rotation);
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.processResult(winningNumber);
    }

    rotateWheel(degrees) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, 300, 300);
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.translate(-150, -150);
        this.drawWheel();
        ctx.restore();
    }

    processResult(winningNumber) {
        const winnings = this.calculateWinnings(winningNumber);
        this.balance += winnings;
        this.updateBalance();
        
        setTimeout(() => {
            alert(`Number ${winningNumber}! You ${winnings > 0 ? 'won $' + winnings : 'lost'}`);
            this.clearBets();
            this.isSpinning = false;
            document.getElementById('spinButton').disabled = false;
        }, 500);
    }

    calculateWinnings(winningNumber) {
        let winnings = 0;
        
        this.currentBets.forEach((amount, bet) => {
            if (bet === winningNumber.toString()) {
                winnings += amount * 35; // Straight up bet
            } else if (bet === 'red' && this.getNumberColor(winningNumber) === '#C41E3A') {
                winnings += amount * 2;
            } else if (bet === 'black' && this.getNumberColor(winningNumber) === '#1a1a1a') {
                winnings += amount * 2;
            } else if (bet === 'even' && winningNumber % 2 === 0 && winningNumber !== 0) {
                winnings += amount * 2;
            } else if (bet === 'odd' && winningNumber % 2 === 1) {
                winnings += amount * 2;
            } else if (bet === '1-18' && winningNumber >= 1 && winningNumber <= 18) {
                winnings += amount * 2;
            } else if (bet === '19-36' && winningNumber >= 19 && winningNumber <= 36) {
                winnings += amount * 2;
            }
        });

        return winnings;
    }

    clearBets() {
        this.currentBets.clear();
        document.querySelectorAll('.bet-amount').forEach(el => el.remove());
    }

    updateBalance() {
        document.getElementById('balance').textContent = this.balance;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Roulette game initializing...');
    new RouletteGame();
    console.log('Roulette game initialized');
});
