/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    initializeForm();
    initializeProfilePicture();
});

/* ===== PROFILE FUNCTIONS ===== */
function initializeProfile() {
    // Get operator name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const operatorName = urlParams.get('operator');
    
    // Load saved profile data
    loadProfileData();
    
    // Update operator name if available
    if (operatorName) {
        document.getElementById('operatorName').textContent = operatorName;
    }
}

function loadProfileData() {
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
        const profileData = JSON.parse(savedData);
        
        // Update form fields
        document.getElementById('displayName').value = profileData.displayName || '';
        document.getElementById('email').value = profileData.email || '';
        document.getElementById('status').value = profileData.status || 'online';
        
        // Update profile picture
        if (profileData.profilePicture) {
            document.getElementById('profilePicture').src = profileData.profilePicture;
        }
        
        // Update operator name
        if (profileData.displayName) {
            document.getElementById('operatorName').textContent = profileData.displayName;
        }
        
        // Update last update time
        updateLastUpdate(profileData.lastUpdate);
    }
}

/* ===== FORM FUNCTIONS ===== */
function initializeForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    // Add form change listeners
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            addLogEntry(`${input.name} updated`);
            saveProfileChanges();
        });
    });

    // Add form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAllChanges();
    });
}

function saveProfileChanges() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    const formData = new FormData(form);
    const changes = {};
    
    for (let [key, value] of formData.entries()) {
        if (value) {
            changes[key] = value;
        }
    }

    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();

    // Add log entry
    addLogEntry('Profile changes saved successfully');
}

function saveAllChanges() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    const formData = new FormData(form);
    
    // Validate password if changed
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    if (password && password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Save to localStorage
    const profileData = {
        displayName: formData.get('displayName'),
        email: formData.get('email'),
        status: formData.get('status'),
        lastUpdate: new Date().toISOString()
    };

    // Only add password if it was changed
    if (password) {
        profileData.password = password;
    }

    // Save profile picture if changed
    const profilePicture = document.getElementById('profilePicture').src;
    if (profilePicture !== 'default-profile.png') {
        profileData.profilePicture = profilePicture;
    }

    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Also save profile picture separately for easy access
    if (profileData.profilePicture) {
        localStorage.setItem('profilePicture', profileData.profilePicture);
    }

    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();

    // Add log entry
    addLogEntry('All profile changes saved successfully');

    // Show success message
    alert('All changes saved successfully!');
}

/* ===== PROFILE PICTURE FUNCTIONS ===== */
function initializeProfilePicture() {
    const pictureUpload = document.getElementById('pictureUpload');
    if (!pictureUpload) return;

    pictureUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profilePicture = document.getElementById('profilePicture');
                if (profilePicture) {
                    profilePicture.src = e.target.result;
                    addLogEntry('Profile picture updated');
                    saveProfileChanges();
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function resetProfilePicture() {
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePicture.src = 'default-profile.png';
        addLogEntry('Profile picture reset to default');
        saveProfileChanges();
    }
}

/* ===== LOG FUNCTIONS ===== */
function addLogEntry(message) {
    const logDisplay = document.querySelector('.log-display');
    if (!logDisplay) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;

    logDisplay.insertBefore(logEntry, logDisplay.firstChild);
    
    // Keep only the last 5 log entries
    while (logDisplay.children.length > 5) {
        logDisplay.removeChild(logDisplay.lastChild);
    }
}

/* ===== TIME FUNCTIONS ===== */
function updateLastUpdate(timestamp) {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const date = new Date(timestamp);
        lastUpdateElement.textContent = date.toLocaleString();
    }
}

// Update time every minute
updateLastUpdate();
setInterval(updateLastUpdate, 60000); 