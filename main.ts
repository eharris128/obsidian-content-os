import {
  App,
  Editor,
  MarkdownView,
  MarkdownFileInfo,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile
} from 'obsidian';
import { Logger, LogLevel, createLogger } from './src/utils/logger';

interface MyPluginSettings {
  mySetting: string;
  enableFeatureX: boolean;
  maxItems: number;
  devMode: boolean;
  logLevel: LogLevel;
  linkedinAccessToken: string;
  linkedinOAuthUrl: string;
  linkedinPersonUrn: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
  enableFeatureX: true,
  maxItems: 10,
  devMode: false,
  logLevel: LogLevel.ERROR,
  linkedinAccessToken: '',
  linkedinOAuthUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  linkedinPersonUrn: ''
};

export default class MyPlugin extends Plugin {
  settings!: MyPluginSettings;
  logger!: Logger | ReturnType<typeof createLogger>;

  override async onload() {
    await this.loadSettings();

    // Initialize logger - returns no-op logger when devMode is off
    this.logger = createLogger(
      'Open your mind',
      this.settings.devMode,
      this.settings.logLevel
    );

    this.logger.logPluginLoad();
    this.logger.debug('Settings loaded', this.settings);

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      'brain',
      'Open your mind',
      (evt: MouseEvent) => {
        // Called when the user clicks the icon.
        this.logger.debug('Ribbon icon clicked');
        new Notice('Open your mind!');
      }
    );

    // Perform additional setup
    ribbonIconEl.addClass('oym-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        this.logger.logCommandExecution('open-sample-modal-simple');
        new SampleModal(this.app, this.logger).open();
      }
    });

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (
        editor: Editor,
        ctx: MarkdownView | MarkdownFileInfo
      ) => {
        this.logger.logCommandExecution('sample-editor-command');
        if (ctx instanceof MarkdownView) {
          const selection = editor.getSelection();
          if (selection) {
            this.logger.debug('Making text bold', { selection });
            editor.replaceSelection(`**${  selection  }**`);
            new Notice('Text made bold!');
          } else {
            this.logger.debug('No text selected for bold command');
            new Notice('No text selected');
          }
        }
      }
    });

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply 'checking' if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            this.logger.logCommandExecution('open-sample-modal-complex');
            new SampleModal(this.app, this.logger).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
        return false;
      }
    });

    // Enhanced command: Insert current timestamp
    this.addCommand({
      id: 'insert-timestamp',
      name: 'Insert current timestamp',
      editorCallback: (editor: Editor) => {
        this.logger.logCommandExecution('insert-timestamp');
        const timestamp = new Date().toISOString();
        this.logger.debug('Inserting timestamp', { timestamp });
        editor.replaceSelection(timestamp);
      }
    });

    // Enhanced command: Count words in current note
    this.addCommand({
      id: 'count-words',
      name: 'Count words in current note',
      callback: () => {
        this.logger.logCommandExecution('count-words');
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          this.logger.time('word-count');
          const content = activeView.editor.getValue();
          const wordCount = content
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
          this.logger.timeEnd('word-count');
          this.logger.debug('Word count calculated', {
            wordCount,
            contentLength: content.length
          });
          new Notice(`Word count: ${wordCount}`);
        } else {
          this.logger.debug('No active markdown view for word count');
        }
      }
    });

    // LinkedIn post command
    this.addCommand({
      id: 'create-linkedin-post',
      name: 'Create LinkedIn post',
      callback: async () => {
        this.logger.logCommandExecution('create-linkedin-post');

        if (!this.settings.linkedinAccessToken) {
          new Notice(
            'Please configure your LinkedIn access token in settings first'
          );
          return;
        }

        const { LinkedInAPI } = await import('./src/linkedin/api');
        const api = new LinkedInAPI(this.settings.linkedinAccessToken);
        
        // Check if we already have a person URN saved
        if (this.settings.linkedinPersonUrn) {
          // Use the saved person URN
          api.setPersonUrn(this.settings.linkedinPersonUrn);
        } else {
          // Validate token and fetch user info
          const isValid = await api.validateToken();
          if (!isValid) {
            new Notice('LinkedIn token is invalid or expired. Please update it in settings.');
            return;
          }
          
          // Save the person URN for future use
          const personUrn = api.getPersonUrn();
          if (personUrn) {
            this.settings.linkedinPersonUrn = personUrn;
            await this.saveSettings();
          }
        }

        // Pass the API instance to the composer so it has the person URN
        const { LinkedInPostComposer } = await import(
          './src/linkedin/PostComposer'
        );
        const composer = new LinkedInPostComposer(
          this.app,
          api,
          this.logger
        );
        composer.open();
      }
    });

    // Tab command example: Open dedicated getting started file
    this.addCommand({
      id: 'open-getting-started-file',
      name: 'Open getting started file',
      callback: async () => {
        this.logger.logCommandExecution('open-getting-started-file');

        // Create or get the getting started file
        const fileName = 'Open your mind - getting started.md';
        const filePath = fileName;

        let file = this.app.vault.getAbstractFileByPath(filePath);

        // If file doesn't exist, create it
        if (!file) {
          this.logger.debug('Creating getting started file');
          const content = `
Welcome to Open your mind! This tool enhances your Obsidian experience with powerful features.

## Quick Start

1. Click the dice icon in the ribbon to open your mind
2. Use the command palette to access various commands
3. Configure settings in the plugin settings tab

## Features

- **Sample Modals**: Demonstrate how to create interactive modals
- **Editor Commands**: Modify text directly in the editor
- **Timestamp Insertion**: Insert current timestamp at cursor
- **Word Counter**: Count words in the current note
- **Dev Mode**: Enable detailed logging for debugging

## Getting Help

Visit the settings tab to configure the tool to your needs.
Enable Dev Mode to see detailed logs in the console.

---
*Happy note-taking!*`;

          try {
            file = await this.app.vault.create(filePath, content);
            this.logger.debug('Getting started file created');
          } catch (error) {
            this.logger.error('Failed to create getting started file', error);
            new Notice('Failed to create getting started file');
            return;
          }
        }

        // Open the file in a new tab
        const leaf = this.app.workspace.getLeaf('tab');
        if (file instanceof TFile) {
          await leaf.openFile(file);
          this.logger.debug('Opened getting started file');
        }
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(
      window.setInterval(
        () => this.logger.debug('Periodic interval tick'),
        5 * 60 * 1000
      )
    );

    // Error handling example
    try {
      // Some potentially risky operation
      this.performRiskyOperation();
    } catch (error) {
      this.logger.error('Error in plugin initialization', error);
      new Notice('Plugin encountered an error. Check console for details.');
    }

    this.logger.info('Plugin initialization completed');
  }

  override onunload() {
    this.logger.logPluginUnload();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // Recreate logger when settings are loaded
    if (this.logger) {
      this.logger = createLogger(
        'Open your mind',
        this.settings.devMode,
        this.settings.logLevel
      );
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Recreate logger when dev mode or log level changes
    if (this.logger) {
      this.logger = createLogger(
        'Open your mind',
        this.settings.devMode,
        this.settings.logLevel
      );
      this.logger.debug('Settings saved');
    }
  }

  private performRiskyOperation() {
    // Example of a method that might throw an error
    this.logger.debug('Performing risky operation');
    if (!this.app.workspace) {
      throw new Error('Workspace not available');
    }
    this.logger.debug('Risky operation completed successfully');
    // Additional risky operations...
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText((text) =>
        text
          .setPlaceholder('Enter your secret')
          .setValue(this.plugin.settings.mySetting)
          .onChange(async (value) => {
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable feature')
      .setDesc('Toggle this awesome feature on or off')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableFeatureX)
          .onChange(async (value) => {
            this.plugin.settings.enableFeatureX = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Maximum items')
      .setDesc('Set the maximum number of items to process')
      .addSlider((slider) =>
        slider
          .setLimits(1, 100, 1)
          .setValue(this.plugin.settings.maxItems)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxItems = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Dev mode')
      .setDesc(
        'Enable detailed logging for debugging. Only enable when troubleshooting issues.'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.devMode)
          .onChange(async (value) => {
            this.plugin.settings.devMode = value;
            await this.plugin.saveSettings();

            const status = value ? 'enabled' : 'disabled';
            new Notice(`Dev mode ${status}. Check console for detailed logs.`);

            this.display();
          })
      );

    // Only show log level setting when dev mode is enabled
    if (this.plugin.settings.devMode) {
      new Setting(containerEl)
        .setName('Log level')
        .setDesc('Set the minimum log level to display')
        .addDropdown((dropdown) =>
          dropdown
            .addOption(LogLevel.DEBUG.toString(), 'Debug')
            .addOption(LogLevel.INFO.toString(), 'Info')
            .addOption(LogLevel.WARN.toString(), 'Warning')
            .addOption(LogLevel.ERROR.toString(), 'Error')
            .setValue(this.plugin.settings.logLevel.toString())
            .onChange(async (value) => {
              this.plugin.settings.logLevel = parseInt(value) as LogLevel;
              await this.plugin.saveSettings();

              // Update logger's log level if it exists
              if (this.plugin.logger && 'setLogLevel' in this.plugin.logger) {
                this.plugin.logger.setLogLevel(this.plugin.settings.logLevel);
              }
            })
        );
    }

    containerEl.createEl('h2', { text: 'LinkedIn Integration' });

    new Setting(containerEl)
      .setName('LinkedIn OAuth URL')
      .setDesc('Click the button to start the LinkedIn OAuth process')
      .addButton((button) =>
        button.setButtonText('Generate LinkedIn OAuth Token').onClick(() => {
          window.open('https://oauth-proxy.echarris.workers.dev', '_blank');
          new Notice(
            'Complete the OAuth flow and paste your access token below'
          );
        })
      );

    new Setting(containerEl)
      .setName('LinkedIn Access Token')
      .setDesc(
        'Paste your LinkedIn access token here after completing the OAuth flow'
      )
      .addText((text) =>
        text
          .setPlaceholder('Enter your LinkedIn access token')
          .setValue(this.plugin.settings.linkedinAccessToken)
          .onChange(async (value) => {
            this.plugin.settings.linkedinAccessToken = value;
            // Clear person URN when access token changes
            this.plugin.settings.linkedinPersonUrn = '';
            await this.plugin.saveSettings();
          })
      )
      .addButton((button) =>
        button.setButtonText('Validate Token').onClick(async () => {
          if (!this.plugin.settings.linkedinAccessToken) {
            new Notice('Please enter a LinkedIn access token first');
            return;
          }

          const { LinkedInAPI } = await import('./src/linkedin/api');
          const api = new LinkedInAPI(this.plugin.settings.linkedinAccessToken);

          try {
            const isValid = await api.validateToken();
            if (isValid) {
              const personUrn = api.getPersonUrn();
              if (personUrn) {
                this.plugin.settings.linkedinPersonUrn = personUrn;
                await this.plugin.saveSettings();
              }
              new Notice('LinkedIn token is valid!');
            } else {
              new Notice('LinkedIn token is invalid or expired');
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            new Notice(`Error validating token: ${errorMessage}`);
          }
        })
      );

    const versionSection = containerEl.createDiv();
    versionSection.addClass('oym-version-warpper');

    const versionContent = versionSection.createEl('div', {
      attr: { class: 'oym-version-content' }
    });

    versionContent.createEl('p', {
      text: 'Open your mind',
      attr: { class: 'oym-version-name' }
    });

    versionContent.createEl('p', {
      text: 'By eharris128',
      attr: { class: 'oym-version-author' }
    });

    const versionNumber = versionContent.createEl('span', {
      text: `v${this.plugin.manifest.version}`,
      attr: { class: 'oym-version-number' }
    });
    versionContent.appendChild(versionNumber);
  }
}
