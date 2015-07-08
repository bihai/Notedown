define(["require", "exports", "fs-extra"], function (require, exports, fs) {
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
});
//# sourceMappingURL=DocumentService.js.map