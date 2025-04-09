// Function to load and inject JSON-LD
(function() {
    fetch('/assets/structured-data.json')
      .then(response => response.json())
      .then(data => {
        // Create script element
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        
        // Append to document head
        document.head.appendChild(script);
      })
      .catch(error => {
        console.error('Error loading structured data:', error);
      });
  })();