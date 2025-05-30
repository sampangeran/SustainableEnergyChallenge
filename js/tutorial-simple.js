/**
 * Simple Tutorial System - Rebuilt for Reliability
 * Provides interactive educational guidance with working spotlight highlighting
 */

class SimpleTutorial {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.isActive = false;
        this.currentStep = 0;
        this.overlay = null;
        this.panel = null;
        this.highlightedElement = null;
        
        this.initializeTutorialSteps();
        this.setupEventListeners();
    }

    initializeTutorialSteps() {
        this.tutorialSteps = [
            {
                title: "Welcome to Sustainable City Challenge",
                content: `
                    <h3>🌱 Welcome to Your Energy Journey!</h3>
                    <p>You're about to design a sustainable city using renewable energy sources. This simulation teaches real-world energy planning through hands-on experience.</p>
                    
                    <h4>What You'll Learn:</h4>
                    <ul>
                        <li><strong>Energy Planning:</strong> Strategic placement of renewable sources</li>
                        <li><strong>Budget Management:</strong> Balancing costs with energy needs</li>
                        <li><strong>Environmental Impact:</strong> Understanding sustainability metrics</li>
                        <li><strong>Weather Effects:</strong> How conditions affect energy production</li>
                    </ul>
                    
                    <p><strong>Ready to build the future?</strong></p>
                `,
                highlight: ".header"
            },
            {
                title: "Understanding the Grid Layout",
                content: `
                    <h3>🏙️ Your City Grid</h3>
                    <p>The grid represents your city with different terrain types that affect energy production:</p>
                    
                    <ul>
                        <li><strong>🏔️ Mountains:</strong> Perfect for geothermal and wind power</li>
                        <li><strong>🏖️ Beach:</strong> Excellent for wind and solar energy</li>
                        <li><strong>🌊 Rivers:</strong> Ideal for hydroelectric power</li>
                        <li><strong>🌲 Forests:</strong> Great for biomass energy production</li>
                    </ul>
                    
                    <p>Empty gray cells can be developed into city zones that need power to generate income.</p>
                `,
                highlight: "#city-grid"
            },
            {
                title: "Energy Source Options",
                content: `
                    <h3>⚡ Renewable Energy Sources</h3>
                    <p>Choose from various energy technologies, each with unique characteristics:</p>
                    
                    <ul>
                        <li><strong>☀️ Solar:</strong> $3,750 • 50kW - Clean, weather-dependent</li>
                        <li><strong>💨 Wind:</strong> $11,500 • 100kW - Powerful in windy conditions</li>
                        <li><strong>🌊 Hydro:</strong> $56,000 • 200kW - Reliable water power</li>
                        <li><strong>🌋 Geothermal:</strong> $81,000 • 180kW - Consistent underground energy</li>
                        <li><strong>🌱 Biomass:</strong> $55,000 • 200kW - Organic waste to energy</li>
                    </ul>
                    
                    <p>Click an energy source to select it, then click on grid cells to place it.</p>
                `,
                highlight: ".energy-sources"
            },
            {
                title: "Budget and Financial Management",
                content: `
                    <h3>💰 Managing Your City Budget</h3>
                    <p>Start with $500,000 to build your sustainable city. Smart planning is essential:</p>
                    
                    <ul>
                        <li><strong>Energy Costs:</strong> Each source requires upfront investment</li>
                        <li><strong>Monthly Income:</strong> Powered zones generate revenue</li>
                        <li><strong>Efficiency Bonus:</strong> Well-designed cities earn more</li>
                        <li><strong>Refunds:</strong> Get 70% back when removing sources</li>
                    </ul>
                    
                    <p>Click the budget panel to see detailed financial information and transaction history.</p>
                `,
                highlight: "#budget-panel"
            },
            {
                title: "Weather System Impact",
                content: `
                    <h3>🌤️ Dynamic Weather Effects</h3>
                    <p>Weather conditions change every few minutes and affect energy production:</p>
                    
                    <ul>
                        <li><strong>☀️ Sunny:</strong> +20% solar, -20% wind</li>
                        <li><strong>☁️ Cloudy:</strong> -40% solar, normal wind/hydro</li>
                        <li><strong>🌧️ Rainy:</strong> -60% solar, +30% hydro, -10% wind</li>
                        <li><strong>💨 Windy:</strong> +40% wind, normal solar</li>
                    </ul>
                    
                    <p>The weather impact percentage shows how current conditions affect your energy mix compared to neutral weather. Diversify your energy sources to maintain stable power during all weather conditions.</p>
                `,
                highlight: ".weather-display"
            },
            {
                title: "Performance Dashboard",
                content: `
                    <h3>📊 Real-time Performance Tracking</h3>
                    <p>Monitor your city's performance with comprehensive metrics:</p>
                    
                    <ul>
                        <li><strong>Energy Production:</strong> Current output vs demand</li>
                        <li><strong>Grid Efficiency:</strong> How well you meet power needs</li>
                        <li><strong>Sustainability Score:</strong> Environmental impact rating based on 5 factors</li>
                        <li><strong>Financial Performance:</strong> Income and expense tracking</li>
                    </ul>
                    
                    <h4>Sustainability Score Components:</h4>
                    <ul>
                        <li><strong>Energy Efficiency (25 pts):</strong> Production meeting demand</li>
                        <li><strong>Carbon Impact (20 pts):</strong> CO₂ reduction vs emissions</li>
                        <li><strong>Energy Diversity (20 pts):</strong> Using different renewable sources</li>
                        <li><strong>Grid Reliability (15 pts):</strong> Consistent power supply</li>
                        <li><strong>Community Impact (10 pts):</strong> All zone types placed and powered (reduced by pollution in residential areas)</li>
                    </ul>
                `,
                highlight: ".dashboard"
            },
            {
                title: "Creating City Zones",
                content: `
                    <h3>🏘️ Build Your First Zone</h3>
                    <p>Create a diverse city with three zone types:</p>
                    
                    <ol>
                        <li>Make sure "Zone Mode" is selected (active button is highlighted)</li>
                        <li>Choose zone type from dropdown: Residential, Commercial, or Industrial</li>
                        <li>Click on any empty grid cell or drag to select multiple cells</li>
                    </ol>
                    
                    <h4>Zone Types & Requirements:</h4>
                    <ul>
                        <li><strong>🏠 Residential:</strong> 50kW demand, $120/month income</li>
                        <li><strong>🏢 Commercial:</strong> 100kW demand, $250/month income</li>
                        <li><strong>🏭 Industrial:</strong> 200kW demand, $400/month income</li>
                    </ul>
                    
                    <p><strong>Important:</strong> For maximum Community Impact score, place all three zone types and power them adequately!</p>
                `,
                highlight: ".grid-controls"
            },
            {
                title: "You're Ready to Build!",
                content: `
                    <h3>🎯 Start Your Sustainable City!</h3>
                    <p>You now have all the knowledge needed to create an amazing renewable energy city!</p>
                    
                    <h4>Success Tips:</h4>
                    <ul>
                        <li><strong>Use terrain bonuses:</strong> Place energy sources strategically on matching terrain</li>
                        <li><strong>Diversify renewable energy:</strong> Use all 5 renewable sources for maximum diversity score</li>
                        <li><strong>Complete city planning:</strong> Place all three zone types for full community score</li>
                        <li><strong>Consider pollution impact:</strong> Wind turbines create noise pollution in residential areas, while biomass and coal plants cause toxic emissions</li>
                        <li><strong>Avoid fossil fuels:</strong> Coal and natural gas reduce your carbon impact score</li>
                        <li><strong>Monitor sustainability:</strong> Aim for A+ grade (90+ points)</li>
                        <li><strong>Manage budget wisely:</strong> Balance investments with zone income</li>
                    </ul>
                    
                    <p><strong>Ultimate Challenge:</strong> Can you achieve a 100% renewable city with all zone types, full power coverage, and maximum sustainability score?</p>
                `,
                highlight: "#city-grid"
            }
        ];
    }

    setupEventListeners() {
        // No special event listeners needed for this simple version
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createTutorialInterface();
        this.showCurrentStep();
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.clearHighlights();
        this.removeTutorialInterface();
    }

    nextStep() {
        console.log(`Tutorial: Current step ${this.currentStep}, total steps ${this.tutorialSteps.length}`);
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            console.log(`Tutorial: Moving to step ${this.currentStep}`);
            this.showCurrentStep();
        } else {
            console.log(`Tutorial: Finishing tutorial`);
            this.stop();
            // Show city name dialog after tutorial completion
            if (this.mainApp) {
                setTimeout(() => {
                    this.mainApp.showSimpleCityNameDialog();
                }, 500);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showCurrentStep();
        }
    }

    showCurrentStep() {
        const step = this.tutorialSteps[this.currentStep];
        if (!step) {
            console.log(`Tutorial: No step found for index ${this.currentStep}`);
            return;
        }
        
        console.log(`Tutorial: Showing step ${this.currentStep}: ${step.title}`);
        this.updateContent(step);
        this.updateNavigation();
        
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
    }

    createTutorialInterface() {
        // Create overlay with spotlight cutout
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999998;
            pointer-events: auto;
        `;
        
        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'tutorial-panel';
        this.panel.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            color: #2c3e50;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08);
            z-index: 999999;
            max-width: 480px;
            max-height: 85vh;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.8);
        `;
        
        this.panel.innerHTML = `
            <div class="tutorial-header">
                <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 700; line-height: 1.3;"></h2>
                <button class="tutorial-close" style="position: absolute; top: 20px; right: 20px; background: #f8f9fa; border: 1px solid #dee2e6; font-size: 18px; cursor: pointer; color: #6c757d; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">×</button>
            </div>
            <div class="tutorial-content" style="margin-bottom: 28px; line-height: 1.65; color: #495057; font-size: 15px;"></div>
            <div class="tutorial-navigation" style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; gap: 12px;">
                <button class="tutorial-prev" style="padding: 12px 24px; background: #e9ecef; color: #495057; border: 1px solid #dee2e6; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 14px;">Previous</button>
                <span class="tutorial-progress" style="color: #6c757d; font-size: 14px; font-weight: 600; padding: 8px 16px; background: rgba(108, 117, 125, 0.1); border-radius: 20px;"></span>
                <button class="tutorial-next" style="padding: 12px 24px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);">Next</button>
            </div>
        `;
        
        // Add event listeners
        this.panel.querySelector('.tutorial-close').addEventListener('click', () => this.stop());
        this.panel.querySelector('.tutorial-prev').addEventListener('click', () => this.previousStep());
        this.panel.querySelector('.tutorial-next').addEventListener('click', () => this.nextStep());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.stop();
        });
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.panel);
        
        // Add animation CSS if not already added
        if (!document.querySelector('#tutorial-animations')) {
            const style = document.createElement('style');
            style.id = 'tutorial-animations';
            style.textContent = `
                @keyframes tutorialPulse {
                    0%, 100% { 
                        box-shadow: 0 0 20px rgba(0, 123, 255, 0.6), 0 0 40px rgba(0, 123, 255, 0.3); 
                        transform: scale(1);
                    }
                    50% { 
                        box-shadow: 0 0 30px rgba(0, 123, 255, 0.8), 0 0 60px rgba(0, 123, 255, 0.5); 
                        transform: scale(1.015);
                    }
                }
                
                @keyframes tutorialFadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                .tutorial-panel {
                    animation: tutorialFadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .tutorial-prev:hover {
                    background: #dee2e6 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
                }
                
                .tutorial-next:hover {
                    background: linear-gradient(135deg, #0056b3 0%, #004085 100%) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4) !important;
                }
                
                .tutorial-close:hover {
                    background: #e9ecef !important;
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
                }
                
                .tutorial-content h3 {
                    color: #2c3e50 !important;
                    font-weight: 700 !important;
                    margin: 16px 0 12px 0 !important;
                    font-size: 18px !important;
                }
                
                .tutorial-content h4 {
                    color: #495057 !important;
                    font-weight: 600 !important;
                    margin: 14px 0 8px 0 !important;
                    font-size: 16px !important;
                }
                
                .tutorial-content ul, .tutorial-content ol {
                    margin: 12px 0 !important;
                    padding-left: 20px !important;
                }
                
                .tutorial-content li {
                    margin: 8px 0 !important;
                    color: #495057 !important;
                }
                
                .tutorial-content strong {
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                }
                
                .tutorial-content p {
                    margin: 12px 0 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    removeTutorialInterface() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    }

    updateContent(step) {
        if (!this.panel) return;
        
        this.panel.querySelector('h2').textContent = step.title;
        this.panel.querySelector('.tutorial-content').innerHTML = step.content;
    }

    updateNavigation() {
        if (!this.panel) return;
        
        const prevBtn = this.panel.querySelector('.tutorial-prev');
        const nextBtn = this.panel.querySelector('.tutorial-next');
        const progress = this.panel.querySelector('.tutorial-progress');
        
        prevBtn.disabled = this.currentStep === 0;
        prevBtn.style.opacity = this.currentStep === 0 ? '0.5' : '1';
        
        if (this.currentStep === this.tutorialSteps.length - 1) {
            nextBtn.textContent = 'Finish';
        } else {
            nextBtn.textContent = 'Next';
        }
        
        progress.textContent = `${this.currentStep + 1} of ${this.tutorialSteps.length}`;
    }

    highlightElement(selector) {
        this.clearHighlights();
        
        console.log(`Tutorial: Trying to highlight selector: ${selector}`);
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Tutorial: Element not found for selector: ${selector}`);
            console.log(`Tutorial: Available header elements:`, document.querySelectorAll('header, .header'));
            this.centerPanel();
            return;
        }
        
        console.log(`Tutorial: Found element to highlight:`, element);
        console.log(`Tutorial: Element dimensions:`, element.getBoundingClientRect());
        
        const rect = element.getBoundingClientRect();
        
        // Check if element has zero dimensions
        if (rect.width === 0 || rect.height === 0) {
            console.warn(`Tutorial: Element has zero dimensions - width: ${rect.width}, height: ${rect.height}`);
            this.centerPanel();
            return;
        }
        const padding = 8;
        
        // Create dark overlay first
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 999995;
            pointer-events: none;
        `;
        
        // Create spotlight effect by cutting out highlighted area from overlay
        // Handle off-screen elements by clamping coordinates
        const topClamp = Math.max(rect.top - padding, 0);
        const leftClamp = Math.max(rect.left - padding, 0);
        const rightClamp = Math.min(rect.right + padding, window.innerWidth);
        const bottomClamp = Math.min(rect.bottom + padding, window.innerHeight);
        
        const clipPath = `polygon(
            0% 0%, 
            0% 100%, 
            ${leftClamp}px 100%, 
            ${leftClamp}px ${topClamp}px, 
            ${rightClamp}px ${topClamp}px, 
            ${rightClamp}px ${bottomClamp}px, 
            ${leftClamp}px ${bottomClamp}px, 
            ${leftClamp}px 100%, 
            100% 100%, 
            100% 0%
        )`;
        
        this.overlay.style.clipPath = clipPath;
        document.body.appendChild(this.overlay);
        
        console.log(`Tutorial: Created overlay with clipPath:`, clipPath);
        
        // Create glowing border around the highlighted element
        const highlightBorder = document.createElement('div');
        highlightBorder.className = 'tutorial-highlight-border';
        highlightBorder.style.cssText = `
            position: fixed;
            top: ${rect.top - padding}px;
            left: ${rect.left - padding}px;
            width: ${rect.width + (padding * 2)}px;
            height: ${rect.height + (padding * 2)}px;
            border: 3px solid #007bff;
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(0, 123, 255, 0.6), 0 0 40px rgba(0, 123, 255, 0.3);
            z-index: 999995;
            pointer-events: none;
            animation: tutorialPulse 2s infinite ease-in-out;
        `;
        
        document.body.appendChild(highlightBorder);
        this.highlightedElement = highlightBorder;
        
        // Bump original element z-index
        element.style.position = 'relative';
        element.style.zIndex = '999997';
        this.originalElement = element;
        
        // Auto-scroll to highlighted element
        this.scrollToElement(element);
        
        // Update overlay position after scrolling
        setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            const newTopClamp = Math.max(newRect.top - padding, 0);
            const newLeftClamp = Math.max(newRect.left - padding, 0);
            const newRightClamp = Math.min(newRect.right + padding, window.innerWidth);
            const newBottomClamp = Math.min(newRect.bottom + padding, window.innerHeight);
            
            const newClipPath = `polygon(
                0% 0%, 
                0% 100%, 
                ${newLeftClamp}px 100%, 
                ${newLeftClamp}px ${newTopClamp}px, 
                ${newRightClamp}px ${newTopClamp}px, 
                ${newRightClamp}px ${newBottomClamp}px, 
                ${newLeftClamp}px ${newBottomClamp}px, 
                ${newLeftClamp}px 100%, 
                100% 100%, 
                100% 0%
            )`;
            
            if (this.overlay) {
                this.overlay.style.clipPath = newClipPath;
                console.log(`Tutorial: Updated overlay clipPath after scroll:`, newClipPath);
            }
            
            // Update highlight border position too
            if (this.highlightedElement) {
                this.highlightedElement.style.top = `${newRect.top - padding}px`;
                this.highlightedElement.style.left = `${newRect.left - padding}px`;
                this.highlightedElement.style.width = `${newRect.width + (padding * 2)}px`;
                this.highlightedElement.style.height = `${newRect.height + (padding * 2)}px`;
            }
        }, 200);
        
        this.positionPanelNearElement(element);
    }

    clearHighlights() {
        // Remove overlay completely
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.highlightedElement) {
            this.highlightedElement.remove();
            this.highlightedElement = null;
        }
        if (this.originalElement) {
            this.originalElement.style.position = '';
            this.originalElement.style.zIndex = '';
            this.originalElement = null;
        }
    }

    positionPanelNearElement(element) {
        if (!this.panel || !element) return;
        
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, position panel at bottom of screen
            this.panel.style.position = 'fixed';
            this.panel.style.left = '10px';
            this.panel.style.right = '10px';
            this.panel.style.bottom = '20px';
            this.panel.style.top = 'auto';
            this.panel.style.maxWidth = 'none';
            this.panel.style.width = 'auto';
            this.panel.style.transform = 'none';
            return;
        }
        
        const rect = element.getBoundingClientRect();
        const panelWidth = 400;
        const panelHeight = this.panel.offsetHeight || 300;
        const margin = 20;
        
        let left = rect.right + margin;
        let top = rect.top;
        
        // Adjust if panel goes off screen
        if (left + panelWidth > window.innerWidth) {
            left = rect.left - panelWidth - margin;
        }
        if (left < margin) {
            left = margin;
            top = rect.bottom + margin;
        }
        if (top + panelHeight > window.innerHeight) {
            top = window.innerHeight - panelHeight - margin;
        }
        if (top < margin) {
            top = margin;
        }
        
        this.panel.style.left = `${left}px`;
        this.panel.style.top = `${top}px`;
        this.panel.style.transform = 'none';
    }

    centerPanel() {
        if (!this.panel) return;
        
        this.panel.style.left = '50%';
        this.panel.style.top = '50%';
        this.panel.style.transform = 'translate(-50%, -50%)';
    }

    scrollToElement(element) {
        // Enable scrolling for all devices now
        console.log(`Tutorial: Scrolling enabled for all devices - width: ${window.innerWidth}`);
        
        // Wait a moment for highlighting to be applied
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const elementCenter = rect.top + (rect.height / 2);
            
            console.log(`Tutorial: Scrolling to element - rect.top: ${rect.top}, viewportHeight: ${viewportHeight}`);
            
            // Always scroll to center the highlighted element
            const scrollTarget = window.scrollY + elementCenter - (viewportHeight / 2);
            
            console.log(`Tutorial: Scroll target: ${scrollTarget}`);
            
            window.scrollTo({
                top: Math.max(0, scrollTarget),
                behavior: 'smooth'
            });
        }, 100);
    }
}

// Initialize the tutorial system
window.tutorialSystem = null;