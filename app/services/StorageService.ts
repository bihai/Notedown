var nodeFs = require("fs-extra");
var gui = require('nw.gui');
var nodePath = require("path");

module Services {
	export interface IStorageService {
		settings : Models.AppSettings;
		loadSettings();
		saveSettings();
	}

	export class StorageService implements IStorageService {

		settings : Models.AppSettings;

		constructor() {
			this.loadSettings();
		}

		loadSettings() {
			var settingsJson = localStorage["settings"];
			var settings;

			if (settingsJson !== undefined) {
				settings = JSON.parse(settingsJson);
			}

			this.settings = new Models.AppSettings(settings);
			if (this.settings.currentFolder.length === 0) {
				this.settings.currentFolder = '/';
			}
		}

		saveSettings() {
			localStorage["settings"] = JSON.stringify(this.settings);
		}
	}
}

angular.module("NotesApp.Services").service(
	"StorageService", [
		"$q",
		Services.StorageService
	]
);