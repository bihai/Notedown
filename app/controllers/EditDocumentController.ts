module Controllers {
	export class EditDocumentController {

		folder   : Models.IFolder;
		filePath : string;
		document : Models.IDocument;

		editorOptions : any = {
			mode: 'markdown',
			lineNumbers: false,
			viewportMargin: Infinity,
			lineWrapping: true,
			dragDrop: false,
			drop: (codeMirror, event) => {

			}
		}

		constructor(
			private $state          : angular.ui.IStateService,
		    private $stateParams    : angular.ui.IStateParamsService,
			private folderService   : Services.IFolderService,
			private documentService : Services.IDocumentService
		) {
			this.document = null;
			this.folder = folderService.newFolder(decodeURIComponent($stateParams["path"]));
			this.filePath = $stateParams["filename"] || "";

			if (this.filePath.length === 0) {
				this.document = this.folder.newDocument("New Document.md");
			}
			else {
				documentService.load(this.filePath).then((doc) => {
					this.document = doc;
				});
			}
		}

		save() {
			var save = () => {
				this.documentService.save(this.document).then((doc) => {
					this.document = doc;
					this.filePath = doc.path;

					this.goToView();
				},
				(err) => {
					alert(err);
				});
			}

			if (this.document.path != this.filePath  && this.filePath.length > 0) {
				this.documentService.rename(this.document, this.filePath).then(() => {
					save();
				},
				(err) => {
					alert(err);
				});

				return;
			}

			save();
		}

		cancel() {
			this.goToView();
		}

		private goToView() {
			if (this.filePath && this.filePath.length > 0) {
				this.$state.go("^", { path: this.folder.path, filename: this.filePath });
			}
			else {
				this.$state.go("documents", { path: this.folder.path });
			}
		}
	}
}

angular.module("NotesApp.Controllers").controller("EditDocumentController", [
	"$state",
	"$stateParams",
	"FolderService",
	"DocumentService",
	Controllers.EditDocumentController
]);

