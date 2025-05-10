function validateForm(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    // Password length validation
    if (password.length < 6 || password.length > 8) {
        errorMessage.textContent = 'Password must be between 6 and 8 characters!';
        errorMessage.classList.add('show');
        return false;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match!';
        errorMessage.classList.add('show');
        return false;
    }
    
    // If validation passes, redirect to main page
    window.location.href = '../Main Page/main.html';
    return true;
} 