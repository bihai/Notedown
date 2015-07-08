module Models {
	
	export interface IWindowSettings {
		width: number;
		height: number;
	}
	
	export interface IAppSettings {
		window? : IWindowSettings;
		currentFolder? : string;
		resourcesFolderName? : string;
		settingsFilename? : string;
	}
	
	export class AppSettings {
		window : IWindowSettings;
		currentFolder : string;
		resourcesFolderName : string;
		settingsFilename : string;
		
		constructor(settings : IAppSettings) {
			settings = settings || <any>{};
			
			this.window = settings.window || { width: 800, height: 600 };
			this.currentFolder = settings.currentFolder || "";
			this.resourcesFolderName = settings.resourcesFolderName || "NotedownResources";
			this.settingsFilename = settings.settingsFilename || ".notedownSettings";
		}
	}
	
}