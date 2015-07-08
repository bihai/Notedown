var gui = require("nw.gui");
var nodeFs = require("fs-extra");
var nodeJsPath = require("path");

module Controllers {
	export class ViewFolderController {

		static folderWatcher : any;

		folder : Models.IFolder;
		selectedFilename : string;

		constructor(private $state : angular.ui.IStateService,
					private $stateParams : angular.ui.IStateParamsService,
					private storageService : Services.IStorageService,
		            private folderService : Services.IFolderService,
					private documentService : Services.IDocumentService,
					private windowService : Services.IWindowService) {

			var path = decodeURIComponent($stateParams["path"]);
			this.selectedFilename = $stateParams["filename"];

			if (!path || path.length === 0) {
				path = this.storageService.settings.currentFolder;
			}

			windowService.setTitle(path);

			this.loadFolder(path);
		}

		loadFolder(path?:string) {
			path = path || this.folder.path;

			while (!nodeFs.existsSync(path)) {
				path = nodeJsPath.join(path, "..")
			}

			this.folderService.load(path).then((folder) => {
				this.folder = folder;

				if (ViewFolderController.folderWatcher !== undefined) {
					ViewFolderController.folderWatcher.close();
				}

				ViewFolderController.folderWatcher = nodeFs.watch(path, (event, filename) => {
					this.loadFolder();
				});

				this.storageService.settings.currentFolder = path;
				this.storageService.saveSettings();
			});
		}

		addFolder() {
			var name = prompt("Enter a name for the new folder", "New Folder");
			if (name.length === 0) {
				return;
			}

			this.folderService.addFolder(this.folder, name).then((folder) => {
				this.folder.folders.push(folder);
			},
			(err) => {
				alert(err);
			});
		}

		navigate(path:string) {
			this._navigate("documents", { path: path, filename: "" });
		}

		openFile(file:Models.IDocument) {
			this._navigate("documents.view", { path: this.folder.path, filename: file.path });
		}

		newFile() {
			this._navigate("documents.view.edit", { path: this.folder.path, filename: '' });
		}

		explore() {
			gui.Shell.openExternal(this.folder.path);
		}

		showGenericContextMenu(ev) {
			var menu1 = new gui.Menu();

			menu1.append(new gui.MenuItem({ label: 'New Document', click: () => {
				this.newFile();
			}}));

			menu1.append(new gui.MenuItem({ label: 'New Folder', click: () => {
				this.addFolder();
			}}));

			menu1.append(new gui.MenuItem({ type: "separator" }));

			menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: () => {
				gui.Shell.openExternal(this.folder.path);
			}}));

			menu1.popup(ev.x, ev.y);
		}

		showFolderContextMenu(folder:Models.IFolder, ev) {
			var menu1 = new gui.Menu();
			menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: () => {
				gui.Shell.openExternal(folder.path);
			}}));

			menu1.append(new gui.MenuItem({ type: "separator" }));

			menu1.append(new gui.MenuItem({ label: 'Rename', click: () => {
				this.renameFolder(folder);
			}}));
			menu1.append(new gui.MenuItem({ label: 'Delete', click: () => {

			}}));

			menu1.popup(ev.x, ev.y);

			ev.stopImmediatePropagation();
		}

		showFileContextMenu(document:Models.IDocument, ev) {
			var menu1 = new gui.Menu();
			menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: () => {
				gui.Shell.showItemInFolder(document.path);
			}}));
			menu1.append(new gui.MenuItem({ label: 'Copy path to clipboard', click: () => {
				var clipboard = gui.Clipboard.get();
				clipboard.set(document.path, 'text');
			}}));
			menu1.append(new gui.MenuItem({ type: "separator" }));
			menu1.append(new gui.MenuItem({ label: 'Rename', click: () => {
				this.renameFile(document);
			}}));
			menu1.append(new gui.MenuItem({ label: 'Delete', click: () => {

			}}));

			menu1.popup(ev.x, ev.y);

			ev.stopImmediatePropagation();
		}

		renameFile(document:Models.IDocument) {
			var oldName = document.name;
			var oldPath = document.path;

			var name = prompt("Enter a new name for the new file", oldName);
			if (name.length === 0) {
				return;
			}

			document.name = name;

			this.documentService.rename(document, oldPath).then(() => {
				this.loadFolder();
			},
			(err) => {
				document.path = oldPath;

				alert(err);
			});
		}

		renameFolder(folder:Models.IFolder) {
			var name = prompt("Enter a new name for the new file", folder.name);
			if (name.length === 0) {
				return;
			}

			this.folderService.rename(folder, name).then(() => {
				this.loadFolder();
			},
			(err) => {
				alert(err);
			});
		}

		private getExplorerName() : string {
			return process.platform === "darwin" ? "Finder" : "Explorer";
		}

		private _navigate(state:string, stateParams:any) {
			this.$state.go(state, stateParams);
		}
	}
}

angular.module("NotesApp.Controllers").controller("ViewFolderController", [
	"$state",
	"$stateParams",
	"StorageService",
	"FolderService",
	"DocumentService",
	"WindowService",
	Controllers.ViewFolderController
]);

