function(request){
    try {
        personium.validateRequestMethod(['POST'], request);
        
        var params = personium.parseBodyAsJSON(request);
        
        var headers = getHeaders(params);
        
        return personium.createResponse(200, headers);
    } catch(e) {
        return personium.createErrorResponse(e);
    }
}

var getHeaders = function(query) {
    var cellUrl = query.cellUrl;
    var url = [
        cellUrl,
        "__token"
    ].join("");
    var headers = {
        "Accept": "application/json",
    };
    var contentType = "text/plain";
    var body = [
        "grant_type=password",
        "username=" + query.username,
        "password=" + query.password,
        "p_cookie=" + true
    ].join('&');
    var httpCodeExpected = 200;
    var response = httpPOSTMethod(url, headers, contentType, body, httpCodeExpected);
    return JSON.parse(response.headers);
};
    
var httpPOSTMethod = function (url, headers, contentType, body, httpCodeExpected) {
    var httpClient = new _p.extension.HttpClient();
    var response = httpClient.post(url, headers, contentType, body);
    var httpCode = parseInt(response.status);
    if (httpCode === 500) {
        // retry
        var ignoreVerification = {"IgnoreHostnameVerification": true};
        httpClient = new _p.extension.HttpClient(ignoreVerification);
        response = httpClient.post(url, headers, contentType, body);
        httpCode = parseInt(response.status);
    }
    if (httpCode !== httpCodeExpected) {
        // Personium exception
        var err = [
            "io.personium.client.DaoException: ",
            httpCode,
            ",",
            response.body
        ].join("");
        throw new _p.PersoniumException(err);
    }
    return response;
};
var personium = require("personium").personium;
