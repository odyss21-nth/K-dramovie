/**
 * AI 로또 번호 분석 및 추천 로직
 * 데이터 출처: 1121~1123회차 실데이터 반영
 */

const HISTORICAL_DATA = [
    { round: 1123, nums: [13, 19, 21, 24, 34, 35], bonus: 26 },
    { round: 1122, nums: [3, 6, 21, 30, 34, 35], bonus: 22 },
    { round: 1121, nums: [6, 24, 31, 32, 38, 44], bonus: 8 }
];

class LottoAI {
    constructor() {
        this.display = document.getElementById('best-pick-display');
        this.btn = document.getElementById('analyze-btn');
        this.sumVal = document.getElementById('sum-val');
        this.evenBar = document.getElementById('even-bar');
        this.parityText = document.getElementById('parity-text');
        
        this.init();
    }

    init() {
        this.btn.addEventListener('click', () => this.runAnalysis());
        // 초기 자동 분석 실행
        setTimeout(() => this.runAnalysis(), 800);
    }

    /**
     * 분석 실행 엔진
     */
    runAnalysis() {
        this.display.innerHTML = '<div class="loading-shimmer">패턴 분석 중...</div>';
        
        setTimeout(() => {
            const bestCombination = this.generateOptimalCombination();
            this.renderBestPick(bestCombination);
            this.updateStats(bestCombination);
        }, 1000);
    }

    /**
     * 최적의 조합 생성 (패턴 알고리즘)
     */
    generateOptimalCombination() {
        let attempts = 0;
        while (attempts < 1000) {
            const combo = this.getRandomCombo();
            if (this.isBalanced(combo)) {
                return combo.sort((a, b) => a - b);
            }
            attempts++;
        }
        return this.getRandomCombo().sort((a, b) => a - b);
    }

    getRandomCombo() {
        const nums = new Set();
        // 최근 빈출 번호(Hot)에 가중치 부여 (가상)
        const hotNumbers = [6, 21, 24, 34, 35]; 
        
        while (nums.size < 6) {
            // 20% 확률로 Hot 넘버에서 추출
            if (Math.random() < 0.2 && hotNumbers.length > 0) {
                nums.add(hotNumbers[Math.floor(Math.random() * hotNumbers.length)]);
            } else {
                nums.add(Math.floor(Math.random() * 45) + 1);
            }
        }
        return Array.from(nums);
    }

    /**
     * 패턴 밸런스 체크 (홀짝, 총합, 고저)
     */
    isBalanced(nums) {
        const sum = nums.reduce((a, b) => a + b, 0);
        const evenCount = nums.filter(n => n % 2 === 0).length;
        const lowCount = nums.filter(n => n <= 22).length;

        // 1. 총합 범위: 100 ~ 170 (가장 빈번한 구간)
        const sumOk = sum >= 100 && sum <= 170;
        // 2. 홀짝 비율: 2:4, 3:3, 4:2 중 하나
        const parityOk = evenCount >= 2 && evenCount <= 4;
        // 3. 고저 비율: 2:4, 3:3, 4:2 중 하나
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
        this.parityText.textContent = `홀:${odd} / 짝:${even} (${odd === even ? '황금밸런스' : '안정적'})`;
    }

    getBallColorClass(num) {
        if (num <= 10) return 'b-1';
        if (num <= 20) return 'b-2';
        if (num <= 30) return 'b-3';
        if (num <= 40) return 'b-4';
        return 'b-5';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LottoAI();
});
