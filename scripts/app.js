var gui = require("nw.gui");
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
var nodePath = require("path");
var fs = require("fs-extra");
var Models;
(function (Models) {
    var NodeFolder = (function () {
        function NodeFolder(path, parent) {
            this.path = path;
            this.folders = [];
            this.files = [];
            this.settings = new Models.FolderSettings();
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
        Object.defineProperty(NodeFolder.prototype, "name", {
            get: function () { return nodePath.basename(this.path); },
            set: function (v) {
                var dirPath = nodePath.dirname(this.path);
                this.path = nodePath.join(dirPath, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NodeFolder.prototype, "exists", {
            get: function () { return fs.existsSync(this.path); },
            enumerable: true,
            configurable: true
        });
        NodeFolder.prototype.newDocument = function (name) {
            var doc = new Models.NodeDocument(nodePath.join(this.path, name), this);
            this.files.push(doc);
            return doc;
        };
        return NodeFolder;
    })();
    Models.NodeFolder = NodeFolder;
})(Models || (Models = {}));
var Models;
(function (Models) {
    var FolderSettings = (function () {
        function FolderSettings(options) {
            options = options || {};
            this.tags = options.tags || [];
        }
        return FolderSettings;
    })();
    Models.FolderSettings = FolderSettings;
})(Models || (Models = {}));
var nodePath = require("path");
var Models;
(function (Models) {
    (function (DocumentType) {
        DocumentType[DocumentType["Html"] = 0] = "Html";
        DocumentType[DocumentType["Markdown"] = 1] = "Markdown";
    })(Models.DocumentType || (Models.DocumentType = {}));
    var DocumentType = Models.DocumentType;
    var NodeDocument = (function () {
        function NodeDocument(path, parent) {
            this.path = path;
            this.content = "# New Document";
            this.parent = parent;
        }
        Object.defineProperty(NodeDocument.prototype, "name", {
            get: function () {
                return nodePath.basename(this.path);
            },
            set: function (v) {
                var dirPath = nodePath.dirname(this.path);
                this.path = nodePath.join(dirPath, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NodeDocument.prototype, "type", {
            get: function () {
                switch (nodePath.extname(this.path)) {
                    case ".md":
                        return DocumentType.Markdown;
                    default:
                        return DocumentType.Html;
                }
            },
            enumerable: true,
            configurable: true
        });
        return NodeDocument;
    })();
    Models.NodeDocument = NodeDocument;
})(Models || (Models = {}));
var Models;
(function (Models) {
    var AppSettings = (function () {
        function AppSettings(settings) {
            settings = settings || {};
            this.window = settings.window || { width: 800, height: 600 };
            this.currentFolder = settings.currentFolder || "";
            this.resourcesFolderName = settings.resourcesFolderName || "NotedownResources";
            this.settingsFilename = settings.settingsFilename || ".notedownSettings";
        }
        return AppSettings;
    })();
    Models.AppSettings = AppSettings;
})(Models || (Models = {}));
var nodeFs = require("fs-extra");
var nodeJsPath = require("path");
var Services;
(function (Services) {
    var FolderService = (function () {
        function FolderService($q, storageService) {
            this.$q = $q;
            this.storageService = storageService;
        }
        FolderService.prototype.load = function (path) {
            var _this = this;
            return new this.$q(function (resolve, reject) {
                nodeFs.readdir(path, function (err, files) {
                    var folder = new Models.NodeFolder(path);
                    if (!folder.exists) {
                        return;
                    }
                    files.forEach(function (item) {
                        var itemPath = nodeJsPath.join(path, item);
                        try {
                            var stats = nodeFs.statSync(itemPath);
                            if (stats.mode === 33060)
                                return;
                            if (stats.isDirectory() && item[0] !== ".") {
                                folder.folders.push(new Models.NodeFolder(itemPath, folder));
                            }
                            else if (stats.isFile()) {
                                var extension = nodeJsPath.extname(item);
                                if ((extension === ".md") ||
                                    (extension === ".html") ||
                                    (extension === ".htm") ||
                                    (item === _this.storageService.settings.settingsFilename) ||
                                    (folder.name === _this.storageService.settings.resourcesFolderName)) {
                                    folder.files.push(new Models.NodeDocument(nodeJsPath.join(path, item), folder));
                                }
                            }
                        }
                        catch (ex) {
                        }
                    });
                    var settingsFilename = nodeJsPath.join(path, ".notedownSettings");
                    if (nodeFs.existsSync(settingsFilename)) {
                        nodeFs.readFile(settingsFilename, { encoding: "utf8" }, function (err, data) {
                            if (!err) {
                                try {
                                    folder.settings = new Models.FolderSettings(JSON.parse(data));
                                }
                                catch (ex) {
                                    folder.settings = new Models.FolderSettings();
                                }
                            }
                        });
                    }
                    resolve(folder);
                });
            });
        };
        FolderService.prototype.addFolder = function (folder, name) {
            return new this.$q(function (resolve, reject) {
                var folderPath = nodeJsPath.join(folder.path, name);
                nodeFs.mkdir(folderPath, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(new Models.NodeFolder(folderPath, folder));
                    }
                });
            });
        };
        FolderService.prototype.rename = function (folder, name) {
            return new this.$q(function (resolve, reject) {
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
                nodeFs.rename(folder.path, newPath, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(new Models.NodeFolder(newPath));
                    }
                });
            });
        };
        FolderService.prototype.newFolder = function (path) {
            return new Models.NodeFolder(path);
        };
        return FolderService;
    })();
    Services.FolderService = FolderService;
})(Services || (Services = {}));
angular.module("NotesApp.Services").service("FolderService", [
    "$q",
    "StorageService",
    Services.FolderService
]);
var fs = require("fs-extra");
var nodePath = require("path");
var Services;
(function (Services) {
    var NodeDocumentService = (function () {
        function NodeDocumentService($q) {
            this.$q = $q;
        }
        /**
         * Load a file from the filesystem
         *
         * @param path Location of the file
         */
        NodeDocumentService.prototype.load = function (path) {
            return new this.$q(function (resolve, reject) {
                fs.readFile(path, { encoding: "utf8" }, function (err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var doc = new Models.NodeDocument(path);
                    doc.content = data;
                    resolve(doc);
                });
            });
        };
        /**
         * Saves a document to the file system
         *
         * @param document Document to save
         */
        NodeDocumentService.prototype.save = function (document) {
            return new this.$q(function (resolve, reject) {
                fs.writeFile(document.path, document.content, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(document);
                    }
                });
            });
        };
        NodeDocumentService.prototype.rename = function (document, oldPath) {
            return new this.$q(function (resolve, reject) {
                if (!fs.existsSync(oldPath)) {
                    reject("Document does not exist");
                    return;
                }
                if (fs.existsSync(document.path)) {
                    reject("New filename already exists");
                    return;
                }
                fs.rename(oldPath, document.path, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(document);
                    }
                });
            });
        };
        return NodeDocumentService;
    })();
    Services.NodeDocumentService = NodeDocumentService;
})(Services || (Services = {}));
angular.module("NotesApp.Services").service("DocumentService", [
    "$q",
    Services.NodeDocumentService
]);
var nodeFs = require("fs-extra");
var gui = require('nw.gui');
var Services;
(function (Services) {
    var WindowService = (function () {
        function WindowService() {
        }
        WindowService.prototype.setTitle = function (title) {
            var win = gui.Window.get();
            win.title = "Notedown - " + title;
        };
        return WindowService;
    })();
    Services.WindowService = WindowService;
})(Services || (Services = {}));
angular.module("NotesApp.Services").service("WindowService", [
    "$q",
    Services.WindowService
]);
var nodeFs = require("fs-extra");
var gui = require('nw.gui');
var nodePath = require("path");
var Services;
(function (Services) {
    var StorageService = (function () {
        function StorageService() {
            this.loadSettings();
        }
        StorageService.prototype.loadSettings = function () {
            var settingsJson = localStorage["settings"];
            var settings;
            if (settingsJson !== undefined) {
                settings = JSON.parse(settingsJson);
            }
            this.settings = new Models.AppSettings(settings);
            if (this.settings.currentFolder.length === 0) {
                this.settings.currentFolder = '/';
            }
        };
        StorageService.prototype.saveSettings = function () {
            localStorage["settings"] = JSON.stringify(this.settings);
        };
        return StorageService;
    })();
    Services.StorageService = StorageService;
})(Services || (Services = {}));
angular.module("NotesApp.Services").service("StorageService", [
    "$q",
    Services.StorageService
]);
var gui = require("nw.gui");
var nodeFs = require("fs-extra");
var nodeJsPath = require("path");
var Controllers;
(function (Controllers) {
    var ViewFolderController = (function () {
        function ViewFolderController($state, $stateParams, storageService, folderService, documentService, windowService) {
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.storageService = storageService;
            this.folderService = folderService;
            this.documentService = documentService;
            this.windowService = windowService;
            var path = decodeURIComponent($stateParams["path"]);
            this.selectedFilename = $stateParams["filename"];
            if (!path || path.length === 0) {
                path = this.storageService.settings.currentFolder;
            }
            windowService.setTitle(path);
            this.loadFolder(path);
        }
        ViewFolderController.prototype.loadFolder = function (path) {
            var _this = this;
            path = path || this.folder.path;
            while (!nodeFs.existsSync(path)) {
                path = nodeJsPath.join(path, "..");
            }
            this.folderService.load(path).then(function (folder) {
                _this.folder = folder;
                if (ViewFolderController.folderWatcher !== undefined) {
                    ViewFolderController.folderWatcher.close();
                }
                ViewFolderController.folderWatcher = nodeFs.watch(path, function (event, filename) {
                    _this.loadFolder();
                });
                _this.storageService.settings.currentFolder = path;
                _this.storageService.saveSettings();
            });
        };
        ViewFolderController.prototype.addFolder = function () {
            var _this = this;
            var name = prompt("Enter a name for the new folder", "New Folder");
            if (name.length === 0) {
                return;
            }
            this.folderService.addFolder(this.folder, name).then(function (folder) {
                _this.folder.folders.push(folder);
            }, function (err) {
                alert(err);
            });
        };
        ViewFolderController.prototype.navigate = function (path) {
            this._navigate("documents", { path: path, filename: "" });
        };
        ViewFolderController.prototype.openFile = function (file) {
            this._navigate("documents.view", { path: this.folder.path, filename: file.path });
        };
        ViewFolderController.prototype.newFile = function () {
            this._navigate("documents.view.edit", { path: this.folder.path, filename: '' });
        };
        ViewFolderController.prototype.explore = function () {
            gui.Shell.openExternal(this.folder.path);
        };
        ViewFolderController.prototype.showGenericContextMenu = function (ev) {
            var _this = this;
            var menu1 = new gui.Menu();
            menu1.append(new gui.MenuItem({ label: 'New Document', click: function () {
                    _this.newFile();
                } }));
            menu1.append(new gui.MenuItem({ label: 'New Folder', click: function () {
                    _this.addFolder();
                } }));
            menu1.append(new gui.MenuItem({ type: "separator" }));
            menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: function () {
                    gui.Shell.openExternal(_this.folder.path);
                } }));
            menu1.popup(ev.x, ev.y);
        };
        ViewFolderController.prototype.showFolderContextMenu = function (folder, ev) {
            var _this = this;
            var menu1 = new gui.Menu();
            menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: function () {
                    gui.Shell.openExternal(folder.path);
                } }));
            menu1.append(new gui.MenuItem({ type: "separator" }));
            menu1.append(new gui.MenuItem({ label: 'Rename', click: function () {
                    _this.renameFolder(folder);
                } }));
            menu1.append(new gui.MenuItem({ label: 'Delete', click: function () {
                } }));
            menu1.popup(ev.x, ev.y);
            ev.stopImmediatePropagation();
        };
        ViewFolderController.prototype.showFileContextMenu = function (document, ev) {
            var _this = this;
            var menu1 = new gui.Menu();
            menu1.append(new gui.MenuItem({ label: 'Reveal in ' + this.getExplorerName(), click: function () {
                    gui.Shell.showItemInFolder(document.path);
                } }));
            menu1.append(new gui.MenuItem({ label: 'Copy path to clipboard', click: function () {
                    var clipboard = gui.Clipboard.get();
                    clipboard.set(document.path, 'text');
                } }));
            menu1.append(new gui.MenuItem({ type: "separator" }));
            menu1.append(new gui.MenuItem({ label: 'Rename', click: function () {
                    _this.renameFile(document);
                } }));
            menu1.append(new gui.MenuItem({ label: 'Delete', click: function () {
                } }));
            menu1.popup(ev.x, ev.y);
            ev.stopImmediatePropagation();
        };
        ViewFolderController.prototype.renameFile = function (document) {
            var _this = this;
            var oldName = document.name;
            var oldPath = document.path;
            var name = prompt("Enter a new name for the new file", oldName);
            if (name.length === 0) {
                return;
            }
            document.name = name;
            this.documentService.rename(document, oldPath).then(function () {
                _this.loadFolder();
            }, function (err) {
                document.path = oldPath;
                alert(err);
            });
        };
        ViewFolderController.prototype.renameFolder = function (folder) {
            var _this = this;
            var name = prompt("Enter a new name for the new file", folder.name);
            if (name.length === 0) {
                return;
            }
            this.folderService.rename(folder, name).then(function () {
                _this.loadFolder();
            }, function (err) {
                alert(err);
            });
        };
        ViewFolderController.prototype.getExplorerName = function () {
            return process.platform === "darwin" ? "Finder" : "Explorer";
        };
        ViewFolderController.prototype._navigate = function (state, stateParams) {
            this.$state.go(state, stateParams);
        };
        return ViewFolderController;
    })();
    Controllers.ViewFolderController = ViewFolderController;
})(Controllers || (Controllers = {}));
angular.module("NotesApp.Controllers").controller("ViewFolderController", [
    "$state",
    "$stateParams",
    "StorageService",
    "FolderService",
    "DocumentService",
    "WindowService",
    Controllers.ViewFolderController
]);
var nodeFs = require("fs-extra");
var Controllers;
(function (Controllers) {
    var ViewDocumentController = (function () {
        function ViewDocumentController($timeout, $state, $stateParams, documentService, storageService, windowService) {
            this.$timeout = $timeout;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.documentService = documentService;
            this.storageService = storageService;
            this.windowService = windowService;
            this.document = null;
            this.loadFile($stateParams["filename"]);
        }
        ViewDocumentController.prototype.loadFile = function (filePath) {
            var _this = this;
            this.documentService.load(filePath).then(function (doc) {
                _this.document = doc;
                _this.windowService.setTitle(_this.document.name);
            });
        };
        ViewDocumentController.prototype.edit = function () {
            this.$state.go(".edit", this.$stateParams);
        };
        ViewDocumentController.prototype.click = function () {
            alert("Click");
        };
        return ViewDocumentController;
    })();
    Controllers.ViewDocumentController = ViewDocumentController;
})(Controllers || (Controllers = {}));
angular.module("NotesApp.Controllers").controller("ViewDocumentController", [
    "$timeout",
    "$state",
    "$stateParams",
    "DocumentService",
    "StorageService",
    "WindowService",
    Controllers.ViewDocumentController
]);
var Controllers;
(function (Controllers) {
    var EditDocumentController = (function () {
        function EditDocumentController($state, $stateParams, folderService, documentService) {
            var _this = this;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.folderService = folderService;
            this.documentService = documentService;
            this.editorOptions = {
                mode: 'markdown',
                lineNumbers: false,
                viewportMargin: Infinity,
                lineWrapping: true,
                dragDrop: false,
                drop: function (codeMirror, event) {
                }
            };
            this.document = null;
            this.folder = folderService.newFolder(decodeURIComponent($stateParams["path"]));
            this.filePath = $stateParams["filename"] || "";
            if (this.filePath.length === 0) {
                this.document = this.folder.newDocument("New Document.md");
            }
            else {
                documentService.load(this.filePath).then(function (doc) {
                    _this.document = doc;
                });
            }
        }
        EditDocumentController.prototype.save = function () {
            var _this = this;
            var save = function () {
                _this.documentService.save(_this.document).then(function (doc) {
                    _this.document = doc;
                    _this.filePath = doc.path;
                    _this.goToView();
                }, function (err) {
                    alert(err);
                });
            };
            if (this.document.path != this.filePath && this.filePath.length > 0) {
                this.documentService.rename(this.document, this.filePath).then(function () {
                    save();
                }, function (err) {
                    alert(err);
                });
                return;
            }
            save();
        };
        EditDocumentController.prototype.cancel = function () {
            this.goToView();
        };
        EditDocumentController.prototype.goToView = function () {
            if (this.filePath && this.filePath.length > 0) {
                this.$state.go("^", { path: this.folder.path, filename: this.filePath });
            }
            else {
                this.$state.go("documents", { path: this.folder.path });
            }
        };
        return EditDocumentController;
    })();
    Controllers.EditDocumentController = EditDocumentController;
})(Controllers || (Controllers = {}));
angular.module("NotesApp.Controllers").controller("EditDocumentController", [
    "$state",
    "$stateParams",
    "FolderService",
    "DocumentService",
    Controllers.EditDocumentController
]);
angular.module("NotesApp.Filters")
    .filter("rawHtml", ["$sce", function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }]);
angular.module("NotesApp.Filters")
    .filter("documentPreview", ["$sce", function ($sce) {
        return function (doc) {
            if (!doc)
                return;
            var result;
            if (doc.type === Models.DocumentType.Markdown) {
                var converter = new Showdown.converter({ extensions: ['table', 'task', 'prettify'] });
                result = converter.makeHtml(doc.content);
            }
            else {
                result = doc.content;
            }
            return $sce.trustAsHtml(result);
        };
    }]);
angular.module("NotesApp.Directives")
    .directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
});
angular.module("NotesApp.Directives")
    .directive('notesDragDrop', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.notesDragDrop);
        element.bind('drop', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
});
//# sourceMappingURL=app.js.map