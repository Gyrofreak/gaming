/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', function() {
    initializeOperator();
    initializeProfileButton();
    initializeSystemStatus();
    initializeHeaderProfilePicture();
    updateLastUpdate();
});

/* ===== OPERATOR FUNCTIONS ===== */
function initializeOperator() {
    const urlParams = new URLSearchParams(window.location.search);
    const operatorName = urlParams.get('operator');
    
    // Load saved profile data
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
        const profileData = JSON.parse(savedData);
        if (profileData.displayName) {
            document.getElementById('operatorName').textContent = profileData.displayName;
            return;
        }
    }
    
    // Fallback to URL parameter
    if (operatorName) {
        document.getElementById('operatorName').textContent = operatorName;
    }
}

function initializeHeaderProfilePicture() {
    const headerProfilePicture = document.getElementById('headerProfilePicture');
    if (headerProfilePicture) {
        const savedProfilePicture = localStorage.getItem('profilePicture');
        if (savedProfilePicture) {
            headerProfilePicture.src = savedProfilePicture;
        }
    }
}

/* ===== PROFILE FUNCTIONS ===== */
function initializeProfileButton() {
    const profileButton = document.querySelector('.profile-button');
    if (profileButton) {
        profileButton.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
}

/* ===== SYSTEM STATUS FUNCTIONS ===== */
function initializeSystemStatus() {
    updateSystemStatus();
    setInterval(updateSystemStatus, 5000); // Update every 5 seconds
}

function updateSystemStatus() {
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        const label = item.querySelector('.label').textContent;
        const valueElement = item.querySelector('.value');
        
        // Simulate different status values
        switch(label) {
            case 'CPU Usage':
                valueElement.textContent = `${Math.floor(Math.random() * 30) + 20}%`;
                break;
            case 'Memory Usage':
                valueElement.textContent = `${Math.floor(Math.random() * 40) + 30}%`;
                break;
            case 'Network Status':
                valueElement.textContent = 'Stable';
                break;
            case 'System Temperature':
                valueElement.textContent = `${Math.floor(Math.random() * 10) + 35}°C`;
                break;
        }
    });
}

/* ===== TIME FUNCTIONS ===== */
function updateLastUpdate() {
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
        const profileData = JSON.parse(savedData);
        const lastUpdate = new Date(profileData.lastUpdate);
        document.getElementById('lastUpdate').textContent = lastUpdate.toLocaleTimeString();
    } else {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
    }
}

// Update time every minute
setInterval(updateLastUpdate, 60000);

// Get operator name from URL parameter or saved data
const urlParams = new URLSearchParams(window.location.search);
let operatorName = urlParams.get('operator');

// Load saved profile data
const savedData = localStorage.getItem('profileData');
if (savedData) {
    const profileData = JSON.parse(savedData);
    if (!operatorName) {
        operatorName = profileData.displayName;
    }
    document.getElementById('operatorName').textContent = operatorName;
    
    // Update status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    statusIndicator.className = 'status-indicator ' + (profileData.status || 'online');
} else if (operatorName) {
    document.getElementById('operatorName').textContent = operatorName;
} 