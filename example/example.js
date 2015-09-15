angular.module('classy.rest.example', ['classy.rest'])

.config(['ClassyRestServiceProvider', function(ClassyRestServiceProvider) {

	ClassyRestServiceProvider.defaults({
		$baseUrl: '//localhost:3007'
	});

}])

.factory('UserService', [
	'ClassyRestService', 
function( ClassyRest ) {
	var User = Classy('user', {

	}, ClassyRest.instance({
    $resource: 'user'
  }));

  User.$on('$remove', function(u) {
		console.log("Notifica que o cara " + u.name + " foi removido.");
  })

	// var UserApi = ClassyRest.instance({
 //    $resource: 'user',
 //    $classy: User
 //  });

	// User.rest = UserApi;
	
	return User;
}])

.controller('ExampleCtrl', [
	'UserService', 
	'$scope', 
	'$timeout',
function( User, $scope, $timeout ) {
	console.log('Classy Rest Example');

	$scope.users = User.$data();

	$scope.listUsers = function() {
		User.$get();
	};

	$scope.removeUser = function(user) {
		user.$remove();
	};

	$scope.addUser = function(user) {
		User.$post(user);

		delete $scope.user;
	};

	$scope.listUsers();


	window.User = User;

}])

.controller('ExampleCtrl-old', [
	'UserService', 
	'$scope', 
	'$timeout',
function( User, $scope, $timeout ) {
	console.log('Classy Rest Example');

	$scope.users = User.$data();

	$scope.listUsers = function() {
		User
			.rest
			.$get()
				.$load();
	};

	$scope.removeUser = function(user) {
		User
			.rest
			.$delete(user.id)
			.$promise
			.then(function() {
				user.$remove();
			});
	};

	$scope.addUser = function(user) {
		User
			.rest
			.$post(user)
			.$add();
	};

	$scope.listUsers();

}])

.run([
function() {

}]);