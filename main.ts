import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface FolderDgPublishSettings {
	folder: string;
	frontMatterDefaults: Record<string, any>;
}

const DEFAULT_SETTINGS: FolderDgPublishSettings = {
	folder: "folder",
	frontMatterDefaults: { "dg-publish": true },
};

export default class FolderDgPublish extends Plugin {
	settings: FolderDgPublishSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(
			new FolderDgPublishSettingsSettingTab(this.app, this)
		);

		this.registerEvent(
			this.app.vault.on("rename", (abstractFile) => {
				const file = this.app.vault.getFileByPath(abstractFile.path);

				if (file === null) {
					return;
				}

				this.app.fileManager.processFrontMatter(file, (frontmatter) => {
					console.log(frontmatter);
					for (const key in this.settings.frontMatterDefaults) {
						if (frontmatter[key] === undefined) {
							frontmatter[key] =
								this.settings.frontMatterDefaults[key];
						}
					}
				});
			})
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	onunload() {}
}

class FolderDgPublishSettingsSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: FolderDgPublish) {
		super(app, plugin);
	}

	display() {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName("The folder used for the automation")
			.setDesc(
				"All files moved to this folder will be processed. Files currently in this folder won't be processed."
			)
			.addText((text) => {
				text.setPlaceholder("Folder")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveData(this.plugin.settings);
					});
			});
	}
}
