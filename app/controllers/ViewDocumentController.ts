var nodeFs = require("fs-extra");

declare var prettyPrint : any;

module Controllers {
	export class ViewDocumentController {

		document : Models.IDocument;

		constructor(private $timeout : angular.ITimeoutService,
			        private $state : angular.ui.IStateService,
		            private $stateParams : angular.ui.IStateParamsService,
					private documentService : Services.IDocumentService,
					private storageService : Services.IStorageService,
					private windowService : Services.IWindowService) {
			this.document = null;

			this.loadFile($stateParams["filename"]);
		}

		loadFile(filePath:string) {
			this.documentService.load(filePath).then((doc) => {
				this.document = doc;

				this.windowService.setTitle(this.document.name);
			});
		}

		edit() {
			this.$state.go(".edit", this.$stateParams);
		}

		click() {
			alert("Click");
		}
	}
}

angular.module("NotesApp.Controllers").controller("ViewDocumentController", [
	"$timeout",
	"$state",
	"$stateParams",
	"DocumentService",
	"StorageService",
	"WindowService",
	Controllers.ViewDocumentController
]);

