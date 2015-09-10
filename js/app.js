var test1;
// Start app
var mainApp = angular.module('MainApp', ['ngRoute', 'ui.bootstrap'])

// Constants
.constant()
// Config route provider
.config(function($routeProvider) {
  $routeProvider
   .when('/:section?/challenges/:challenge_id?', {
    templateUrl: 'pages/challenges.html',
    controller: 'ChallengeController',
  })
   .when('/:section?/lectures', {
    templateUrl: 'pages/lectures.html',
    controller: 'LectureController',
  })
   .when('/:section?/final-projects',{
    templateUrl:'pages/final-projects.html', 
    controller:'ProjectController'
   })
   .when('/:section?', {
    templateUrl: 'pages/landing.html',
    controller: 'MainCtrl',
  })
})


// Main controller
.controller('MainCtrl', function($scope, $routeParams) {
	 $scope.$on('$routeChangeSuccess', function() {
	 	$scope.section = $routeParams.section == 'a' | $routeParams.section == 'c' ? $routeParams.section : undefined
	 	$scope.homeLink = $scope.section == 'a' | $scope.section == 'c' ?  $scope.section + '' : ''
		$scope.lecturesLink = $scope.section == 'a' | $scope.section == 'c' ?  $scope.section + '/lectures' : '/lectures'
		$scope.challengesLink = $scope.section == 'a' | $scope.section == 'c' ?  $scope.section + '/challenges' : '/challenges'
  	});
	
  $scope.$on('$includeContentLoaded', function(){
      Prism.highlightAll()  
  });    
})

// Landing page controller
.controller('LandingController', function($scope, LandingData, $routeParams){
  LandingData.then(function(data){
  	var specifiedSection = $scope.section == undefined ? false : true
    $scope.content = data;
    $scope.content.time = specifiedSection == true ? data['time_' + $scope.section] : data.time
    $scope.content.ta = specifiedSection == true ? data['ta_' + $scope.section] : data.ta
    $scope.content.lab = specifiedSection == true ? data['lab_' + $scope.section] : data.lab
  });
})

// Challenge Controller
.controller('ChallengeController', function($scope, $q, $routeParams, ChallengeData, ChallengeRubric){
  $q.all([ChallengeData, ChallengeRubric]).then(function(values){    
    $scope.challenges = values[0];    
    console.log('section ', $scope.section)
    $scope.challenges.map(function(d){
    	d.date = $scope.section == undefined ? d.date :d['date_' + $scope.section]
    }) 
    $scope.rubrics = {}
    values[1].map(function(d) {
      if($scope.rubrics[d.challenge_id] == undefined)$scope.rubrics[d.challenge_id] = []
      $scope.rubrics[d.challenge_id].push(d)
    })
    $scope.currentChallenge = $routeParams.challenge_id
    $scope.currentRubric = $scope.rubrics[$routeParams.challenge_id]
    $scope.submitUrl = $scope.currentChallenge == undefined ? '' : $scope.challenges.filter(function(d) { return d.challenge_id == $scope.currentChallenge})[0].submitUrl
  })
})

// Lecture controller
.controller('LectureController', function($scope, $routeParams, Items){
  Items.then(function(data){  	
    $scope.items = data.filter(function(d) {
    	return d.has_lecture == 'TRUE'
    })
  });
})

// Final project controller
.controller('ProjectController',['$scope', 'ProjectData', function($scope, ProjectData){
  ProjectData.then(function(data){
    $scope.projects = data;
  });
}])


// Schedule controller 
.controller('ScheduleController', function($scope, $q, ChallengeData, Items){
  $q.all([ChallengeData, Items]).then(function(values){    
    $scope.challenges = values[0];    

    $scope.lectures = values[1];
    $scope.challenges.map(function(d){
    	d.date = $scope.section == undefined ? d.date :d['date_' + $scope.section]
    }) 
    $scope.lectures.map(function(d){
    	d.date = $scope.section == undefined ? d.date :d['date_' + $scope.section]    	
    }) 
    $scope.challenges.map(function(challenge){
      var lecture = $scope.lectures.filter(function(lecture){
        return lecture.date == challenge.date
      })[0]
      if(lecture == undefined || lecture.date == '') return
      lecture.due = challenge.title
      lecture.challengeUrl = challenge.challenge_id
      $scope.scheduleFilter = function(d) {
      	return d.date != ''
      }
    })
  })
})
// Landing page data
.factory('LandingData', ['$http', function($http){
  var Url   = "data/content.csv";
  var test = $http.get(Url).then(function(response){
     arr = CSVToArray(response.data);
     var ret = {}
     arr.map(function(d) {ret[d.section] = d.content})
     return ret
  })
  return test
}])
    

// Get data
.factory('Items', ['$http', function($http){
  var Url   = "data/lectures.csv";
  var Items = $http.get(Url).then(function(response){
    test = response.data
     return CSVToArray(response.data);
  });
  return Items;
}])


// Challenge data
.factory('ChallengeData', ['$http', function($http){
  var Url   = "data/challenges.csv";
  var ChallengeData = $http.get(Url).then(function(response){
     return CSVToArray(response.data);
  });
  return ChallengeData;
}])

// Challenge data
.factory('ChallengeRubric', ['$http', function($http){
  var Url   = "data/rubrics.csv";
  var ChallengeRubrics = $http.get(Url).then(function(response){
     return CSVToArray(response.data);
  });
  return ChallengeRubrics
}])

// Final project data
.factory('ProjectData', ['$http', function($http){
  var Url   = "data/projects.csv";
  var ProjectData = $http.get(Url).then(function(response){
     return CSVToArray(response.data);
  });
  console.log('project Data ', ProjectData)
  return ProjectData;
}]);
