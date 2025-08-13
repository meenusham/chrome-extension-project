let performDropdown = document.getElementById('perform-dropdown');
    let perform = performDropdown.value;
    let firstname = '';
    let lastname = '';
    let batchId = '';
    let expiryDate = '';
    
    // Application configuration
    const appConfig = {
        // Set to false to hide connection warnings
        showConnectionWarnings: false,
        // Debug mode for additional console logging
        debugMode: false
    };
    
    // Set initial state 
    document.addEventListener('DOMContentLoaded', function() {
        // Make sure select dropdowns are initialized correctly
        const envDropdown = document.getElementById('env-dropdown');
        if (envDropdown.selectedIndex === 0) {
            envDropdown.value = '';
        }
        
        if (performDropdown.selectedIndex === 0) {
            perform = '';
        }
        
        // Add focus and blur event listeners to all inputs and selects
        document.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('focus', function() {
                this.closest('.form-group').classList.add('focused');
            });
            
            element.addEventListener('blur', function() {
                this.closest('.form-group').classList.remove('focused');
                validateField(this);
            });
        });
    });
    
    // Function to reset button state after request completes
    function resetButtonState() {
        const submitButton = document.getElementById('submit-button');
        submitButton.disabled = false;
        submitButton.classList.remove('processing');
    }
    
    // Function to handle network errors or timeouts
    function handleNetworkError(errorMessage) {
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = errorMessage || 'Network error. Please check your connection and try again.';
        resultDiv.classList.add('show', 'error');
        // Toast removed
        resetButtonState();
    }
    
    // Toast notification system - replaced with empty implementation
    function showToast(message, type) {
        // Intentionally empty - toast functionality removed
        console.log(`Toast message (disabled): ${message}, type: ${type}`);
        return;
    }
    
    function closeToast(toast) {
        // Intentionally empty - toast functionality removed
        return;
    }
    
    // Field validation
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        
        // Remove previous validation classes and messages
        formGroup.classList.remove('error', 'success');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.parentNode.removeChild(existingError);
        }
        
        // Skip validation for optional fields that are empty
        if (!field.required && !field.value) {
            return true;
        }
        
        // Validate required fields
        if (field.required && !field.value) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'This field is required';
            formGroup.appendChild(errorMessage);
            formGroup.classList.add('error');
            return false;
        }
        
        // Validate date format if it's an expiry date field
        if (field.id === 'expiry-date' && field.value) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(field.value)) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please use YYYY-MM-DD format';
                formGroup.appendChild(errorMessage);
                formGroup.classList.add('error');
                return false;
            }
        }
        
        // Field is valid
        formGroup.classList.add('success');
        return true;
    }
    
    // Validate all visible fields
    function validateForm() {
        let isValid = true;
        
        // Validate site field
        const siteField = document.getElementById('site-textbox');
        if (!siteField.value.trim()) {
            isValid = false;
            const formGroup = siteField.closest('.form-group');
            formGroup.classList.add('error');
            
            if (!formGroup.querySelector('.error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Site ID is required';
                formGroup.appendChild(errorMessage);
            }
        }
        
        // Validate environment dropdown
        const envDropdown = document.getElementById('env-dropdown');
        if (!envDropdown.value) {
            isValid = false;
            const formGroup = envDropdown.closest('.form-group');
            formGroup.classList.add('error');
            
            if (!formGroup.querySelector('.error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Environment is required';
                formGroup.appendChild(errorMessage);
            }
        }
        
        // Validate action dropdown
        if (!performDropdown.value) {
            isValid = false;
            const formGroup = performDropdown.closest('.form-group');
            formGroup.classList.add('error');
            
            if (!formGroup.querySelector('.error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Action is required';
                formGroup.appendChild(errorMessage);
            }
        }
        
        // Validate first and last name if resident member ID action is selected
        if (perform === 'resmId') {
            const firstNameField = document.getElementById('first-name');
            const lastNameField = document.getElementById('last-name');
            
            if (!firstNameField.value.trim()) {
                isValid = false;
                const formGroup = firstNameField.closest('.form-group');
                
                if (!formGroup.querySelector('.error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'First name is required';
                    formGroup.appendChild(errorMessage);
                }
            }
            
            if (!lastNameField.value.trim()) {
                isValid = false;
                const formGroup = lastNameField.closest('.form-group');
                
                if (!formGroup.querySelector('.error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Last name is required';
                    formGroup.appendChild(errorMessage);
                }
            }
        }
        
        // Validate expiry date fields if extend expiry action is selected
        if (perform === 'extendexpiry') {
            const batchIdField = document.getElementById('batch-id');
            const expiryDateField = document.getElementById('expiry-date');
            
            if (!batchIdField.value.trim()) {
                isValid = false;
                const formGroup = batchIdField.closest('.form-group');
                
                if (!formGroup.querySelector('.error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Batch ID is required';
                    formGroup.appendChild(errorMessage);
                }
            }
            
            if (!expiryDateField.value.trim()) {
                isValid = false;
                const formGroup = expiryDateField.closest('.form-group');
                
                if (!formGroup.querySelector('.error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Expiry date is required';
                    formGroup.appendChild(errorMessage);
                }
            } else {
                // Validate date format
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!datePattern.test(expiryDateField.value)) {
                    isValid = false;
                    const formGroup = expiryDateField.closest('.form-group');
                    
                    if (!formGroup.querySelector('.error-message')) {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.textContent = 'Please use YYYY-MM-DD format';
                        formGroup.appendChild(errorMessage);
                    }
                }
            }
        }
        
        return isValid;
    }
    
    performDropdown.addEventListener('change', function() {   
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results
    resultDiv.classList.remove('show', 'success', 'error');
    
    perform = performDropdown.value;     
    console.log(perform);    
    
    // Toggle visibility of conditional fields with animation
    if (perform == 'resmId') {
        const resmIdFields = document.getElementById('resmId-fields');
        resmIdFields.style.display = 'block';
        // Trigger a subtle animation by adding and removing a class
        resmIdFields.classList.add('pulse');
        setTimeout(() => {
            resmIdFields.classList.remove('pulse');
        }, 1000);
        
        firstname = document.getElementById('first-name').value;
        lastname = document.getElementById('last-name').value;
    } else {
        document.getElementById('resmId-fields').style.display = 'none';
    }

    if (perform == 'extendexpiry') {
        const siteExpiry = document.getElementById('site-expiry');
        siteExpiry.style.display = 'block';
        // Trigger a subtle animation
        siteExpiry.classList.add('pulse');
        setTimeout(() => {
            siteExpiry.classList.remove('pulse');
        }, 1000);
        
        batchId = document.getElementById('batch-id').value;
        expiryDate = document.getElementById('expiry-date').value;
    } else {
        document.getElementById('site-expiry').style.display = 'none';
    }
    
    // Remove toast message for selected action
    if (perform) {
        let actionName = performDropdown.options[performDropdown.selectedIndex].text;
        // Toast removed
        console.log(`Selected action: ${actionName}`);
    }
});


//document.addEventListener('DOMContentLoaded', async function () {
    //const performDropdown = document.getElementById('perform-dropdown');
    //const perform = performDropdown.value;

    const submitButton = document.getElementById('submit-button');
    const siteInput = document.getElementById('site-textbox');
    const envInput = document.getElementById('env-textbox');    

    submitButton.addEventListener('click', async function () {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';
        resultDiv.classList.remove('show', 'success', 'error');
        
        // Run validation
        if (!validateForm()) {
            // Instead of showing toast, update the result div
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
        
        // Add enhanced loading message to result container
        resultDiv.innerHTML = `
            <div class="loading-container">
                <div class="loading-icon-container">
                    <div class="loading-spinner"></div>
                </div>
                <div class="loading-message">Processing your request...</div>
            </div>
        `;
        resultDiv.classList.add('show');
        
        const url = 'https://'+environment+'.crossfire.realpage.com/Crossfire/onesitedirectory.asmx/LookupSiteXml?Environment=' + environment + '&SiteID=' + site + '';
        console.log('Requesting URL:', url);
        
        const payload = {
            site: site,
            environment: environment
        };

        try {
            const response = await safeFetch(url);
            const xmlString = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const siteElement = xmlDoc.querySelector('site');
            const SiteStatus = siteElement ? siteElement.getAttribute('SiteStatus') : 'Not found';
            const DB = siteElement ? siteElement.getAttribute('PmcDbMachine') : 'Not found';
            const PmcID = siteElement ? siteElement.getAttribute('PmcID') : 'Not found';
            const PmcName = siteElement ? siteElement.getAttribute('PmcName') : 'Not found';
            const SiteID = siteElement ? siteElement.getAttribute('SiteID') : 'Not found';
            const SiteName = siteElement ? siteElement.getAttribute('SiteName') : 'Not found';
            if (perform == 'siteDetails') {
                if (SiteStatus == '') {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
            SiteStatus: 'INACTIVE'`;
                    resultDiv.classList.add('show', 'error');
                    // Toast removed
                } else {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
            SiteID: ${SiteID}<br>
            SiteName: ${SiteName}<br>
            PmcID: ${PmcID}<br>
            PmcName: ${PmcName}<br>
            DB: ${DB}`;
                    resultDiv.classList.add('show', 'success');
                    // Toast removed
                }
            }

            if (perform == 'siteStatus') 
            {
                if (SiteStatus == '') {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
                            SiteStatus: 'INACTIVE'`;
                    //resultDiv.classList.add('show', 'error');
                    // Toast removed
                } else {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
                            SiteStatus: ${SiteStatus}`;
                    resultDiv.classList.add('show', 'success');
                    // Toast removed
                }
            } 

            if (perform == 'resmId') 
            {
                try {
                    firstname = document.getElementById('first-name').value;
                    lastname = document.getElementById('last-name').value;
                    
                    // Construct the URL for the request
                    const apiUrl = `http://localhost:3000/site/${DB}/s${site}/${firstname}/${lastname}`;
                    
                    const response = await safeFetch(apiUrl);
                    console.log(response);
                    const data = await response.json();
                    console.log(data);
                    
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Resident Member ID: ${data.resmID}</strong>`;
                    resultDiv.classList.add('show', 'success');
                    
                    // Toast removed
                } catch (err) {
                    if(firstname == '' || lastname == '') {
                        const resultDiv = document.getElementById('result');
                        resultDiv.textContent = 'Please enter both first and last names.';
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    } else {
                        const resultDiv = document.getElementById('result');
                        resultDiv.textContent = 'Error: ' + err;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                }
            } 

            if (perform == 'extendexpiry') 
            {
                try {
                    batchId = document.getElementById('batch-id').value;
                    expiryDate = document.getElementById('expiry-date').value;
                    
                    // Create URL and handle connection warning
                    const apiUrl = `http://localhost:3000/expirysite/${environment}/${batchId}/${expiryDate}`;
                    
                    const response = await safeFetch(apiUrl);
                    console.log(response);
                    const data = await response.json();
                    console.log(data);
                    
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                    resultDiv.classList.add('show', 'success');
                    
                    // Toast removed
                } catch (err) {
                    const resultDiv = document.getElementById('result');
                    
                    if(batchId == '' || expiryDate == '') {
                        resultDiv.textContent = 'Please enter both batch ID and expiry date.';
                        // Toast removed
                    } else {
                        resultDiv.textContent = 'Error: ' + err;
                        // Toast removed
                    }
                    resultDiv.classList.add('show', 'error');
                }
            } 

            if(perform == 'enableWHWidget') 
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Enabling WH Widget...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableWHWidget/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling WH Widget: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'enableCD')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Converting to CD...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableCD/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Error converting to CD: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'enableHybrid')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Converting to Hybrid...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableHybrid/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Hybrid conversion response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Error converting to Hybrid: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'enableRD')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Converting to RD...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableRD/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Error converting to RD: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'chasemidAndlidSettings')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Enabling Chase settings...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableChase/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Enabling Chase response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling Chase settings: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'clearcache')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Working on Cache reset...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/clearcache/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Chase reset response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>Cache reset failed: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }

            if(perform == 'randomresmId')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Getting random resident details...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/randomResidentDetails/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Random resident Response:', data);
                    
                    if (data) {
                        const resultDiv = document.getElementById('result');
                        resultDiv.innerHTML = `
                            <strong>Resident Details:</strong><br>
                            First Name: ${data.FirstName || 'N/A'}<br>
                            Middle Name: ${data.MiddleName || 'N/A'}<br>
                            Last Name: ${data.LastName || 'N/A'}<br>
                            Resh ID: ${data.ReshID || 'N/A'}<br>
                            Resident Member ID: ${data.ResidentID || 'N/A'}<br>
                            Lease ID: ${data.LeaseID || 'N/A'}<br>
                        `;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>No resident details found</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'formerresident')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <div class="loading-container">
                            <div class="loading-icon-container">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="loading-message">Getting former resident details...</div>
                        </div>
                    `;
                    resultDiv.classList.add('show');

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/formerResidentDetails/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await safeFetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Former resident Response:', data);
                    
                    if (data) {
                        const resultDiv = document.getElementById('result');
                        resultDiv.innerHTML = `
                            <strong>Former Resident Details:</strong><br>
                            First Name: ${data.resmFirstName || 'N/A'}<br>
                            Middle Name: ${data.resmMiddleInitial || 'N/A'}<br>
                            Last Name: ${data.resmLastName || 'N/A'}<br>
                            Resh ID: ${data.reshId || 'N/A'}<br>
                            Resident Member ID: ${data.resmID || 'N/A'}<br>
                            Lease ID: ${data.LeaID || 'N/A'}<br>
                        `;
                        resultDiv.classList.add('show', 'success');
                        // Toast removed
                    } else {
                        resultDiv.innerHTML = `<strong>No former resident details found</strong>`;
                        resultDiv.classList.add('show', 'error');
                        // Toast removed
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `
                        <strong>Error: ${err.message}</strong>
                    `;
                    resultDiv.classList.add('show', 'error');
                }
            }
        
        }catch (error) {
            console.error('Error:', error);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
                <strong>Error: ${error.message || 'Unknown error'}</strong>
            `;
            resultDiv.classList.add('show', 'error');
        } finally {
            // Always reset button state when request completes
            resetButtonState();
        }
        });
       

    /*const performDropdown = document.getElementById('perform-dropdown');
    const resmIdFields = document.getElementById('resmId-fields');

    performDropdown.addEventListener('change', function() {
        if (this.value === 'resmId') {
            resmIdFields.style.display = 'block';
        } else {
            resmIdFields.style.display = 'none';
        }
    });*/
//});

/*
// This function is no longer used - warnings are handled internally
function handleInsecureConnection(url, isHttp = true) {
    const resultDiv = document.getElementById('result');
    
    // Create a confirmation dialog within the UI with a more general message
    resultDiv.innerHTML = `
        <div class="warning-container ${isHttp ? 'http-warning' : 'https-warning'}">
            <div class="warning-icon">⚠️</div>
            <div class="warning-message">
                <strong>Connection Warning</strong><br>
                You're connecting to: ${url}<br>
                ${isHttp ? 'This connection is not secure (HTTP instead of HTTPS).' : 'Please confirm you want to proceed with this connection.'}
            </div>
            <div class="warning-actions">
                <button id="proceed-anyway" class="warning-button proceed">Proceed Anyway</button>
                <button id="cancel-request" class="warning-button cancel">Cancel</button>
            </div>
        </div>
    `;
    resultDiv.classList.add('show', 'warning');
    
    return new Promise((resolve, reject) => {
        document.getElementById('proceed-anyway').addEventListener('click', function() {
            resultDiv.innerHTML = '';
            resultDiv.classList.remove('warning');
            resolve(true);
        });
        
        document.getElementById('cancel-request').addEventListener('click', function() {
            resultDiv.innerHTML = '';
            resultDiv.classList.remove('warning', 'show');
            resetButtonState();
            reject(new Error('Connection canceled by user'));
        });
    });
}
*/

// Helper function to safely fetch without showing warnings to the user
// Handles all connections internally without UI prompts
async function safeFetch(url) {
    const urlStr = url.toString();
    
    // Log connection type
    if (urlStr.startsWith('http:')) {
        if (appConfig.debugMode) {
            console.log('Non-secure connection (HTTP) used:', urlStr);
        }
        
        // Only show warnings if enabled in config
        if (appConfig.showConnectionWarnings) {
            await handleInsecureConnectionInternal(urlStr, true);
        }
    } else if (urlStr.startsWith('https:')) {
        if (appConfig.debugMode) {
            console.log('Secure connection (HTTPS) used:', urlStr);
        }
        
        // Only show warnings if enabled in config
        if (appConfig.showConnectionWarnings) {
            await handleInsecureConnectionInternal(urlStr, false);
        }
    }
    
    try {
        // Proceed with the fetch request
        const response = await fetch(url);
        return response;
    } catch (error) {
        console.error('Connection error:', error);
        // Gracefully handle network errors without user interaction
        throw new Error(`Connection failed: ${error.message}`);
    }
}

// Internal function for handling connection warnings if they're enabled
async function handleInsecureConnectionInternal(url, isHttp) {
    // This function would handle showing the UI warning
    // Currently unused since warnings are disabled
    console.log(`Connection warning would be shown for: ${url} (HTTP: ${isHttp})`);
    
    // Since we're not showing warnings, just return resolved promise
    return Promise.resolve(true);
}

