import { mockData } from './data.js';

class KDramovieApp {
    constructor() {
        this.currentCategory = 'trending';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.movieGrid = document.getElementById('movie-grid');
        this.searchInput = document.getElementById('search-input');
        this.navItems = document.querySelectorAll('nav ul li');
        this.modal = document.getElementById('details-modal');
        this.closeBtn = document.querySelector('.close-btn');
        this.header = document.querySelector('header');
        this.sectionTitle = document.getElementById('section-title');
    }

    bindEvents() {
        // Scroll header effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.currentCategory = item.dataset.category;
                this.sectionTitle.textContent = item.textContent;
                this.render();
            });
        });

        // Modal close
        this.closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    getFilteredData() {
        let data = [...mockData];

        if (this.currentCategory !== 'trending') {
            data = data.filter(item => item.type === this.currentCategory);
        }

        if (this.searchQuery) {
            data = data.filter(item => 
                item.title.toLowerCase().includes(this.searchQuery) ||
                item.overview.toLowerCase().includes(this.searchQuery)
            );
        }

        return data;
    }

    render() {
        const data = this.getFilteredData();
        this.movieGrid.innerHTML = '';

        if (data.length === 0) {
            this.movieGrid.innerHTML = '<p class="no-results">No titles found matching your search.</p>';
            return;
        }

        data.forEach(item => {
            const card = this.createMovieCard(item);
            this.movieGrid.appendChild(card);
        });
    }

    createMovieCard(item) {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `
            <img src="${item.poster}" alt="${item.title}" loading="lazy">
            <div class="card-info">
                <h3>${item.title}</h3>
                <span class="rating"><i class="fas fa-star"></i> ${item.rating}</span>
            </div>
        `;
        div.addEventListener('click', () => this.openModal(item));
        return div;
    }

    openModal(item) {
        document.getElementById('modal-poster').src = item.poster;
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-rating').innerHTML = `<i class="fas fa-star"></i> ${item.rating}`;
        document.getElementById('modal-date').textContent = item.date;
        document.getElementById('modal-type').textContent = item.type === 'tv' ? 'TV Show' : 'Movie';
        document.getElementById('modal-overview').textContent = item.overview;

        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new KDramovieApp();
});
