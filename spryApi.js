var tools = angular.module('spryApi', []);

tools.factory('Base64', function () {
  /* jshint ignore:start */

  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return {
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" +
          "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
          "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };

  /* jshint ignore:end */
});



tools.factory('spryFactory', function ($http) {
  var urlBase = 'https://api.gospry.com';
  var factory = {};
  factory.happenings = [];
  
   /**
   * TODO: call api and check status
   */
  factory.checkAuth = function () {
    return factory.getHappenings();
  };
  

  /**
   * Specific API functions
   */
  
  
  factory.logout = function(){
    //TODO: call logout url
    //removeCredentials();
  };
  
  factory.deleteHappening = function (happening) {
    return $http.delete(urlBase + '/happening/' + happening.id);
  };
  
  factory.addHappening = function (happening) {
    //return $http.post(urlBase + '/happening', happening);
    
    return $http({
      method: 'POST',
      url: urlBase + '/happening',
      data: happening
    });
  };
  
  factory.getHappenings = function () {
    console.log("DEBUG: spryFactory - get Happenings");

    return $http({
      method: 'GET',
      url: urlBase + '/happening'
    });
  };
    
  factory.compare = function compare(a, b) {
    if (a.createdAt < b.createdAt)
      return -1;
    if (a.createdAt > b.createdAt)
      return 1;
    return 0;
  }

  return factory;
});

/**
 * AUTHENTICATION
 */

tools.factory('authManager', function(Base64){
  var factory = {};
  
   factory.setCredentials = function(username, password){
    console.log("store credentials to localStorage");
    
    localStorage.setItem("username", username); 
    localStorage.setItem("password", password); 
  }
  
  factory.removeCredentials = function(){
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }
  
  factory.loadCredentials = function(){
    console.log("load credentials from localStorage");

    return {
      username : localStorage.getItem("username"),
      password : localStorage.getItem("password")
    }
  }
  
  factory.generateAuthHeader = function(){
    var credentials = factory.loadCredentials();
    
    return 'Basic ' + Base64.encode(
      credentials.username + ':' + credentials.password);
  }
  
  return factory;
});


tools.factory('SpryAuthInterceptor', function (authManager) 
{
  return {
    request: function (config) 
    { 
      config.headers = config.headers || {};
      config.headers.Authorization = authManager.generateAuthHeader();
      
      console.log("Auth interceptor called: ");
      console.log(config);
      return config;
    }
  };
});

tools.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('SpryAuthInterceptor');
}]);
