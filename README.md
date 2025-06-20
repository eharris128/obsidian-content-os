# Obsidian Plugin QuickStar

This is an enhanced Obsidian plugin quickstart template that includes modern development practices, comprehensive examples, and all the files needed for plugin submission.

## Features

- **Enhanced Plugin Structure**: Modern TypeScript setup with strict type checking
- **Rich Examples**: Demonstrates commands, modals, settings, and error handling
- **GitHub Actions**: Automated release workflow with Node.js 24.2.0
- **Comprehensive Settings**: Toggle controls, sliders, and persistent storage
- **Modern Build System**: ESBuild with development and production modes
- **Code Quality**: ESLint configuration and type checking
- **Submission Ready**: Follows Obsidian plugin submission requirements

## Quick Start

1. Clone this repository
2. Update the plugin information in `manifest.json`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Build for production: `npm run build`

## Development

### Commands Available

- `npm run dev` - Start development with file watching
- `npm run build` - Production build with minification
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run version` - Bump version and update manifest
- `npm run clean` - Remove build artifacts

### Plugin Structure

```
├── main.ts              # Main plugin file with examples
├── manifest.json        # Plugin metadata
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Test configuration
├── esbuild.config.mjs   # Build configuration
├── .eslintrc.js         # Linting rules
├── .gitignore           # Git ignore rules
├── styles.css           # Plugin styles
├── versions.json        # Version compatibility
├── version-bump.mjs     # Version management utility
├── src/
│   └── utils/
│       └── logger.ts    # Logger utility with dev mode
├── tests/
│   ├── setup/           # Test mocks and utilities
│   ├── utils/           # Utility tests
│   └── plugin/          # Plugin tests
└── .github/
    └── workflows/
        ├── ci.yml       # Continuous integration
        └── release.yml  # Automated release workflow
```

## Plugin Examples Included

### Commands
- Simple command with notice
- Editor command for text formatting
- Complex command with conditions
- Timestamp insertion
- Word count functionality

### UI Components
- Ribbon icon with click handler
- Status bar integration
- Modal with interactive elements
- Settings tab with various controls

### Settings
- Text input with persistence
- Toggle switches
- Slider controls with plugintips
- Automatic settings synchronization
- Developer mode toggle for detailed logging

## Testing

This template includes a comprehensive testing setup using **Vitest** for fast, modern unit testing.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- **`tests/setup/`** - Mock implementations of Obsidian APIs and test utilities
- **`tests/utils/`** - Tests for utility functions (like the logger)
- **`tests/plugin/`** - Tests for plugin functionality (settings, lifecycle, etc.)

### Writing Tests

The test setup includes:
- **Obsidian API mocks** - Test your plugin without requiring the full Obsidian environment
- **Test utilities** - Helper functions for creating mock instances and capturing console output
- **TypeScript support** - Full type checking in your tests

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
  it('should log messages in dev mode', () => {
    const logger = new Logger('TestPlugin', true);
    // Test your logger functionality
  });
});
```

### Continuous Integration

Tests automatically run on:
- Every push to main/master branch
- Every pull request
- Multiple Node.js versions (20, 22)

The CI also runs linting, type checking, and builds to ensure code quality.

## Release Process

1. Update version in `package.json`
2. Run `npm run version` to sync versions
3. Commit changes: `git commit -am "Release v1.0.1"`
4. Create tag: `git tag 1.0.1`
5. Push with tags: `git push origin main --tags`

The GitHub Action will automatically:
- Build the plugin
- Create a draft release
- Attach required files (`main.js`, `manifest.json`, `styles.css`)

## Obsidian Plugin Submission Requirements

This template follows the [official submission requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins):

### ✅ Required Files
- `manifest.json` - Plugin metadata and configuration
- `main.js` - Compiled plugin code (generated from main.ts)
- `styles.css` - Plugin styles (optional but recommended)

### ✅ Manifest Requirements
- Unique plugin ID
- Descriptive name and description
- Proper version numbering
- Minimum app version specified
- Author information
- Funding URLs (optional)

### ✅ Code Quality
- TypeScript with strict type checking
- ESLint configuration
- Error handling examples
- Modern ES6+ syntax
- Proper async/await usage

### ✅ Build System
- Automated build process
- External dependencies properly handled
- Source maps for development
- Minification for production

### ✅ Documentation
- Clear README with setup instructions
- Code examples and API usage
- Release process documentation

## Customization

### Update Plugin Information
1. Edit `manifest.json` - Change ID, name, description, author
2. Edit `package.json` - Update name, description, repository URLs
3. Update this README with your plugin's specific information

### Add New Features
1. Extend the main plugin class in `main.ts`
2. Add new commands, modals, or settings
3. Update settings interface if needed
4. Add corresponding UI elements

### Styling
1. Add CSS rules to `styles.css`
2. Use Obsidian's CSS variables for theming
3. Follow Obsidian's design guidelines

## Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Plugin+anatomy)
- [Plugin Submission Guidelines](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESBuild Documentation](https://esbuild.github.io/)

## License

MIT License - feel free to use this template for your own plugins!

---

Happy plugin development! 🚀