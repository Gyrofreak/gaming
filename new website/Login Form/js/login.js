function validateForm(event) {
    event.preventDefault();
    
    const operatorId = document.getElementById('operatorId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    // Basic validation
    if (!operatorId || !password) {
        errorMessage.textContent = 'Please enter both Operator ID and Password';
        errorMessage.classList.add('show');
        return false;
    }
    
    // If validation passes, redirect to main page with operator ID
    window.location.href = `../Main Page/main.html?operator=${encodeURIComponent(operatorId)}`;
    return true;
} 