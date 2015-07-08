var fs = require("fs-extra");
var nodePath = require("path");

module Services {
	export interface IDocumentService {
		load(path : string) : ng.IPromise<Models.IDocument>;
		save(document : Models.IDocument) : ng.IPromise<Models.IDocument>;
		rename(document : Models.IDocument, oldPath : string) : ng.IPromise<Models.IDocument>;
	}

	export class NodeDocumentService implements IDocumentService {
		constructor(private $q:ng.IQService) {
		}

		/**
		 * Load a file from the filesystem
		 *
		 * @param path Location of the file
		 */
		load(path : string) : ng.IPromise<Models.IDocument> {
			return new this.$q<Models.IDocument>((resolve, reject) => {

				fs.readFile(path, { encoding: "utf8" }, (err, data) => {
					if (err) {
						reject(err);
						return;
					}

					var doc = new Models.NodeDocument(path);
					doc.content = data;

					resolve(doc);
				});
			});
		}

		/**
		 * Saves a document to the file system
		 *
		 * @param document Document to save
		 */
		save(document : Models.IDocument) : ng.IPromise<Models.IDocument> {
			return new this.$q<Models.IDocument>((resolve, reject) => {

				fs.writeFile(document.path, document.content, (err) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(document);
					}
				});
			});
		}

		rename(document : Models.IDocument, oldPath:string) : ng.IPromise<Models.IDocument> {
			return new this.$q<Models.IDocument>((resolve, reject) => {

				if (!fs.existsSync(oldPath)) {
					reject("Document does not exist");
					return;
				}

				if (fs.existsSync(document.path)) {
					reject("New filename already exists");
					return;
				}

				fs.rename(oldPath, document.path, (err) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(document);
					}
				});
			});
		}
	}
}

angular.module("NotesApp.Services").service(
	"DocumentService", [
		"$q",
		Services.NodeDocumentService
	]
);