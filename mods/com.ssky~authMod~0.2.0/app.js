
load('md5.js'); 

var vertx = require('vertx')
var eventBus = require('vertx/event_bus');
var console = require('vertx/console');


function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}


var userHandler = function(userdb, replier) {

  var jsonReply = {"type":"user"};  
  jsonReply.mode = userdb.mode;

  switch (userdb.mode) {
    case "join": //회원가입

      var saveJson = {"action":"save","collection":userdb.apiID+".user", "document":{
        "user_id":userdb.user_id,
        "password":MD5(userdb.password),
        "name":userdb.name,
        "token":guid(),
        "email_adress":userdb.email_adress
      }};
      eventBus.send("ssky.mongo", saveJson, function(req){
        jsonReply.status = "ok";
        replier(jsonReply);
      });

      break;
    case "login": // 로그인

      //"user_id":userdb.user_id,"password":userdb.password}
      var find_json = {"action":"findone","collection":userdb.apiID+".user", "matcher":{"user_id":userdb.user_id,"password":MD5(userdb.password)} };
      eventBus.send("ssky.mongo", find_json, function(reply){
        
        //reply.result.user_id == userdb.user_id
        if (reply.result) { //reply.status=="ok"
          jsonReply.status = "ok";
          jsonReply.token = reply.result.token;
        } else {
          jsonReply.status = "fail";
          jsonReply.message = "Login Fail.";
        }
        replier(jsonReply);

      });

      break;
    case "logout": // 로그아웃 

      //타임만 기록해주면 될까요?


      break;
    case "modify": // 회원정보수정

      //토큰으로 수정할 예정.
      //비밀번호랑 분리해야함.
      var find_json = {"action":"findone","collection":userdb.apiID+".user", "matcher":{"user_id":userdb.user_id,"password":MD5(userdb.password)} };
      eventBus.send("ssky.mongo", find_json, function(reply){
        
        if (reply.result) { 
          var newToken = guid();
          var modifyConfig = {"action":"update","collection":userdb.apiID+".user", "criteria":{"user_id":userdb.user_id}, 
          objNew:{$set:{"password":MD5(userdb.new_password),"token":newToken}}, upsert : true, multi : false};
          eventBus.send("ssky.mongo", modifyConfig);

          jsonReply.status = "ok";
          jsonReply.token = newToken;
        } else {
          jsonReply.status = "fail";
          jsonReply.message = "Login Fail.";
        }
        replier(jsonReply);

      });

      break;
    case "findpassword": // 아이디비밀번호 찾기 



      break;
    case "drop": // 회원탈퇴

      // 토큰으로 변경예정.
      var find_json = {"action":"findone","collection":userdb.apiID+".user", "matcher":{"user_id":userdb.user_id,"password":MD5(userdb.password)} };
      eventBus.send("ssky.mongo", find_json, function(reply){
        
        if (reply.result) { 
          var newToken = guid();
          var modifyConfig = {"action":"update","collection":userdb.apiID+".user", "criteria":{"user_id":userdb.user_id}, 
          objNew:{$set:{"status":"drop","password":MD5(userdb.new_password),"token":newToken}}, upsert : true, multi : false};
          eventBus.send("ssky.mongo", modifyConfig);

          jsonReply.status = "ok";
          jsonReply.token = newToken;
        } else {
          jsonReply.status = "fail";
          jsonReply.message = "Login Fail.";
        }
        replier(jsonReply);

      });
    case "get": // GetUser

      var find_json = {"action":"findone","collection":userdb.apiID+".user", "matcher":{"user_id":userdb.user_id} };
      eventBus.send("ssky.mongo", find_json, function(reply){
        
        if (reply.result) { 
          jsonReply = reply.result;
        } else {
          jsonReply.status = "fail";
          jsonReply.message = "Login Fail.";
        }
        replier(jsonReply);

      });

      break;
  }

} 

eventBus.registerHandler('ssky.api.user', userHandler);
console.log("[SSKY] 로그인모듈과 정상적으로 연결되었습니다. ");