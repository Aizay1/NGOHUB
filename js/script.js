document.addEventListener('DOMContentLoaded', function () {
  // Theme toggle functionality
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function setTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    if (dark) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') setTheme(true);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setTheme(!isDark);
  });

  // User session management
  let currentUser = null;
  let selectedNgo = null;
  let selectedBookingId = null;
  let selectedDate = '';
  let selectedTime = '';
  
  const userAvatar = document.getElementById('user-avatar');
  const userProfileModal = document.getElementById('userProfileModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const userProfile = document.getElementById('userProfile');
  const profileInfo = document.getElementById('profileInfo');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewBookingsBtn = document.getElementById('viewBookingsBtn');
  const loginStatus = document.getElementById('loginStatus');
  const registerStatus = document.getElementById('registerStatus');
  
  // Booking system elements
  const bookingModal = document.getElementById('bookingModal');
  const successModal = document.getElementById('successModal');
  const closeButtons = document.querySelectorAll('.close');
  const cancelBooking = document.getElementById('cancelBooking');
  const nextToTimes = document.getElementById('nextToTimes');
  const backToDays = document.getElementById('backToDays');
  const nextToForm = document.getElementById('nextToForm');
  const backToTimes = document.getElementById('backToTimes');
  const confirmBooking = document.getElementById('confirmBooking');
  const closeSuccess = document.getElementById('closeSuccess');
  const modalNgoTitle = document.getElementById('modalNgoTitle');
  const daySelection = document.getElementById('daySelection');
  const timeSelection = document.getElementById('timeSelection');
  const bookingForm = document.getElementById('bookingForm');
  const bookingUserInfo = document.getElementById('bookingUserInfo');
  const successMessage = document.getElementById('successMessage');
  const currentMonthYear = document.getElementById('currentMonthYear');
  const timeSlotsContainer = document.getElementById('timeSlotsContainer');
  const bookingsModal = document.getElementById('userBookingsModal');
  const bookingsList = document.getElementById('bookingsList');
  const ngoDetailsModal = document.getElementById('ngoDetailsModal');
  const ngoDetailsContent = document.getElementById('ngoDetailsContent');
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  // Check if user is logged in
  checkSession();

  // Avatar click handler
  userAvatar.addEventListener('click', function() {
    userProfileModal.style.display = 'block';
  });

  // Show register form
  showRegister.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  // Show login form
  showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Login handler
  loginBtn.addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showStatusMessage(loginStatus, 'Please fill in all fields', 'error');
      return;
    }

    fetch('php/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        currentUser = data.user;
        updateUserAvatar();
        loadUserProfile();
        loginForm.style.display = 'none';
        userProfile.style.display = 'block';
        showStatusMessage(loginStatus, '', '');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
      } else {
        showStatusMessage(loginStatus, data.message, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showStatusMessage(loginStatus, 'Login failed. Please try again.', 'error');
    });
  });

  // Register handler
  registerBtn.addEventListener('click', function() {
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;

    if (!firstName || !lastName || !email || !phone || !password) {
      showStatusMessage(registerStatus, 'Please fill in all fields', 'error');
      return;
    }

    fetch('php/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        phone, 
        password 
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        currentUser = data.user;
        updateUserAvatar();
        loadUserProfile();
        registerForm.style.display = 'none';
        userProfile.style.display = 'block';
        showStatusMessage(registerStatus, '', '');
        // Clear form
        document.getElementById('regFirstName').value = '';
        document.getElementById('regLastName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regPassword').value = '';
      } else {
        showStatusMessage(registerStatus, data.message, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showStatusMessage(registerStatus, 'Registration failed. Please try again.', 'error');
    });
  });

  // Logout handler
  logoutBtn.addEventListener('click', function() {
    fetch('php/logout.php')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        currentUser = null;
        userProfile.style.display = 'none';
        loginForm.style.display = 'block';
        userProfileModal.style.display = 'none';
        updateUserAvatar();
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  // View bookings handler
  viewBookingsBtn.addEventListener('click', function() {
    if (!currentUser) return;
    
    fetch(`php/get_user_bookings.php?user_id=${currentUser.id}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayUserBookings(data.bookings);
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to load bookings');
    });
  });

  // Check user session
  function checkSession() {
    fetch('php/check_session.php')
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        currentUser = data.user;
        updateUserAvatar();
        loadUserProfile();
        loginForm.style.display = 'none';
        userProfile.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
  }

  // Update user avatar
  function updateUserAvatar() {
    if (currentUser) {
      userAvatar.textContent = currentUser.first_name.charAt(0).toUpperCase();
    } else {
      userAvatar.textContent = '?';
    }
  }

  // Load user profile
  function loadUserProfile() {
    if (!currentUser) return;
    
    profileInfo.innerHTML = `
      <div class="profile-info-item">
        <label>First Name</label>
        <span>${currentUser.first_name}</span>
      </div>
      <div class="profile-info-item">
        <label>Last Name</label>
        <span>${currentUser.last_name}</span>
      </div>
      <div class="profile-info-item">
        <label>Email</label>
        <span>${currentUser.email}</span>
      </div>
      <div class="profile-info-item">
        <label>Phone</label>
        <span>${currentUser.phone}</span>
      </div>
    `;
  }

  // Display user bookings with delete functionality
  function displayUserBookings(bookings) {
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>You have no scheduled visits.</p>';
    } else {
      bookingsList.innerHTML = '';
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.visit_date);
        const now = new Date();
        const isPast = bookingDate < now;
        
        const bookingItem = document.createElement('div');
        bookingItem.className = `booking-item ${isPast ? 'past' : ''}`;
        bookingItem.innerHTML = `
          <h4>${booking.ngo_name}</h4>
          <p><strong>Date:</strong> ${formatDate(booking.visit_date)}</p>
          <p><strong>Time:</strong> ${booking.visit_time}</p>
          <p><strong>Status:</strong> ${isPast ? 'Completed' : 'Upcoming'}</p>
          <div class="booking-actions">
            <button class="btn-secondary delete-booking" data-booking-id="${booking.id}">Delete</button>
          </div>
        `;
        bookingsList.appendChild(bookingItem);
      });

     
      // Add click handlers for delete buttons
      document.querySelectorAll('.delete-booking').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const bookingId = this.dataset.bookingId;
          deleteBooking(bookingId);
        });
      });
    }
    
    userProfileModal.style.display = 'none';
    bookingsModal.style.display = 'block';
  }


  // Delete booking function
  function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this visit?')) {
      fetch(`php/delete_booking.php?id=${bookingId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Refresh the bookings list
          viewBookingsBtn.click();
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete booking');
      });
    }
  }

  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Show status message
  function showStatusMessage(element, message, type) {
    element.textContent = message;
    element.className = 'status-message';
    if (type === 'error') {
      element.classList.add('error-message');
    } else if (type === 'success') {
      element.classList.add('success-message');
    }
  }

  // NGO data and functionality
  const ngoList = [
    {
      id: 1,
      name: "Green Earth Initiative",
      category: "Environment: Click To Read More",
      description: "Dedicated to environmental conservation and sustainability. Our projects include tree planting, clean energy advocacy, and environmental education programs. We work with local communities to create sustainable solutions for environmental challenges.",
      location: "123 Green St, Eco City",
      focusAreas: "Conservation, Education, Sustainability",
      image: "http://localhost/ngohub-pro/images/green.jpg",
      details: {
        founded: "2005",
        teamSize: "25 employees, 100+ volunteers",
        projects: ["Urban Tree Planting", "Clean Energy Workshops", "School Education Programs"],
        impact: "Planted over 50,000 trees, educated 10,000+ students"
      }
    },
    {
      id: 2,
      name: "Hope for Children Foundation",
      category: "Children: Click To Read More",
      description: "Providing education, healthcare, and support to underprivileged children. We run orphanages, schools, and nutrition programs across the region. Our mission is to give every child a chance for a better future regardless of their background.",
      location: "456 Hope Ave, Compassion Town",
      focusAreas: "Education, Healthcare, Child Welfare",
      image: "http://localhost/ngohub-pro/images/hope.png",
      details: {
        founded: "1998",
        teamSize: "40 employees, 200+ volunteers",
        projects: ["Orphan Care", "School Sponsorships", "Nutrition Programs"],
        impact: "Supported 5,000+ children, built 10 schools"
      }
    },
    {
      id: 3,
      name: "Community Health Alliance",
      category: "Healthcare: Click To Read More",
      description: "Bringing healthcare services to underserved communities. Our mobile clinics and health education programs reach thousands each year. We focus on preventive care and health education to create lasting change in community health outcomes.",
      location: "789 Health Blvd, Wellness City",
      focusAreas: "Medical Care, Health Education, Disease Prevention",
      image: "http://localhost/ngohub-pro/images/health.png",
      details: {
        founded: "2010",
        teamSize: "30 employees, 150+ volunteers",
        projects: ["Mobile Clinics", "Vaccination Drives", "Health Workshops"],
        impact: "Treated 20,000+ patients, conducted 500+ health workshops"
      }
    }
  ];

  // Render NGO cards
  function renderNGOCards() {
    const ngoListContainer = document.querySelector('.ngo-list');
    ngoListContainer.innerHTML = '';

    ngoList.forEach(ngo => {
      const ngoCard = document.createElement('div');
      ngoCard.className = 'ngo-card';
      ngoCard.dataset.ngoId = ngo.id;
      
      ngoCard.innerHTML = `
        <div class="ngo-content">
          <h4>${ngo.name}</h4>
          <span class="ngo-category">${ngo.category}</span>
          <p>${ngo.description.substring(0, 150)}...</p>
          <p><strong>Location:</strong> ${ngo.location}</p>
          <p><strong>Focus Areas:</strong> ${ngo.focusAreas}</p>
          <button class="schedule-btn" data-ngo="${ngo.name}" data-ngo-id="${ngo.id}">Schedule Visit</button>
        </div>
        <img src="${ngo.image}" alt="${ngo.name}" />
      `;
      
      ngoListContainer.appendChild(ngoCard);
    });

    // Add click handlers for NGO cards
    document.querySelectorAll('.ngo-card').forEach(card => {
      card.addEventListener('click', function(e) {
        // Don't trigger if clicking on schedule button
        if (e.target.classList.contains('schedule-btn')) return;
        
        const ngoId = this.dataset.ngoId;
        showNGODetails(ngoId);
      });
    });

    // Add click handlers for schedule buttons
    document.querySelectorAll('.schedule-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const ngoName = this.dataset.ngo;
        const ngoId = this.dataset.ngoId;
        
        if (!currentUser) {
          showStatusMessage(loginStatus, 'Please login to schedule a visit', 'error');
          userProfileModal.style.display = 'block';
          loginForm.style.display = 'block';
          registerForm.style.display = 'none';
          return;
        }
        
        selectedNgo = { id: ngoId, name: ngoName };
        selectedBookingId = null; // Reset for new booking
        modalNgoTitle.textContent = `Schedule Visit to ${ngoName}`;
        bookingModal.style.display = 'block';
        daySelection.style.display = 'block';
        timeSelection.style.display = 'none';
        bookingForm.style.display = 'none';
        selectedDate = '';
        selectedTime = '';
        
        // Update booking form with user info
        bookingUserInfo.innerHTML = `
          <p><strong>Name:</strong> ${currentUser.first_name} ${currentUser.last_name}</p>
          <p><strong>Email:</strong> ${currentUser.email}</p>
          <p><strong>Phone:</strong> ${currentUser.phone}</p>
        `;
      });
    });
  }

  // Show NGO details modal
  function showNGODetails(ngoId) {
    const ngo = ngoList.find(n => n.id == ngoId);
    if (!ngo) return;
    
    ngoDetailsContent.innerHTML = `
      <div class="ngo-details">
        <div class="ngo-details-header">
          <img src="${ngo.image}" class="ngo-details-image" alt="${ngo.name}">
          <div class="ngo-details-info">
            <h2>${ngo.name}</h2>
            <span class="ngo-category">${ngo.category}</span>
            <p><strong>Location:</strong> ${ngo.location}</p>
            <p><strong>Focus Areas:</strong> ${ngo.focusAreas}</p>
          </div>
        </div>
        
        <div class="ngo-details-description">
          <h3>About Us</h3>
          <p>${ngo.description}</p>
        </div>
        
        <div class="ngo-details-meta">
          <div class="ngo-details-meta-item">
            <h4>Founded</h4>
            <p>${ngo.details.founded}</p>
          </div>
          <div class="ngo-details-meta-item">
            <h4>Team</h4>
            <p>${ngo.details.teamSize}</p>
          </div>
          <div class="ngo-details-meta-item">
            <h4>Key Projects</h4>
            <ul>
              ${ngo.details.projects.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="ngo-details-meta-item">
            <h4>Impact</h4>
            <p>${ngo.details.impact}</p>
          </div>
        </div>
        
        <button class="btn-primary schedule-from-details" data-ngo="${ngo.name}" data-ngo-id="${ngo.id}">Schedule Visit</button>
      </div>
    `;
    
    ngoDetailsModal.style.display = 'block';
    
    // Add click handler for schedule button in details
    document.querySelector('.schedule-from-details').addEventListener('click', function() {
      ngoDetailsModal.style.display = 'none';
      
      if (!currentUser) {
        showStatusMessage(loginStatus, 'Please login to schedule a visit', 'error');
        userProfileModal.style.display = 'block';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        return;
      }
      
      selectedNgo = { id: this.dataset.ngoId, name: this.dataset.ngo };
      selectedBookingId = null; // Reset for new booking
      modalNgoTitle.textContent = `Schedule Visit to ${this.dataset.ngo}`;
      bookingModal.style.display = 'block';
      daySelection.style.display = 'block';
      timeSelection.style.display = 'none';
      bookingForm.style.display = 'none';
      selectedDate = '';
      selectedTime = '';
      
      // Update booking form with user info
      bookingUserInfo.innerHTML = `
        <p><strong>Name:</strong> ${currentUser.first_name} ${currentUser.last_name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone}</p>
      `;
    });
  }

  // Generate calendar days
  function generateCalendar() {
    const calendar = document.getElementById('calendarDays');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Set month/year display
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    currentMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Clear previous calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header';
      dayHeader.textContent = day;
      calendar.appendChild(dayHeader);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'day empty';
      calendar.appendChild(emptyCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      dayElement.textContent = day;
      dayElement.dataset.date = date.toISOString().split('T')[0];
      
      // Disable past days
      if (date < today) {
        dayElement.classList.add('disabled');
      } else {
        dayElement.addEventListener('click', function() {
          document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
          this.classList.add('selected');
          selectedDate = this.dataset.date;
        });
      }
      
      calendar.appendChild(dayElement);
    }
  }

  // Close modals
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      bookingModal.style.display = 'none';
      successModal.style.display = 'none';
      ngoDetailsModal.style.display = 'none';
      userProfileModal.style.display = 'none';
      userBookingsModal.style.display = 'none';
    });
  });

  cancelBooking.addEventListener('click', function() {
    bookingModal.style.display = 'none';
  });

  closeSuccess.addEventListener('click', function() {
    successModal.style.display = 'none';
  });

  // Time slot selection
  timeSlotsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('time-slot')) {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      e.target.classList.add('selected');
      selectedTime = e.target.getAttribute('data-time');
    }
  });

  // Form navigation
  nextToTimes.addEventListener('click', function() {
    if (!selectedDate) {
      alert('Please select a visit date');
      return;
    }
    daySelection.style.display = 'none';
    timeSelection.style.display = 'block';
  });

  backToDays.addEventListener('click', function() {
    daySelection.style.display = 'block';
    timeSelection.style.display = 'none';
  });

  nextToForm.addEventListener('click', function() {
    if (!selectedTime) {
      alert('Please select a visit time');
      return;
    }
    timeSelection.style.display = 'none';
    bookingForm.style.display = 'block';
  });

  backToTimes.addEventListener('click', function() {
    timeSelection.style.display = 'block';
    bookingForm.style.display = 'none';
  });

  // Confirm booking handler
  confirmBooking.addEventListener('click', function() {
    if (!currentUser || !selectedNgo || !selectedDate || !selectedTime) {
      alert('Please complete all booking information');
      return;
    }

    const url = selectedBookingId ? 
      `php/update_booking.php?id=${selectedBookingId}` : 
      'php/process_booking.php';
      
    const method = selectedBookingId ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('user_id', currentUser.id);
    formData.append('ngo_id', selectedNgo.id);
    formData.append('visit_date', selectedDate);
    formData.append('visit_time', selectedTime);

    fetch(url, {
      method: method,
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        bookingModal.style.display = 'none';
        successMessage.textContent = selectedBookingId ? 
          `Your visit to ${selectedNgo.name} has been updated to ${formatDate(selectedDate)} at ${selectedTime}.` :
          `Thank you! Your visit to ${selectedNgo.name} on ${formatDate(selectedDate)} at ${selectedTime} has been confirmed.`;
        successModal.style.display = 'block';
        
        // Clear selection
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        selectedDate = '';
        selectedTime = '';
        selectedBookingId = null;
        
        // Refresh bookings list if viewing
        if (bookingsModal.style.display === 'block') {
          viewBookingsBtn.click();
        }
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error processing your booking. Please try again.');
    });
  });

  // Contact form handling
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('php/process_contact.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        contactStatus.textContent = 'Thank you for your message! We will get back to you soon.';
        contactStatus.style.color = 'green';
        contactForm.reset();
      } else {
        contactStatus.textContent = 'Error: ' + data.message;
        contactStatus.style.color = 'red';
      }
    })
    .catch(error => {
      contactStatus.textContent = 'There was an error submitting your message. Please try again.';
      contactStatus.style.color = 'red';
      console.error('Error:', error);
    });
  });
  // Update active nav link when scrolling
window.addEventListener('scroll', function() {
  if (window.innerWidth <= 768) {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.mobile-nav a');
    
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = '#' + section.id;
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) {
        link.classList.add('active');
      }
    });
  }
});

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });

  // Initialize the page
  generateCalendar();
  renderNGOCards();
});