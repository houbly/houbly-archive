var app = angular.module("houblyApp", ['ui.router']);


//ROUTES
app.config(function ($stateProvider, $urlRouterProvider, $provide) {

	$provide.decorator('$uiViewScroll', function ($delegate) {
		return function (uiViewElement) {
			window.scrollTo(0);
		};
	});

	var helloState = {
		name: 'hello',
		url: '/index',
		templateUrl: 'views/main.html'
	};

	var aboutState = {
		name: 'about',
		url: '/about',
		templateUrl: 'views/about.html'
	};
	var workState = {
		name: 'work',
		url: '/work',
		templateUrl: 'views/work.html'
	};
	var workShowState = {
		name: 'project',
		url: '/work/project/:projectId/:slug',
		controller: "projectController",
		templateUrl: 'views/singleproject.html'
	};

	$urlRouterProvider.when('', '/index');
	$stateProvider.state(helloState);
	$stateProvider.state(aboutState);
	$stateProvider.state(workState);
	$stateProvider.state(workShowState);
});


// --- CONTROLLERS ---

app.controller("mainController", ['$scope', '$timeout', '$location', '$sce', function ($scope, $timeout, $location, $sce) {

	"use strict";

	function sayHello() {
		var timeNow = new Date().getHours();
		$scope.hello = (timeNow < 12) ? "Good Morning!" : "Good Afternoon!";
		if (timeNow > 17) {
			$scope.hello = "Good Evening!";
		}
		$timeout(sayHello, 60000);
	};
	
	
	$scope.$sce = $sce;
	$scope.bindHTML = $sce.trustAsHtml();
	
	$scope.compactHeader = function () {
		if ($location.path() !== "/index") {
			return true;
		}
	}


	$scope.navToggle = function () {
		if (angular.element(document.querySelector(".nav-btn")).hasClass("open")) {
			anime({
				targets: '.nav-btn svg path:first-child',
				d: "M5 10, 45 10",
				duration: 1000,
				delay: 250
			});
			anime({
				targets: '.nav-btn svg path:nth-child(2)',
				opacity: 1,
				duration: 1000,
				delay: 250
			});
			anime({
				targets: '.nav-btn svg path:last-child',
				d: "M5 40, 45 40",
				duration: 1000,
				delay: 250
			});
		} else {
			anime({
				targets: '.nav-btn svg path:first-child',
				d: "M5 5, 45 45",
				duration: 1000,
				delay: 250
			});
			anime({
				targets: '.nav-btn svg path:nth-child(2)',
				opacity: 0,
				x: -100,
				duration: 1000,
				delay: 250
			});
			anime({
				targets: '.nav-btn svg path:last-child',
				d: "M5 45, 45 5",
				duration: 1000,
				delay: 250
			});
		}
	}

	sayHello();

}]);

app.controller("skillsController", ['$scope', function ($scope) {
	$scope.tab = 1;

	$scope.setTab = function (newTab) {
		$scope.tab = newTab;

	}
	$scope.isSet = function (tabNum) {
		return $scope.tab === tabNum;
	}

	$scope.setGraph = function (skill) {


		var labels = angular.element(document.querySelectorAll("." + skill + " li"));
		var top = [];
		var bottom = [];
		angular.forEach(labels, function (v, i) {
			var attr = angular.element(v).attr("data-percentage");
			if (i < 3) {
				top.push(attr);
			} else {
				bottom.push(attr);
			}

		});
		var percentages = top.concat(bottom.reverse());

		morphGraph(percentages);


	};

	var maxVal = {
		p0: [240.6, 139.5],
		p1: [433.4, 28.8],
		p2: [624.3, 140.2],
		p3: [624.8, 362.1],
		p4: [433.4, 472.8],
		p5: [241.1, 361.4]
	};

	$scope.setTab($scope.tab);
	$scope.setGraph("general");

	function morphGraph(arr) {
		var o = [433.4, 250.4];

		var morphString = [o, o, o, o, o, o];
		angular.forEach(arr, function (v, i) {


			var current = "p" + i,
				x = ((maxVal[current][0] - o[0]) / 100) * arr[i] + o[0],
				y = ((maxVal[current][1] - o[1]) / 100) * arr[i] + o[1];


			morphString[i] = x + " " + y;
		});

		anime({
			targets: '#data',
			points: [
				//{ value: plot.toString() },
				{
					value: morphString.join(' ')
				}
			],
			elasticity: 400,
			duration: 500
		});
	}

}]);

app.controller('workController', function ($scope, $http) {

	var loadAnimation = anime.timeline({
		loop: true,
		direction: "alternate"
	});

	loadAnimation
		.add({
			targets: '#path1',
			strokeDashoffset: [anime.setDashoffset, 0],
			easing: 'easeInOutSine',
			duration: 300
		})
		.add({
			targets: '#path2',
			strokeDashoffset: [anime.setDashoffset, 0],
			easing: 'easeInOutSine',
			duration: 500,
			offset: '-=100'
		})
		.add({
			targets: '#path1, #path2',
			scale: [0.75, 1],
			transformOrigin: ["50% 50%", "50% 50%"],
			duration: 1000,
			offset: '-=200'
		})
		.add({
			targets: '#point1',
			scale: [0, 1],
			transformOrigin: ["50% 50%", "50% 50%"],
			duration: 700,
			offset: '-=700'
		});
	
	$scope.loading = true;
	
	$http.get("http://houbly.me/content/wp-json/wp/v2/posts?categories=2&?_embed")
		.then(function (response) {
			$scope.loading = false;
			$scope.posts = response.data;
		});
});

app.controller("projectController", ['$scope', '$stateParams', '$http', function ($scope, $stateParams, $http) {
	$http.get("http://houbly.me/content/wp-json/wp/v2/posts/" + $stateParams.projectId + "?_embed")
		.then(function (response) {
			$scope.project = response.data;
		});
}]);


app.filter('trustHtml',function($sce){
  return function(html){
    return $sce.trustAsHtml(html)
  }
})


app.directive("emailMe", function () {
	return {
		templateUrl: 'modules/emailme.html'
	};
});

app.directive("skillsDiagram", function () {
	return {
		templateUrl: 'modules/skillsdiagram.html',
		controller: 'skillsController'
	};
});


var greetingSvg = anime.timeline();

greetingSvg
	.add({
		targets: '#greetingAnimation path, #greetingAnimation line',
		strokeDashoffset: [anime.setDashoffset, 0],
		easing: 'easeInOutSine',
		duration: 1500,
		delay: function (el, i) {
			return i * 100
		},
		complete: function (anim) {
			blink();
		}
	})

function blink() {
	var delay = anime.random(2000, 10);
	var blink = anime({
		targets: '#greetingAnimation .eye',
		strokeDashoffset: [0, anime.setDashoffset],
		translateY: [anime.setDashoffset],
		easing: 'easeInOutSine',
		direction: 'alternate',
		duration: 250,
		delay: delay,
		loop: 2,
		complete: function () {
			runBlink();
		}
	})
}

function runBlink() {
	blink();
}