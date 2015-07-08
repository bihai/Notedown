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
//# sourceMappingURL=Document.js.map