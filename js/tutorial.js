/**
 * Tutorial System
 * Provides interactive educational guidance for students
 */

class TutorialSystem {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialSteps = [];
        this.modal = null;
        this.highlightedElements = [];
        
        this.initializeTutorialSteps();
        this.setupEventListeners();
        this.injectTutorialStyles();
        
        console.log('TutorialSystem initialized');
    }

    initializeTutorialSteps() {
        this.tutorialSteps = [
            {
                title: "Welcome to Renewable Energy City Simulator!",
                content: `
                    <div class="tutorial-welcome">
                        <h3>🌱 Learn to Build a Sustainable City!</h3>
                        <p>This simulation teaches you about renewable energy sources and how to design an eco-friendly city.</p>
                        
                        <h4>What you'll learn:</h4>
                        <ul>
                            <li>🌞 Different types of renewable energy</li>
                            <li>🏙️ How cities consume energy</li>
                            <li>🌤️ How weather affects energy production</li>
                            <li>💰 Cost vs. environmental benefits</li>
                            <li>📊 Energy efficiency and sustainability</li>
                        </ul>
                        
                        <p><strong>Goal:</strong> Create a city that produces enough clean energy to meet all its needs!</p>
                    </div>
                `,
                highlight: null,
                action: null
            },
            {
                title: "Understanding City Zones",
                content: `
                    <div class="tutorial-zones">
                        <h3>🏘️ City Zones and Energy Needs</h3>
                        <p>Cities are divided into different zones, each with unique energy requirements:</p>
                        
                        <div class="zone-explanation">
                            <div class="zone-item">
                                <div class="zone-color residential"></div>
                                <div>
                                    <strong>Residential Zones</strong><br>
                                    <small>50 kW per cell - Houses and apartments where people live</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color commercial"></div>
                                <div>
                                    <strong>Commercial Zones</strong><br>
                                    <small>100 kW per cell - Offices, shops, and businesses</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color industrial"></div>
                                <div>
                                    <strong>Industrial Zones</strong><br>
                                    <small>200 kW per cell - Factories and heavy manufacturing</small>
                                </div>
                            </div>
                        </div>
                        
                        <p><strong>Try it:</strong> Click on the grid to create zones!</p>
                    </div>
                `,
                highlight: ".city-grid",
                action: "enableZoneMode"
            },
            {
                title: "Creating Your First Zone",
                content: `
                    <div class="tutorial-zones">
                        <h3>🎯 Let's Create a Residential Zone</h3>
                        <p>Follow these steps:</p>
                        <ol>
                            <li>Make sure "Zone Mode" is selected (orange button)</li>
                            <li>Select "Residential" from the dropdown</li>
                            <li>Click on any empty grid cell to create a residential zone</li>
                        </ol>
                        
                        <p>The cell will turn green to show it's now a residential area that needs 50 kW of power.</p>
                        
                        <div class="tutorial-tip">
                            💡 <strong>Tip:</strong> Click on the same cell again to remove the zone.
                        </div>
                    </div>
                `,
                highlight: ".grid-controls",
                action: "waitForZoneCreation"
            },
            {
                title: "You're Ready to Build!",
                content: `
                    <div class="tutorial-conclusion">
                        <h3>🎉 Congratulations!</h3>
                        <p>You now know the basics of building a sustainable renewable energy city!</p>
                        
                        <div class="next-steps">
                            <h4>Your Next Steps:</h4>
                            <ol>
                                <li>Expand your city with more zones</li>
                                <li>Drag energy sources from the left panel to power your zones</li>
                                <li>Monitor weather changes and adapt your strategy</li>
                                <li>Watch the dashboard to track your city's performance</li>
                                <li>Save your best designs</li>
                            </ol>
                        </div>
                        
                        <p><strong>Remember:</strong> You can restart this tutorial anytime by clicking the "Tutorial" button!</p>
                    </div>
                `,
                highlight: null,
                action: "completeTutorial"
            }
        ];
    }

    setupEventListeners() {
        // Listen for tutorial completion events
        document.addEventListener('tutorialStepCompleted', (event) => {
            if (this.isActive) {
                this.nextStep();
            }
        });
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.showTutorialModal();
        this.showCurrentStep();
        
        console.log('Tutorial started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.hideTutorialModal();
        this.clearHighlights();
        
        console.log('Tutorial stopped');
    }

    nextStep() {
        if (!this.isActive) return;
        
        this.clearHighlights();
        this.currentStep++;
        
        if (this.currentStep >= this.tutorialSteps.length) {
            this.completeTutorial();
        } else {
            this.showCurrentStep();
        }
    }

    previousStep() {
        if (!this.isActive || this.currentStep <= 0) return;
        
        this.clearHighlights();
        this.currentStep--;
        this.showCurrentStep();
    }

    showCurrentStep() {
        const step = this.tutorialSteps[this.currentStep];
        if (!step) return;
        
        this.updateTutorialContent(step);
        this.updateNavigationButtons();
        
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
        
        if (step.action) {
            this.executeStepAction(step.action);
        }
    }

    showTutorialModal() {
        this.modal = document.getElementById('tutorial-modal');
        if (!this.modal) {
            this.createTutorialModal();
        }
        
        this.modal.style.display = 'block';
        this.setupModalHandlers();
    }

    createTutorialModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'tutorial-modal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="tutorial-content">
                    <!-- Tutorial content will be loaded here -->
                </div>
                <div class="tutorial-navigation">
                    <button id="prev-tutorial" class="btn btn-secondary">Previous</button>
                    <span id="tutorial-progress">1 / ${this.tutorialSteps.length}</span>
                    <button id="next-tutorial" class="btn btn-primary">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    hideTutorialModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    setupModalHandlers() {
        const closeBtn = this.modal.querySelector('.close');
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        
        if (closeBtn) {
            closeBtn.onclick = () => this.stop();
        }
        
        if (prevBtn) {
            prevBtn.onclick = () => this.previousStep();
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => this.nextStep();
        }
        
        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.stop();
            }
        };
    }

    updateTutorialContent(step) {
        const contentDiv = document.getElementById('tutorial-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <h2>${step.title}</h2>
                ${step.content}
            `;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        const progressSpan = document.getElementById('tutorial-progress');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        
        if (nextBtn) {
            if (this.currentStep === this.tutorialSteps.length - 1) {
                nextBtn.textContent = 'Finish';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
        
        if (progressSpan) {
            progressSpan.textContent = `${this.currentStep + 1} / ${this.tutorialSteps.length}`;
        }
    }

    highlightElement(selector) {
        this.clearHighlights();
        
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            this.highlightedElements.push(element);
        }
    }

    clearHighlights() {
        this.highlightedElements.forEach(element => {
            element.classList.remove('tutorial-highlight');
        });
        this.highlightedElements = [];
    }

    executeStepAction(action) {
        switch (action) {
            case 'enableZoneMode':
                this.mainApp.setMode('zone');
                break;
            case 'waitForZoneCreation':
                this.waitForUserAction('zoneCreated');
                break;
            case 'completeTutorial':
                // Action handled in nextStep
                break;
        }
    }

    waitForUserAction(actionType) {
        const checkAction = () => {
            let completed = false;
            
            switch (actionType) {
                case 'zoneCreated':
                    const totalZones = this.mainApp.zoneManager.getTotalEnergyDemand();
                    completed = totalZones > 0;
                    break;
            }
            
            if (completed) {
                this.showActionCompleted(actionType);
            } else {
                setTimeout(checkAction, 1000);
            }
        };
        
        checkAction();
    }

    showActionCompleted(actionType) {
        const messages = {
            zoneCreated: '✅ Great! You created your first zone!'
        };
        
        const message = messages[actionType] || '✅ Well done!';
        this.showTutorialNotification(message, 'success');
        
        const nextBtn = document.getElementById('next-tutorial');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.add('animate-pulse');
        }
    }

    showTutorialNotification(message, type = 'info') {
        console.log(`Tutorial: ${message}`);
    }

    confirmExit() {
        if (confirm('Are you sure you want to exit the tutorial?')) {
            this.stop();
        }
    }

    completeTutorial() {
        this.stop();
        this.showTutorialNotification('🎉 Tutorial completed! You\'re ready to build your renewable energy city!', 'success');
        console.log('Tutorial completed');
    }

    injectTutorialStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-highlight {
                position: relative;
                z-index: 1001;
                border: 3px solid hsl(var(--accent-color));
                border-radius: 8px;
                animation: pulse 1s infinite;
            }
            
            .tutorial-welcome, .tutorial-zones, .tutorial-conclusion {
                padding: 1rem;
            }
            
            .zone-explanation {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .zone-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.5rem;
                background: hsl(var(--background));
                border-radius: 6px;
            }
            
            .zone-color {
                width: 20px;
                height: 20px;
                border-radius: 4px;
            }
            
            .tutorial-tip {
                background: hsl(var(--info) / 0.1);
                border-left: 4px solid hsl(var(--info));
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorialSystem };
}