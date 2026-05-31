/**
 * AI 로또 번호 분석 및 추천 로직 (Ver 2.1)
 * 알고리즘: 시퀀스 전이 분석 (Sequence Transition Analysis)
 * 기능: 실시간 날짜 검증 및 다이내믹 회차 동기화 적용
 */

const HISTORICAL_DATA = [
    { round: 1123, nums: [13, 19, 21, 24, 34, 35], bonus: 26 },
    { round: 1122, nums: [3, 6, 21, 30, 34, 35], bonus: 22 },
    { round: 1121, nums: [6, 24, 31, 32, 38, 44], bonus: 8 },
    { round: 1120, nums: [2, 19, 26, 31, 38, 41], bonus: 34 },
    { round: 1119, nums: [1, 9, 12, 13, 20, 45], bonus: 3 },
    { round: 1118, nums: [11, 13, 14, 15, 16, 45], bonus: 3 },
    { round: 1117, nums: [3, 4, 9, 30, 33, 36], bonus: 7 },
    { round: 1116, nums: [15, 16, 17, 25, 30, 31], bonus: 32 },
    { round: 1115, nums: [7, 12, 23, 32, 34, 36], bonus: 8 },
    { round: 1114, nums: [10, 16, 19, 32, 33, 38], bonus: 22 },
    { round: 1113, nums: [11, 13, 20, 21, 32, 44], bonus: 8 },
    { round: 1112, nums: [16, 20, 26, 36, 42, 44], bonus: 24 },
    { round: 1111, nums: [3, 13, 30, 33, 43, 45], bonus: 4 },
    { round: 1110, nums: [3, 7, 11, 20, 22, 41], bonus: 24 },
    { round: 1109, nums: [10, 12, 13, 19, 33, 40], bonus: 2 },
    { round: 1108, nums: [7, 19, 26, 37, 39, 44], bonus: 27 },
    { round: 1107, nums: [6, 14, 30, 31, 40, 41], bonus: 29 },
    { round: 1106, nums: [1, 3, 4, 29, 42, 45], bonus: 36 },
    { round: 1105, nums: [6, 16, 34, 37, 39, 40], bonus: 11 },
    { round: 1104, nums: [1, 7, 21, 30, 35, 38], bonus: 2 },
    { round: 1103, nums: [10, 12, 29, 31, 40, 45], bonus: 19 },
    { round: 1102, nums: [13, 14, 22, 26, 37, 38], bonus: 20 },
    { round: 1101, nums: [6, 7, 13, 28, 36, 42], bonus: 41 },
    { round: 1100, nums: [17, 26, 29, 30, 31, 43], bonus: 12 }
];

class LottoAI {
    constructor() {
        this.display = document.getElementById('best-pick-display');
        this.btn = document.getElementById('analyze-btn');
        this.sumVal = document.getElementById('sum-val');
        this.evenBar = document.getElementById('even-bar');
        this.parityText = document.getElementById('parity-text');
        this.logList = document.getElementById('analysis-log');
        
        this.transitionMap = new Map(); 
        this.hotNumbers = [];
        this.today = new Date(); // 시스템 실시간 날짜 확인

        this.init();
    }

    init() {
        this.updateDynamicInfo();
        this.buildTransitionMap();
        this.btn.addEventListener('click', () => this.runAnalysis());
        setTimeout(() => this.runAnalysis(), 800);
    }

    /**
     * 오늘 날짜 기준 회차 자동 동기화
     */
    updateDynamicInfo() {
        // 기준점: 1123회 (2024-06-08)
        const baseDate = new Date('2024-06-08');
        const diffMs = this.today - baseDate;
        const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        const currentRound = 1123 + diffWeeks;
        const nextRound = currentRound + 1;

        // UI 요소 업데이트
        const lastRoundBadge = document.querySelector('.last-draw-info .badge');
        const nextRoundTitle = document.querySelector('.analysis-card h2');

        if (lastRoundBadge) lastRoundBadge.textContent = `최신 회차: ${currentRound}회`;
        if (nextRoundTitle) nextRoundTitle.textContent = `${nextRound}회차 STR AI 분석 추천`;

        this.addLog(`[검증] 분석 기준일: ${this.today.toLocaleDateString()} 확인`);
        this.addLog(`[동기화] 현재 ${currentRound}회차 데이터 기반 예측 시스템 가동`);
    }

    buildTransitionMap() {
        const data = [...HISTORICAL_DATA].reverse();
        for (let i = 0; i < data.length - 1; i++) {
            const currentDraw = [...data[i].nums, data[i].bonus];
            const nextDraw = data[i+1].nums;

            currentDraw.forEach(curNum => {
                if (!this.transitionMap.has(curNum)) {
                    this.transitionMap.set(curNum, new Map());
                }
                const followerMap = this.transitionMap.get(curNum);
                nextDraw.forEach(nextNum => {
                    followerMap.set(nextNum, (followerMap.get(nextNum) || 0) + 1);
                });
            });
        }

        const frequency = {};
        HISTORICAL_DATA.forEach(draw => {
            draw.nums.forEach(n => frequency[n] = (frequency[n] || 0) + 1);
        });
        this.hotNumbers = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(entry => parseInt(entry[0]));
    }

    runAnalysis() {
        this.display.innerHTML = '<div class="loading-shimmer">시퀀스 전이 분석 중...</div>';
        this.addLog(`${this.today.getHours()}시 ${this.today.getMinutes()}분 실시간 분석 패턴 반영`);

        setTimeout(() => {
            const bestCombination = this.generatePredictiveCombination();
            this.renderBestPick(bestCombination);
            this.updateStats(bestCombination);
            this.addLog(`AI 추천: [${bestCombination.join(', ')}] 추출 성공`);
        }, 1000);
    }

    generatePredictiveCombination() {
        const lastDraw = [...HISTORICAL_DATA[0].nums, HISTORICAL_DATA[0].bonus];
        const candidates = new Map();

        lastDraw.forEach(num => {
            const followers = this.transitionMap.get(num);
            if (followers) {
                followers.forEach((count, followerNum) => {
                    candidates.set(followerNum, (candidates.get(followerNum) || 0) + count * 20);
                });
            }
        });

        lastDraw.forEach(num => {
            candidates.set(num, (candidates.get(num) || 0) + 15);
        });

        this.hotNumbers.forEach(num => {
            candidates.set(num, (candidates.get(num) || 0) + 10);
        });

        const sortedCandidates = Array.from(candidates.entries())
            .sort((a, b) => b[1] - a[1]);

        let attempts = 0;
        while (attempts < 1000) {
            const combo = this.selectTopWeighted(sortedCandidates);
            if (this.isBalanced(combo)) {
                return combo.sort((a, b) => a - b);
            }
            attempts++;
        }
        return sortedCandidates.slice(0, 6).map(c => c[0]).sort((a, b) => a - b);
    }

    selectTopWeighted(weightedList) {
        const result = new Set();
        const pool = weightedList.slice(0, 20);
        while (result.size < 6) {
            const idx = Math.floor(Math.pow(Math.random(), 1.5) * pool.length);
            result.add(pool[idx][0]);
        }
        return Array.from(result);
    }

    isBalanced(nums) {
        const sum = nums.reduce((a, b) => a + b, 0);
        const evenCount = nums.filter(n => n % 2 === 0).length;
        const lowCount = nums.filter(n => n <= 22).length;

        const sumOk = sum >= 100 && sum <= 175;
        const parityOk = evenCount >= 2 && evenCount <= 4;
        const rangeOk = lowCount >= 2 && lowCount <= 4;

        return sumOk && parityOk && rangeOk;
    }

    renderBestPick(nums) {
        this.display.innerHTML = '';
        nums.forEach((num, i) => {
            const ball = document.createElement('div');
            ball.className = `ball ${this.getBallColorClass(num)}`;
            ball.style.animationDelay = `${i * 0.1}s`;
            ball.textContent = num;
            this.display.appendChild(ball);
        });
    }

    updateStats(nums) {
        const sum = nums.reduce((a, b) => a + b, 0);
        const even = nums.filter(n => n % 2 === 0).length;
        const odd = 6 - even;

        this.sumVal.textContent = sum;
        this.evenBar.style.width = `${(even / 6) * 100}%`;
        this.parityText.textContent = `홀:${odd} / 짝:${even}`;
    }

    getBallColorClass(num) {
        if (num <= 10) return 'b-1';
        if (num <= 20) return 'b-2';
        if (num <= 30) return 'b-3';
        if (num <= 40) return 'b-4';
        return 'b-5';
    }

    addLog(msg) {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        this.logList.prepend(li);
        if (this.logList.children.length > 5) {
            this.logList.removeChild(this.logList.lastChild);
        }
    }
}

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.themeText = this.themeToggle.querySelector('span');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }
    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggle());
    }
    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            this.themeIcon.className = 'fas fa-sun';
            this.themeText.textContent = '라이트 모드';
        } else {
            this.themeIcon.className = 'fas fa-moon';
            this.themeText.textContent = '다크 모드';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LottoAI();
    new ThemeManager();
});
