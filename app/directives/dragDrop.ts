 angular.module("NotesApp.Directives")
    .directive('notesDragDrop', function($parse) {
       return function(scope, element, attrs) {
           var fn = $parse(attrs.notesDragDrop);
           element.bind('drop', function(event) {
               scope.$apply(function() {
                  event.preventDefault();
                  fn(scope, {$event:event});
               });
           })
       }
    });