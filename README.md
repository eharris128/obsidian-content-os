# Content OS

Post directly to LinkedIn from your vault.

## Overview

Content OS is an Obsidian plugin that bridges the gap between your note-taking and content publishing workflows. Create and publish LinkedIn posts directly from Obsidian without switching between applications.

## Features

- **Seamless Workflow**: Create LinkedIn posts without leaving Obsidian
- **User-Friendly Interface**: Simple modal for composing and publishing posts
- **Character Counter**: Real-time character count with LinkedIn limits

## Quick Start

### 1. Installation
1. Download the plugin files
2. Place them in your Obsidian plugins directory: `.obsidian/plugins/content-os/`
3. Enable the plugin in Obsidian settings

### 2. LinkedIn Authentication
1. Open plugin settings
2. Click "Generate LinkedIn access token"
3. Complete the login flow in your browser
4. Copy and paste the access token into the plugin settings
5. Click "Validate token" to verify the token works

### 3. Create Your First Post
- Use the ribbon icon (send icon) to open the post composer
- Or use the command palette: "Create LinkedIn post"
- Write your content in the modal
- Click "Post" to publish

## Usage

### Creating Posts
1. **Ribbon Icon**: Click the send icon in the left ribbon
2. **Command Palette**: Search for "Create LinkedIn post"
3. **Write Content**: Enter your post content in the modal
4. **Character Limit**: Stay within LinkedIn's 3000 character limit
5. **Publish**: Click "Post" to publish immediately

### Settings Configuration
- **LinkedIn Access Token**: Your OAuth token for API access (password field for security)
- **Dev Mode**: Enable for detailed logging and debugging
- **Log Level**: Control the verbosity of logs when dev mode is enabled

## Authentication

Content OS uses LinkedIn's OAuth 2.0 for secure authentication:

1. **Initial Setup**: Generate a token through the OAuth proxy
2. **Token Storage**: Tokens are stored securely in Obsidian's data storage
3. **Auto-Validation**: The plugin automatically validates tokens before posting
4. **User ID Caching**: LinkedIn user IDs are cached to avoid repeated API calls

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npm run dev      # Development with file watching
npm run build    # Production build
npm run lint     # Code linting
npm run typecheck # TypeScript checking
```

### Project Structure
```
├── main.ts                 # Main plugin entry point
├── manifest.json           # Plugin metadata
├── src/
│   ├── linkedin/
│   │   ├── api.ts          # LinkedIn API integration
│   │   └── PostComposer.ts # Post creation modal
│   └── utils/
│       └── logger.ts       # Logging utility
└── README.md              # This file
```

## API Integration

Content OS integrates with LinkedIn's v2 API:

- **User Info Endpoint**: `/v2/userinfo` for user identification
- **Posts Endpoint**: `/v2/posts` for content publishing
- **OAuth Flow**: Standard OAuth 2.0 with PKCE for security

## Privacy & Security

- **Local Storage**: All tokens are stored locally in Obsidian
- **No Data Collection**: Content OS doesn't collect or transmit user data
- **OAuth Security**: Uses industry-standard OAuth 2.0 authentication
- **Token Validation**: Tokens are validated before each use

### OAuth Host
- I have a small open source repo [here](https://github.com/eharris128/content-os-linkedin-oauth-proxy) where the LinkedIn OAuth flow is driven from. When a user uses the `Generate LinkedIn access token` button within this app, this is the code standing behind the URL where they are pushed.

## Troubleshooting

### Common Issues

**Token Invalid/Expired**
- Generate a new token through the OAuth flow
- Ensure you're using the correct LinkedIn account
- Check that the token hasn't expired

**Post Failed to Publish**
- Verify your internet connection
- Check that your LinkedIn account has posting permissions
- Ensure content doesn't exceed character limits

**Plugin Not Loading**
- Enable dev mode in settings for detailed logs
- Check the developer console for error messages
- Verify plugin files are in the correct directory

### Debug Mode
Enable dev mode in plugin settings to see detailed logs in the developer console:
1. Open plugin settings
2. Toggle "Dev mode" on
3. Set log level to "Debug"
4. Check browser developer console for detailed information

## License

MIT License - See LICENSE file for details.

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Report bugs or request features]
