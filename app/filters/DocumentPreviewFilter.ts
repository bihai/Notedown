angular.module("NotesApp.Filters")
	.filter("documentPreview", ["$sce", ($sce:ng.ISCEService) => {
		return (doc : Models.IDocument) => {

			if (!doc) return;

			var result;

			if (doc.type === Models.DocumentType.Markdown) {
				var converter = new Showdown.converter({extensions: ['table', 'task', 'prettify']});
				result = converter.makeHtml(doc.content);
			}
			else {
				result = doc.content;
			}

			return $sce.trustAsHtml(result);
		}
	}]);