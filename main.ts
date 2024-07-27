import { Notice, Plugin } from "obsidian";

interface MySettings {
	folder: string;
	frontMatterDefaults: Record<string, any>;
}

const DEFAULT_SETTINGS: MySettings = {
	folder: "folder",
	frontMatterDefaults: { "dg-publish": true },
};

export default class MyPlugin extends Plugin {
	settings: MySettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.vault.on("rename", (abstractFile) => {
				const file = this.app.vault.getFileByPath(abstractFile.path);

				if (file === null) {
					new Notice(
						`Could not find file with path ${abstractFile.path}`
					);
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
