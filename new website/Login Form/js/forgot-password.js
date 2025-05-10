function validateForm(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Clear previous messages
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    successMessage.style.display = 'none';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address';
        errorMessage.classList.add('show');
        return false;
    }
    
    // Show success message
    successMessage.textContent = 'Reset instructions have been sent to your email';
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    
    // Reset form
    document.getElementById('resetForm').reset();
    
    return false;
} 