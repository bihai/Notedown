angular.module("NotesApp.Filters")
	.filter("rawHtml", ["$sce", ($sce:ng.ISCEService) => {
		return (val) => {
			return $sce.trustAsHtml(val);
		}
	}]);