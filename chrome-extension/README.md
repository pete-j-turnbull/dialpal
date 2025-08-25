# Google Docs Diff Tracker Chrome Extension

A Chrome MV3 extension that tracks text changes in Google Docs and sends compact diffs to an API endpoint every 30 seconds.

## Features

- **No OAuth required**: Uses session cookies for document access
- **Real-time diff tracking**: Monitors changes using diff_match_patch algorithm
- **Activity-aware**: Only runs when document is focused and user is typing
- **Idle detection**: Pauses after 2 minutes of inactivity
- **Exponential backoff**: Robust error handling for network failures
- **Efficient payloads**: Sends only insert/delete operations, not full text

## Installation

### Load Unpacked Extension

1. **Compile TypeScript files** (if needed):
   ```bash
   # Install TypeScript if not already installed
   npm install -g typescript

   # Compile all .ts files to .js
   cd chrome-extension
   tsc types.ts --target es2017 --module es6
   tsc lib/hash.ts --target es2017 --module es6
   tsc lib/backoff.ts --target es2017 --module es6
   tsc vendor/diff_match_patch.ts --target es2017 --module es6
   tsc content.ts --target es2017 --module es6
   ```

2. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `chrome-extension` directory
   - The extension should appear in your extensions list

4. **Grant permissions**:
   - The extension will automatically request host permissions for `https://docs.google.com/*`
   - Accept the permissions when prompted

## Configuration

### API Endpoint

Before using the extension, update the API endpoint in `content.ts`:

```typescript
const API_URL = "https://your.ingest.endpoint/v1/diffs"; // Replace with your actual endpoint
```

After updating, recompile the TypeScript file:

```bash
tsc content.ts --target es2017 --module es6
```

Then reload the extension in `chrome://extensions/`.

## Testing

1. **Open a Google Doc**:
   - Navigate to any Google Docs document in edit mode
   - URL should match: `https://docs.google.com/document/d/*/edit*`

2. **Start typing**:
   - Make some changes to the document
   - The extension will begin tracking after detecting activity

3. **Monitor network activity**:
   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Filter by your API endpoint URL
   - You should see POST requests every ~30 seconds while actively editing

4. **Test activity states**:
   - **Tab blur**: Switch to another tab - requests should stop
   - **Tab hide**: Minimize window - requests should stop  
   - **Idle state**: Stop typing for 2+ minutes - requests should pause
   - **Resume activity**: Start typing again - requests should resume

## How It Works

### Document Access

The extension uses Google Docs' built-in export endpoint:
```
GET https://docs.google.com/document/d/{DOC_ID}/export?format=txt
```

This endpoint uses session cookies (no OAuth required) and returns plain text content.

### Diff Algorithm

1. **First fetch**: Sends full document as single insert operation
2. **Subsequent fetches**: 
   - Compares new text with previous snapshot using diff_match_patch
   - Converts diffs to absolute position operations:
     - `{ t: "ins", pos: number, text: string }` - Insert text at position
     - `{ t: "del", pos: number, len: number }` - Delete length chars at position
   - Coalesces adjacent operations of same type

### Activity Detection

The extension only runs when:
- Document tab is visible (`document.visibilityState === "visible"`)
- Document has focus (`document.hasFocus() === true`)
- User typed within last 2 minutes (keydown listener)

### Error Handling

- **Export failures**: Exponential backoff with 2-minute cap
- **Large documents**: >2MB docs trigger heartbeat and 5-minute pause  
- **Network errors**: Robust retry logic with jitter
- **Rate limiting**: Respects 429 responses with backoff

## Payload Format

```typescript
{
  ts: "2023-12-07T10:30:00.000Z",
  docId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  docUrl: "https://docs.google.com/document/d/.../edit",
  installId: "550e8400-e29b-41d4-a716-446655440000",
  sampleMs: 30000,
  source: "chrome-ext@v1",
  oldHash: "abc123...", // SHA-256 of previous text
  newHash: "def456...",  // SHA-256 of current text
  ops: [
    { t: "del", pos: 100, len: 5 },      // Delete 5 chars at pos 100
    { t: "ins", pos: 100, text: "new" }  // Insert "new" at pos 100
  ],
  meta: {
    title: "My Document",
    userLocale: "en-US"
  }
}
```

## Limitations

- **Cookie dependency**: Requires user to be logged into Google Docs
- **Enterprise policies**: Some corporate environments may block cookie access for extensions
- **Single tab**: Tracks one document per tab (multiple tabs work independently)
- **Plain text only**: No formatting information, only text content
- **No real-time**: 30-second polling interval (not live collaboration)

## Security & Privacy

- **No data storage**: Document content never persisted locally
- **Session-based**: Uses existing Google authentication
- **HTTPS only**: All communication encrypted
- **Minimal permissions**: Only requests necessary host permissions
- **No user data**: Install ID is randomly generated UUID

## Troubleshooting

### Extension not working

1. Check console for errors:
   - Open DevTools on Google Docs page
   - Look for `[docs-tracker]` log messages

2. Verify permissions:
   - Go to `chrome://extensions/`
   - Ensure "Site access" shows "On docs.google.com"

3. Check document URL:
   - Must be in `/edit` mode
   - Must be `https://docs.google.com/document/d/*/edit*`

### No network requests

1. Verify activity state:
   - Tab must be focused and visible
   - Must type something (keydown events)
   - Wait up to 30 seconds for first request

2. Check API endpoint:
   - Ensure `API_URL` is correctly configured
   - Verify endpoint accepts POST requests
   - Check for CORS issues in network tab

### Export endpoint failing

- **403 Forbidden**: User not logged in or document not accessible
- **429 Rate Limited**: Extension will automatically back off
- **Network Error**: Check internet connection and firewall

## Development

### File Structure

```
chrome-extension/
├── manifest.json           # Extension configuration
├── content.ts             # Main extension logic  
├── types.ts              # TypeScript interfaces
├── lib/
│   ├── hash.ts           # SHA-256 utility
│   └── backoff.ts        # Exponential backoff
├── vendor/
│   └── diff_match_patch.ts # Text diffing library
└── README.md             # This file
```

### Building

Compile TypeScript files:
```bash
find . -name "*.ts" -exec tsc {} --target es2017 --module es6 \;
```

### Future Enhancements

- **OAuth support**: For enterprise environments that block cookies
- **Real-time sync**: WebSocket connection for live updates  
- **Compression**: Gzip large payloads automatically
- **Batch operations**: Group multiple small changes
- **Formatting tracking**: Include style/structure changes