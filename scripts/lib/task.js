(function(){

    var task = function(converter) {
        return [
            { type: 'output', filter: function(source){
                return source.replace(/\[{1}[-+]?\]{1}/gi, function(match) {
                    if (match) {
                        if (match[1] === "+") {
                            return '<input type="checkbox" checked></input>';                                
                        }
                        
                        return '<input type="checkbox"></input>';
                    }
                });
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window["Showdown"] && window["Showdown"].extensions) { window["Showdown"].extensions.task = task; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = task;

}());
