var nodeFs = require("fs-extra");
var nodeJsPath = require("path");

module Services {
	export interface IFolderService {
		load(path:string) : ng.IPromise<Models.IFolder>;
		addFolder(folder:Models.IFolder, name:string) : ng.IPromise<Models.IFolder>;
		rename(folder:Models.IFolder, name:string) : ng.IPromise<Models.IFolder>;
		newFolder(path:string) : Models.IFolder;
	}

	export class FolderService implements IFolderService {
		constructor(private $q:ng.IQService,
					private storageService : Services.StorageService) {
		}

		load(path:string) : ng.IPromise<Models.IFolder> {

			return new this.$q<Models.IFolder>((resolve, reject) => {
				nodeFs.readdir(path, (err, files) => {
					var folder = new Models.NodeFolder(path);
					if (!folder.exists) {
						return;
					}

					files.forEach((item:string) => {

						var itemPath = nodeJsPath.join(path, item);

						try {
							var stats = nodeFs.statSync(itemPath);
							if (stats.mode === 33060) return;

							if (stats.isDirectory() && item[0] !== ".") {
								folder.folders.push(new Models.NodeFolder(itemPath, folder));
							}
							else if (stats.isFile()) {
								var extension = nodeJsPath.extname(item);

								if ((extension === ".md") ||
									(extension === ".html") ||
									(extension === ".htm") ||
									(item === this.storageService.settings.settingsFilename) ||
									(folder.name === this.storageService.settings.resourcesFolderName)) {

									folder.files.push(new Models.NodeDocument(nodeJsPath.join(path, item), folder));
								}
							}
						}
						catch(ex) {
						}

					});

					var settingsFilename = nodeJsPath.join(path, ".notedownSettings");
					if (nodeFs.existsSync(settingsFilename)) {
						nodeFs.readFile(settingsFilename, { encoding: "utf8" }, (err, data) => {
							if (!err) {
								try {
									folder.settings = new Models.FolderSettings(JSON.parse(data));
								}
								catch(ex) {
									folder.settings = new Models.FolderSettings();
								}
							}
						});
					}

					resolve(folder);
				});
			});

		}

		addFolder(folder:Models.IFolder, name:string) : ng.IPromise<Models.IFolder> {
			return new this.$q<Models.IFolder>((resolve, reject) => {
				var folderPath = nodeJsPath.join(folder.path, name);
				nodeFs.mkdir(folderPath, (err) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(new Models.NodeFolder(folderPath, folder));
					}
				});
			});
		}

		rename(folder:Models.IFolder, name:string) : ng.IPromise<Models.IFolder>{
			return new this.$q<Models.IFolder>((resolve, reject) => {
				if (!nodeFs.existsSync(folder.path)) {
					reject("Folder does not exist");
					return;
				}

				var parentPath = nodePath.dirname(folder.path);
				var newPath = nodePath.join(parentPath, name);

				if (nodeFs.existsSync(newPath)) {
					reject("Folder with name " + name + " already exists");
					return;
				}

				nodeFs.rename(folder.path, newPath, (err) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(new Models.NodeFolder(newPath));
					}
				});
			});
		}

		newFolder(path:string) : Models.IFolder {
			return new Models.NodeFolder(path);
		}
	}
}

angular.module("NotesApp.Services").service(
	"FolderService", [
		"$q",
		"StorageService",
		Services.FolderService
	]
);