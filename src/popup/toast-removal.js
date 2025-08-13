// No-op function to replace showToast
function showToast() {
    // Intentionally empty - toast functionality removed
    return;
}

// Update the perform dropdown event listener to remove toast messages
performDropdown.addEventListener('change', function() {   
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results
    resultDiv.classList.remove('show', 'success', 'error');
    
    perform = performDropdown.value;     
    console.log(perform);    
    
    // Toggle visibility of conditional fields
    if (perform == 'resmId') {
        const resmIdFields = document.getElementById('resmId-fields');
        resmIdFields.style.display = 'block';
        
        firstname = document.getElementById('first-name').value;
        lastname = document.getElementById('last-name').value;
    } else {
        document.getElementById('resmId-fields').style.display = 'none';
    }

    if (perform == 'extendexpiry') {
        const siteExpiry = document.getElementById('site-expiry');
        siteExpiry.style.display = 'block';
        
        batchId = document.getElementById('batch-id').value;
        expiryDate = document.getElementById('expiry-date').value;
    } else {
        document.getElementById('site-expiry').style.display = 'none';
    }
});

// Update submit button event handler to not use toasts
submitButton.addEventListener('click', async function () {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    resultDiv.classList.remove('show', 'success', 'error');
    
    // Run validation
    if (!validateForm()) {
        // Instead of showing toast, just update the result div
        resultDiv.textContent = 'Please fix the form errors before submitting';
        resultDiv.classList.add('show', 'error');
        return;
    }
    
    const site = document.getElementById('site-textbox').value;
    const envDropdown = document.getElementById('env-dropdown');
    const environment = envDropdown.value;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.classList.add('processing');
    
    // Add loading message to result container
    resultDiv.innerHTML = '<div class="loading"></div> Processing request...';
    resultDiv.classList.add('show');
    
    // Continue with the existing functionality...
});
