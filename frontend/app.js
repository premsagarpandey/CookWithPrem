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
    if (catParam) {
        currentCategory = catParam.toLowerCase();
    }

    setupEventListeners();
    initScrollReveal();
    initTiltEffect();
    initHeroParallax();
    await loadCategories();
    await loadRecipes();
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
        
        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.textContent = cat.name;
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
async function loadRecipes() {
    const bookContainer = document.getElementById("recipe-book-container");
    if (!bookContainer) return; // Skip if not on recipes page
    
    try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Network error");
        recipes = await response.json();
        applyFilters();
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
    
    if (!spread || !leftPage || !rightPage) {
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
}

function generateLeftPageHtml(recipe) {
    if (!recipe) return '';
    const ingredientsHtml = recipe.ingredients.map(ing => `
        <li><span>${ing.name}</span> <span class="qty">${ing.quantity} ${ing.unit}</span></li>
    `).join('');

    return `
        <h2 class="book-recipe-title">${recipe.title}</h2>
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

// 3D Tilt Effect for Chef's Special Card
function initTiltEffect() {
    const card = document.getElementById('tilt-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -15; // Max rotation 15deg
        const rotateY = ((x - centerX) / centerX) * 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        card.style.transition = `transform 0.5s ease-out`;
    });
    
    card.addEventListener('mouseenter', () => {
        card.style.transition = `transform 0.1s ease-out`;
    });
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
        heroImg.style.transition = `transform 0.1s ease-out`;
    });
}
