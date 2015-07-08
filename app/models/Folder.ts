var nodePath = require("path");
var fs = require("fs-extra");

module Models {
	export interface IFolder {
		name    : string;
		path    : string;
		folders : IFolder[];
		files   : IDocument[];
		parent  : IFolder;
		settings : FolderSettings;
		exists  : boolean;

		newDocument(name:string) : IDocument;
	}

	export class NodeFolder implements IFolder {
		path    : string;
		folders : IFolder[];
		files   : IDocument[];
		parent  : IFolder;
		settings : FolderSettings;

		get name() : string { return nodePath.basename(this.path); }
		set name(v:string) {
			var dirPath = nodePath.dirname(this.path);
			this.path = nodePath.join(dirPath, v);
		}

		get exists() : boolean { return fs.existsSync(this.path); }

		constructor(path:string, parent? : IFolder) {
			this.path = path;
			this.folders = [];
			this.files = [];
			this.settings = new FolderSettings();

			if (parent) {
				this.parent = parent;
			}
			else {
				var parentPath = nodePath.join(this.path, "..");
				if (parentPath !== this.path) {
					this.parent = new NodeFolder(parentPath);
				}
			}
		}

		newDocument(name:string) : IDocument {
			var doc = new NodeDocument(nodePath.join(this.path, name), this);
			this.files.push(doc);

			return doc;
		}
	}
}