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
                        <p>This advanced simulation teaches you about renewable energy sources and sustainable urban planning.</p>
                        
                        <h4>What you'll learn:</h4>
                        <ul>
                            <li>🌞 7 different energy sources (5 renewable + 2 fossil fuels)</li>
                            <li>🏙️ How city zones generate income when powered</li>
                            <li>🌤️ How weather affects energy production</li>
                            <li>💰 Budget management and economic sustainability</li>
                            <li>🗻 Terrain bonuses for optimal energy placement</li>
                            <li>📊 Real-time performance tracking</li>
                        </ul>
                        
                        <p><strong>Goal:</strong> Build a profitable, sustainable city with $250,000 starting budget!</p>
                    </div>
                `,
                highlight: null,
                action: null
            },
            {
                title: "Understanding Your Budget System",
                content: `
                    <div class="tutorial-budget">
                        <h3>💰 Managing Your City Budget</h3>
                        <p>You start with <strong>$250,000</strong> to build your city. Here's how money works:</p>
                        
                        <div class="budget-explanation">
                            <h4>💸 Expenses:</h4>
                            <ul>
                                <li>Energy sources cost money to build</li>
                                <li>You get 70% refund when removing energy sources</li>
                            </ul>
                            
                            <h4>💵 Income (Monthly):</h4>
                            <ul>
                                <li><strong>Residential:</strong> $120/month (when powered)</li>
                                <li><strong>Commercial:</strong> $250/month (when powered)</li>
                                <li><strong>Industrial:</strong> $400/month (when powered)</li>
                            </ul>
                            
                            <h4>🔋 Power Requirements:</h4>
                            <ul>
                                <li>Zones only generate income if they have enough power</li>
                                <li>Energy is shared across the entire city grid</li>
                                <li>Unpowered zones get red borders and warning icons</li>
                            </ul>
                        </div>
                        
                        <p><strong>Tip:</strong> Click the budget amount to see detailed financial information!</p>
                    </div>
                `,
                highlight: ".budget-display",
                action: null
            },
            {
                title: "Understanding City Zones",
                content: `
                    <div class="tutorial-zones">
                        <h3>🏘️ City Zones and Energy Needs</h3>
                        <p>Cities are divided into different zones with unique energy and income characteristics:</p>
                        
                        <div class="zone-explanation">
                            <div class="zone-item">
                                <div class="zone-color residential"></div>
                                <div>
                                    <strong>Residential Zones</strong><br>
                                    <small>50 kW demand • $120/month income when powered</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color commercial"></div>
                                <div>
                                    <strong>Commercial Zones</strong><br>
                                    <small>100 kW demand • $250/month income when powered</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color industrial"></div>
                                <div>
                                    <strong>Industrial Zones</strong><br>
                                    <small>200 kW demand • $400/month income when powered</small>
                                </div>
                            </div>
                        </div>
                        
                        <p><strong>Advanced Features:</strong></p>
                        <ul>
                            <li>Drag to select multiple cells for bulk zone creation</li>
                            <li>Monthly income updates in real-time</li>
                            <li>Visual indicators show powered vs unpowered zones</li>
                        </ul>
                    </div>
                `,
                highlight: ".city-grid",
                action: "enableZoneMode"
            },
            {
                title: "Understanding Energy Sources",
                content: `
                    <div class="tutorial-energy">
                        <h3>⚡ Energy Source Types & Costs</h3>
                        <p>Choose from 7 different energy sources, each with unique characteristics:</p>
                        
                        <div class="energy-explanation">
                            <h4>🌱 Renewable Energy:</h4>
                            <ul>
                                <li><strong>Solar:</strong> $15,000 • 100kW • Works best in sunny weather</li>
                                <li><strong>Wind:</strong> $20,000 • 150kW • Enhanced by windy weather</li>
                                <li><strong>Hydro:</strong> $25,000 • 200kW • +60% bonus near rivers</li>
                                <li><strong>Geothermal:</strong> $30,000 • 120kW • +50% bonus in mountains</li>
                                <li><strong>Biomass:</strong> $18,000 • 80kW • +40% bonus in forests</li>
                            </ul>
                            
                            <h4>🏭 Fossil Fuels:</h4>
                            <ul>
                                <li><strong>Coal:</strong> $35,000 • 300kW • High pollution</li>
                                <li><strong>Natural Gas:</strong> $28,000 • 250kW • Lower emissions than coal</li>
                            </ul>
                        </div>
                        
                        <p><strong>Advanced Placement:</strong> Drag to select multiple cells, then auto-place energy sources!</p>
                    </div>
                `,
                highlight: ".energy-sources",
                action: null
            },
            {
                title: "Terrain Bonuses & Strategic Placement",
                content: `
                    <div class="tutorial-terrain">
                        <h3>🗻 Terrain Features & Efficiency Bonuses</h3>
                        <p>The city has specialized terrain that provides efficiency bonuses for certain energy sources:</p>
                        
                        <div class="terrain-explanation">
                            <div class="terrain-item">
                                <strong>🌲 Forest Areas:</strong> +40% biomass efficiency
                            </div>
                            <div class="terrain-item">
                                <strong>🏔️ Mountain Areas:</strong> +50% geothermal, +30% wind efficiency
                            </div>
                            <div class="terrain-item">
                                <strong>🏖️ Beach Areas:</strong> +35% wind, +25% solar efficiency
                            </div>
                            <div class="terrain-item">
                                <strong>🌊 River Areas:</strong> +60% hydro efficiency
                            </div>
                        </div>
                        
                        <p><strong>Strategy Tips:</strong></p>
                        <ul>
                            <li>Place hydro plants near rivers for maximum efficiency</li>
                            <li>Mountain areas are perfect for geothermal and wind</li>
                            <li>Forests boost biomass production significantly</li>
                            <li>Beach areas enhance both wind and solar</li>
                        </ul>
                    </div>
                `,
                highlight: ".city-grid",
                action: null
            },
            {
                title: "Weather System & Production",
                content: `
                    <div class="tutorial-weather">
                        <h3>🌤️ Dynamic Weather Effects</h3>
                        <p>Weather conditions change every 30-60 seconds and affect energy production:</p>
                        
                        <div class="weather-explanation">
                            <div class="weather-item">
                                <strong>☀️ Sunny:</strong> Solar +20%, others normal
                            </div>
                            <div class="weather-item">
                                <strong>☁️ Cloudy:</strong> Solar -30%, others normal
                            </div>
                            <div class="weather-item">
                                <strong>🌧️ Rainy:</strong> Solar -50%, Hydro +30%
                            </div>
                            <div class="weather-item">
                                <strong>💨 Windy:</strong> Wind +40%, Solar -10%
                            </div>
                        </div>
                        
                        <p><strong>Advanced Features:</strong></p>
                        <ul>
                            <li>Weather forecast shows upcoming conditions</li>
                            <li>Real-time production updates based on weather</li>
                            <li>Diversify energy sources to handle weather changes</li>
                            <li>Income calculations adjust with production changes</li>
                        </ul>
                    </div>
                `,
                highlight: ".weather-display",
                action: null
            },
            {
                title: "Dashboard & Performance Monitoring",
                content: `
                    <div class="tutorial-dashboard">
                        <h3>📊 Real-Time Performance Dashboard</h3>
                        <p>The dashboard provides comprehensive city performance metrics:</p>
                        
                        <div class="dashboard-explanation">
                            <h4>📈 Key Metrics:</h4>
                            <ul>
                                <li><strong>Energy Production:</strong> Total kW generated vs demanded</li>
                                <li><strong>Efficiency:</strong> How well your city meets energy needs</li>
                                <li><strong>Carbon Reduction:</strong> Environmental impact tracking</li>
                                <li><strong>Sustainability Score:</strong> Overall city performance grade</li>
                            </ul>
                            
                            <h4>💡 Performance Insights:</h4>
                            <ul>
                                <li>Energy mix breakdown showing source diversity</li>
                                <li>Zone-by-zone performance analysis</li>
                                <li>Financial projections and trends</li>
                                <li>Achievement system for milestones</li>
                            </ul>
                        </div>
                        
                        <p><strong>Use the dashboard to:</strong> Track progress, identify problems, and optimize your city design!</p>
                    </div>
                `,
                highlight: ".dashboard",
                action: null
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
                        
                        <p>The cell will turn green and show it needs 50 kW of power to generate $120/month income.</p>
                        
                        <div class="tutorial-tip">
                            💡 <strong>Advanced Tip:</strong> Drag across multiple cells to create zones in bulk!
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
                        <h3>🎉 Ready for Advanced City Planning!</h3>
                        <p>You now understand all the advanced features of the renewable energy city simulator!</p>
                        
                        <div class="next-steps">
                            <h4>Your Next Steps:</h4>
                            <ol>
                                <li><strong>Plan strategically:</strong> Use terrain bonuses for optimal placement</li>
                                <li><strong>Manage budget:</strong> Balance costs with income potential</li>
                                <li><strong>Diversify energy:</strong> Mix renewable sources for weather resilience</li>
                                <li><strong>Monitor performance:</strong> Use the dashboard to track efficiency</li>
                                <li><strong>Experiment:</strong> Try different city layouts and energy mixes</li>
                                <li><strong>Compare options:</strong> Test renewable vs fossil fuel scenarios</li>
                            </ol>
                        </div>
                        
                        <div class="tutorial-tip">
                            🎯 <strong>Challenge:</strong> Can you build a 100% renewable city that's profitable?
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