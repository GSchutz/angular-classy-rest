/**
* marketplace.ClassyServiceModule Module
*
* The Classy Service
*/
angular.module('classy.rest', [
])

.provider('ClassyRestService', [
function(){

  var config = {
    $classy: {},
    $primaryKey: 'id',
    $baseUrl: "//localhost",
    $resource: "",
    $query: {
      limit: 20,
      sort: this.$primaryKey
    },
    $after: {
      $read: function(){
      },
      $create:  function(data, resource){
      },
      $update:  function(){
      },
      $delete:  function(){
      }
    },
    $before: {
      $read: function(){
      },
      $create:  function(data, resource){
      },
      $update:  function(){
      },
      $delete:  function(){
      }
    },
  };

  this.defaults = function(o) {
    if (o)
      config = _.defaults(o, config);
    else
      return config;

    return this;
  }

  this.$get = [
    '$http',
    function($http){

      function Rest(o) {
      	var self = this;

        o = _.defaults(o, config);

        /**
         * Short method for construct the base URL. If needed for another resource, use: url([1, 'records'], 'collection'));
         *
         * @method   url
         *
         * @memberOf MapsService
         *
         * @return   {string} The URL containing all the arguments passed.
         */
        function url(params, clean) {
          var args;

          if (_.isArray(params)) {
            args = (clean ? [] : [o.$resource]).concat(params);
          } else {
            args = [o.$resource].concat(_.toArray(arguments));
          }

          return [o.$baseUrl].concat(args).join('/');
        }

        this.$get = function(query) {
        	var $classy = this;

        	return $http
        		.get( url() )
          	.then(function(response) {

          		if (response.status === 200) {
          			// ok
          			$classy.$load(response.data);
          		} else {
          			
          		}

          	});
        }

        this.$post = function(param) {
        	var $classy = this;
        	delete param['id'];

      		return $http
      			.post( url(), param.$value ? param.$value() : param )
          	.then(function(response) {

          		if (response.status >= 200 && response.status < 300) {
          			// ok
          			console.log(response.data);
          			$classy.$add(param);
          		} else {
          			
          		}

          	});
        };

        this.$remove = function(u) {
        	var $classy = this;

      		$http
      			.delete( url(u.id) )
          	.then(function(response) {

          		if (response.status === 200) {
          			// ok
          			$classy.$super(u);
          		} else {
          			
          		}

          	});

          return this;
        };

        this.$delete = function(u) {
        	var $classy = this;

      		return $http
      			.delete( url(u.id) )
          	.then(function(response) {

          		if (response.status === 200) {
          			// ok
          			u.$remove();
          		} else {
          			
          		}

          	});
        };
      }
      
      return {
        instance: function(o) {
          return new Rest(o);
        }
      }
    }]
}])


.provider('ClassyRestService-old', [
function(){

  var config = {
    $classy: {},
    $primaryKey: 'id',
    $baseUrl: "//localhost",
    $resource: "",
    $query: {
      limit: 20,
      sort: this.$primaryKey
    },
    $after: {
      $read: function(){
      },
      $create:  function(data, resource){
      },
      $update:  function(){
      },
      $delete:  function(){
      }
    },
    $before: {
      $read: function(){
      },
      $create:  function(data, resource){
      },
      $update:  function(){
      },
      $delete:  function(){
      }
    },
  };

  this.defaults = function(o) {
    if (o)
      config = _.defaults(o, config);
    else
      return config;

    return this;
  }

  this.$get = [
    '$http',
    function($http){

    	var reserved = ['then', 'rest'];

      function RestLoader(promise) {
        var $rest = this;

        // makeup all Rest methods
        // and reserve them to dispatch when 
        // the promise end

        function RestLoader() {
          var self = this;

          var $deliveries = [];

	          for(n in $rest) {
	            var m = $rest[n];

	            if (_.isFunction(m) && !_.contains(reserved, n)) {
	            	(function(){
	            		var d = {
	                  name: n,
	                  method: m,
	                  thisArg: $rest
	                };
		              this[n] = function delay() {
		                // save the original method and arguments;
		                d.args = _.toArray(arguments);

		                $deliveries.push(d);

		                // return self, so mixin can't change it
		                return self;
		              }
        				}.call(this));
	            } else {
	              this[n] = m;
	            }
	          }

          // bind another thisArg?
          // this.then = promise.then;
          this.$promise = promise;

          // for (n in promise) {
          // 	this[n] = promise[n];
          // }

          promise.then(function(response) {
          	console.log(response);

            _.each($deliveries, function(d) {
            	var args = [response.data].concat(d.args);

            	console.log(d.name);

              d.method.apply(d.thisArg, args);
            });
          });
        }
        return new RestLoader();
      }

      function Rest(o) {
        o = _.defaults(o, config);

        /**
         * Short method for construct the base URL. If needed for another resource, use: url([1, 'records'], 'collection'));
         *
         * @method   url
         *
         * @memberOf MapsService
         *
         * @return   {string} The URL containing all the arguments passed.
         */
        function url(params, clean) {
          var args;

          if (_.isArray(params)) {
            args = (clean ? [] : [o.$resource]).concat(params);
          } else {
            args = [o.$resource].concat(_.toArray(arguments));
          }

          return [o.$baseUrl].concat(args).join('/');
        }

        this.$get = function(param, query) {
          var id;

          if (param && !_.isPlainObject(param)) {
            id = param;
          } else {
            query = query || param;
          }

          return RestLoader.call(o.$classy, $http.get( url(id), query ));
        };

        this.$post = function(param) {
          return RestLoader
          	.call(
          		o.$classy, 
          		$http.post( url(), param )
        		);
        };

        this.$delete = this.$remove = function(id) {
          return RestLoader
          	.call(
          		o.$classy, 
          		$http.delete( url(id) )
        		);
        };
      }
      
      return {
        instance: function(o) {
          return new Rest(o);
        }
      }
    }]
}]);