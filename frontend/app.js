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
        heroImg.style.transition = `transform 0.1s ease-out`;
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

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfffaf0, 0.005);
    
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
    mainLight.position.set(10, 30, 15);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xaabbff, 0.4);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    const fireGlow = new THREE.PointLight(0xff6600, 1.5, 50);
    fireGlow.position.set(0, -15, 0);
    scene.add(fireGlow);

    const tiltGroup = new THREE.Group();
    scene.add(tiltGroup);

    // 3. Create Pan
    const panGroup = new THREE.Group();
    
    const panBaseGeo = new THREE.CylinderGeometry(14, 13, 2, 64);
    const panBaseMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.7, 
        metalness: 0.2 
    });
    const panBase = new THREE.Mesh(panBaseGeo, panBaseMat);
    panBase.position.y = 0;
    panBase.receiveShadow = true;
    panBase.castShadow = true;
    panGroup.add(panBase);

    const panRimGeo = new THREE.TorusGeometry(14, 1.2, 16, 64);
    const panRimMat = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        roughness: 0.2, 
        metalness: 0.8 
    });
    const panRim = new THREE.Mesh(panRimGeo, panRimMat);
    panRim.position.y = 1;
    panRim.rotation.x = Math.PI / 2;
    panRim.receiveShadow = true;
    panRim.castShadow = true;
    panGroup.add(panRim);
    
    const handleGeo = new THREE.CylinderGeometry(1.5, 1.5, 20, 16);
    const handleMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        roughness: 0.8, 
        metalness: 0.1 
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.5, 22);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    panGroup.add(handle);

    tiltGroup.add(panGroup);

    // 4. Create Low-Poly Veggies
    const veggies = [];
    const foodGroup = new THREE.Group();
    tiltGroup.add(foodGroup);

    function createTomato() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.3, metalness: 0.1 })
        );
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(1, 0.5, 5),
            new THREE.MeshStandardMaterial({ color: 0x22aa22 })
        );
        leaf.position.y = 2.5;
        group.add(leaf);
        return group;
    }

    function createCarrot() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(1.2, 5, 8),
            new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.6 })
        );
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        return group;
    }

    function createMushroom() {
        const group = new THREE.Group();
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 })
        );
        stem.position.y = 1;
        stem.castShadow = true;
        group.add(stem);
        
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xa87c66, roughness: 0.9 })
        );
        cap.position.y = 2;
        cap.castShadow = true;
        group.add(cap);
        
        return group;
    }

    function createBroccoli() {
        const group = new THREE.Group();
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x88cc44, roughness: 0.8 })
        );
        stem.position.y = 1.5;
        stem.castShadow = true;
        group.add(stem);
        
        const tops = [
            [0, 3, 0], [1, 2.5, 1], [-1, 2.5, 1], [0, 2.5, -1.5]
        ];
        
        tops.forEach(pos => {
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(1.5, 6, 6),
                new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 })
            );
            cap.position.set(pos[0], pos[1], pos[2]);
            cap.castShadow = true;
            group.add(cap);
        });
        
        return group;
    }

    const vegGenerators = [createTomato, createCarrot, createMushroom, createBroccoli, createTomato, createMushroom];
    
    vegGenerators.forEach((gen, i) => {
        const v = gen();
        v.position.x = (Math.random() - 0.5) * 16;
        v.position.z = (Math.random() - 0.5) * 16;
        v.position.y = 2;
        
        v.rotation.x = Math.random() * Math.PI;
        v.rotation.y = Math.random() * Math.PI;
        v.rotation.z = Math.random() * Math.PI;
        
        foodGroup.add(v);
        
        veggies.push({
            mesh: v,
            baseX: v.position.x,
            baseZ: v.position.z,
            speed: 0.5 + Math.random() * 0.5,
            offset: Math.random() * Math.PI * 2,
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1
            }
        });
    });

    // 5. Create Fire Particles
    const fireParticles = new THREE.Group();
    scene.add(fireParticles);
    
    const logGeo = new THREE.CylinderGeometry(1, 1, 12, 6);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 1.0 });
    
    const log1 = new THREE.Mesh(logGeo, logMat);
    log1.position.set(0, -10, 0);
    log1.rotation.z = Math.PI / 2;
    log1.rotation.y = 0.5;
    fireParticles.add(log1);
    
    const log2 = new THREE.Mesh(logGeo, logMat);
    log2.position.set(0, -9.5, 0);
    log2.rotation.z = Math.PI / 2;
    log2.rotation.y = -0.5;
    fireParticles.add(log2);

    const flames = [];
    const flameGeo = new THREE.ConeGeometry(1.5, 4, 6);
    
    for (let i = 0; i < 12; i++) {
        const flameMat = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xff5500 : 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        
        flame.position.x = (Math.random() - 0.5) * 8;
        flame.position.y = -9 + Math.random() * 2;
        flame.position.z = (Math.random() - 0.5) * 8;
        
        fireParticles.add(flame);
        
        flames.push({
            mesh: flame,
            baseY: flame.position.y,
            speed: 1 + Math.random() * 2,
            offset: Math.random() * Math.PI * 2
        });
    }

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 6. Animation Loop
    let time = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016; 
        
        const tiltAmt = Math.sin(time * 1.5) * 0.15;
        tiltGroup.rotation.x = tiltAmt;
        tiltGroup.rotation.z = Math.cos(time * 1.2) * 0.05;
        tiltGroup.rotation.y = time * 0.5;

        veggies.forEach(v => {
            const jump = Math.abs(Math.sin(time * v.speed * 2 + v.offset));
            const height = Math.pow(jump, 1.5) * 15;
            
            v.mesh.position.y = 2 + height;
            
            v.mesh.rotation.x += v.rotSpeed.x;
            v.mesh.rotation.y += v.rotSpeed.y;
            v.mesh.rotation.z += v.rotSpeed.z;
        });
        
        fireGlow.intensity = 1.5 + Math.random() * 0.5;
        
        flames.forEach(f => {
            const rise = Math.sin(time * f.speed * 3 + f.offset);
            f.mesh.position.y = f.baseY + rise * 2;
            f.mesh.scale.setScalar(1 + rise * 0.2);
            if (f.mesh.position.y > -7) {
                f.mesh.material.color.setHex(0xff3300);
            } else {
                f.mesh.material.color.setHex(0xffaa00);
            }
        });

        renderer.render(scene, camera);
    }

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJSCookingScene);
} else {
    initThreeJSCookingScene();
}
