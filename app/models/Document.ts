var nodePath = require("path");

module Models {
	export enum DocumentType {
		Html,
		Markdown
	}

	export interface IDocument {
		path       : string;
		content    : string;
		type       : DocumentType;
		parent     : IFolder;

		name       : string;
	}

	export class NodeDocument implements IDocument {
		path       : string;
		content    : string;
		parent     : IFolder;

		get name() : string {
			return nodePath.basename(this.path);
		}

		set name(v:string) {
			var dirPath = nodePath.dirname(this.path);
			this.path = nodePath.join(dirPath, v);
		}

		get type() : DocumentType {
			switch (nodePath.extname(this.path)) {
				case ".md":
					return DocumentType.Markdown
				default:
					return DocumentType.Html
			}
		}

		constructor(path:string, parent?:IFolder) {
			this.path = path;
			this.content = "# New Document";
			this.parent = parent;
		}
	}
}

