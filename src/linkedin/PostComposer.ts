import { App, Modal, Notice } from "obsidian";
import { LinkedInAPI } from "./api";
import { createLogger } from "../utils/logger";

export class LinkedInPostComposer extends Modal {
  private postContent: string = "";
  private api: LinkedInAPI;
  private logger: ReturnType<typeof createLogger>;

  constructor(app: App, api: LinkedInAPI, logger: ReturnType<typeof createLogger>) {
    super(app);
    this.api = api;
    this.logger = logger;
  }

  override onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "Create LinkedIn post" });

    // Post content textarea
    const textareaContainer = contentEl.createDiv();
    textareaContainer.style.marginBottom = "1rem";

    const textarea = textareaContainer.createEl("textarea", {
      placeholder: "What do you want to share on LinkedIn?",
      attr: {
        style: "width: 100%; min-height: 150px; resize: vertical;"
      }
    });

    textarea.value = this.postContent;
    textarea.addEventListener("input", (e) => {
      // TODO - rm any
      this.postContent = (e.target as any).value;
    });

    // Character count
    const charCount = textareaContainer.createEl("div", {
      text: `${this.postContent.length}/3000 characters`,
      attr: {
        style: "text-align: right; font-size: 0.9em; color: var(--text-muted);"
      }
    });

    textarea.addEventListener("input", () => {
      charCount.textContent = `${this.postContent.length}/3000 characters`;
    });


    // Action buttons
    const buttonContainer = contentEl.createDiv({
      attr: { style: "display: flex; gap: 10px; margin-top: 1rem;" }
    });

    buttonContainer.createEl("button", {
      text: "Cancel",
      attr: { style: "flex: 1;" }
    }).addEventListener("click", () => {
      this.close();
    });

    const postButton = buttonContainer.createEl("button", {
      text: "Post to LinkedIn",
      attr: {
        style: "flex: 1; background-color: var(--interactive-accent); color: var(--text-on-accent);"
      }
    });

    postButton.addEventListener("click", async () => {
      await this.postToLinkedIn();
    });

    // Help text
    contentEl.createEl("div", {
      text: "Note: You need to configure your LinkedIn access token in the plugin settings first.",
      attr: {
        style: "margin-top: 1rem; font-size: 0.9em; color: var(--text-muted);"
      }
    });
  }

  private async postToLinkedIn() {
    if (!this.postContent.trim()) {
      new Notice("Please enter some content for your post");
      return;
    }


    // Disable post button and show loading state
    const postButton = this.contentEl.querySelector("button:last-child") as any;
    if (postButton) {
      postButton.disabled = true;
      postButton.textContent = "Posting...";
    }

    try {
      this.logger.debug("Posting to LinkedIn", { contentLength: this.postContent.length });

      const response = await this.api.createPost(this.postContent);

      if (response.status === 201) {
        this.logger.info("LinkedIn post created successfully");
        new Notice("Post published to LinkedIn successfully!");
        this.close();
      } else {
        throw new Error(`Failed to post: ${response.status}`);
      }
    } catch (error) {
      this.logger.error("Failed to post to LinkedIn", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      new Notice(`Failed to post to LinkedIn: ${errorMessage}`);

      // Re-enable post button
      if (postButton) {
        postButton.disabled = false;
        postButton.textContent = "Post to LinkedIn";
      }
    }
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
