// 渲染内容对象
function Context(request, response,doServer){
    this.request = request;
    this.response = response;
    this.server = doServer;
}

Context.prototype.none = function () {
    this.response.writeHead(204);
    this.response.end();
};
Context.prototype.renderJSON = function (jsonObj) {
    this.response.setHeader("Content-Type", "application/json");
    this.response.writeHead(200);
    this.response.end(JSON.stringify(jsonObj));
};
Context.prototype.redirect = function (url) {
    this.response.setHeader("Location", url);
    this.response.writeHead(301);
    this.response.end();
};

exports = module.exports = Context;