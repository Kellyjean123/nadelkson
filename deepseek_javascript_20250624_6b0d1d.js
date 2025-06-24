// ================ PRESENTATION APP ================
class PresentationApp {
    constructor() {
        // App state
        this.state = {
            slides: [],
            currentSlide: null,
            selectedElement: null,
            currentTemplate: 'default',
            presentationMode: false,
            previewMode: false,
            fullscreen: false
        };

        // DOM Elements
        this.dom = {
            appContainer: document.querySelector('.app-container'),
            sidebar: document.querySelector('.sidebar'),
            mainNavItems: document.querySelectorAll('.main-nav li'),
            slidesList: document.getElementById('slidesList'),
            slideEditor: document.getElementById('slideEditor'),
            propertiesPanel: document.getElementById('propertiesPanel'),
            addSlideBtn: document.getElementById('addSlideBtn'),
            duplicateSlideBtn: document.getElementById('duplicateSlideBtn'),
            deleteSlideBtn: document.getElementById('deleteSlideBtn'),
            previewBtn: document.getElementById('previewBtn'),
            presentBtn: document.getElementById('presentBtn'),
            saveBtn: document.getElementById('saveBtn'),
            shareBtn: document.getElementById('shareBtn'),
            previewModal: document.getElementById('previewModal'),
            closePreview: document.getElementById('closePreview'),
            previewContent: document.getElementById('previewContent'),
            prevSlide: document.getElementById('prevSlide'),
            nextSlide: document.getElementById('nextSlide'),
            slideCounter: document.getElementById('slideCounter'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            presentationMode: document.getElementById('presentationMode'),
            presentationSlide: document.getElementById('presentationSlide'),
            prevPresent: document.getElementById('prevPresent'),
            nextPresent: document.getElementById('nextPresent'),
            exitPresent: document.getElementById('exitPresent'),
            presentCounter: document.getElementById('presentCounter'),
            templatesModal: document.getElementById('templatesModal'),
            closeTemplates: document.getElementById('closeTemplates'),
            templatesGrid: document.getElementById('templatesGrid'),
            categoryBtns: document.querySelectorAll('.category-btn'),
            exportModal: document.getElementById('exportModal'),
            closeExport: document.getElementById('closeExport'),
            exportBtns: document.querySelectorAll('.btn-export'),
            shareModal: document.getElementById('shareModal'),
            closeShare: document.getElementById('closeShare'),
            shareLink: document.getElementById('shareLink'),
            copyLink: document.getElementById('copyLink'),
            elementPicker: document.getElementById('elementPicker'),
            closeElementPicker: document.getElementById('closeElementPicker'),
            elementsGrid: document.getElementById('elementsGrid'),
            elementCategories: document.querySelectorAll('.element-category'),
            toast: document.getElementById('toast')
        };

        // Initialize the app
        this.init();
    }

    // Initialize the application
    init() {
        // Load saved presentation if exists
        this.loadPresentation();

        // If no slides, create a default one
        if (this.state.slides.length === 0) {
            this.addNewSlide();
        } else {
            this.renderSlidesList();
            this.showSlide(this.state.slides[0].id);
        }

        // Set up event listeners
        this.setupEventListeners();

        // Load templates and elements
        this.loadTemplates();
        this.loadElements();

        // Show welcome message
        this.showToast('¡Bienvenido a Presentaciones Pro!', 'success');
    }

    // Set up all event listeners
    setupEventListeners() {
        // Navigation
        this.dom.mainNavItems.forEach(item => {
            item.addEventListener('click', () => {
                this.dom.mainNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                // Here you would handle showing different sections
            });
        });

        // Slide actions
        this.dom.addSlideBtn.addEventListener('click', () => this.addNewSlide());
        this.dom.duplicateSlideBtn.addEventListener('click', () => this.duplicateCurrentSlide());
        this.dom.deleteSlideBtn.addEventListener('click', () => this.deleteCurrentSlide());
        this.dom.previewBtn.addEventListener('click', () => this.togglePreview());
        this.dom.presentBtn.addEventListener('click', () => this.startPresentation());
        this.dom.saveBtn.addEventListener('click', () => this.savePresentation());
        this.dom.shareBtn.addEventListener('click', () => this.showShareModal());

        // Preview controls
        this.dom.closePreview.addEventListener('click', () => this.togglePreview());
        this.dom.prevSlide.addEventListener('click', () => this.navigateSlide('prev'));
        this.dom.nextSlide.addEventListener('click', () => this.navigateSlide('next'));
        this.dom.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Presentation controls
        this.dom.prevPresent.addEventListener('click', () => this.navigatePresentation('prev'));
        this.dom.nextPresent.addEventListener('click', () => this.navigatePresentation('next'));
        this.dom.exitPresent.addEventListener('click', () => this.exitPresentation());

        // Templates modal
        this.dom.closeTemplates.addEventListener('click', () => this.closeModal('templates'));
        this.dom.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterTemplates(btn.dataset.category));
        });

        // Export modal
        this.dom.closeExport.addEventListener('click', () => this.closeModal('export'));
        this.dom.exportBtns.forEach(btn => {
            btn.addEventListener('click', () => this.exportPresentation(btn.dataset.type));
        });

        // Share modal
        this.dom.closeShare.addEventListener('click', () => this.closeModal('share'));
        this.dom.copyLink.addEventListener('click', () => this.copyShareLink());

        // Element picker
        this.dom.closeElementPicker.addEventListener('click', () => this.closeModal('elementPicker'));
        this.dom.elementCategories.forEach(cat => {
            cat.addEventListener('click', () => this.filterElements(cat.dataset.category));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    // ================ SLIDE MANAGEMENT ================
    addNewSlide(template = 'default') {
        const newSlide = {
            id: this.generateId(),
            template,
            elements: [
                {
                    id: this.generateId(),
                    type: 'title',
                    content: 'Nueva Diapositiva',
                    position: { x: 50, y: 20 },
                    style: {
                        fontSize: '2.5rem',
                        color: '#212529',
                        fontFamily: 'var(--font-primary)',
                        fontWeight: '600'
                    }
                },
                {
                    id: this.generateId(),
                    type: 'paragraph',
                    content: 'Agrega tu contenido aquí',
                    position: { x: 50, y: 40 },
                    style: {
                        fontSize: '1rem',
                        color: '#6c757d',
                        fontFamily: 'var(--font-primary)'
                    }
                }
            ],
            background: {
                color: '#ffffff',
                image: null,
                gradient: null
            }
        };

        this.state.slides.push(newSlide);
        this.renderSlidesList();
        this.showSlide(newSlide.id);
        this.savePresentation();
    }

    duplicateCurrentSlide() {
        if (!this.state.currentSlide) return;

        const currentSlide = this.state.slides.find(s => s.id === this.state.currentSlide);
        if (!currentSlide) return;

        const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
        duplicatedSlide.id = this.generateId();
        duplicatedSlide.elements.forEach(el => el.id = this.generateId());

        // Find the index of the current slide and insert after it
        const currentIndex = this.state.slides.findIndex(s => s.id === this.state.currentSlide);
        this.state.slides.splice(currentIndex + 1, 0, duplicatedSlide);

        this.renderSlidesList();
        this.showSlide(duplicatedSlide.id);
        this.savePresentation();
    }

    deleteCurrentSlide() {
        if (!this.state.currentSlide || this.state.slides.length <= 1) return;

        const currentIndex = this.state.slides.findIndex(s => s.id === this.state.currentSlide);
        this.state.slides.splice(currentIndex, 1);

        // Show the previous slide or the first one if we deleted the first
        const slideToShow = currentIndex > 0 ? 
            this.state.slides[currentIndex - 1].id : 
            this.state.slides[0].id;

        this.renderSlidesList();
        this.showSlide(slideToShow);
        this.savePresentation();
    }

    showSlide(slideId) {
        const slide = this.state.slides.find(s => s.id === slideId);
        if (!slide) return;

        this.state.currentSlide = slideId;
        this.renderSlideEditor(slide);
        this.updateActiveSlideThumbnail();
    }

    // ================ RENDERING ================
    renderSlidesList() {
        this.dom.slidesList.innerHTML = '';

        this.state.slides.forEach((slide, index) => {
            const slideThumb = document.createElement('div');
            slideThumb.className = `slide-thumbnail ${slide.id === this.state.currentSlide ? 'active' : ''}`;
            slideThumb.dataset.slideId = slide.id;
            
            // Create a thumbnail preview (simplified for this example)
            slideThumb.innerHTML = `
                <div class="slide-preview-content">
                    <h4>${slide.elements.find(el => el.type === 'title')?.content || 'Sin título'}</h4>
                </div>
                <div class="slide-number">${index + 1}</div>
            `;

            slideThumb.addEventListener('click', () => this.showSlide(slide.id));
            this.dom.slidesList.appendChild(slideThumb);
        });
    }

    renderSlideEditor(slide) {
        this.dom.slideEditor.innerHTML = '';
        
        // Set slide background
        this.dom.slideEditor.style.background = slide.background.color;
        
        // Add elements to the editor
        slide.elements.forEach(element => {
            const el = this.createElement(element);
            this.dom.slideEditor.appendChild(el);
        });
    }

    createElement(elementData) {
        const element = document.createElement('div');
        element.className = `slide-element ${elementData.type}`;
        element.dataset.elementId = elementData.id;
        
        // Position the element
        element.style.position = 'absolute';
        element.style.left = `${elementData.position.x}%`;
        element.style.top = `${elementData.position.y}%`;
        
        // Apply styles
        Object.entries(elementData.style).forEach(([property, value]) => {
            element.style[property] = value;
        });
        
        // Set content based on type
        switch (elementData.type) {
            case 'title':
            case 'subtitle':
            case 'paragraph':
                element.textContent = elementData.content;
                break;
            case 'image':
                element.innerHTML = `<img src="${elementData.content}" alt="Imagen">`;
                break;
            case 'icon':
                element.innerHTML = `<i class="${elementData.content}"></i>`;
                break;
            // More element types would be handled here
        }
        
        // Make elements draggable and selectable
        this.makeDraggable(element, elementData);
        
        return element;
    }

    makeDraggable(element, elementData) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            
            // Calculate offset from mouse to element position
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Select this element
            this.selectElement(elementData.id);
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // Calculate new position in percentages
            const editorRect = this.dom.slideEditor.getBoundingClientRect();
            const newX = ((e.clientX - offsetX - editorRect.left) / editorRect.width) * 100;
            const newY = ((e.clientY - offsetY - editorRect.top) / editorRect.height) * 100;
            
            // Update element position
            element.style.left = `${Math.max(0, Math.min(90, newX))}%`;
            element.style.top = `${Math.max(0, Math.min(90, newY))}%`;
            
            // Update in state
            const slide = this.state.slides.find(s => s.id === this.state.currentSlide);
            if (slide) {
                const elementInState = slide.elements.find(el => el.id === elementData.id);
                if (elementInState) {
                    elementInState.position = { 
                        x: parseFloat(element.style.left),
                        y: parseFloat(element.style.top)
                    };
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            this.savePresentation();
        });
    }

    selectElement(elementId) {
        this.state.selectedElement = elementId;
        this.renderPropertiesPanel();
    }

    renderPropertiesPanel() {
        if (!this.state.currentSlide || !this.state.selectedElement) {
            this.dom.propertiesPanel.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cog"></i>
                    <p>Selecciona un elemento para editar</p>
                </div>
            `;
            return;
        }
        
        const slide = this.state.slides.find(s => s.id === this.state.currentSlide);
        const element = slide.elements.find(el => el.id === this.state.selectedElement);
        
        if (!element) return;
        
        let propertiesHTML = `
            <div class="property-group">
                <h4>Propiedades de ${element.type}</h4>
        `;
        
        // Common properties for all elements
        propertiesHTML += `
            <div class="form-group">
                <label>Contenido</label>
                <textarea id="element-content">${element.content}</textarea>
            </div>
            
            <div class="form-group">
                <label>Color</label>
                <input type="color" id="element-color" value="${element.style.color || '#000000'}">
            </div>
            
            <div class="form-group">
                <label>Tamaño de fuente</label>
                <select id="element-font-size">
                    <option value="0.75rem" ${element.style.fontSize === '0.75rem' ? 'selected' : ''}>Pequeño</option>
                    <option value="1rem" ${element.style.fontSize === '1rem' ? 'selected' : ''}>Normal</option>
                    <option value="1.5rem" ${element.style.fontSize === '1.5rem' ? 'selected' : ''}>Grande</option>
                    <option value="2rem" ${element.style.fontSize === '2rem' ? 'selected' : ''}>Muy grande</option>
                    <option value="3rem" ${element.style.fontSize === '3rem' ? 'selected' : ''}>Título</option>
                </select>
            </div>
        `;
        
        // Type-specific properties
        if (element.type === 'image') {
            propertiesHTML += `
                <div class="form-group">
                    <label>URL de la imagen</label>
                    <input type="text" id="element-image-url" value="${element.content}">
                    <button class="btn btn-sm" id="upload-image">Subir imagen</button>
                </div>
            `;
        }
        
        propertiesHTML += `</div>`;
        
        this.dom.propertiesPanel.innerHTML = propertiesHTML;
        
        // Set up event listeners for property changes
        document.getElementById('element-content').addEventListener('input', (e) => {
            element.content = e.target.value;
            this.renderSlideEditor(slide);
            this.savePresentation();
        });
        
        document.getElementById('element-color').addEventListener('input', (e) => {
            element.style.color = e.target.value;
            this.renderSlideEditor(slide);
            this.savePresentation();
        });
        
        document.getElementById('element-font-size').addEventListener('change', (e) => {
            element.style.fontSize = e.target.value;
            this.renderSlideEditor(slide);
            this.savePresentation();
        });
        
        if (element.type === 'image') {
            document.getElementById('element-image-url').addEventListener('input', (e) => {
                element.content = e.target.value;
                this.renderSlideEditor(slide);
                this.savePresentation();
            });
            
            document.getElementById('upload-image').addEventListener('click', () => {
                this.showToast('Función de subida de imagen no implementada en este ejemplo', 'warning');
            });
        }
    }

    updateActiveSlideThumbnail() {
        document.querySelectorAll('.slide-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.dataset.slideId === this.state.currentSlide) {
                thumb.classList.add('active');
            }
        });
    }

    // ================ TEMPLATES ================
    loadTemplates() {
        // In a real app, this would be fetched from a server or a larger local database
        const templates = [
            // Default templates
            { id: 'default', name: 'Predeterminada', category: 'all', thumbnail: 'default.jpg' },
            { id: 'dark', name: 'Oscura', category: 'all', thumbnail: 'dark.jpg' },
            { id: 'minimal', name: 'Minimalista', category: 'minimal', thumbnail: 'minimal.jpg' },
            { id: 'gamer', name: 'Gamer', category: 'gamer', thumbnail: 'gamer.jpg' },
            { id: 'education', name: 'Escolar', category: 'education', thumbnail: 'education.jpg' },
            { id: 'business', name: 'Negocios', category: 'business', thumbnail: 'business.jpg' },
            { id: 'creative', name: 'Creativa', category: 'creative', thumbnail: 'creative.jpg' },
            { id: 'neon', name: 'Neón', category: 'creative', thumbnail: 'neon.jpg' },
            { id: 'modern', name: 'Moderna', category: 'minimal', thumbnail: 'modern.jpg' },
            { id: 'vintage', name: 'Vintage', category: 'creative', thumbnail: 'vintage.jpg' }
        ];

        this.templates = templates;
        this.renderTemplates();
    }

    renderTemplates(filter = 'all') {
        this.dom.templatesGrid.innerHTML = '';
        
        const filteredTemplates = filter === 'all' ? 
            this.templates : 
            this.templates.filter(t => t.category === filter);
        
        filteredTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.dataset.templateId = template.id;
            
            templateCard.innerHTML = `
                <div class="template-thumbnail">
                    <img src="https://via.placeholder.com/300x169?text=${template.name}" alt="${template.name}">
                </div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-category">${template.category}</div>
                </div>
            `;
            
            templateCard.addEventListener('click', () => this.applyTemplate(template.id));
            this.dom.templatesGrid.appendChild(templateCard);
        });
    }

    filterTemplates(category) {
        this.dom.categoryBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.category-btn[data-category="${category}"]`).classList.add('active');
        this.renderTemplates(category);
    }

    applyTemplate(templateId) {
        if (!this.state.currentSlide) return;
        
        const slide = this.state.slides.find(s => s.id === this.state.currentSlide);
        if (!slide) return;
        
        // Update slide template and background based on template
        slide.template = templateId;
        
        // These would be more sophisticated in a real app
        switch (templateId) {
            case 'dark':
                slide.background.color = '#212529';
                slide.elements.forEach(el => el.style.color = '#ffffff');
                break;
            case 'minimal':
                slide.background.color = '#ffffff';
                slide.elements.forEach(el => el.style.color = '#212529');
                break;
            case 'gamer':
                slide.background.color = '#0d0d12';
                slide.elements.forEach(el => el.style.color = '#4cc9f0');
                break;
            // More template cases...
            default:
                slide.background.color = '#ffffff';
                slide.elements.forEach(el => el.style.color = '#212529');
        }
        
        this.renderSlideEditor(slide);
        this.closeModal('templates');
        this.savePresentation();
    }

    // ================ ELEMENTS ================
    loadElements() {
        // In a real app, this would be a more extensive library
        this.elements = {
            text: [
                { type: 'title', name: 'Título', icon: 'fas fa-heading' },
                { type: 'subtitle', name: 'Subtítulo', icon: 'fas fa-heading' },
                { type: 'paragraph', name: 'Párrafo', icon: 'fas fa-paragraph' }
            ],
            media: [
                { type: 'image', name: 'Imagen', icon: 'fas fa-image' },
                { type: 'video', name: 'Video', icon: 'fas fa-video' }
            ],
            shapes: [
                { type: 'rectangle', name: 'Rectángulo', icon: 'fas fa-square' },
                { type: 'circle', name: 'Círculo', icon: 'fas fa-circle' },
                { type: 'line', name: 'Línea', icon: 'fas fa-minus' }
            ],
            icons: [
                { type: 'icon', name: 'Estrella', icon: 'fas fa-star', content: 'fas fa-star' },
                { type: 'icon', name: 'Corazón', icon: 'fas fa-heart', content: 'fas fa-heart' },
                { type: 'icon', name: 'Check', icon: 'fas fa-check', content: 'fas fa-check' }
            ],
            charts: [
                { type: 'bar-chart', name: 'Gráfico de barras', icon: 'fas fa-chart-bar' },
                { type: 'pie-chart', name: 'Gráfico circular', icon: 'fas fa-chart-pie' }
            ]
        };
        
        this.renderElements();
    }

    renderElements(filter = 'text') {
        this.dom.elementsGrid.innerHTML = '';
        
        this.elements[filter].forEach(element => {
            const elementCard = document.createElement('div');
            elementCard.className = 'element-card';
            elementCard.dataset.elementType = element.type;
            
            elementCard.innerHTML = `
                <div class="element-icon">
                    <i class="${element.icon}"></i>
                </div>
                <div class="element-name">${element.name}</div>
            `;
            
            elementCard.addEventListener('click', () => this.addElementToSlide(element));
            this.dom.elementsGrid.appendChild(elementCard);
        });
    }

    filterElements(category) {
        this.dom.elementCategories.forEach(cat => cat.classList.remove('active'));
        document.querySelector(`.element-category[data-category="${category}"]`).classList.add('active');
        this.renderElements(category);
    }

    addElementToSlide(elementData) {
        if (!this.state.currentSlide) return;
        
        const slide = this.state.slides.find(s => s.id === this.state.currentSlide);
        if (!slide) return;
        
        const newElement = {
            id: this.generateId(),
            type: elementData.type,
            content: elementData.content || 'Nuevo elemento',
            position: { x: 20, y: 20 },
            style: {
                fontSize: '1rem',
                color: '#212529',
                fontFamily: 'var(--font-primary)'
            }
        };
        
        // Type-specific defaults
        if (elementData.type === 'image') {
            newElement.content = 'https://via.placeholder.com/300x200';
        } else if (elementData.type === 'icon') {
            newElement.style.fontSize = '2rem';
        }
        
        slide.elements.push(newElement);
        this.renderSlideEditor(slide);
        this.selectElement(newElement.id);
        this.closeModal('elementPicker');
        this.savePresentation();
    }

    // ================ PREVIEW & PRESENTATION ================
    togglePreview() {
        if (this.state.previewMode) {
            this.state.previewMode = false;
            this.dom.previewModal.classList.remove('active');
        } else {
            this.state.previewMode = true;
            this.renderPreview();
            this.dom.previewModal.classList.add('active');
        }
    }

    renderPreview() {
        this.dom.previewContent.innerHTML = '';
        
        this.state.slides.forEach((slide, index) => {
            const previewSlide = document.createElement('div');
            previewSlide.className = 'preview-slide';
            
            // Apply template styles
            if (slide.template === 'dark') {
                previewSlide.style.backgroundColor = '#212529';
                previewSlide.style.color = '#ffffff';
            } else if (slide.template === 'gamer') {
                previewSlide.style.backgroundColor = '#0d0d12';
                previewSlide.style.color = '#4cc9f0';
            } else {
                previewSlide.style.backgroundColor = '#ffffff';
                previewSlide.style.color = '#212529';
            }
            
            // Add elements to preview
            slide.elements.forEach(element => {
                const el = document.createElement('div');
                el.className = `preview-element ${element.type}`;
                
                // Apply styles
                Object.entries(element.style).forEach(([property, value]) => {
                    el.style[property] = value;
                });
                
                // Set content
                switch (element.type) {
                    case 'title':
                    case 'subtitle':
                    case 'paragraph':
                        el.textContent = element.content;
                        break;
                    case 'image':
                        el.innerHTML = `<img src="${element.content}" alt="Imagen">`;
                        break;
                    case 'icon':
                        el.innerHTML = `<i class="${element.content}"></i>`;
                        break;
                }
                
                previewSlide.appendChild(el);
            });
            
            this.dom.previewContent.appendChild(previewSlide);
        });
        
        // Update slide counter
        this.updatePreviewCounter(1);
    }

    updatePreviewCounter(current) {
        this.dom.slideCounter.textContent = `${current} / ${this.state.slides.length}`;
    }

    navigateSlide(direction) {
        // In a real app, this would handle actual navigation between slides in preview
        this.showToast(`Navegación ${direction === 'prev' ? 'anterior' : 'siguiente'}`, 'info');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.dom.previewModal.requestFullscreen().catch(err => {
                this.showToast(`Error al entrar en pantalla completa: ${err.message}`, 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    startPresentation() {
        if (this.state.slides.length === 0) return;
        
        this.state.presentationMode = true;
        this.renderPresentationSlide(0);
        this.dom.presentationMode.style.display = 'flex';
    }

    renderPresentationSlide(index) {
        const slide = this.state.slides[index];
        if (!slide) return;
        
        this.dom.presentationSlide.innerHTML = '';
        this.dom.presentationSlide.style.backgroundColor = slide.background.color || '#ffffff';
        
        slide.elements.forEach(element => {
            const el = document.createElement('div');
            el.className = `presentation-element ${element.type}`;
            
            // Apply styles
            Object.entries(element.style).forEach(([property, value]) => {
                el.style[property] = value;
            });
            
            // Set content
            switch (element.type) {
                case 'title':
                case 'subtitle':
                case 'paragraph':
                    el.textContent = element.content;
                    break;
                case 'image':
                    el.innerHTML = `<img src="${element.content}" alt="Imagen">`;
                    break;
                case 'icon':
                    el.innerHTML = `<i class="${element.content}"></i>`;
                    break;
            }
            
            this.dom.presentationSlide.appendChild(el);
        });
        
        // Update counter
        this.dom.presentCounter.textContent = `${index + 1} / ${this.state.slides.length}`;
    }

    navigatePresentation(direction) {
        // In a real app, this would handle actual navigation between slides
        this.showToast(`Navegación ${direction === 'prev' ? 'anterior' : 'siguiente'} en presentación`, 'info');
    }

    exitPresentation() {
        this.state.presentationMode = false;
        this.dom.presentationMode.style.display = 'none';
    }

    // ================ EXPORT ================
    exportPresentation(type) {
        switch (type) {
            case 'pdf':
                this.exportToPDF();
                break;
            case 'html':
                this.exportToHTML();
                break;
            case 'png':
                this.exportToPNG();
                break;
        }
        
        this.closeModal('export');
    }

    exportToPDF() {
        // In a real app, this would use a library like jsPDF or html2pdf.js
        this.showToast('Exportando a PDF... (simulado)', 'success');
        
        // Simulate PDF export delay
        setTimeout(() => {
            this.showToast('PDF exportado correctamente', 'success');
        }, 2000);
    }

    exportToHTML() {
        // Create HTML content with inline CSS
        let htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentación Exportada</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .slide {
            width: 90%;
            max-width: 900px;
            margin: 30px auto;
            padding: 60px;
            border-radius: 12px;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .title {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 1.8rem;
            font-weight: 500;
            margin-bottom: 20px;
        }
        .paragraph {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .image {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 8px;
        }
        .icon {
            font-size: 2rem;
            margin: 20px 0;
        }
    </style>
</head>
<body>`;
        
        // Add slides to HTML
        this.state.slides.forEach((slide, index) => {
            htmlContent += `
    <div class="slide" style="background-color: ${slide.background.color || '#ffffff'}">
        <h2>Diapositiva ${index + 1}</h2>`;
            
            slide.elements.forEach(element => {
                switch (element.type) {
                    case 'title':
                        htmlContent += `
        <div class="title" style="color: ${element.style.color}">${element.content}</div>`;
                        break;
                    case 'subtitle':
                        htmlContent += `
        <div class="subtitle" style="color: ${element.style.color}">${element.content}</div>`;
                        break;
                    case 'paragraph':
                        htmlContent += `
        <div class="paragraph" style="color: ${element.style.color}">${element.content}</div>`;
                        break;
                    case 'image':
                        htmlContent += `
        <img class="image" src="${element.content}" alt="Imagen">`;
                        break;
                    case 'icon':
                        htmlContent += `
        <div class="icon" style="color: ${element.style.color}"><i class="${element.content}"></i></div>`;
                        break;
                }
            });
            
            htmlContent += `
    </div>`;
        });
        
        htmlContent += `
</body>
</html>`;
        
        // Create download
        this.downloadFile('presentacion.html', htmlContent, 'text/html');
    }

    exportToPNG() {
        this.showToast('Exportando a imágenes PNG... (simulado)', 'success');
        
        // Simulate PNG export delay
        setTimeout(() => {
            this.showToast('Imágenes PNG exportadas correctamente', 'success');
        }, 2000);
    }

    downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // ================ SHARE ================
    showShareModal() {
        // Generate a share link (simulated)
        const shareId = this.generateId();
        localStorage.setItem(`share_${shareId}`, JSON.stringify(this.state.slides));
        
        const shareLink = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
        this.dom.shareLink.value = shareLink;
        
        this.openModal('share');
    }

    copyShareLink() {
        this.dom.shareLink.select();
        document.execCommand('copy');
        this.showToast('Enlace copiado al portapapeles', 'success');
    }

    // ================ MODAL MANAGEMENT ================
    openModal(modalName) {
        const modal = this.dom[`${modalName}Modal`];
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalName) {
        const modal = this.dom[`${modalName}Modal`];
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ================ UTILITIES ================
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    savePresentation() {
        localStorage.setItem('presentation_pro_slides', JSON.stringify(this.state.slides));
        localStorage.setItem('presentation_pro_current', this.state.currentSlide);
    }

    loadPresentation() {
        const savedSlides = localStorage.getItem('presentation_pro_slides');
        const savedCurrent = localStorage.getItem('presentation_pro_current');
        
        if (savedSlides) {
            this.state.slides = JSON.parse(savedSlides);
        }
        
        if (savedCurrent) {
            this.state.currentSlide = savedCurrent;
        }
    }

    showToast(message, type = 'info') {
        const toast = this.dom.toast;
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    handleKeyboardShortcuts(e) {
        // Prevent shortcuts when in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Common shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.addNewSlide();
                    break;
                case 'd':
                    e.preventDefault();
                    this.duplicateCurrentSlide();
                    break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    this.deleteCurrentSlide();
                    break;
                case 's':
                    e.preventDefault();
                    this.savePresentation();
                    this.showToast('Presentación guardada', 'success');
                    break;
                case 'p':
                    e.preventDefault();
                    this.togglePreview();
                    break;
            }
        }
    }

    handleWindowResize() {
        // Handle responsive adjustments
        if (window.innerWidth < 992) {
            // Mobile layout adjustments
        } else {
            // Desktop layout adjustments
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PresentationApp();
});