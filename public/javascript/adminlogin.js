document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Perform login validation here
    // For example, you can send an AJAX request to a server-side script to validate the username and password
  
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  });