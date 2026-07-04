// ==========================================================================
// CookWithPrem — Frontend Logic (Plain Vanilla JavaScript)
// ==========================================================================

let recipes = [];
let categories = [];
let currentCategory = 'all';
let searchQuery = '';

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
    await loadCategories();
    await loadRecipes();
}

function setupEventListeners() {
    // Search input event
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderRecipes();
        });
    }

    // Close modal event
    const closeModal = document.getElementById("close-modal");
    const modal = document.getElementById("recipe-modal");
    
    if (closeModal && modal) {
        closeModal.addEventListener("click", () => {
            modal.classList.remove("show");
            document.body.style.overflow = "auto";
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
                document.body.style.overflow = "auto";
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
                renderRecipes();
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
                renderRecipes();
            });
        }
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Fetch recipes from C++ API
async function loadRecipes() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return; // Skip if not on recipes page
    
    try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Network error");
        recipes = await response.json();
        renderRecipes();
    } catch (error) {
        console.error("Error loading recipes:", error);
        grid.innerHTML = `<div class="loading-state">Error loading recipes from C++ Backend. Make sure it is compiled and running on port 8080.</div>`;
    }
}

// Render filtered recipes to grid
function renderRecipes() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    // Filter recipes
    const filtered = recipes.filter(recipe => {
        // Category Filter
        const matchesCategory = currentCategory === 'all' || recipe.category.toLowerCase() === currentCategory.toLowerCase();
        
        // Search Query Filter
        const matchesSearch = searchQuery === '' || 
            recipe.title.toLowerCase().includes(searchQuery) ||
            recipe.description.toLowerCase().includes(searchQuery) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery));
            
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="loading-state">No recipes found matching your search.</div>`;
        return;
    }

    filtered.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        
        const imgUrl = recipe.heroImage || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800";
        
        card.innerHTML = `
            <img class="recipe-image" src="${imgUrl}" alt="${recipe.title}">
            <div class="recipe-details">
                <span class="recipe-badge ${recipe.isVeg ? '' : 'non-veg'}">${recipe.isVeg ? 'Veg' : 'Non-Veg'}</span>
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-desc">${recipe.description}</p>
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.totalTime} mins</span>
                    <span>📊 ${recipe.difficulty}</span>
                </div>
            </div>
        `;
        
        card.addEventListener("click", () => {
            openRecipeDetail(recipe);
        });
        
        grid.appendChild(card);
    });
}

// Open recipe detail modal popup
function openRecipeDetail(recipe) {
    const modal = document.getElementById("recipe-modal");
    const content = document.getElementById("modal-content");
    if (!modal || !content) return;
    
    const imgUrl = recipe.heroImage || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800";
    
    // Format lists
    const ingredientsHtml = recipe.ingredients.map(ing => `
        <li>${ing.quantity} ${ing.unit} ${ing.name}</li>
    `).join('');
    
    const stepsHtml = recipe.steps.map(step => `
        <div class="step-item">
            <div class="step-num">${step.stepNumber}</div>
            <div class="step-text">
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="modal-hero">
            <img src="${imgUrl}" alt="${recipe.title}">
        </div>
        <div class="modal-body">
            <h1 class="modal-title">${recipe.title}</h1>
            <div class="modal-badges">
                <span class="detail-badge">${recipe.category}</span>
                <span class="detail-badge">${recipe.cuisine} Cuisine</span>
                <span class="detail-badge">${recipe.isVeg ? 'Vegetarian 🌱' : 'Non-Vegetarian 🍗'}</span>
                <span class="detail-badge">Difficulty: ${recipe.difficulty}</span>
                <span class="detail-badge">⏱️ Cook: ${recipe.cookTime}m / Prep: ${recipe.prepTime}m</span>
            </div>
            
            <p class="detail-description">${recipe.description}</p>
            
            <div class="detail-section">
                <h2>Ingredients</h2>
                <ul class="ingredients-list">
                    ${ingredientsHtml}
                </ul>
            </div>
            
            <div class="detail-section">
                <h2>Step-by-Step Instructions</h2>
                <div class="steps-list">
                    ${stepsHtml}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}
