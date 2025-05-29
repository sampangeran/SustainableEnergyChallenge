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
                        <li><strong>☀️ Solar:</strong> $8,000 - Clean, weather-dependent</li>
                        <li><strong>💨 Wind:</strong> $10,000 - Powerful in windy conditions</li>
                        <li><strong>🌊 Hydro:</strong> $12,000 - Reliable water power</li>
                        <li><strong>🌋 Geothermal:</strong> $15,000 - Consistent underground energy</li>
                        <li><strong>🌱 Biomass:</strong> $10,000 - Organic waste to energy</li>
                    </ul>
                    
                    <p>You can drag these onto the grid or use Energy Mode for placement.</p>
                `,
                highlight: ".energy-sources"
            },
            {
                title: "Budget and Financial Management",
                content: `
                    <h3>💰 Managing Your City Budget</h3>
                    <p>Start with $250,000 to build your sustainable city. Smart planning is essential:</p>
                    
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
                        <li><strong>☀️ Sunny:</strong> +20% solar, normal wind/hydro</li>
                        <li><strong>☁️ Cloudy:</strong> -50% solar, +10% hydro</li>
                        <li><strong>🌧️ Rainy:</strong> -70% solar, +30% hydro</li>
                        <li><strong>💨 Windy:</strong> +40% wind, -10% solar</li>
                    </ul>
                    
                    <p>Diversify your energy sources to maintain stable power during all weather conditions.</p>
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
                        <li><strong>Sustainability Score:</strong> Environmental impact rating</li>
                        <li><strong>Financial Performance:</strong> Income and expense tracking</li>
                    </ul>
                    
                    <p>Aim for high efficiency and sustainability scores to maximize your city's success.</p>
                `,
                highlight: ".dashboard"
            },
            {
                title: "Creating City Zones",
                content: `
                    <h3>🏘️ Build Your First Zone</h3>
                    <p>Now let's create a residential area:</p>
                    
                    <ol>
                        <li>Make sure "Zone Mode" is selected (orange button)</li>
                        <li>Choose "Residential" from the dropdown menu</li>
                        <li>Click on any empty grid cell to create the zone</li>
                    </ol>
                    
                    <p>Zones only generate income when they have sufficient power supply. Unpowered zones show red warning indicators.</p>
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
                        <li><strong>Use terrain bonuses:</strong> Place energy sources strategically</li>
                        <li><strong>Diversify energy:</strong> Mix sources for weather resilience</li>
                        <li><strong>Monitor performance:</strong> Keep efficiency high</li>
                        <li><strong>Manage budget:</strong> Balance investments with income</li>
                    </ul>
                    
                    <p><strong>Challenge:</strong> Can you build a 100% renewable city that's profitable and efficient?</p>
                `,
                highlight: ".header"
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            z-index: 999999;
            max-width: 450px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        this.panel.innerHTML = `
            <div class="tutorial-header">
                <h2 style="margin: 0 0 16px 0; color: white; font-size: 22px; font-weight: 600;"></h2>
                <button class="tutorial-close" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; font-size: 20px; cursor: pointer; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
            <div class="tutorial-content" style="margin-bottom: 24px; line-height: 1.7; color: rgba(255,255,255,0.95); font-size: 14px;"></div>
            <div class="tutorial-navigation" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <button class="tutorial-prev" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;">Previous</button>
                <span class="tutorial-progress" style="color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 500;"></span>
                <button class="tutorial-next" style="padding: 10px 20px; background: rgba(255,255,255,0.9); color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">Next</button>
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
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.02); }
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
            this.centerPanel();
            return;
        }
        
        console.log(`Tutorial: Found element to highlight:`, element);
        
        const rect = element.getBoundingClientRect();
        const padding = 8;
        
        // Create spotlight effect by cutting out highlighted area from overlay
        const clipPath = `polygon(
            0% 0%, 
            0% 100%, 
            ${rect.left - padding}px 100%, 
            ${rect.left - padding}px ${rect.top - padding}px, 
            ${rect.right + padding}px ${rect.top - padding}px, 
            ${rect.right + padding}px ${rect.bottom + padding}px, 
            ${rect.left - padding}px ${rect.bottom + padding}px, 
            ${rect.left - padding}px 100%, 
            100% 100%, 
            100% 0%
        )`;
        
        this.overlay.style.clipPath = clipPath;
        
        // Create glowing border around the highlighted element
        const highlightBorder = document.createElement('div');
        highlightBorder.className = 'tutorial-highlight-border';
        highlightBorder.style.cssText = `
            position: fixed;
            top: ${rect.top - padding}px;
            left: ${rect.left - padding}px;
            width: ${rect.width + (padding * 2)}px;
            height: ${rect.height + (padding * 2)}px;
            border: 3px solid #f39c12;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(243, 156, 18, 0.8);
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
        
        this.positionPanelNearElement(element);
    }

    clearHighlights() {
        // Reset overlay clip path
        if (this.overlay) {
            this.overlay.style.clipPath = '';
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
}

// Initialize the tutorial system
window.tutorialSystem = null;