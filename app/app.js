define(["require", "exports", "nw.gui"], function (require, exports, gui) {
    var mainWindow = gui.Window.get();
    var menu = new gui.Menu({ type: 'menubar' });
    var menu_file = new gui.Menu();
    var menu_help = new gui.Menu();
    menu.append(new gui.MenuItem({ label: "File", submenu: menu_file }));
    menu.append(new gui.MenuItem({ label: "Help", submenu: menu_help }));
    menu_file.append(new gui.MenuItem({ label: "Exit", click: function () {
            mainWindow.close();
        } }));
    menu_help.append(new gui.MenuItem({ label: "Reload Dev", click: function () {
            mainWindow.reloadDev();
        } }));
    menu_help.append(new gui.MenuItem({ label: "Show Dev Tools", click: function () {
            mainWindow.showDevTools();
        } }));
    menu_help.append(new gui.MenuItem({ type: "separator" }));
    menu_help.append(new gui.MenuItem({ label: "About" }));
    mainWindow.menu = menu;
    /**
     * Disable DragDrop in the window
     */
    window.ondragover = function (e) { e.preventDefault(); return false; };
    window.ondrop = function (e) { e.preventDefault(); return false; };
    var services = angular.module("NotesApp.Services", []);
    var controllers = angular.module("NotesApp.Controllers", []);
    var filters = angular.module("NotesApp.Filters", []);
    var directives = angular.module("NotesApp.Directives", []);
    var app = angular.module("NotesApp", [
        "ui.router",
        "ui.codemirror",
        "NotesApp.Services",
        "NotesApp.Controllers",
        "NotesApp.Filters",
        "NotesApp.Directives"
    ]);
    app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/documents//");
        $stateProvider
            .state("documents", {
            url: "/documents/:path/:filename",
            templateUrl: "views/ViewFolder.html",
            controller: "ViewFolderController",
            controllerAs: "controller"
        })
            .state("documents.list", {
            url: "",
            template: "<p>Test</p>"
        })
            .state("documents.view", {
            url: "/:filename",
            views: {
                "": {
                    templateUrl: "views/ViewDocument.html",
                    controller: "ViewDocumentController",
                    controllerAs: "controller"
                }
            }
        })
            .state("documents.view.edit", {
            url: "/edit",
            views: {
                "@documents": {
                    templateUrl: "views/EditDocument.html",
                    controller: "EditDocumentController",
                    controllerAs: "controller"
                }
            }
        });
    });
});
//# sourceMappingURL=app.js.map