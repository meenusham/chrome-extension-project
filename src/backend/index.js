const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

async function connectDB(server, site) {
  const config = {
    user: 'one_1_admin',
    password: 'admin',
    server: server,
    database: site,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };
  return config;
}

app.get('/enableWHWidget/:DB/:SITE', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)

  try {
    await sql.connect(config);
    const result = await sql.query`
        DECLARE @CenterID NUMERIC(10,0)
        DECLARE @CompanyID VARCHAR(10)
        DECLARE @SiteID VARCHAR(10)
        DECLARE @Activationdate VARCHAR(200)
        SET @CompanyID=(select [CS].[udfGetPMCID]())
        SET @SiteID=(SELECT [CS].[udfGetSiteID]())
        SET @CenterID='93'
        SET @Activationdate=convert(varchar(50),getdate(),101)
        BEGIN
        IF NOT EXISTS (select top 1 1 from SiteMaster.dbo.ActiveCenters where entid=@CompanyID and oneid in (@CenterID))
        BEGIN
        exec SiteMaster..uspMcoEditCenterUpdate @CompanyID,'1',@CompanyID,@CompanyID,'0',@CenterID,'','1','1/1/2000',''
        END
        exec DBO.uspCGMPEditCentersUpdate @CompanyID,'1',@CompanyID,@SiteID,'0',@CenterID,'','1',@Activationdate,'2099-12-31 00:00:00.000','ACTIVE'
        END
    `;
    res.json({ success: true, message: 'WH Widget enabled successfully' });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/enableChase/:DB/:SITE/:PMC/:env', async (req, res) => {
  const pmc = req.params.PMC;
  console.log('pmc:', pmc);
  const config = await connectDB(req.params.DB, req.params.SITE);
  const environment = req.params.env;
  const siteId = req.params.SITE.replace('s', '');
  console.log(config)

  try {
    await sql.connect(config);
    
    // First switch to PMC database using proper string concatenation
    let result = await sql.query(`USE p${pmc}`);
    console.log('Switched to PMC database p' + pmc);

    // Then execute the provider map query
    result = await sql.query`
        DECLARE @isEnable bit = 1;
        DECLARE @providerName varchar(100) = 'Chase';
        
        IF NOT EXISTS (SELECT 1 FROM ProviderMap WHERE ProviderGUID = '8947B54E-63BC-457A-9E8F-C6F93EF2126C')
        BEGIN
            INSERT INTO ProviderMap (ProviderGUID, IsEnabled, createddate, createdby, ModifiedDate, ModifiedBy)
            VALUES ('8947B54E-63BC-457A-9E8F-C6F93EF2126C', 1, GETDATE(), 13, GETDATE(), 13)
        END
        ELSE 
        BEGIN
            UPDATE ProviderMap 
            SET IsEnabled = @isEnable 
            WHERE ProviderGUID = '8947B54E-63BC-457A-9E8F-C6F93EF2126C'
        END;

        UPDATE psm 
        SET psm.ProviderGUID = OSPProvider.ProviderGUID
        FROM ProviderServiceMap psm
        JOIN SiteMaster..OSPService OSPService ON OSPService.ServiceGUID = psm.ServiceGUID
        CROSS JOIN sitemaster..OSPProvider OSPProvider
        WHERE OSPService.ServiceName = 'CARD'
        AND OSPProvider.ProviderName = @providerName;
    `;
    console.log('Provider map query completed');

    // Switch to site database using proper string concatenation
    result = await sql.query(`USE s${siteId}`);
    console.log('Switched to site database s' + siteId);

    // Update provider settings
    result = await sql.query`
        UPDATE ProviderSettings 
        SET SettingsValue = '1665702' 
        WHERE ProviderSettingsID = 1
    `;
    console.log('Provider settings updated');

    // Update property number
    result = await sql.query`
        UPDATE PropertyNumber 
        SET LocationID = '11299562', 
            ResidentDirectID = '11299618' 
        WHERE propnNumber = ${siteId}
    `;
    console.log('Property number updated');

    const url = 'http://' + environment + '.realpage.com/Payments/PaymentSettingsSvc/PaymentsSettings.asmx/ResetCachedSiteSettings?pmcID=' + pmc + '&siteID=' + siteId + '&applicationGuid=ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2';
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      console.log('Cache reset response:', response.status);
      response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log('Cache reset response:', response.status);
        response = await fetch(url, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log('Cache reset response:', response.status);
          res.json({ success: true, message: 'Enabled Chase and MID,LID setting updated successfully' });
        }
      }
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/enableRD/:DB/:SITE/:PMC/:env', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)
  const site = req.params.SITE;
  const pmc = req.params.PMC;
  const environment = req.params.env;
  const siteId = site.replace('s', '');
  console.log('Site ID processing:', { original: site, processed: siteId });

  try {
    await sql.connect(config);
    
    // Execute all queries in sequence
    let result;  
    result = await sql.query`
         update servicefeesettings set ResidentDirectMode=1, ServiceFeeSourceType=1 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType in (1,3,4,5) 
    `;
    console.log('Query 1 completed');
    
    result = await sql.query`
        update servicefeesettings set ResidentDirectMode=2, ServiceFeeSourceType=1 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType=0
    `;
    console.log('Query 2 completed');    

    const url = 'http://' + environment + '.realpage.com/Payments/PaymentSettingsSvc/PaymentsSettings.asmx/ResetCachedSiteSettings?pmcID=' + pmc + '&siteID=' + siteId + '&applicationGuid=ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2';
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      console.log('Cache reset response:', response.status);
      response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log('Cache reset response:', response.status);
        response = await fetch(url, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log('Cache reset response:', response.status);
          res.json({ success: true, message: 'Converted to RD successfully' });
        }
      }
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/enableHybrid/:DB/:SITE/:PMC/:env', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)
  const site = req.params.SITE;
  const pmc = req.params.PMC;
  const environment = req.params.env;
  const siteId = site.replace('s', '');
  console.log('Site ID processing:', { original: site, processed: siteId });

  try {
    await sql.connect(config);
    
    // Execute all queries in sequence
    let result;  
    result = await sql.query`
         update servicefeesettings set ResidentDirectMode=1, ServiceFeeSourceType=1 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType in (1,3,4,5) 
    `;
    console.log('Query 1 completed');
    
    result = await sql.query`
        update servicefeesettings set ResidentDirectMode=2, ServiceFeeSourceType=0 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType=0
    `;
    console.log('Query 2 completed');    

    const url = 'http://' + environment + '.realpage.com/Payments/PaymentSettingsSvc/PaymentsSettings.asmx/ResetCachedSiteSettings?pmcID=' + pmc + '&siteID=' + siteId + '&applicationGuid=ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2';
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      console.log('Cache reset response:', response.status);
      response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log('Cache reset response:', response.status);
        response = await fetch(url, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log('Cache reset response:', response.status);
          res.json({ success: true, message: 'Converted to Hybrid successfully' });
        }
      }
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/enableCD/:DB/:SITE/:PMC/:env', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)
  const site = req.params.SITE;
  const pmc = req.params.PMC;
  const environment = req.params.env;
  const siteId = site.replace('s', '');
  console.log('Site ID processing:', { original: site, processed: siteId });

  try {
    await sql.connect(config);
    
    // Execute all queries in sequence
    let result;  
    result = await sql.query`
         update servicefeesettings set ResidentDirectMode=1, ServiceFeeSourceType=0 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType in (1,3,4,5) 
    `;
    console.log('Query 1 completed');
    
    result = await sql.query`
        update servicefeesettings set ResidentDirectMode=2, ServiceFeeSourceType=0 where applicationguid = 'ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2' and ServiceFeeTransactionType=0
    `;
    console.log('Query 2 completed');    

    const url = 'http://' + environment + '.realpage.com/Payments/PaymentSettingsSvc/PaymentsSettings.asmx/ResetCachedSiteSettings?pmcID=' + pmc + '&siteID=' + siteId + '&applicationGuid=ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2';
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      console.log('Cache reset response:', response.status);
      response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log('Cache reset response:', response.status);
        response = await fetch(url, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log('Cache reset response:', response.status);
          res.json({ success: true, message: 'Converted to CD successfully' });
        }
      }
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/clearcache/:DB/:SITE/:PMC/:env', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)
  const site = req.params.SITE;
  const pmc = req.params.PMC;
  const environment = req.params.env;
  const siteId = site.replace('s', '');
  console.log('Site ID processing:', { original: site, processed: siteId });

  try {
    await sql.connect(config);
    

    const url = 'http://' + environment + '.realpage.com/Payments/PaymentSettingsSvc/PaymentsSettings.asmx/ResetCachedSiteSettings?pmcID=' + pmc + '&siteID=' + siteId + '&applicationGuid=ADD708A3-E0AC-4456-B07E-6ECB4F2A8EB2';
    let response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      console.log('Cache reset response:', response.status);
      response = await fetch(url, {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        console.log('Cache reset response:', response.status);
        response = await fetch(url, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          console.log('Cache reset response:', response.status);
          res.json({ success: true, message: 'Cache reset performed succesfully' });
        }
      }
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/site/:DB/:SITE/:first/:last', async (req, res) => {
  const firstName = req.params.first;
  const lastName = req.params.last;

  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)

  try {
    await sql.connect(config);
    const result = await sql.query`
        SELECT resmID 
        FROM residentmember 
        WHERE resmfirstname = ${firstName} 
        AND resmLastName = ${lastName}
    `;
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await sql.close();
  }

});

app.get('/expirysite/:environment/:batch/:expiry', async (req, res) => {
  const env = req.params.environment;
  const batchId = req.params.batch;
  const expiryDate = req.params.expiry;

  const url = 'https://cloningservices-'+env+'.realpage.com/api/Details/UpdateKeepUntil';
  const payload = {
            "BatchID": batchId,
            "KeepUntil": expiryDate
        };  
  console.log('Payload:', payload);
  let response = await fetch(url, {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      console.log('Site ID Expiry date updated succesfully');
      res.json({ success: true, message: 'Site ID Expiry date updated succesfully' });
    }else{
      throw new Error(`HTTP error! status: ${response.status}`);
    } 

});

app.get('/randomResidentDetails/:DB/:SITE', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)

  try {
    await sql.connect(config);
    // First get the results
    const result = await sql.query`
        SELECT 
		 Lease.leaid LeaseID,
		 Lease.leaBeginDate LeaseStartDate,       
		 Lease.leaActiveDate LeaseActiveDate,       
		 lease.reshID ReshID,       
		 ResidentMemberLease.resmID ResidentID,       
		 LeaseStatusDesc.Name LeaseStatus,       
		 ResidentMember.resmFirstName FirstName,       
		 ResidentMember.resmMiddleInitial MiddleName,       
		 ResidentMember.resmLastName LastName 
		 FROM 
		 Lease         
		 INNER JOIN 
		 ResidentMemberLease                    
		 ON Lease.leaID = ResidentMemberLease.leaID         
		 INNER JOIN 
		 ResidentMember                    
		 ON ResidentMemberLease.resmID = ResidentMember.resmID         
		 Inner JOIN 
		 LeaseStatusDescription LeaseStatusDesc                    
		 On Lease.codeLeaseStatusCode = LeaseStatusDesc.ID 
     WHERE codeLeaseStatusCode = 6    
		 AND leacountasrenewalflag IS NULL 
     ORDER BY Lease.leaID DESC;
    `;

    if (result.recordset && result.recordset.length > 0) {
      // Get a random index
      const randomIndex = Math.floor(Math.random() * result.recordset.length);
      // Return the random row
      res.json(result.recordset[randomIndex]);
    } else {
      res.status(404).json({ error: 'No records found' });
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await sql.close();
  }
});

app.get('/formerResidentDetails/:DB/:SITE', async (req, res) => {
  const config = await connectDB(req.params.DB, req.params.SITE);

  console.log(config)

  try {
    await sql.connect(config);
    const result = await sql.query`
        select distinct Lease.LeaID, 
				Lease.leaBeginDate LeaseStartDate,
				Lease.leaEndDate LeaseEndDate,
				Lease.leaActiveDate LeaseActiveDate, 
				Lease.reshId, 
				ResidentMemberLease.resmID, 
				ResidentMember.resmFirstName, 
				ResidentMember.resmMiddleInitial, 
				ResidentMember.resmLastName, 
				CodeLookup.codeDisplayName 
        from lease Lease  INNER JOIN 
		    ResidentMemberLease                    
		    ON Lease.leaID = ResidentMemberLease.leaID 
		    INNER JOIN 
		    ResidentMember                    
		    ON ResidentMemberLease.resmID = ResidentMember.resmID 
		    JOIN 
		    CodeLookup 
		    ON codelookup.codeCodeName =Lease.codeLeaseStatusCode
        where ResidentMemberLease.resmID = ResidentMember.resmID and ResidentMemberLease.leaID = Lease.leaID 
        and Lease.codeLeaseStatusCode = CodeLookup.codeCodeName AND CodeLookup.className = 'OCCUPANCYSTATUS' 
		    and CodeLookup.codeDisplayName='Former resident'
    `;
    if (result.recordset && result.recordset.length > 0) {
      // Get a random index
      const randomIndex = Math.floor(Math.random() * result.recordset.length);
      // Return the random row
      res.json(result.recordset[randomIndex]);
    } else {
      res.status(404).json({ error: 'No records found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await sql.close();
  }

});

app.listen(3000, () => console.log('API running on port 3000'));