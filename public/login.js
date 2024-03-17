document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        // Check if response is JSON, otherwise handle it as non-JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          throw new Error('Invalid JSON response from server');
        }
      })
      .then(data => {
        console.log(data); // Check response data
        if (data.success) {
          window.location.href = '/dashboard';
        } else {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
  
        // Log the actual response text for debugging
        error.response.text().then(text => {
          console.error('Actual response text:', text);
        });
  
        alert('An error occurred. Please try again later.');
      });
    });
  });
  