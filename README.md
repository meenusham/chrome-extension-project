# LOFT Chrome Extension

## Overview
This Chrome extension provides functionality to manage site settings, resident information, and various configurations for the RealPage platform. It offers a convenient interface to perform common administrative tasks directly from the browser.

## Features

### Site Management
- **Site Details**: View detailed site information including SiteID, SiteName, PmcID, and database information
- **Site Status**: Check the current status of a site
- **Cache Management**: Clear site cache settings

### Resident Management
- **Resident Lookup**: Search residents by first and last name
- **Random Resident Details**: Get random resident information for testing
- **Former Resident Details**: Access information about former residents

### Payment Settings
- **WH Widget**: Enable/disable the WH Widget functionality
- **Payment Modes**:
  - Convert to CD (Card Direct)
  - Convert to RD (Resident Direct)
- **Chase Integration**: Configure Chase payment settings including MID and LID

### Site Expiry Management
- Update site expiry dates
- Manage batch settings

## Installation

1. Clone the repository
2. Navigate to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the project directory

## Project Structure

```
├── manifest.json           # Chrome extension manifest
├── package.json           # Project dependencies
├── src/
│   ├── background.js      # Background script
│   ├── content.js         # Content script
│   ├── backend/
│   │   └── index.js      # Backend server implementation
│   ├── images/           # Extension icons
│   ├── options/          # Extension options page
│   └── popup/            # Extension popup interface
```

## Setup

### Backend Server
1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node src/backend/index.js
```

The server runs on port 3000 by default.

### Database Configuration
The application requires access to SQL Server with the following credentials:
- Username: one_1_admin
- Database: Configured per site
- Server: Configured per environment

## API Endpoints

### Site Management
- `GET /site/:DB/:SITE/:first/:last` - Get resident member ID
- `GET /randomResidentDetails/:DB/:SITE` - Get random resident details
- `GET /formerResidentDetails/:DB/:SITE` - Get former resident details
- `GET /enableWHWidget/:DB/:SITE` - Enable WH Widget
- `GET /enableCD/:DB/:SITE/:PMC/:env` - Convert to Card Direct
- `GET /enableRD/:DB/:SITE/:PMC/:env` - Convert to Resident Direct
- `GET /enableChase/:DB/:SITE/:PMC/:env` - Configure Chase settings
- `GET /clearcache/:DB/:SITE/:PMC/:env` - Clear site cache
- `GET /expirysite/:environment/:batch/:expiry` - Update site expiry

## Usage

1. Click the extension icon in Chrome
2. Enter the site ID
3. Select the environment (e.g., production, staging)
4. Choose the desired operation from the dropdown
5. Fill in any required additional information
6. Click Submit to execute the operation

## Features in Detail

### Site Details
Provides comprehensive site information including:
- Site ID
- Site Name
- PMC ID
- PMC Name
- Database Location
- Site Status

### Resident Management
- Search for residents using first and last names
- View resident member IDs
- Access lease information
- Get random resident details for testing
- View former resident information

### Payment Configuration
- Enable/disable WH Widget
- Configure payment modes (CD/RD)
- Set up Chase integration
- Update MID and LID settings
- Manage service fee settings

## Error Handling
- The extension provides clear error messages for common issues
- Database connection errors are logged with details
- HTTP error responses include status codes and descriptions
- Invalid input validation with user feedback

## Security
- Uses secure database connections
- Implements proper error handling
- Validates all user inputs
- Requires proper authentication for sensitive operations

## Development

### Prerequisites
- Node.js
- SQL Server
- Chrome browser

### Local Development
1. Make code changes
2. Reload the extension in Chrome
3. Restart the backend server if needed

### Testing
Test all functionality in a non-production environment first:
1. Site lookup
2. Resident searches
3. Payment configuration changes
4. Cache management