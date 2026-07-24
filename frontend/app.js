// ==========================================================================
// CookWithPrem — Frontend Logic (Plain Vanilla JavaScript)
// ==========================================================================

let recipes = [];
let filteredRecipes = [];
let categories = [];
let currentCategory = 'all';
let searchQuery = '';
let currentRecipeIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    // Parse URL parameter to check for categories passed from Home Page
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const recipeParam = urlParams.get('recipe');
    
    if (catParam) {
        currentCategory = catParam.toLowerCase();
    }

    setupEventListeners();
    initScrollReveal();
    initCarousel3D();
    initHeroParallax();
    initCategory3DTilt();
    await loadCategories();
    await loadRecipes(recipeParam);
}

// Initialize IntersectionObserver for scroll animations
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    // Make a global observer so we can observe dynamic elements later
    window.scrollObserver = observer;

    // Animated number counter for stat cards
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'), 10);
                let current = 0;
                const duration = 1500;
                const step = Math.ceil(target / (duration / 30));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current;
                }, 30);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));
}

function setupEventListeners() {
    // Search input event
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Book Navigation Events
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => turnPage(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => turnPage(1));
    }

    // Navbar Toggle (Mobile Hamburger Menu)
    const navToggle = document.getElementById("nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navToggle.classList.toggle("open");
            navLinks.classList.toggle("open");
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navToggle.classList.remove("open");
                navLinks.classList.remove("open");
            });
        });

        // Close menu when clicking outside of it
        document.addEventListener("click", (e) => {
            if (navToggle.classList.contains("open") && !navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove("open");
                navLinks.classList.remove("open");
            }
        });
    }

    // Mobile Tabs for Recipe Book
    const tabBtns = document.querySelectorAll(".mobile-tab-btn");
    const bookSpreadEl = document.getElementById("book-spread");
    if (tabBtns.length > 0 && bookSpreadEl) {
        // Ensure it has default show-left class
        bookSpreadEl.classList.add("show-left");
        
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                tabBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                if (targetTab === "left") {
                    bookSpreadEl.classList.remove("show-right");
                    bookSpreadEl.classList.add("show-left");
                } else {
                    bookSpreadEl.classList.remove("show-left");
                    bookSpreadEl.classList.add("show-right");
                }
            });
        });
    }

    // Touch Swipe Support for Recipe Book Spread
    if (bookSpreadEl) {
        let bookStartX = 0;
        let bookStartY = 0;
        let bookIsDragging = false;

        bookSpreadEl.addEventListener('touchstart', (e) => {
            bookStartX = e.touches[0].clientX;
            bookStartY = e.touches[0].clientY;
            bookIsDragging = true;
        }, { passive: true });

        bookSpreadEl.addEventListener('touchmove', (e) => {
            if (!bookIsDragging) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = bookStartX - currentX;
            const diffY = bookStartY - currentY;

            // Threshold of 70px horizontal vs vertical scroll check
            if (Math.abs(diffX) > 70 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    turnPage(1); // Swipe left -> next recipe
                } else {
                    turnPage(-1); // Swipe right -> prev recipe
                }
                bookIsDragging = false;
            }
        }, { passive: true });

        bookSpreadEl.addEventListener('touchend', () => {
            bookIsDragging = false;
        });

        // Keyboard Left/Right Arrow navigation for Recipe Book
        document.addEventListener("keydown", (e) => {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) return;
            
            if (e.key === "ArrowLeft") {
                turnPage(-1);
            } else if (e.key === "ArrowRight") {
                turnPage(1);
            }
        });
    }
}

// Fetch categories from C++ API
async function loadCategories() {
    try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Network error");
        categories = await response.json();
        
        const categoryList = document.getElementById("category-list");
        if (!categoryList) return; // Skip if not on recipes page
        
        categoryList.innerHTML = "";
        
        const categoryIcons = {
            'breakfast': '🍳',
            'lunch-mains': '🍲',
            'rice-dishes': '🍚',
            'snacks': '🥟',
            'indo-chinese': '🍜',
            'desserts': '🍰',
            'beverages': '☕'
        };
        
        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            const icon = categoryIcons[cat.slug.toLowerCase()] || '🍽️';
            btn.innerHTML = `<span>${icon}</span> ${cat.name}`;
            btn.setAttribute("data-category", cat.slug);
            
            // Set active if it matches the currentCategory URL param
            if (currentCategory === cat.slug.toLowerCase()) {
                btn.classList.add("active");
                // Remove active from 'All Dishes' button
                const allBtn = document.querySelector("[data-category='all']");
                if (allBtn) allBtn.classList.remove("active");
            }
            
            btn.addEventListener("click", () => {
                // Toggle active button
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                currentCategory = cat.slug;
                applyFilters();
            });
            
            categoryList.appendChild(btn);
        });
        
        // Listen to "All Dishes" click
        const allBtn = document.querySelector("[data-category='all']");
        if (allBtn) {
            allBtn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                allBtn.classList.add("active");
                currentCategory = 'all';
                applyFilters();
            });
        }
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Fetch recipes from C++ API
async function loadRecipes(recipeParam) {
    const bookContainer = document.getElementById("recipe-book-container");
    if (!bookContainer) return; // Skip if not on recipes page
    
    try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Network error");
        recipes = await response.json();
        
        // Handle specific recipe redirection from Home Page
        if (recipeParam) {
            const targetRecipe = recipes.find(r => r.slug === recipeParam);
            if (targetRecipe) {
                // Set current category to match the recipe category
                const catObj = categories.find(c => c.name.toLowerCase() === targetRecipe.category.toLowerCase());
                currentCategory = catObj ? catObj.slug : 'all';
                
                // Highlight corresponding filter button
                const filterButtons = document.querySelectorAll(".filter-btn");
                filterButtons.forEach(btn => {
                    if (btn.getAttribute("data-category") === currentCategory) {
                        btn.classList.add("active");
                    } else {
                        btn.classList.remove("active");
                    }
                });
            }
        }

        applyFilters();

        // Set index to target recipe page
        if (recipeParam) {
            const index = filteredRecipes.findIndex(r => r.slug === recipeParam);
            if (index !== -1) {
                currentRecipeIndex = index;
                renderBookPage();
            }
            
            // Clean URL query parameters so page refresh/filtering behaves normally
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error("Error loading recipes:", error);
        const leftPage = document.getElementById("book-left");
        if (leftPage) leftPage.innerHTML = `<div class="empty-book">Error loading database.</div>`;
    }
}

// Apply Filters and reset book
function applyFilters() {
    filteredRecipes = recipes.filter(recipe => {
        const catObj = categories.find(c => c.name.toLowerCase() === recipe.category.toLowerCase());
        const recipeCatSlug = catObj ? catObj.slug : (recipe.category || '').toLowerCase().replace(/\s+/g, '-');
        
        const matchesCategory = currentCategory === 'all' || recipeCatSlug === currentCategory.toLowerCase();
        const matchesSearch = searchQuery === '' || fuzzyMatchRecipe(recipe, searchQuery);
            
        return matchesCategory && matchesSearch;
    });

    currentRecipeIndex = 0; // Reset to first page
    renderBookPage();
}

function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function fuzzyMatchRecipe(recipe, query) {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    
    // Exact substring match first (fastest)
    if (recipe.title && recipe.title.toLowerCase().includes(q)) return true;
    if (recipe.description && recipe.description.toLowerCase().includes(q)) return true;
    if (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(q))) return true;

    // Fuzzy word-by-word match
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return false;

    // Get all searchable words from recipe
    const searchableText = `${recipe.title || ''} ${recipe.description || ''} ${(recipe.tags || []).join(' ')}`.toLowerCase();
    const textWords = searchableText.split(/[^a-z0-9]+/).filter(w => w.length > 2);

    // Every significant word in the query must match at least one word in the recipe closely
    for (const qw of queryWords) {
        let maxDist = qw.length <= 4 ? 1 : 2;
        let wordMatched = false;
        for (const tw of textWords) {
            if (Math.abs(qw.length - tw.length) > maxDist) continue;
            if (levenshteinDistance(qw, tw) <= maxDist) {
                wordMatched = true;
                break;
            }
        }
        if (!wordMatched) return false;
    }
    return true;
}

// Turn Page (Navigation)
function turnPage(direction) {
    const newIndex = currentRecipeIndex + direction;
    if (newIndex < 0 || newIndex >= filteredRecipes.length) return;
    
    const spread = document.getElementById("book-spread");
    const leftPage = document.getElementById("book-left");
    const rightPage = document.getElementById("book-right");
    
    if (!spread || !leftPage || !rightPage || window.innerWidth <= 1024) {
        currentRecipeIndex = newIndex;
        renderBookPage();
        return;
    }

    const isNext = direction === 1;
    const currentRecipe = filteredRecipes[currentRecipeIndex];
    const newRecipe = filteredRecipes[newIndex];
    
    // Create flipping page
    const flipPage = document.createElement("div");
    flipPage.className = `flip-page ${isNext ? 'next' : 'prev'}`;
    
    const flipFront = document.createElement("div");
    flipFront.className = "flip-front";
    
    const flipBack = document.createElement("div");
    flipBack.className = "flip-back";
    
    if (isNext) {
        // Turning to the right (next page)
        flipFront.innerHTML = generateRightPageHtml(currentRecipe);
        flipBack.innerHTML = generateLeftPageHtml(newRecipe);
        // Actual right page updates instantly
        rightPage.innerHTML = generateRightPageHtml(newRecipe);
    } else {
        // Turning to the left (prev page)
        flipFront.innerHTML = generateLeftPageHtml(currentRecipe);
        flipBack.innerHTML = generateRightPageHtml(newRecipe);
        // Actual left page updates instantly
        leftPage.innerHTML = generateLeftPageHtml(newRecipe);
    }
    
    flipPage.appendChild(flipFront);
    flipPage.appendChild(flipBack);
    spread.appendChild(flipPage);
    
    // Trigger animation
    setTimeout(() => {
        flipPage.classList.add("is-flipping");
    }, 50);
    
    // After animation finishes
    setTimeout(() => {
        currentRecipeIndex = newIndex;
        if (isNext) {
            leftPage.innerHTML = generateLeftPageHtml(newRecipe);
        } else {
            rightPage.innerHTML = generateRightPageHtml(newRecipe);
        }
        flipPage.remove();
        updatePaginationButtons();
    }, 850);
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    if (prevBtn) prevBtn.disabled = currentRecipeIndex === 0;
    if (nextBtn) nextBtn.disabled = currentRecipeIndex === filteredRecipes.length - 1;
}

function resetBookMobileTabs() {
    const tabBtns = document.querySelectorAll(".mobile-tab-btn");
    const bookSpreadEl = document.getElementById("book-spread");
    if (tabBtns.length > 0 && bookSpreadEl) {
        tabBtns.forEach(btn => {
            if (btn.getAttribute("data-tab") === "left") {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
        bookSpreadEl.classList.remove("show-right");
        bookSpreadEl.classList.add("show-left");
    }
}

// Render the current recipe into the book spread (initial load)
function renderBookPage() {
    const leftPage = document.getElementById("book-left");
    const rightPage = document.getElementById("book-right");
    
    if (!leftPage || !rightPage) return;

    if (filteredRecipes.length === 0) {
        leftPage.innerHTML = `<div class="empty-book">No recipes found. Try a different search.</div>`;
        rightPage.innerHTML = ``;
        updatePaginationButtons();
        return;
    }

    const recipe = filteredRecipes[currentRecipeIndex];
    leftPage.innerHTML = generateLeftPageHtml(recipe);
    rightPage.innerHTML = generateRightPageHtml(recipe);
    updatePaginationButtons();
    resetBookMobileTabs();
}

function generateLeftPageHtml(recipe) {
    if (!recipe) return '';
    const ingredientsHtml = recipe.ingredients.map(ing => `
        <li><span>${ing.name}</span> <span class="qty">${ing.quantity} ${ing.unit}</span></li>
    `).join('');

    return `
        <div class="book-recipe-header">
            <h2 class="book-recipe-title">${recipe.title}</h2>
            <span class="recipe-index-indicator">${currentRecipeIndex + 1} / ${filteredRecipes.length}</span>
        </div>
        <div class="book-recipe-badges">
            <span class="detail-badge">${recipe.category}</span>
            <span class="detail-badge">${recipe.isVeg ? 'Veg 🌱' : 'Non-Veg 🍗'}</span>
        </div>
        
        <div class="book-meta-grid">
            <div class="book-meta-item">
                <span class="book-meta-label">Prep:</span>
                <span class="book-meta-value">${recipe.prepTime}m</span>
            </div>
            <div class="book-meta-item">
                <span class="book-meta-label">Cook:</span>
                <span class="book-meta-value">${recipe.cookTime}m</span>
            </div>
            <div class="book-meta-item">
                <span class="book-meta-label">Servings:</span>
                <span class="book-meta-value">${recipe.servings || 4}</span>
            </div>
        </div>

        <h3 class="book-section-title">Ingredients</h3>
        <ul class="book-ingredients">
            ${ingredientsHtml}
        </ul>
    `;
}

function generateRightPageHtml(recipe) {
    if (!recipe) return '';
    const stepsHtml = recipe.steps.map(step => `
        <div class="book-step">
            <div class="book-step-num">${step.stepNumber}</div>
            <div class="book-step-content">
                <h4>${step.title}</h4>
                <p>${step.description || step.instruction}</p>
            </div>
        </div>
    `).join('');

    return `
        <h3 class="book-section-title">Preparation Method</h3>
        <div class="book-steps">
            ${stepsHtml}
        </div>
    `;
}

// 3D Rotating Recipe Carousel Logic
function initCarousel3D() {
    const viewport = document.querySelector('.carousel-3d-viewport');
    if (!viewport) return;

    const stage = viewport.querySelector('.carousel-3d-stage');
    const cards = viewport.querySelectorAll('.carousel-3d-card');
    const prevBtn = viewport.querySelector('.carousel-control.prev');
    const nextBtn = viewport.querySelector('.carousel-control.next');
    const indicators = viewport.querySelectorAll('.carousel-indicators .indicator');

    let activeIndex = 0;
    const totalCards = cards.length;
    const angleIncrement = 360 / totalCards; // 72 degrees for 5 cards

    // Dynamic tilt variable states for the active card
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScale = 1;
    let currentScale = 1;
    let targetZ = 30;
    let currentZ = 30;
    let isAnimatingTilt = false;

    // Track active card elements for the tilt effect
    let activeCard = null;
    let activeBg = null;
    let activeContent = null;
    let activeGlare = null;

    function updateCarousel() {
        // Rotate the stage
        const rotationAngle = -angleIncrement * activeIndex;
        stage.style.transform = `rotateY(${rotationAngle}deg)`;

        // Update active card class
        cards.forEach((card, idx) => {
            if (idx === activeIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update indicator dots
        indicators.forEach((indicator, idx) => {
            if (idx === activeIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Update active card references for the tilt effect
        setupActiveCardTilt();
    }

    function rotateToIndex(index) {
        activeIndex = (index + totalCards) % totalCards;
        updateCarousel();
    }

    // Attach click events to buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => rotateToIndex(activeIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => rotateToIndex(activeIndex + 1));
    }

    // Attach click events to indicators
    indicators.forEach((indicator) => {
        indicator.addEventListener('click', () => {
            const index = parseInt(indicator.getAttribute('data-index'), 10);
            rotateToIndex(index);
        });
    });

    // Touch support (Swiping)
    let startX = 0;
    let isDragging = false;

    viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentXPos = e.touches[0].clientX;
        const diffX = startX - currentXPos;

        if (Math.abs(diffX) > 60) { // Swipe threshold
            if (diffX > 0) {
                rotateToIndex(activeIndex + 1); // Swipe left -> next
            } else {
                rotateToIndex(activeIndex - 1); // Swipe right -> prev
            }
            isDragging = false;
        }
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Only trigger if carousel is inside viewport
        const rect = viewport.getBoundingClientRect();
        const inViewport = (rect.top >= -rect.height && rect.bottom <= window.innerHeight + rect.height);
        if (!inViewport) return;

        if (e.key === 'ArrowLeft') {
            rotateToIndex(activeIndex - 1);
        } else if (e.key === 'ArrowRight') {
            rotateToIndex(activeIndex + 1);
        }
    });

    // ----------------------------------------------------
    // Individual Tilt Logic for Active Card (Lerp based)
    // ----------------------------------------------------
    function setupActiveCardTilt() {
        // Reset old active card style
        if (activeCard) {
            removeTiltListeners(activeCard);
            activeCard.style.transition = ''; // Restore transition
            const prevCardAngle = parseInt(activeCard.getAttribute('data-index'), 10) * angleIncrement;
            activeCard.style.transform = `rotateY(${prevCardAngle}deg) translateZ(260px)`;
            if (activeBg) activeBg.style.transform = '';
            if (activeContent) activeContent.style.transform = '';
            if (activeGlare) {
                activeGlare.style.transform = '';
                activeGlare.style.opacity = '0';
            }
        }

        // Setup new active card
        activeCard = stage.querySelector('.carousel-3d-card.active');
        if (!activeCard) return;

        activeBg = activeCard.querySelector('.carousel-bg');
        activeContent = activeCard.querySelector('.carousel-content');
        activeGlare = activeCard.querySelector('.carousel-glare');

        // Reset variables
        targetX = 0; targetY = 0; currentX = 0; currentY = 0;
        targetScale = 1; currentScale = 1; targetZ = 30; currentZ = 30;
        isAnimatingTilt = false;

        // Attach listeners
        activeCard.addEventListener('mouseenter', handleMouseEnter);
        activeCard.addEventListener('mousemove', handleMouseMove);
        activeCard.addEventListener('mouseleave', handleMouseLeave);
    }

    function removeTiltListeners(card) {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
    }

    function handleMouseEnter() {
        activeCard.style.transition = 'none'; // Prevent conflicts with JS animation
        targetScale = 1.08;
        targetZ = 45;
        if (!isAnimatingTilt) {
            isAnimatingTilt = true;
            requestAnimationFrame(updateTiltTransform);
        }
    }

    function handleMouseMove(e) {
        const bounds = activeCard.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        targetY = ((y - centerY) / centerY) * -10;
        targetX = ((x - centerX) / centerX) * 10;
    }

    function handleMouseLeave() {
        targetX = 0;
        targetY = 0;
        targetScale = 1;
        targetZ = 30;
    }

    function updateTiltTransform() {
        if (!isAnimatingTilt) return;

        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        currentScale += (targetScale - currentScale) * 0.12;
        currentZ += (targetZ - currentZ) * 0.12;

        // Combine base position rotation on ring + mouse tilt offset applied locally (after translateZ)
        const cardRingAngle = parseInt(activeCard.getAttribute('data-index'), 10) * angleIncrement;
        activeCard.style.transform = `rotateY(${cardRingAngle}deg) translateZ(260px) rotateY(${currentX}deg) rotateX(${currentY}deg)`;

        if (activeBg) {
            activeBg.style.transform = `scale(${currentScale}) translate(${-currentX * 0.4}px, ${-currentY * 0.4}px)`;
        }

        if (activeContent) {
            activeContent.style.transform = `translateZ(${currentZ}px) translateX(${currentX * 0.3}px) translateY(${currentY * 0.3}px)`;
        }

        if (activeGlare) {
            activeGlare.style.transform = `translate(-50%, -50%) translate(${currentX * 2}px, ${-currentY * 2}px)`;
            const magnitude = Math.sqrt(currentX * currentX + currentY * currentY);
            activeGlare.style.opacity = magnitude / 12;
        }

        // Rest check
        if (targetX === 0 && targetY === 0 &&
            Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01 &&
            Math.abs(currentScale - 1) < 0.001 && Math.abs(currentZ - 30) < 0.01) {
            
            const cardRingAngle = parseInt(activeCard.getAttribute('data-index'), 10) * angleIncrement;
            activeCard.style.transform = `rotateY(${cardRingAngle}deg) translateZ(260px)`;
            activeCard.style.transition = ''; // Restore CSS transition
            if (activeBg) activeBg.style.transform = `scale(1) translate(0,0)`;
            if (activeContent) activeContent.style.transform = `translateZ(30px) translateX(0) translateY(0)`;
            if (activeGlare) activeGlare.style.opacity = '0';
            isAnimatingTilt = false;
            return;
        }

        requestAnimationFrame(updateTiltTransform);
    }

    // Run initial setup
    updateCarousel();
}

// Interactive Hero Parallax Effect
function initHeroParallax() {
    const hero = document.getElementById('hero');
    const heroImg = document.getElementById('hero-img');
    
    if (!hero || !heroImg) return;

    hero.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        
        // Subtle 3D movement for the hero image
        const rotateX = y * 15; // Max 15 deg rotation
        const rotateY = x * -15;
        const translateX = x * -30; // Slight shift
        const translateY = y * -30;
        
        heroImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) scale(1.05)`;
    });

    hero.addEventListener('mouseleave', () => {
        heroImg.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateX(0) translateY(0) scale(1)`;
        heroImg.style.transition = `transform 0.5s ease-out`;
    });
    
    hero.addEventListener('mouseenter', () => {
        heroImg.style.transition = 'none';
        // Force reflow before setting fast transition
        heroImg.offsetHeight;
        heroImg.style.transition = 'transform 0.1s ease-out';
    });
}

// Interactive 3D Category Tilt Effect
function initCategory3DTilt() {
    const cards = document.querySelectorAll('.card-3d-wrapper');
    
    cards.forEach(wrapper => {
        const card = wrapper.querySelector('.card-3d');
        const glare = wrapper.querySelector('.card-3d-glare');
        
        wrapper.addEventListener('mousemove', (e) => {
            const bounds = card.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            // Calculate tilt angle
            const rotateY = ((x - centerX) / centerX) * 15; // Max 15 deg
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            if (glare) {
                const glareX = (x / bounds.width) * 100;
                const glareY = (y / bounds.height) * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)`;
            }
        });
        
        wrapper.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            card.style.transition = 'transform 0.5s ease';
        });
        
        wrapper.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}

/* ==========================================================================
   Three.js 3D Cooking Animation
   ========================================================================== */
function initThreeJSCookingScene() {
    const container = document.getElementById('threejs-cooking-canvas');
    if (!container || typeof THREE === 'undefined') return;
    
    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfffaf0, 0.005);
    
    const isMobile = window.innerWidth <= 768;

    const camera = new THREE.PerspectiveCamera(
        isMobile ? 55 : 40, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    if (isMobile) {
        camera.position.set(0, 22, 65); // Move camera further back and slightly higher
    } else {
        camera.position.set(0, 18, 55); 
    }
    camera.lookAt(0, -2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isMobile ? Math.min(1.5, window.devicePixelRatio) : window.devicePixelRatio);
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) {
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    mainLight.position.set(15, 35, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fireGlow = new THREE.PointLight(0xff5500, 2, 60);
    fireGlow.position.set(0, -10, 0);
    scene.add(fireGlow);
    
    const panGlow = new THREE.PointLight(0xff8800, 0.5, 30);
    panGlow.position.set(0, 5, 0);
    scene.add(panGlow);

    const tiltGroup = new THREE.Group();
    scene.add(tiltGroup);

    const panGroup = new THREE.Group();
    
    const panBaseGeo = new THREE.CylinderGeometry(14, 13.5, 2, 64);
    const panBaseMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, 
        roughness: 0.2, 
        metalness: 0.5 
    });
    const panBase = new THREE.Mesh(panBaseGeo, panBaseMat);
    panBase.position.y = 0;
    panBase.receiveShadow = true;
    panBase.castShadow = true;
    panGroup.add(panBase);

    const panRimGeo = new THREE.TorusGeometry(14, 1.2, 16, 64);
    const panRimMat = new THREE.MeshStandardMaterial({ 
        color: 0x999999, 
        roughness: 0.3, 
        metalness: 0.8 
    });
    const panRim = new THREE.Mesh(panRimGeo, panRimMat);
    panRim.position.y = 1.2;
    panRim.rotation.x = Math.PI / 2;
    panRim.receiveShadow = true;
    panRim.castShadow = true;
    panGroup.add(panRim);
    
    const handleGeo = new THREE.CylinderGeometry(1.2, 1.2, 22, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.5, 24);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    panGroup.add(handle);

    tiltGroup.add(panGroup);

    const veggies = [];
    const foodGroup = new THREE.Group();
    tiltGroup.add(foodGroup);

    function createTomato() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.2, metalness: 0.1 })
        );
        body.castShadow = true; body.receiveShadow = true;
        group.add(body);
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.8, 0.4, 5),
            new THREE.MeshStandardMaterial({ color: 0x2a9d8f })
        );
        leaf.position.y = 2.2;
        group.add(leaf);
        return group;
    }

    function createCarrot() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(1, 4.5, 12),
            new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.5 })
        );
        body.rotation.x = Math.PI / 2;
        body.castShadow = true; body.receiveShadow = true;
        group.add(body);
        return group;
    }

    function createMushroom() {
        const group = new THREE.Group();
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.9, 1.8, 12),
            new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.8 })
        );
        stem.position.y = 0.9;
        stem.castShadow = true;
        group.add(stem);
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xa87c66, roughness: 0.7 })
        );
        cap.position.y = 1.8;
        cap.castShadow = true;
        group.add(cap);
        return group;
    }

    function createBroccoli() {
        const group = new THREE.Group();
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 2.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x88cc44, roughness: 0.8 })
        );
        stem.position.y = 1.25;
        stem.castShadow = true;
        group.add(stem);
        
        const tops = [[0, 2.5, 0], [1, 2, 0.8], [-1, 2, 0.8], [0, 2, -1.2]];
        tops.forEach(pos => {
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(1.3, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x2b9348, roughness: 0.9 })
            );
            cap.position.set(pos[0], pos[1], pos[2]);
            cap.castShadow = true;
            group.add(cap);
        });
        return group;
    }

    const vegGenerators = [createTomato, createCarrot, createMushroom, createBroccoli, createTomato, createMushroom, createCarrot];
    
    vegGenerators.forEach((gen, i) => {
        const v = gen();
        v.position.x = (Math.random() - 0.5) * 18;
        v.position.z = (Math.random() - 0.5) * 18;
        v.position.y = 1.5; 
        
        v.rotation.x = Math.random() * Math.PI;
        v.rotation.y = Math.random() * Math.PI;
        
        foodGroup.add(v);
        
        veggies.push({
            mesh: v,
            baseX: v.position.x,
            baseZ: v.position.z,
            speed: 2 + Math.random() * 2, 
            offset: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        });
    });

    const fireGroup = new THREE.Group();
    scene.add(fireGroup);
    
    const logGeo = new THREE.CylinderGeometry(1.5, 1.5, 20, 8);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 1.0 });
    
    const log1 = new THREE.Mesh(logGeo, logMat);
    log1.position.set(0, -15, 0);
    log1.rotation.z = Math.PI / 2;
    log1.rotation.y = 0.5;
    fireGroup.add(log1);
    
    const log2 = new THREE.Mesh(logGeo, logMat);
    log2.position.set(0, -14.5, 0);
    log2.rotation.z = Math.PI / 2;
    log2.rotation.y = -0.5;
    fireGroup.add(log2);

    // Advanced Fire Particles
    const fireParticleCount = isMobile ? 60 : 200;
    const fireGeo = new THREE.BufferGeometry();
    const firePos = new Float32Array(fireParticleCount * 3);
    const fireColors = new Float32Array(fireParticleCount * 3);
    const fireLife = new Float32Array(fireParticleCount);
    const fireSpeed = new Float32Array(fireParticleCount);
    
    // Create soft radial gradient for fire particles
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 200, 50, 1)');
    grad.addColorStop(0.5, 'rgba(255, 50, 0, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const fireTex = new THREE.CanvasTexture(canvas);

    const fireMat = new THREE.PointsMaterial({
        size: 10,
        map: fireTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    for (let i = 0; i < fireParticleCount; i++) {
        firePos[i*3] = (Math.random() - 0.5) * 14;
        firePos[i*3+1] = -14 + Math.random() * 8; 
        firePos[i*3+2] = (Math.random() - 0.5) * 14;
        
        fireColors[i*3] = 1.0;
        fireColors[i*3+1] = 0.5;
        fireColors[i*3+2] = 0.0;
        
        fireLife[i] = Math.random(); 
        fireSpeed[i] = 15 + Math.random() * 10;
    }
    
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    fireGeo.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));
    const fireSystem = new THREE.Points(fireGeo, fireMat);
    fireGroup.add(fireSystem);

    const steamGroup = new THREE.Group();
    scene.add(steamGroup);
    const steamParticles = [];
    const steamGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const steamCount = isMobile ? 6 : 15;
    
    for (let i = 0; i < steamCount; i++) {
        const steamMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const steam = new THREE.Mesh(steamGeo, steamMat);
        steam.position.set((Math.random() - 0.5) * 16, 2 + Math.random() * 10, (Math.random() - 0.5) * 16);
        steamGroup.add(steam);
        
        steamParticles.push({
            mesh: steam,
            speed: 1 + Math.random() * 2,
            offset: Math.random() * Math.PI * 2
        });
    }

    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    let time = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016; 
        
        const tiltAmt = Math.sin(time * 5) * 0.03; 
        tiltGroup.rotation.x = tiltAmt;
        tiltGroup.rotation.z = Math.cos(time * 4.5) * 0.02;
        tiltGroup.rotation.y = Math.sin(time * 0.5) * 0.2; 

        veggies.forEach((v, i) => {
            const sizzle = Math.abs(Math.sin(time * 15 + v.offset)) * 0.5;
            const bigJump = (Math.sin(time * v.speed + v.offset) > 0.95) ? 4 : 0; 
            
            v.mesh.position.y = 1.5 + sizzle + bigJump;
            
            v.mesh.position.x = v.baseX + Math.sin(time * 20 + i) * 0.1;
            v.mesh.position.z = v.baseZ + Math.cos(time * 20 + i) * 0.1;

            if (bigJump > 0) {
                v.mesh.rotation.x += v.rotSpeed;
                v.mesh.rotation.z += v.rotSpeed;
            }
        });
        
        fireGlow.intensity = 2 + Math.random() * 1;
        
        const positions = fireSystem.geometry.attributes.position.array;
        const colors = fireSystem.geometry.attributes.color.array;
        
        for (let i = 0; i < fireParticleCount; i++) {
            fireLife[i] += 0.016; 
            
            if (fireLife[i] > 1.0 || positions[i*3+1] > -2) {
                fireLife[i] = 0;
                positions[i*3] = (Math.random() - 0.5) * 16;
                positions[i*3+1] = -14; 
                positions[i*3+2] = (Math.random() - 0.5) * 16;
            }
            
            positions[i*3+1] += fireSpeed[i] * 0.016;
            
            positions[i*3] -= positions[i*3] * 0.01;
            positions[i*3+2] -= positions[i*3+2] * 0.01;
            
            const life = fireLife[i];
            colors[i*3] = 1.0; 
            colors[i*3+1] = Math.max(0, 0.8 - life * 1.5); 
            colors[i*3+2] = 0.0; 
        }
        fireSystem.geometry.attributes.position.needsUpdate = true;
        fireSystem.geometry.attributes.color.needsUpdate = true;

        steamParticles.forEach(s => {
            s.mesh.position.y += s.speed * 0.05;
            s.mesh.position.x += Math.sin(time * s.speed + s.offset) * 0.02;
            
            if (s.mesh.position.y > 20) {
                s.mesh.position.y = 2;
                s.mesh.position.x = (Math.random() - 0.5) * 16;
            }
            
            s.mesh.material.opacity = Math.max(0, 0.3 - (s.mesh.position.y - 2) * 0.015);
        });

        renderer.render(scene, camera);
    }

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initThreeJSCookingScene();
        initAdminPortal();
    });
} else {
    initThreeJSCookingScene();
    initAdminPortal();
}

// ==========================================================================
// CookWithPrem — Secure Admin Control Panel & XSS Security Module
// ==========================================================================

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function initAdminPortal() {
    // Add Admin Portal link to footer bottom if not already present
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom && !document.getElementById('admin-login-btn')) {
        const adminBtn = document.createElement('a');
        adminBtn.id = 'admin-login-btn';
        adminBtn.href = '#';
        adminBtn.style.cssText = 'opacity: 0.6; font-size: 0.85rem; margin-left: 12px; text-decoration: none;';
        adminBtn.innerHTML = '🔒 Admin Portal';
        adminBtn.title = 'Open Admin Control Panel (Alt + A)';
        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAdminModal();
        });
        footerBottom.appendChild(adminBtn);
    }

    // Keyboard shortcut Alt + A
    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            openAdminModal();
        }
    });

    // Create Admin Modal Overlay in DOM if missing
    if (!document.getElementById('admin-modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'admin-modal-overlay';
        overlay.className = 'admin-modal-overlay';
        overlay.innerHTML = `
            <div class="admin-modal-card">
                <div class="admin-modal-header">
                    <h2>🔒 Admin Control Panel</h2>
                    <button class="admin-close-btn" id="admin-modal-close">&times;</button>
                </div>
                <div id="admin-status-area"></div>
                <div id="admin-modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('admin-modal-close').addEventListener('click', closeAdminModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAdminModal();
        });
    }
}

function openAdminModal() {
    const overlay = document.getElementById('admin-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');

    const adminKey = sessionStorage.getItem('COOK_ADMIN_KEY');
    if (adminKey) {
        verifyAndShowAdminDashboard(adminKey);
    } else {
        renderAdminLoginForm();
    }
}

function closeAdminModal() {
    const overlay = document.getElementById('admin-modal-overlay');
    if (overlay) overlay.classList.remove('open');
}

function renderAdminLoginForm() {
    const body = document.getElementById('admin-modal-body');
    if (!body) return;

    body.innerHTML = `
        <p style="color: #A1887F; margin-bottom: 20px;">Enter your <strong>COOK_ADMIN_KEY</strong> to unlock complete update & edit control over CookWithPrem recipes.</p>
        <form id="admin-login-form">
            <div class="admin-form-group">
                <label for="admin-key-input">Admin Secret Key</label>
                <input type="password" id="admin-key-input" class="admin-input" placeholder="Enter your secret key..." required autocomplete="off">
            </div>
            <button type="submit" class="admin-btn-primary">🔓 Unlock Admin Dashboard</button>
        </form>
    `;

    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const key = document.getElementById('admin-key-input').value.trim();
        if (!key) return;

        showAdminStatus('Verifying Admin Secret Key...', 'info');
        const isValid = await verifyAdminKey(key);
        if (isValid) {
            sessionStorage.setItem('COOK_ADMIN_KEY', key);
            showAdminStatus('Admin Authentication Successful!', 'success');
            setTimeout(() => renderAdminDashboard(), 600);
        } else {
            showAdminStatus('Invalid Admin Secret Key! Access Denied.', 'error');
        }
    });
}

async function verifyAdminKey(key) {
    try {
        const response = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': key
            },
            body: JSON.stringify({ key: key })
        });
        return response.ok;
    } catch (err) {
        console.error('Admin verification error:', err);
        return false;
    }
}

function showAdminStatus(msg, type = 'info') {
    const area = document.getElementById('admin-status-area');
    if (!area) return;
    area.innerHTML = `<div class="admin-status-msg ${type}">${escapeHTML(msg)}</div>`;
}

async function renderAdminDashboard() {
    const body = document.getElementById('admin-modal-body');
    if (!body) return;

    showAdminStatus('Loading recipes database...', 'info');

    try {
        const res = await fetch('/api/recipes');
        let currentRecipes = await res.json();
        if (!Array.isArray(currentRecipes)) currentRecipes = recipes;

        const area = document.getElementById('admin-status-area');
        if (area) area.innerHTML = '';

        let tableRows = currentRecipes.map((rec, idx) => `
            <tr>
                <td><strong>${escapeHTML(rec.title || 'Untitled')}</strong></td>
                <td><span style="color: #FF8800; font-size: 0.85rem;">${escapeHTML(rec.category || 'General')}</span></td>
                <td>${escapeHTML(rec.prepTime || 'N/A')}</td>
                <td>
                    <button class="admin-btn-secondary" onclick="editRecipeInAdmin(${idx})">✏️ Edit</button>
                    <button class="admin-btn-danger" onclick="deleteRecipeInAdmin(${idx})">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');

        body.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="color: #A5D6A7; font-weight: 500;">Authenticated Admin Session</span>
                <div>
                    <button class="admin-btn-primary" onclick="renderAddRecipeForm()">➕ Add New Recipe</button>
                    <button class="admin-btn-secondary" onclick="logoutAdmin()">🔒 Lock Dashboard</button>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table class="admin-recipe-table">
                    <thead>
                        <tr>
                            <th>Recipe Title</th>
                            <th>Category</th>
                            <th>Prep Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="4">No recipes found. Click Add New Recipe above.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;

        window.adminCurrentRecipes = currentRecipes;
    } catch (err) {
        showAdminStatus('Failed to load recipes: ' + err.message, 'error');
    }
}

window.logoutAdmin = function() {
    sessionStorage.removeItem('COOK_ADMIN_KEY');
    renderAdminLoginForm();
    showAdminStatus('Logged out of Admin Panel.', 'info');
};

window.renderAddRecipeForm = function(editIdx = null) {
    const body = document.getElementById('admin-modal-body');
    if (!body) return;

    const isEdit = editIdx !== null && window.adminCurrentRecipes && window.adminCurrentRecipes[editIdx];
    const rec = isEdit ? window.adminCurrentRecipes[editIdx] : {
        title: '', slug: '', category: 'breakfast', prepTime: '15 mins', cookTime: '20 mins', servings: '2-3',
        image: 'images/samosa.png', description: '', ingredients: [], method: [], tips: []
    };

    body.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3>${isEdit ? '✏️ Edit Recipe' : '➕ Add New Recipe'}</h3>
            <button class="admin-btn-secondary" onclick="renderAdminDashboard()">&larr; Back to List</button>
        </div>

        <form id="admin-recipe-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="admin-form-group">
                    <label>Title</label>
                    <input type="text" id="rec-title" class="admin-input" value="${escapeHTML(rec.title)}" required placeholder="e.g. Paneer Tikka">
                </div>
                <div class="admin-form-group">
                    <label>Category Slug</label>
                    <select id="rec-category" class="admin-select">
                        <option value="breakfast" ${rec.category === 'breakfast' ? 'selected' : ''}>Breakfast</option>
                        <option value="lunch-mains" ${rec.category === 'lunch-mains' ? 'selected' : ''}>Lunch & Mains</option>
                        <option value="rice-dishes" ${rec.category === 'rice-dishes' ? 'selected' : ''}>Rice Dishes</option>
                        <option value="snacks" ${rec.category === 'snacks' ? 'selected' : ''}>Snacks</option>
                        <option value="indo-chinese" ${rec.category === 'indo-chinese' ? 'selected' : ''}>Indo-Chinese</option>
                        <option value="desserts" ${rec.category === 'desserts' ? 'selected' : ''}>Desserts</option>
                        <option value="beverages" ${rec.category === 'beverages' ? 'selected' : ''}>Beverages</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div class="admin-form-group">
                    <label>Prep Time</label>
                    <input type="text" id="rec-prep" class="admin-input" value="${escapeHTML(rec.prepTime)}" placeholder="e.g. 15 mins">
                </div>
                <div class="admin-form-group">
                    <label>Cook Time</label>
                    <input type="text" id="rec-cook" class="admin-input" value="${escapeHTML(rec.cookTime)}" placeholder="e.g. 20 mins">
                </div>
                <div class="admin-form-group">
                    <label>Servings</label>
                    <input type="text" id="rec-servings" class="admin-input" value="${escapeHTML(rec.servings)}" placeholder="e.g. 2-4">
                </div>
            </div>

            <div class="admin-form-group">
                <label>Image URL or Path</label>
                <input type="text" id="rec-image" class="admin-input" value="${escapeHTML(rec.image)}" placeholder="e.g. images/samosa.png or https://...">
            </div>

            <div class="admin-form-group">
                <label>Short Description</label>
                <textarea id="rec-desc" class="admin-textarea" placeholder="Brief summary...">${escapeHTML(rec.description)}</textarea>
            </div>

            <div class="admin-form-group">
                <label>Ingredients (One per line)</label>
                <textarea id="rec-ingredients" class="admin-textarea" placeholder="1 cup paneer&#10;2 tbsp oil">${Array.isArray(rec.ingredients) ? escapeHTML(rec.ingredients.join('\n')) : ''}</textarea>
            </div>

            <div class="admin-form-group">
                <label>Method Steps (One step per line)</label>
                <textarea id="rec-method" class="admin-textarea" placeholder="Step 1: Heat oil in a pan&#10;Step 2: Add spices">${Array.isArray(rec.method) ? escapeHTML(rec.method.join('\n')) : ''}</textarea>
            </div>

            <button type="submit" class="admin-btn-primary">💾 ${isEdit ? 'Save Changes' : 'Publish Recipe'}</button>
        </form>
    `;

    document.getElementById('admin-recipe-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('rec-title').value.trim();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const category = document.getElementById('rec-category').value;
        const prepTime = document.getElementById('rec-prep').value.trim();
        const cookTime = document.getElementById('rec-cook').value.trim();
        const servings = document.getElementById('rec-servings').value.trim();
        const image = document.getElementById('rec-image').value.trim();
        const description = document.getElementById('rec-desc').value.trim();
        const ingredients = document.getElementById('rec-ingredients').value.split('\n').map(s => s.trim()).filter(Boolean);
        const method = document.getElementById('rec-method').value.split('\n').map(s => s.trim()).filter(Boolean);

        const newRecipeObj = {
            id: isEdit ? rec.id : (Date.now().toString()),
            slug: slug || 'recipe-' + Date.now(),
            title, category, prepTime, cookTime, servings, image, description, ingredients, method, tips: rec.tips || []
        };

        if (isEdit) {
            window.adminCurrentRecipes[editIdx] = newRecipeObj;
        } else {
            window.adminCurrentRecipes.unshift(newRecipeObj);
        }

        await saveRecipesToBackend(window.adminCurrentRecipes);
    });
};

window.editRecipeInAdmin = function(idx) {
    renderAddRecipeForm(idx);
};

window.deleteRecipeInAdmin = async function(idx) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    if (window.adminCurrentRecipes && window.adminCurrentRecipes[idx]) {
        window.adminCurrentRecipes.splice(idx, 1);
        await saveRecipesToBackend(window.adminCurrentRecipes);
    }
};

async function saveRecipesToBackend(recipesArray) {
    const key = sessionStorage.getItem('COOK_ADMIN_KEY');
    showAdminStatus('Saving database changes to server...', 'info');

    try {
        const response = await fetch('/api/admin/update-recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': key
            },
            body: JSON.stringify(recipesArray, null, 2)
        });

        const result = await response.json();
        if (response.ok && result.status === 'ok') {
            showAdminStatus('Success! Recipes database updated and locked.', 'success');
            recipes = recipesArray; // Update live memory
            setTimeout(() => renderAdminDashboard(), 800);
        } else {
            showAdminStatus('Error saving: ' + (result.message || 'Unauthorized'), 'error');
        }
    } catch (err) {
        showAdminStatus('Server connection failed: ' + err.message, 'error');
    }
}

