// Navigation Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'var(--secondary-color)';
    } else {
        nav.style.background = 'rgba(26, 26, 26, 0.95)';
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Remove duplicate event listener
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

// Fade In Animation on Scroll
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', fadeInOnScroll);
window.addEventListener('load', fadeInOnScroll);

// Booking Form Handling
const bookingForm = document.getElementById('bookingForm');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const timeStatus = document.getElementById('timeStatus');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// Set minimum date to today
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().split('T')[0];

// Form validation
const validateForm = () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const date = dateInput.value;
    const time = timeSelect.value;

    let isValid = true;
    let errorMsg = '';

    if (!name) {
        errorMsg = 'Please enter your name';
        isValid = false;
    } else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMsg = 'Please enter a valid email address';
        isValid = false;
    } else if (!phone || !/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) {
        errorMsg = 'Please enter a valid phone number';
        isValid = false;
    } else if (!service) {
        errorMsg = 'Please select a service';
        isValid = false;
    } else if (!date) {
        errorMsg = 'Please select a date';
        isValid = false;
    } else if (!time) {
        errorMsg = 'Please select a time';
        isValid = false;
    }

    if (!isValid) {
        showError(errorMsg);
    } else {
        hideError();
    }

    return isValid;
};

// Show error message
const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
};

// Hide error message
const hideError = () => {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
};

// Show loading state
const showLoading = () => {
    submitButton.disabled = true;
    loadingSpinner.classList.add('show');
};

// Hide loading state
const hideLoading = () => {
    submitButton.disabled = false;
    loadingSpinner.classList.remove('show');
};

// Populate available times based on date selection
dateInput.addEventListener('change', async () => {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Clear previous options
    timeSelect.innerHTML = '<option value="">Select Time</option>';
    
    if (selectedDate < today) {
        timeStatus.textContent = 'Please select a future date';
        timeStatus.classList.add('show');
        timeSelect.disabled = true;
        return;
    }
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) { // Sunday
        timeStatus.textContent = 'We are closed on Sundays. Please select another day.';
        timeStatus.classList.add('show');
        timeSelect.disabled = true;
        return;
    }
    timeSelect.disabled = false;
    timeStatus.textContent = '';
    timeStatus.classList.remove('show');
    // Business hours: 9:00 to 18:00 (last slot 17:30)
    const startHour = 9;
    const endHour = 18;
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of ['00', '30']) {
            if (hour === 17 && minute === '30') break; // 17:30 is the last slot
            const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
            const option = document.createElement('option');
            option.value = timeValue;
            option.textContent = formatTimeDisplay(hour, minute);
            timeSelect.appendChild(option);
        }
    }
});

// Format time for display
function formatTimeDisplay(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${period}`;
}

// Handle form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    showLoading();
    
    try {
        // Get all form values
        const formData = {
            customerName: document.getElementById('name').value.trim(),
            customerEmail: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phone').value.trim(),
            service: document.getElementById('service').value,
            date: dateInput.value,
            time: timeSelect.value
        };

        // Check availability
        const availabilityResponse = await fetch(`/api/check-availability?date=${formData.date}&time=${formData.time}`);
        const availabilityData = await availabilityResponse.json();

        if (!availabilityData.available) {
            throw new Error('This time slot is no longer available. Please select another time.');
        }

        // Submit booking
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to book appointment');
        }
        
        // Update modal content with booking details
        document.getElementById('bookingDate').textContent = formatDate(formData.date);
        document.getElementById('bookingTime').textContent = formatTime(formData.time);
        document.getElementById('bookingService').textContent = formData.service;
        
        // Show the modal
        const modal = document.getElementById('bookingModal');
        modal.classList.add('active');
        
        // Reset form
        bookingForm.reset();
        timeSelect.disabled = true;
        timeSelect.innerHTML = '<option value="">Select Time</option>';
        hideError();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Format date for display
function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Format time for display
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
}

// Close modal function
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('bookingModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('booking-modal')) {
        closeBookingModal();
    }
});

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBookingModal();
    }
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length >= 6) {
        value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0,3)}) ${value.slice(3)}`;
    }
    
    e.target.value = value;
});

// Section Animations
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements and section titles
    document.querySelectorAll('.fade-in, .section-title').forEach(el => {
        observer.observe(el);
    });

    // Parallax Effect for sections with parallax-bg
    window.addEventListener('scroll', () => {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        parallaxElements.forEach(element => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            element.style.transform = `translate3d(0px, ${rate}px, 0px)`;
        });
    });

    // Navigation background change on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Section background parallax effect
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        sections.forEach(section => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            if (section.querySelector('.section-decorator')) {
                section.querySelector('.section-decorator.left').style.transform = 
                    `translateY(calc(-50% + ${rate}px)) rotate(${rate * 0.1}deg)`;
                section.querySelector('.section-decorator.right').style.transform = 
                    `translateY(calc(-50% - ${rate}px)) rotate(-${rate * 0.1}deg)`;
            }
        });
    });
});

// Prevent scroll when mobile menu is open
document.body.addEventListener('touchmove', function(e) {
    if (document.body.classList.contains('menu-open')) {
        e.preventDefault();
    }
}, { passive: false }); 



document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .section-title').forEach(el => {
        observer.observe(el);
    });
});