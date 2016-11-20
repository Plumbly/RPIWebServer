var http = require('http'),
    dispatcher = require('httpdispatcher'),
    utility = require('./utility.js'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var Server;

dispatcher.setStatic('resources');
dispatcher.setStaticDirname(process.cwd());

dispatcher.onError(handleNotFound);

dispatcher.dispatchError = handleError;

dispatcher.registerRoutes = function (routes) {
    var self = this;

    var registerString = "Registering routes:\n";

    for (var i = 0, length = routes.length; i < length; i++) {
        
        registerString += "\t" + routes[i].url + " [" + routes[i].acceptedVerbs.toString() + "]\n";

        dispatcher.onGet(routes[i].url, function (request, response) {
            
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            
            var uri = url.parse(request.url).pathname,
                fullyQualifiedPath = path.join(process.cwd(), uri);
                extension = path.extname(uri);
            
            fs.exists(fullyQualifiedPath, function (exists) {
                if (!exists) {
                    handleNotFound(request, response);
                    return;
                }

                fs.readFile(fullyQualifiedPath, (fullyQualifiedPath.endsWith("html") || fullyQualifiedPath.endsWith("js")) ? "utf8" : "binary", function (err, file) {
                    if (err) {
                        handleError(request, response)
                    };
                    
                    if (fullyQualifiedPath.endsWith("html")) {
                        
                        response.writeHead(200, { "Content-Type": "text/html" });
                        response.write(file);
                    } else if (fullyQualifiedPath.endsWith("js")) {
                        response.writeHead(200, { "Content-Type": "text/javascript" });
                        response.write(file);
                    }
                    else {
                        
                        response.writeHead(200, { "Content-Type": "image/png" });
                        response.write(file, "binary");
                    }
                    response.end();
                });
            });           
        });        
    }

    utility.log(registerString, "INFO");
}

function handleNotFound(request, response){
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end("Page or resource could not be found.")
}

function handleError(request, response){
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end("Internal Server Error.")
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
        url: "/favicon.ico",
        acceptedVerbs: ["GET"]
    },

    {
        url: "/index.html",
        acceptedVerbs: ["GET"]
    },

    {
        url: "/testScriptFile.js",
        acceptedVerbs: ["GET"]
    }
])