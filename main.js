class LottoGenerator {
    constructor() {
        this.generateBtn = document.getElementById('generate-btn');
        this.display = document.getElementById('numbers-display');
        this.historyList = document.getElementById('history-list');
        this.history = [];
        
        this.init();
    }

    init() {
        this.generateBtn.addEventListener('click', () => this.generateNumbers());
    }

    generateNumbers() {
        this.display.innerHTML = '';
        const numbers = new Set();
        
        while(numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        
        sortedNumbers.forEach((num, index) => {
            setTimeout(() => {
                this.createBall(num);
            }, index * 150);
        });

        this.addToHistory(sortedNumbers);
    }

    createBall(num) {
        const ball = document.createElement('div');
        ball.className = `ball ${this.getBallColorClass(num)}`;
        ball.textContent = num;
        this.display.appendChild(ball);
    }

    getBallColorClass(num) {
        if (num <= 10) return 'ball-1-10';
        if (num <= 20) return 'ball-11-20';
        if (num <= 30) return 'ball-21-30';
        if (num <= 40) return 'ball-31-40';
        return 'ball-41-45';
    }

    addToHistory(nums) {
        const time = new Date().toLocaleTimeString();
        const item = { time, nums: nums.join(', ') };
        this.history.unshift(item);
        
        if (this.history.length > 5) this.history.pop();
        
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = this.history.map(item => `
            <li class="history-item">
                <span class="history-time">${item.time}</span>
                <span class="history-nums">${item.nums}</span>
            </li>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LottoGenerator();
});
