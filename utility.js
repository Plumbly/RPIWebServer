

module.exports = {
    log: function (msg, type) {
        
        if (msg === undefined) throw new Exception("paramater 'msg' cannot be null.");
        
        if (type === undefined) throw new Exception("paramater 'type' cannot be null.")

        var logMsg = "[" + new Date().toISOString().toUpperCase() + "][" + type.toUpperCase() + "] " + msg;
        
        console.log(logMsg);
    }
}