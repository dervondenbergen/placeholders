var install = function() {
    if (window.chrome && window.chrome.app) {
        if (!window.chrome.app.isInstalled) {
            try {
                chrome.app.install;
            } catch(e) {
                alert(e + '\nEnable is about:flags');
            }
        } else {
            output('This app is already installed.');
        }
    }
};

angular.module('project', ['mongolab']).
config(function ($routeProvider) {
    $routeProvider.
    when('/', {
        controller: ListCtrl,
        templateUrl: 'list.html'
    }).
    when('/edit/:projectId', {
        controller: EditCtrl,
        templateUrl: 'add.html'
    }).
    when('/new', {
        controller: CreateCtrl,
        templateUrl: 'add.html'
    }).
    otherwise({
        redirectTo: '/'
    });
});


function ListCtrl($scope, Project) {
    $scope.sites = Project.query();
}


function CreateCtrl($scope, $location, Project) {
    $scope.save = function () {
        Project.save($scope.site, function (site) {
            $location.path('/edit/' + site._id.$oid);
        });
    }
}


function EditCtrl($scope, $location, $routeParams, Project) {
    var self = this;

    Project.get({
        id: $routeParams.projectId
    }, function (site) {
        self.original = site;
        $scope.site = new Project(self.original);
    });

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.site);
    }

    $scope.destroy = function () {
        self.original.destroy(function () {
            $location.path('/list');
        });
    };

    $scope.save = function () {
        $scope.project.update(function () {
            $location.path('/');
        });
    };
}

// This is a module for cloud persistance in mongolab - https://mongolab.com
angular.module('mongolab', ['ngResource']).
factory('Project', function ($resource) {
    var Project = $resource('https://api.mongolab.com/api/1/databases' +
        '/placeholdersites/collections/data/:id', {
        apiKey: '2GKuGPR8xivp6WP3Z-zlRxWT2KNjyVDv'
    }, {
        update: {
            method: 'PUT'
        }
    });

    Project.prototype.update = function (cb) {
        return Project.update({
            id: this._id.$oid
        },
        angular.extend({}, this, {
            _id: undefined
        }), cb);
    };

    Project.prototype.destroy = function (cb) {
        return Project.remove({
            id: this._id.$oid
        }, cb);
    };

    return Project;
});