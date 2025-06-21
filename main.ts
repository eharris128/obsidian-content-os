import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from "obsidian";
import { Logger, LogLevel, createLogger } from "./src/utils/logger";

interface ContentOSSettings {
  devMode: boolean;
  logLevel: LogLevel;
  linkedinAccessToken: string;
  linkedinOAuthUrl: string;
  linkedinPersonUrn: string;
}

const DEFAULT_SETTINGS: ContentOSSettings = {
  devMode: false,
  logLevel: LogLevel.ERROR,
  linkedinAccessToken: "",
  linkedinOAuthUrl: "https://www.linkedin.com/oauth/v2/authorization",
  linkedinPersonUrn: ""
};

export default class ContentOSPlugin extends Plugin {
  settings!: ContentOSSettings;
  logger!: Logger | ReturnType<typeof createLogger>;

  override async onload() {
    await this.loadSettings();

    // Initialize logger - returns no-op logger when devMode is off
    this.logger = createLogger(
      "Content OS",
      this.settings.devMode,
      this.settings.logLevel
    );

    this.logger.logPluginLoad();
    this.logger.debug("Settings loaded", this.settings);

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      "linkedin",
      "Create LinkedIn Post",
      (evt: MouseEvent) => {
        // Called when the user clicks the icon.
        this.logger.debug("Ribbon icon clicked");
        this.createLinkedInPost();
      }
    );

    ribbonIconEl.addClass("content-os-ribbon-class");

    this.addCommand({
      id: "create-linkedin-post",
      name: "Create LinkedIn post",
      callback: async () => {
        await this.createLinkedInPost();
      }
    });


    this.addSettingTab(new ContentOSSettingTab(this.app, this));

    this.logger.info("Plugin initialization completed");
  }

  override onunload() {
    this.logger.logPluginUnload();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    if (this.logger) {
      this.logger = createLogger(
        "Content OS",
        this.settings.devMode,
        this.settings.logLevel
      );
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);

    if (this.logger) {
      this.logger = createLogger(
        "Content OS",
        this.settings.devMode,
        this.settings.logLevel
      );
      this.logger.debug("Settings saved");
    }
  }

  private async createLinkedInPost() {
    this.logger.logCommandExecution("create-linkedin-post");

    if (!this.settings.linkedinAccessToken) {
      new Notice(
        "Please configure your LinkedIn access token in settings first"
      );
      return;
    }

    const { LinkedInAPI } = await import("./src/linkedin/api");
    const api = new LinkedInAPI(this.settings.linkedinAccessToken);

    if (this.settings.linkedinPersonUrn) {
      api.setPersonUrn(this.settings.linkedinPersonUrn);
    } else {
      const isValid = await api.validateToken();

      if (!isValid) {
        new Notice("LinkedIn token is invalid or expired. Please update it in settings.");
        return;
      }

      const personUrn = api.getPersonUrn();
      if (personUrn) {
        this.settings.linkedinPersonUrn = personUrn;
        await this.saveSettings();
      }
    }

    // TODO - why do this in this fashion
    const { LinkedInPostComposer } = await import(
      "./src/linkedin/PostComposer"
    );
    const composer = new LinkedInPostComposer(
      this.app,
      api,
      this.logger
    );
    composer.open();
  }
}

class ContentOSSettingTab extends PluginSettingTab {
  plugin: ContentOSPlugin;

  constructor(app: App, plugin: ContentOSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();


    new Setting(containerEl)
      .setName("Dev mode")
      .setDesc(
        "Enable detailed logging for debugging. Only enable when troubleshooting issues."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.devMode)
          .onChange(async (value) => {
            this.plugin.settings.devMode = value;
            await this.plugin.saveSettings();

            const status = value ? "enabled" : "disabled";
            new Notice(`Dev mode ${status}. Check console for detailed logs.`);

            this.display();
          })
      );

    new Setting(containerEl)
      .setName("Generate LinkedIn access token")
      .setDesc("Click the button to open your browser and start the login flow")
      .addButton((button) =>
        button.setButtonText("Generate LinkedIn access token").onClick(() => {
          window.open("https://oauth-proxy.echarris.workers.dev", "_blank");
          new Notice(
            "Complete the login flow and paste your access token below"
          );
        })
      );

    new Setting(containerEl)
      .setName("LinkedIn access token")
      .setDesc(
        "Paste your access token here after completing the login flow"
      )
      .addText((text) =>
        text
          .setPlaceholder("Enter your access token")
          .setValue(this.plugin.settings.linkedinAccessToken)
          .onChange(async (value) => {
            this.plugin.settings.linkedinAccessToken = value;
            this.plugin.settings.linkedinPersonUrn = "";
            await this.plugin.saveSettings();
          })
      )
      .addButton((button) =>
        button.setButtonText("Validate token").onClick(async () => {
          if (!this.plugin.settings.linkedinAccessToken) {
            new Notice("Please enter an access token first");
            return;
          }

          const { LinkedInAPI } = await import("./src/linkedin/api");
          const api = new LinkedInAPI(this.plugin.settings.linkedinAccessToken);

          try {
            const isValid = await api.validateToken();
            if (isValid) {
              const personUrn = api.getPersonUrn();
              if (personUrn) {
                this.plugin.settings.linkedinPersonUrn = personUrn;
                await this.plugin.saveSettings();
              }
              new Notice("Access token is valid!");
            } else {
              new Notice("Access token is invalid or expired");
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            new Notice(`Error validating token: ${errorMessage}`);
          }
        })
      );

    // Only show log level setting when dev mode is enabled
    if (this.plugin.settings.devMode) {
      new Setting(containerEl)
        .setName("Log level")
        .setDesc("Set the minimum log level to display")
        .addDropdown((dropdown) =>
          dropdown
            .addOption(LogLevel.DEBUG.toString(), "Debug")
            .addOption(LogLevel.INFO.toString(), "Info")
            .addOption(LogLevel.WARN.toString(), "Warning")
            .addOption(LogLevel.ERROR.toString(), "Error")
            .setValue(this.plugin.settings.logLevel.toString())
            .onChange(async (value) => {
              this.plugin.settings.logLevel = parseInt(value) as LogLevel;
              await this.plugin.saveSettings();

              // Update logger's log level if it exists
              if (this.plugin.logger && "setLogLevel" in this.plugin.logger) {
                this.plugin.logger.setLogLevel(this.plugin.settings.logLevel);
              }
            })
        );
    }

    const versionSection = containerEl.createDiv();
    versionSection.addClass("content-os-version-wrapper");

    const versionContent = versionSection.createEl("div", {
      attr: { class: "content-os-version-content" }
    });

    versionContent.createEl("p", {
      text: "Content OS",
      attr: { class: "content-os-version-name" }
    });

    versionContent.createEl("p", {
      text: "By eharris128",
      attr: { class: "content-os-version-author" }
    });

    const versionNumber = versionContent.createEl("span", {
      text: `v${this.plugin.manifest.version}`,
      attr: { class: "content-os-version-number" }
    });
    versionContent.appendChild(versionNumber);
  }
}
