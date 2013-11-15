
var vertx = require('vertx')
var eventBus = require('vertx/event_bus');
var container = require('vertx/container');
var console = require('vertx/console');
var server = vertx.createHttpServer();
var logger = container.logger;

var routeMatcher = new vertx.RouteMatcher();


// HTTPS로 옮길것인지.



//////////////////////////////////////////////
// Server Setting
//////////////////////////////////////////////

console.log('[SSKY] vertx 서버가 시작되었습니다.');

var setting_ssky = { "debug_mode":1 };
var setting_api = { "host":"localhost", "port":8080};
var setting_mongo = {"host":"127.0.0.1","port":27017,"pool_size":20,"db_name":"test"};




//////////////////////////////////////////////
// Default Function
//////////////////////////////////////////////
function debuglog(text){ if( setting_ssky.debug_mode== 1) console.log(text); }




//////////////////////////////////////////////
// DataBase Connection
//////////////////////////////////////////////

var mongo_config = {address:"ssky.mongo", host:"127.0.0.1", port:27017, pool_size:20, db_name :"test" }
container.deployModule("io.vertx~mod-mongo-persistor~2.0.0-final",mongo_config,function(event){ 
  console.log("[SSKY] MongoDB와 정상적으로 연결되었습니다. ");
});



//////////////////////////////////////////////
// Login Module
//////////////////////////////////////////////

container.deployModule('com.ssky~authMod~0.2.0');








// POST를 통해 회원 관리하기
routeMatcher.post('/:uuid/user', function(req) {        
  var uuid = req.params().get('uuid');

  req.dataHandler(function(buffer) {
    var loginJson = JSON.parse(buffer.toString());
    loginJson.apiID = uuid;

    eventBus.send('ssky.api.user', loginJson ,function(reply){
      req.response.end(JSON.stringify(reply));
    });
  });
});


var client = vertx.createHttpClient().host("localhost");
//var sendstr = '{"type":"user","mode":"login","user_id":"nana3993","password":"12345"} ';
//var sendstr = '{"type":"user","mode":"modify","user_id":"nana3993","password":"1234","new_password":"12345"} ';
//var sendstr = '{"type":"user","mode":"join","user_id":"junehyuk","password":"10101","name":"YangJunehyuk","email_adress":"nana3993@naver.com"} ';

var sendstr = '{"type":"user","mode":"get","user_id":"nana3993"} ';
client.port(8080);

// 테스트하기
routeMatcher.get('/test', function(req) {       
  var request = client.request("POST", "/test_app/user", function(resp) {
    resp.bodyHandler(function(buffer){
      req.response.end(buffer.toString());
    });
  });
  request.end(sendstr);
});

routeMatcher.get('/passwd', function(req) {
    //req.response.end(MD5("1234"));
});










routeMatcher.noMatch(function(req) {
    req.response.end('ERROR');
});

server.requestHandler(routeMatcher).listen(setting_api.port, setting_api.host);










//////////////////////////////////////////////
// EVENTBUS
//////////////////////////////////////////////

/*
var myHandler = function(message) {
  console.log('I received a message ' + message);
}

eventBus.registerHandler('test.address', myHandler, function() {
    console.log('Yippee! The handler info has been propagated across the cluster');
});
*/

//////////////////////////////////////////////
// TIMER
//////////////////////////////////////////////
/*
var timerID = vertx.setTimer(1000, function(timerID) {
    console.log("And one second later this is printed"); 
});
var timerID = vertx.setPeriodic(1000, function(timerID) {
    console.log("And every second this is printed"); 
});
*/


//////////////////////////////////////////////
// VERTX SERVER SOCKET
//////////////////////////////////////////////
/*
var server = vertx.createNetServer();
server.connectHandler(function(sock) {
    sock.dataHandler(function(buffer) {
        console.log('I received ' + buffer.length() + ' bytes of data');
    });
}).listen(1234, 'localhost');
*/


/*
vertx.createNetServer().connectHandler(function(sock) {
	console.log('Hello standard out');
	eventBus.publish('test.address', 'hello world');

//    new vertx.Pump(sock, sock).start();
}).listen(1234);
*/





//////////////////////////////////////////////
// DEFAULT FUNCTION
//////////////////////////////////////////////
console.log('[SSKY] vertxx 서버 실행이 완료되었습니다.');

function vertxStop() {
   console.log('[SSKY] 서버가 종료되었습니다.');
}




