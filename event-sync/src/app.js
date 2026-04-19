document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements: Tabs ---
    const btnCompanion = document.getElementById('btn-companion-view');
    const btnBrain = document.getElementById('btn-brain-view');
    const companionView = document.getElementById('companion-view');
    const brainView = document.getElementById('brain-view');

    // --- DOM Elements: Companion ---
    const timelineFill = document.getElementById('timeline-fill');
    const eventBadge = document.getElementById('event-status-badge');
    const nudgeTitle = document.getElementById('nudge-title');
    const nudgeDesc = document.getElementById('nudge-desc');
    const timelineCard = document.getElementById('timeline-card');
    
    const microAlert = document.getElementById('micro-alert');
    const microAlertText = document.getElementById('micro-alert-text');
    
    const facilityPulseList = document.getElementById('facility-pulse-list');
    const predictText = document.getElementById('predict-text');

    // --- DOM Elements: Venue Brain ---
    const heatmapContainer = document.getElementById('heatmap-container');
    const aiSuggestionList = document.getElementById('ai-suggestion-list');
    const bottleneckCount = document.getElementById('bottleneck-count');

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    // --- Data Models ---
    
    // Movie is 3 hrs (180 mins). Interval is at 90 mins, lasts 15 mins.
    const EVENT_DURATION = 180 * 60; // seconds
    const INTERVAL_START = 88 * 60;  // 88 mins in (simulating fast approach)
    const INTERVAL_END = 103 * 60;
    
    // We will fast-forward time to demonstrate the interval approach
    let currentSimTime = 83 * 60; // Start at 83 mins (5 mins before interval)

    let zones = [
        { id: 'z1', name: 'Washroom A', type: '🚻', baseTraffic: 10, capacity: 50, currentLoad: 12 },
        { id: 'z2', name: 'Washroom B', type: '🚻', baseTraffic: 5, capacity: 40, currentLoad: 5 },
        { id: 'z3', name: 'Popcorn Kiosk 1', type: '🍿', baseTraffic: 8, capacity: 30, currentLoad: 8 },
        { id: 'z4', name: 'Exit Gate 2', type: '🚪', baseTraffic: 2, capacity: 100, currentLoad: 2 }
    ];

    // --- View Toggling ---
    btnCompanion.addEventListener('click', () => switchTab('companion'));
    btnBrain.addEventListener('click', () => switchTab('brain'));

    function switchTab(tab) {
        if (tab === 'companion') {
            btnCompanion.classList.add('active');
            btnBrain.classList.remove('active');
            companionView.classList.remove('hidden');
            brainView.classList.add('hidden');
        } else {
            btnBrain.classList.add('active');
            btnCompanion.classList.remove('active');
            brainView.classList.remove('hidden');
            companionView.classList.add('hidden');
        }
    }

    function showToast(msg) {
        toastMsg.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    // --- Core Simulation Logic ---

    function getZoneStatus(load, capacity) {
        const ratio = load / capacity;
        if (ratio < 0.5) return 'smooth';
        if (ratio < 0.8) return 'moderate';
        return 'congested';
    }

    function generateRoutePath(zone) {
        // Smart Pathing logic mock
        if (zone.id === 'z2') return `<span class="route-tag">Via North Hall</span> ~40% faster`;
        return `<span class="route-tag">Direct</span>`;
    }

    function renderCompanionPulse() {
        facilityPulseList.innerHTML = zones.filter(z => z.type !== '🚪').map(z => {
            const status = getZoneStatus(z.currentLoad, z.capacity);
            let pillText = 'Smooth';
            if(status === 'moderate') pillText = 'Moderate';
            if(status === 'congested') pillText = 'Congested';
            
            return `
                <div class="facility-card ${status}">
                    <div class="facility-info">
                        <div class="fac-icon">${z.type}</div>
                        <div class="fac-details">
                            <h4>${z.name}</h4>
                            <div class="fac-path">${generateRoutePath(z)}</div>
                        </div>
                    </div>
                    <div class="density-indicator">
                        <div class="status-pill ${status}">${pillText}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderBrainDashboard() {
        // Render Heatmaps
        heatmapContainer.innerHTML = zones.map(z => {
            const status = getZoneStatus(z.currentLoad, z.capacity);
            return `
                <div class="zone-blob ${status}">
                    <div class="zone-name">${z.name}</div>
                    <div class="zone-footfall">${z.currentLoad} pax</div>
                </div>
            `;
        }).join('');

        // Bottlenecks & Suggestions
        const congestedZones = zones.filter(z => getZoneStatus(z.currentLoad, z.capacity) === 'congested');
        bottleneckCount.innerText = congestedZones.length;
        
        let suggestionsHTML = '';
        if (congestedZones.length > 0) {
            suggestionsHTML = congestedZones.map(z => `
                <div class="ai-item">
                    <div>
                        <strong>High Density Detected:</strong> ${z.name} approaching capacity.
                        <br/>
                        <button class="action-btn">Redirect Footfall via App</button>
                    </div>
                </div>
            `).join('');
        } else {
            suggestionsHTML = `
                <div class="ai-item" style="border-color: var(--status-smooth);">
                    <div>
                        <strong>Optimal Flow:</strong> All zones operating smoothly.
                    </div>
                </div>
            `;
        }
        
        // Predictive suggestion based on time
        const minsToInterval = Math.floor((INTERVAL_START - currentSimTime) / 60);
        if (minsToInterval > 0 && minsToInterval <= 5) {
            suggestionsHTML += `
                <div class="ai-item" style="border-color: var(--status-mod);">
                    <div>
                        <strong>Prediction:</strong> Interval in ${minsToInterval} mins. Prepare Kiosk 2 staff.
                        <br/>
                        <button class="action-btn">Alert Staff</button>
                    </div>
                </div>
            `;
        }

        aiSuggestionList.innerHTML = suggestionsHTML;
    }

    let intervalTriggered = false;

    function simulateTick() {
        currentSimTime += 30; // Fast forward 30 seconds per tick
        
        const progressPct = (currentSimTime / EVENT_DURATION) * 100;
        timelineFill.style.width = `${Math.min(progressPct, 100)}%`;

        let isInterval = (currentSimTime >= INTERVAL_START && currentSimTime <= INTERVAL_END);
        
        // Dynamic Crowd Simulation
        zones.forEach(z => {
            // Random fluctuation
            const flux = Math.floor(Math.random() * 5) - 2;
            z.currentLoad = Math.max(0, z.currentLoad + flux);
            
            // Interval Spike Logic
            if (isInterval) {
                if (z.id.startsWith('z') && z.id !== 'z4') z.currentLoad += Math.floor(Math.random() * 8); 
            } else if (currentSimTime > INTERVAL_END) {
                // Post interval clear
                if (z.currentLoad > z.baseTraffic) z.currentLoad -= 5;
            }
        });

        // Predictive Wait Intelligence & Nudges
        const minsToInterval = Math.floor((INTERVAL_START - currentSimTime) / 60);
        
        if (currentSimTime < INTERVAL_START) {
            if (minsToInterval <= 5 && minsToInterval > 0) {
                eventBadge.innerText = 'Interval Approaching';
                eventBadge.style.color = 'var(--status-mod)';
                timelineCard.classList.add('focused');
                
                nudgeTitle.innerText = "Prepare for Interval";
                nudgeDesc.innerText = `Interval starts in ~${minsToInterval} mins.`;
                
                predictText.innerHTML = `<strong>Prediction:</strong> Washroom A congestion expected in <span class="highlight">${minsToInterval} mins</span>. Washroom B will be 40% faster.`;
                
                // Micro alert push
                if (minsToInterval === 3 && microAlert.classList.contains('hidden')) {
                    microAlert.classList.remove('hidden');
                    microAlertText.innerText = "Popcorn Kiosk 1 queues are currently empty. Quick refill before the rush?";
                    showToast("New Smart Nudge available");
                }
            } else {
                eventBadge.innerText = 'Playing';
                nudgeTitle.innerText = "Movie Playing";
                nudgeDesc.innerText = `Enjoy the show. We'll notify you before the interval.`;
            }
        } else if (isInterval) {
            eventBadge.innerText = 'Interval';
            eventBadge.style.color = 'var(--status-congest)';
            timelineCard.classList.add('focused');
            timelineCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            
            nudgeTitle.innerText = "Interval Active";
            const minsLeft = Math.floor((INTERVAL_END - currentSimTime) / 60);
            nudgeDesc.innerText = `Interval ends in ~${minsLeft} mins. Check Live Pulse for queues.`;
            predictText.innerHTML = `<strong>Peak Rush:</strong> Expect wait times to drop in ~5 mins.`;
            
            microAlert.classList.add('hidden');
            
            if(!intervalTriggered) {
                showToast("Interval has started!");
                intervalTriggered = true;
            }
        } else {
            eventBadge.innerText = 'Playing';
            eventBadge.style.color = 'var(--status-smooth)';
            timelineCard.classList.remove('focused');
            timelineCard.style.borderColor = '';
            
            nudgeTitle.innerText = "Act II Playing";
            nudgeDesc.innerText = `Settle in for the remainder of the show.`;
            predictText.innerHTML = `<strong>Clear:</strong> Flow is nominal.`;
        }

        renderCompanionPulse();
        renderBrainDashboard();
    }

    // Initialize
    renderCompanionPulse();
    renderBrainDashboard();
    
    // Run simulation tick every 2.5 seconds (representing 30 real-world seconds)
    setInterval(simulateTick, 2500);

});
