let performDropdown = document.getElementById('perform-dropdown');
    let perform = performDropdown.value;
    let firstname = '';
    let lastname = '';
    let batchId = '';
    let expiryDate = '';
    performDropdown.addEventListener('change', function() {   
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear previous results
    perform = performDropdown.value;     
    console.log(perform);    
    if (perform == 'resmId') 
    {
        document.getElementById('resmId-fields').style.display = 'block';
        firstname = document.getElementById('first-name').value;
        lastname = document.getElementById('last-name').value;
    }else{
        document.getElementById('resmId-fields').style.display = 'none';
    }

    if (perform == 'extendexpiry') 
    {
        document.getElementById('site-expiry').style.display = 'block';
        batchId = document.getElementById('batch-id').value;
        expiryDate = document.getElementById('expiry-date').value;
    }else{
        document.getElementById('site-expiry').style.display = 'none';
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
        resultDiv.innerHTML = ''; // Clear previous results
        const site = siteInput.value;
        const envDropdown = document.getElementById('env-dropdown');
        const environment = envDropdown.value;
        

        const url = 'https://'+environment+'.crossfire.realpage.com/Crossfire/onesitedirectory.asmx/LookupSiteXml?Environment=' + environment + '&SiteID=' + site + '';
        const payload = {
            site: site,
            environment: environment
        };

        try {
            const response = await fetch(url, {
                method: 'GET'//, // or 'GET' if your API expects GET
                //body: JSON.stringify(payload)
            });
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
                    resultDiv.style.color = 'red';
                } else {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
            SiteID: ${SiteID}<br>
            SiteName: ${SiteName}<br>
            PmcID: ${PmcID}<br>
            PmcName: ${PmcName}<br>
            DB: ${DB}`;
                    resultDiv.style.color = 'green';
                }
            }

            if (perform == 'siteStatus') 
            {
                if (SiteStatus == '') {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
                            SiteStatus: 'INACTIVE'`;
                    resultDiv.style.color = 'red';
                } else {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML =
                        `<strong>Site Details:</strong><br>
                            SiteStatus: ${SiteStatus}`;
                    resultDiv.style.color = 'green';
                }
            } 

            if (perform == 'resmId') 
            {
                try {
                    firstname = document.getElementById('first-name').value;
                    lastname = document.getElementById('last-name').value;
                    const response = await fetch(`http://localhost:3000/site/${DB}/s${site}/${firstname}/${lastname}`);
                    console.log(response);
                    const data = await response.json();
                    console.log(data);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Resident Member ID:${data.resmID}</strong>`;
                    resultDiv.style.color = 'green';
                } catch (err) {
                    if(firstname == '' || lastname == '') {
                        const resultDiv = document.getElementById('result').textContent = 'Please enter both first and last names.';
                    } else {
                        const resultDiv = document.getElementById('result').textContent = 'Error: ' + err;
                    }
                    resultDiv.style.color = 'red';
                }
            } 

            if (perform == 'extendexpiry') 
            {
                try {
                    batchId = document.getElementById('batch-id').value;
                    expiryDate = document.getElementById('expiry-date').value;
                    const response = await fetch(`http://localhost:3000/expirysite/${environment}/${batchId}/${expiryDate}`);
                    console.log(response);
                    const data = await response.json();
                    console.log(data);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                    resultDiv.style.color = 'green';
                } catch (err) {
                    if(batchId == '' || expiryDate == '') {
                        const resultDiv = document.getElementById('result').textContent = 'Please enter both batch ID and expiry date.';
                    } else {
                        const resultDiv = document.getElementById('result').textContent = 'Error: ' + err;
                    }
                    resultDiv.style.color = 'red';
                }
            } 

            if(perform == 'enableWHWidget') 
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Enabling WH Widget...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableWHWidget/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling WH Widget: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'enableCD')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Converting to CD...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableCD/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling WH Widget: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'enableRD')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Converting to RD...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableRD/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('WH Widget response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling WH Widget: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'chasemidAndlidSettings')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Enabling Chase settings...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/enableChase/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Enabling Chase response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>Error enabling Chase: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'clearcache')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Working on Cache reset...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/clearcache/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}/${encodeURIComponent(PmcID)}/${environment}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log('Chase reset response:', data);
                    
                    if (data.success) {
                        resultDiv.innerHTML = `<strong>${data.message}</strong>`;
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>Chase reset: ${data.error || 'Unknown error'}</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }

            if(perform == 'randomresmId')
            {
                try {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Working on Getting random resident details...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/randomResidentDetails/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
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
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>No resident details found</strong>`;
                        resultDiv.style.color = 'red';
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
                    resultDiv.innerHTML = `<strong>Working on Getting former resident details...</strong>`;
                    resultDiv.style.color = 'blue';

                    // Make sure DB and site are valid
                    if (!DB || DB === 'Not found') {
                        throw new Error('Database information not found. Please check the site ID.');
                    }

                    // Construct and encode the URL properly
                    const url = new URL(`http://localhost:3000/formerResidentDetails/${encodeURIComponent(DB)}/${encodeURIComponent('s' + site)}`);
                    console.log('Requesting URL:', url.toString());

                    const response = await fetch(url);
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
                        resultDiv.style.color = 'green';
                    } else {
                        resultDiv.innerHTML = `<strong>No former resident details found</strong>`;
                        resultDiv.style.color = 'red';
                    }
                } catch (err) {
                    console.error('Error:', err);
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = `<strong>Error: ${err.message}</strong>`;
                    resultDiv.style.color = 'red';
                }
            }
        
        }catch (error) {
                //alert('Error: ' + error);
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

