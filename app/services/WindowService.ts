var nodeFs = require("fs-extra");
var gui = require('nw.gui');

module Services {
	export interface IWindowService {
		setTitle(title:String);
	}

	export class WindowService implements IWindowService {
		setTitle(title:String) {
			var win = gui.Window.get();
			win.title = "Notedown - " + title;
		}
	}
}

angular.module("NotesApp.Services").service(
	"WindowService", [
		"$q",
		Services.WindowService
	]
);