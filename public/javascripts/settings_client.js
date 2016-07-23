console.log("Start reading public/javascripts/settings_client.js");

//*********************************************
// 定数
//*********************************************
const SocketInitialConnectOn = "connection"
const InitilizationRequest = "initialization_request"
const GroupRequest = "group_request"


// layout.jadeの先頭に定義したng-app
var app = angular.module('Setting', ['ngResource', 'ngRoute']);
app.factory('socketio', ['$rootScope', function($rootScope) {

    console.log("socketio factory");
    var socket = io.connect();
    console.log("socket作成:" + socket);

    return {
        on: function(eventName, callback) {

        console.log("socketio - on");
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            console.log("socketio - emit(" + eventName + "):" + data);
            socket.emit(eventName, data, function(data2) {
                console.log("socket.emit(eventName, data, function):" + data2);
                var args = arguments;
                console.log("arguments:" + arguments);
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

app.config(['$routeProvider', function($routeProvider){

    console.log("app.config - " + $routeProvider)
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/add', {
            templateUrl: 'partials/add.html',
            controller: 'AddCtrl'
        })
        .when('/update', {
            templateUrl: 'partials/update.html',
            controller: 'UpdateCtrl'
        }).when('/app', {
            templateUrl: 'petaBoardApp/index_petaBoard.html',
            controller: 'ApplicationCtrl'
        }).when('/bubbleApp', {
            templateUrl: 'bubbleApp/index_2d.html',
            controller: 'ApplicationCtrl2'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);


app.controller('HomeCtrl', ['$scope', '$resource', '$location', 
	// We’ll use $scope to pass data to the view and $resource to consume a RESTful API.
    function($scope, $resource, $location){
        console.log("HomeCtrl");

    	var Settings = $resource('/api/setting');
        Settings.query(function(settings){
        	var count = settings.length;
        	if(count==0){
        		console.log("DBにレコードがないため追加画面に遷移:" + count);
				$location.path('/add');
        		// document.getElementById("groupSelectButton").style.display="none";
        		return;
        	}else{
        		console.log("DBにすでにレコードがあるため更新画面に遷移:" + count);
				$location.path('/update');
        		// document.getElementById("groupSelectButton").style.display="none";
        		return;
        	}
        });
	}
]);


app.controller('AddCtrl', ['$scope', '$resource', '$location', 
	// We’ll use $scope to pass data to the view and $resource to consume a RESTful API.
    function($scope, $resource, $location){
    	console.log("AddCtrl");
        $scope.save = function(){
            var Settings = $resource('/api/setting');
            Settings.save($scope.setting, function(result){
                if(result.error){
                    alert("エラー:" + result.error);
                }
                $location.path('/');
            });
        };
	}
]);




// 受信なので、一度しか呼ばれないようにすること
var receiveMessageFromServer = function(socketio, callback){
    console.log("受信します...");


    socketio.on(InitilizationRequest, function(value, fn){
        console.log("受信済みメッセージ(InitilizationRequest):「" + value + "]」");
        fn("ok")
    });

    socketio.on('disconnect', function () {
        console.log("切断されました");
        socketio.emit('user disconnected');
    });


}

// 送信なので、何回呼ばれてもOK
var sendMessageToServer = function(socketio, msg, callback){
    console.log("「" + msg + "」を送信します...");

    //emitの第二引数は送信先から返信がある場合に呼び出されるコールバック関数
    socketio.emit(GroupRequest, msg, function(settingModule){
        console.log("groups1:「" + JSON.stringify(settingModule.groups) + "]」");
        if(settingModule.error){
            alert("グループリストが取得できませんでした：" + settingModule.error)
            return 
        }

        // selectedGroupIdから選択されているselectedGroupを特定する
        console.log("settingModule.selectedGroupId("+ settingModule.selectedGroupId + ")の検索...");
        var i = 0;
        for(i=0; i<settingModule.groups.length;i++){
            if(settingModule.groups[i].id == settingModule.selectedGroupId){
                settingModule.selectedGroup = settingModule.groups[i]
                console.log("...発見");
            }
        }
        callback(settingModule)
        
    });
}

var sendMessageToStartGettingGroups = function(socketio, msg){
    console.log("「" + "Groups取得のためのメッセージ" + "」を送信します...");

    //emitの第二引数は送信先から返信がある場合に呼び出されるコールバック関数
    socketio.emit("emit_from_client", msg, function(msg){
        console.log("サーバーからの受け取りメッセージ:" + msg);
    });
}





app.controller('UpdateCtrl', ['$scope', '$resource', '$location', '$routeParams', 'socketio',
	// We’ll use $scope to pass data to the view and $resource to consume a RESTful API.
    function($scope, $resource, $location, $routeParams, socketio){
    	console.log("UpdateCtrl");
        
        sendMessageToServer(socketio, "Groups取得のためのメッセージ取得を開始してください。", 
            function(setting){
            console.log("$scopeに設定 - 1");
            console.log("setting.groups:" + JSON.stringify(setting.groups));
            console.log("setting.selectedGroupId:" + setting.selectedGroupId);

            $scope.setting = setting
        });

        receiveMessageFromServer(socketio, function(setting){
            console.log("$scopeに設定 - 2");
            console.log("setting.groups:" + JSON.stringify(setting.groups));
            console.log("setting.selectedGroup:" + JSON.stringify(setting.selectedGroup));
            
            $scope.setting = setting
        })

        var Settings = $resource('/api/setting/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Settings.query(function(settings){
            var count = settings.length;
            if(count>=2){
                window.alert("致命的なエラー:\n" + settings[0]);
                return;
            }else if(count == 0){
                $location.path('/add');
                return;
            }

            console.log("settings[0]:" + settings[0]);
            console.log("access_token:" + settings[0].accessToken);
            console.log("_id:" + settings[0]._id);
            // home.htmlで利用するための変数を設定
            $scope.setting = settings[0];

            if(settings[0].selectedGroup == null || settings[0].selectedGroup == ""){
                console.log("選択しているグループなし");
            }else{
                console.log("選択しているグループ:" + JSON.stringify(settings[0].selectedGroup));
            }
        });

        $scope.save = function(){
            console.log("Click on save!");

            // 現在設定中のgroupのIDを記憶
            if($scope.setting.selectedGroup){
                $scope.setting.selectedGroupId = $scope.setting.selectedGroup.id
            }
            
            console.log($scope);


            Settings.update($scope.setting, function(result){
                console.log("返り値:" + result.error);
                if(result.error){
                    alert("エラー:" + result.error);
                }
                $location.path('/');
            });
        }


        var count = 0;
        $scope.updateGroup = function(){
            console.log("Click on updateGroup!");
            var msg = "Clientから送信だー" + count++;
            sendMessageToServer(socketio, msg,
                function(setting){
                console.log("$scopeに設定 - 3");
                console.log("setting.groups:" + JSON.stringify(setting.groups));
                console.log("setting.selectedGroup:" + JSON.stringify(setting.selectedGroup));
            
                $scope.setting = setting
            });
        }

        $scope.deleteAllSetting = function(){
            console.log("Click on deleteAllSetting!");

            var result = confirm( "本当に削除してもよろしいですか？" );
            if(result){
                console.log(" OK が押された - " + $scope.setting._id);
                Settings.delete({ id: $scope.setting._id }, function(video){
                    console.log("Delete!");
                    $location.path('/');
                }); 

                // Settings2.delete($scope.setting, function(result){
                //     console.log("Delete!");
                //     $location.path('/');
                // });

            }else{
                console.log(" CANCEL が押された");
            }
        }
	}
]);

app.controller('ApplicationCtrl', ['$scope', '$resource', '$location', '$routeParams', 'socketio',
    // We’ll use $scope to pass data to the view and $resource to consume a RESTful API.
    function($scope, $resource, $location, $routeParams, socketio){
        console.log("ApplicationCtrl1");
        new PetaBoardApp()
    }
]);

app.controller('ApplicationCtrl2', ['$scope', '$resource', '$location', '$routeParams', 'socketio',
    // We’ll use $scope to pass data to the view and $resource to consume a RESTful API.
    function($scope, $resource, $location, $routeParams, socketio){
        console.log("ApplicationCtrl2");
        new BubbleApp()
    }
]);



