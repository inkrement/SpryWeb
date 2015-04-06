var app = angular.module('shop', ['ngRoute', 'spryApi']);

app.config(function ($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'pages/login.html',
    controller: 'LoginController as login'
  }).
  when('/dashboard', {
    templateUrl: 'pages/home.html',
    controller: 'HappeningController as spry'
  }).
  when('/settings', {
    templateUrl: 'pages/settings.html',
    controller: 'SettingsController'
  }).
  otherwise({
    redirectTo: '/'
  });
});

/*
app.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});
  */


app.controller('HappeningController',
  function (spryFactory) {
    this.happenings = [];
    this.selected = null;

    //load happenings
    var controller = this;
  
    spryFactory.initConnection();

    this.updateList = function() {
      spryFactory.getHappenings()
        .success(function (data, status) {
          controller.happenings = data;
          controller.happenings.sort(spryFactory.compare);
        });
    }
    this.updateList();

    this.clicked = function (element) {
      this.selected = element;
      //console.log(element);
    };

    this.isSelected = function (h) {
      return h === this.selected;
    };

    this.viewSelected = function () {
      return this.selected !== null;
    };
  
    this.addHappening = function () {
      console.log("DEBUG: HappeningController - addHappening");
      
      var happening = {
        "description": this.description,
        "creatorID": spryFactory.id,
        "isPublic": this.ispublic
      };
      
      /* add position if geolocation is available */
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position){
            console.log("there is a location!");
            console.log(position);
            happening["location"] = position.coords.latitude + ' ' + position.coords.longitude;
          });
        }
      
      spryFactory.addHappening(happening).success(function (data, status) {
        console.log(controller);
        controller.updateList();
      });
    }

    this.removeHappening = function () {
      spryFactory.deleteHappening(this.selected);
    }

    this.isAdmin = function () {
      if (controller.selected === null) return false;
      return controller.selected.creatorID === spryFactory.id;
    };


  });


app.controller('TabController', function () {
  this.tab = 0;

  this.setTab = function (tab) {
    this.tab = tab;
  }

  this.isTab = function (tab) {
    return this.tab === tab;
  }
});

app.controller('SettingsController', function () {

});

app.controller('LoginController', function ($location, spryFactory) {
  var loginController = this;
  this.error;

  this.login = function () {
    console.log("check: " + this.username + ":" + this.password);
    spryFactory.checkAuth(loginController.username, loginController.password)
      .success(function (data, status) {
        $location.path('/dashboard');
      }).error(function (data, status, config) {
        loginController.error = data || "Request failed";
      });
  };

});



app.controller('MainController', function ($location, spryFactory) {    
  this.isActive = function (route) {
    return route === $location.path();
  }
  
  this.logout = function() {
      spryFactory.logout();
      $location.path('/');
  };
});