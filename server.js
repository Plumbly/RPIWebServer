var http = require('http'),
    dispatcher = require('httpdispatcher'),
    utility = require('./utility.js'),
    url = require('url'),
    path = require('path'),
    fileSys = require('fs');

var Server;

dispatcher.setStatic('resources');
dispatcher.setStaticDirname('.');

dispatcher.onError(function (request, response) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end("Page or resource could not be found.")
});

dispatcher.dispatchError = function (request, response) {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end("Internal Server Error.")
}

dispatcher.registerRoutes = function (routes) {
    
    var registerString = "Registering routes:\n";



    for (var i = 0, length = routes.length; i < length; i++) {
        
        registerString += "\t" + routes[i].url + " [" + routes[i].acceptedVerbs.toString() + "]\n";

        dispatcher.onGet(routes[i].url, function (request, response) {
            
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            
            var uri = url.parse(request.url).pathname,
                fullyQualifiedPath = path.join(process.cwd(), uri);
                extension = path.extname(uri);
            
            fs.exists(filename, function (exists) {
                if (!exists) {
                    dispatcher.dispatchError();
                    return;
                }
            });

            switch (extension) {
                case ".html":
                    response.end("Serving Html file.");
                    break;
            }
        });

        utility.log(registerString, "INFO");
    }
}

function handleServerRequest(request, response){
    utility.log("URL Requested: " + request.url, "INFO");
    
    try {
        dispatcher.dispatch(request, response);
    } catch (ex) {
        utility.log(ex.message, "ERROR");
        dispatcher.dispatchError(request, response);
    }   
};

function initialiseServer(port) {
    Server = http.createServer(handleServerRequest);
    
    Server.listen(port, function () {
        utility.log("Server Initiated. Listening on port " + port + ".", "INFO");
    });
}

module.exports = {
    
    registerRoutes: dispatcher.registerRoutes,

    start: initialiseServer
}


initialiseServer(8080);

dispatcher.registerRoutes([
    {
        url: "/index.html",
        acceptedVerbs: ["GET"]
    }
])