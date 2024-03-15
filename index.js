var http = require("http");
var fs = require("fs");
var express = require("express");

//Read settings
var colors = fs.readFileSync("./config/colors.txt").toString().replace(/\r/,"").split("\n");
var blacklist = fs.readFileSync("./config/blacklist.txt").toString().replace(/\r/,"").split("\n");
var config = JSON.parse(fs.readFileSync("./config/config.json"));
if(blacklist.includes("")) blacklist = []; //If the blacklist has a blank line, ignore the whole list.

//Variables
var rooms = {};
var markuprules = {
  "**":"b",
  "__":"u",
  "--":"s",
  "~~":"i",
  "##":"font size=5",
}
var userips = {}; //It's just for the alt limit
var guidcounter = 0;
var app = new express();
app.use(express.static("./frontend"));
var server = require("http").createServer(app)
//Socket.io Server
var io = require("socket.io")(server, {
    allowEIO3: true
}
);
server.listen(config.port, () => {
    rooms["default"] = new room("default");
    console.log("Welcome to CubeWORLD V4! Chat whatever you want!");
});
io.on("connection", (socket) => {
  //First, verify this user fits the alt limit
  if(true || typeof userips[socket.request.connection.remoteAddress] == 'undefined') userips[socket.request.connection.remoteAddress] = 0;
  userips[socket.request.connection.remoteAddress]++; //remoce true || to turn on alt limit
  
  if(userips[socket.request.connection.remoteAddress] > config.altlimit){
    //If we have more than the altlimit, don't accept this connection and decrement the counter.
    userips[socket.request.connection.remoteAddress]--;
    socket.emit("errr", {code:104});
    socket.disconnect();
    return;
  }
  
  //Set up a new user on connection
    new user(socket);
});

//Now for the fun!

//Command list
var commands = {

  name:(victim,param)=>{
    if (param == "" || (param == "OthmanWuTheVirusFan" && victim.level<2) || param.length > config.namelimit) return;
    victim.public.name = param
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  },
  
  asshole:(victim,param)=>{
  victim.room.emit("asshole",{
    guid:victim.public.guid,
    target:param,
  })
  },
  faggot:(victim,param)=>{
  victim.room.emit("faggot",{
    guid:victim.public.guid,
    target:param,
  })
  },
  gofag:(victim,param)=>{
  victim.room.emit("gofag",{
    guid:victim.public.guid,
    target:param,
  })
  },

  restart:(victim, param)=>{
    if(victim.level < 2) return;
  },
  
  color:(victim, param)=>{
    param = param.toLowerCase();
    if(!colors.includes(param)) param = colors[Math.floor(Math.random() * colors.length)];
    victim.public.color = param;
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  }, 
  
  pitch:(victim, param)=>{
    param = parseInt(param);
    if(isNaN(param)) return;
    victim.public.pitch = param;
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  },

  speed:(victim, param)=>{
    param = parseInt(param);
    if(isNaN(param) || param>400|| param<100) return;
    victim.public.speed = param;
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  },
  
  godmode:(victim, param)=>{
    if(param == config.godword){
	victim.level = 2;
	victim.socket.emit("authed", 2);
    }
  },

  kingmode:(victim, param)=>{
    if(param == config.modword){
  victim.level = 1.5;
  victim.socket.emit("authed", 1.5);
    }
  },
 

  pope:(victim, param)=>{
    if(victim.level<2) return;
    victim.public.color = "god";
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  },
  king:(victim, param)=>{
    if(victim.level<1.5) return;
    victim.public.color = "king";
    victim.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
  },
   bless:(victim, param)=>{
    if(victim.level<2) return;
     if(victim.kinged) return;
   toking = victim.room.users.find(useregg=>{
	return useregg.public.guid == param;
   })
     if(toking == undefined) return;
    toking.public.color = "blessed";
     toking.public.name = "OH FUCKING HELL YEAH";
     toking.level = 1
     victim.kinged = true;
    toking.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
     setTimeout(()=>{victim.kinged = false},10000);
  },
  
    kingger:(victim, param)=>{
    if(victim.level<2) return;
     if(victim.kinged) return;
   toking = victim.room.users.find(useregg=>{
	return useregg.public.guid == param;
   })
     if(toking == undefined) return;
    toking.public.color = "rabbigem";
     toking.public.name = "OH MY FUCKING GOD I GOT RABBI! YAYYYYY";
       toking.level = 1
     victim.kinged = true;
    toking.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
     setTimeout(()=>{victim.kinged = false},10000);
  },
  
    floyd:(victim, param)=>{
    if(victim.level<1) return;
     if(victim.niggered) return;
   toniggery = victim.room.users.find(useregg=>{
	return useregg.public.guid == param;
   })
     if(toniggery == undefined) return;
    toniggery.public.color = "dirty";
     toniggery.public.name = "DIRTY NIGGER";
     victim.niggered = true;
      toniggery.socket.emit("nuke");
    toniggery.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
     setTimeout(()=>{victim.niggered = false},10000);
  },
  ban:(victim, param)=>{
  if(victim.level<1) return;
   if(victim.niggered) return;
  toniggery = victim.room.users.find(useregg=>{
  return useregg.public.guid == param;
  })
   if(toniggery == undefined) return;
  toniggery.public.color = "floyd";
   toniggery.public.name = "BANNED!";
   victim.niggered = true;
    toniggery.socket.emit("ban");
  toniggery.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
   setTimeout(()=>{victim.niggered = false},10000);
  },
   faggy:(victim, param)=>{
    if(victim.level<1) return;
     if(victim.niggeredy) return;
   tofag = victim.room.users.find(useregg=>{
	return useregg.public.guid == param;
   })
     if(tofag == undefined) return;
    tofag.public.color = "jew";
     tofag.public.name = "GIANT FAGGOT";
     victim.niggeredy = true;
     // tofag.socket.emit("nuke");
    tofag.room.emit("update",{guid:victim.public.guid,userPublic:victim.public})
     setTimeout(()=>{victim.niggeredy = false},10000);
  },
  
  image:(victim, param)=>{
    victim.room.emit("talk",{
      text: "<img class='userimage' src='"+param+"' />",
      guid:victim.public.guid
    })
  },

  markup:(victim, param)=>{
    victim.markup = (param=="on");
  },
  
  restart:(victim, param)=>{
    if(victim.level<2) return;
    process.exit();
  },

  update:(victim, param)=>{
    if(victim.level<2) return;
    //Just re-read the settings.
    colors = fs.readFileSync("./config/colors.txt").toString().replace(/\r/,"").split("\n");
blacklist = fs.readFileSync("./config/blacklist.txt").toString().replace(/\r/,"").split("\n");
config = JSON.parse(fs.readFileSync("./config/config.json"));
if(blacklist.includes("")) blacklist = []; 
  },
  
  joke:(victim, param)=>{
    victim.room.emit("joke", {guid:victim.public.guid, rng:Math.random()})
  },
  
  fact:(victim, param)=>{
    victim.room.emit("fact", {guid:victim.public.guid, rng:Math.random()})
  },
  
  backflip:(victim, param)=>{
    victim.room.emit("backflip", {guid:victim.public.guid, swag:(param.toLowerCase() == "swag")})
  },
  sad:(victim, param)=>{
    victim.room.emit("sad", {guid:victim.public.guid, sad:(param.toLowerCase() == "verysad")})
  },
  
  owo:(victim, param)=>{
  victim.room.emit("owo",{
    guid:victim.public.guid,
    target:param,
  })
  },
  nigger:(victim, param)=>{
    victim.room.emit("talk",{
      guid:victim.public.guid,
      text:"Seamus is a super giant faggot!"
    })
  },
  
  sanitize:(victim, param)=>{
    if(victim.level<1) return;
    if(victim.sanitize) victim.sanitize = false;
    else victim.sanitize = true;
  },

  triggered:(victim, param)=>{
    victim.room.emit("triggered", {guid:victim.public.guid})
  },

  linux:(victim, param)=>{
    victim.room.emit("linux", {guid:victim.public.guid})
  },
  
  youtube:(victim, param)=>{
    victim.room.emit("youtube",{guid:victim.public.guid, vid:param.replace(/"/g, "&quot;")})
  },

  kick:(victim, param)=>{
    if(victim.level < 1) return;
    if(victim.kickslow) return;
    tokick = victim.room.users.find(useregg=>{
	return useregg.public.guid == param;
    })
    if(tokick == undefined) return;
    tokick.socket.disconnect();
    victim.kickslow = true;
    setTimeout(()=>{victim.kickslow = false},10000);
  },
}

//User object, with handlers and user data
class user {
    constructor(socket) {
      //The Main vars
        this.socket = socket;
      this.lastmessage = "";
        this.loggedin = false;
	this.kickslow = false;
      this.kinged = false;
      this.niggered = false;
      this.niggeredy = false;
        this.level = 0; //This is the authority level
        this.public = {};
	this.public.typing = "";
        this.slowed = false; //This checks if the client is slowed
        this.sanitize = true;
        this.socket.on("login", (logdata) => {
          if(typeof logdata !== "object" || typeof logdata.name !== "string" || typeof logdata.room !== "string") return;
          //Filter the login data
            if (logdata.name == undefined || logdata.room == undefined) logdata = { room: "default", name: "Anonymous" };
          (logdata.name == "" || logdata.name.length > config.namelimit || filtertext(logdata.name) || logdata.name == "BonziCelestial") && (logdata.name = "Anonymous");
          logdata.name.replace(/ /g,"") == "" && (logdata.name = "Anonymous");
            if (this.loggedin == false) {
              //If not logged in, set up everything
                this.loggedin = true;
                this.public.name = logdata.name;
                this.public.color = colors[Math.floor(Math.random()*colors.length)];
                this.markup = true;
                this.public.pitch = 100;
                this.public.speed = 175;
                guidcounter++;
                this.public.guid = guidcounter;
                var roomname = logdata.room;
                if(roomname == "") roomname = "default";
                if(rooms[roomname] == undefined) rooms[roomname] = new room(roomname);
                this.room = rooms[roomname];
                this.room.users.push(this);
                this.room.usersPublic[this.public.guid] = this.public;
              //Update the new room
                this.socket.emit("updateAll", { usersPublic: this.room.usersPublic });
                this.room.emit("update", { guid: this.public.guid, userPublic: this.public }, this);
            }
          //Send room info
          this.socket.emit("room",{
            room:this.room.name,
            isOwner:false,
            isPublic:this.room.name == "default",
          })
        });
      //quote handler
      this.socket.on("quote", quote=>{
        var victim2;
        try{
        if(filtertext(quote.msg)&& this.sanitize) return;
           if(this.sanitize) quote.msg = quote.msg.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\[/g, "&#91;");
        victim2 = this.room.users.find(useregg=>{
      return useregg.public.guid == quote.guid;
    })
    this.room.emit("talk",{
      text:"<div class='quote'>"+victim2.lastmessage+"</div>" + quote.msg,
      guid:this.public.guid
    })
        }catch(exc){
          console.log("quot error" + exc)
        }
      })

      //dm handler
      this.socket.on("dm", dm=>{
        var victim2;
        try{
        if(filtertext(dm.msg) && this.sanitize) return;
          if(this.sanitize) dm.msg = dm.msg.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\[/g, "&#91;");

    victim2 = this.room.users.find(useregg=>{
      return useregg.public.guid == dm.guid;
    })
          victim2.socket.emit("talk", {
            text: dm.msg+"<h5>Only you can see this.</h5>",
            guid: this.public.guid
          })
          
          this.socket.emit("talk", {
            text: dm.msg+"<h5>Only "+victim2.public.name+" Can see this.</h5>",
            guid: this.public.guid
          })
          
        }catch(exc){
          
        }
      })
      //talk
        this.socket.on("talk", (msg) => {
          try{
          if(typeof msg !== "object" || typeof msg.text !== "string") return;
          //filter
          if(this.sanitize) msg.text = msg.text.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\[/g, "&#91;");
          if(filtertext(msg.text) && this.sanitize) msg.text = "blocked by the 'filter'";
          
          //talk
          if(this.markup) msg.text = markup(msg.text);
            if(!this.slowed){
              if(msg.text.replace(/ /g, "") == "") return;
              this.lastmessage = msg.text;
              this.room.emit("talk", { guid: this.public.guid, text: msg.text });
        this.slowed = true;
        setTimeout(()=>{
          this.slowed = false;
        },config.slowmode)
            }
          }catch(exc){
            
          }
        });
	//Typing Handler
	socket.on("typing", (typer)=>{
    try{
	if(typer.state == 0) this.public.typing = "";
	else if(typer.state == 1) this.public.typing = "\nis typing...";
	else if(typer.state == 2) this.public.typing = "\nis commanding...";
    
	this.room.emit("update", {guid:this.public.guid, userPublic: this.public});
    }catch(exc){
      
    }
	})
      //Deconstruct the user on disconnect
        this.socket.on("disconnect", () => {
          try{
          userips[this.socket.request.connection.remoteAddress]--;
          if(userips[this.socket.request.connection.remoteAddress] == 0) delete userips[this.socket.request.connection.remoteAddress];
                                                                  
          

            if (this.loggedin) {
                delete this.room.usersPublic[this.public.guid];
                this.room.emit("leave", { guid: this.public.guid });
this.room.users.splice(this.room.users.indexOf(this), 1);
            }
          }catch(exc){
            
          }
        });

      //COMMAND HANDLER
      this.socket.on("command",cmd=>{
        try{
        //parse and check
        if(cmd.list[0] == undefined) return;
        var comd = cmd.list[0];
        var param = ""
        if(cmd.list[1] == undefined) param = [""]
        else{
        param=cmd.list;
        param.splice(0,1);
        }
        param = param.join(" ");
          //filter
          if(typeof param !== 'string') return;
          if(this.sanitize) param = param.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\[/g, "&#91;");;
          if(filtertext(param) && this.sanitize) return;
        //carry it out
        if(!this.slowed){
          if(commands[comd] !== undefined) commands[comd](this, param);
        //Slowmode
        this.slowed = true;
        setTimeout(()=>{
          this.slowed = false;
        },config.slowmode)
        }
        }catch(exc){
          
        }
      })
    }
}

//Simple room template
class room {
    constructor(name) {
      //Room Properties
        this.name = name;
        this.users = [];
        this.usersPublic = {};
    }

  //Function to emit to every room member
    emit(event, msg, sender) {
        this.users.forEach((user) => {
            if(user !== sender)  user.socket.emit(event, msg)
        });
    }
}

//Function to check for blacklisted words
function filtertext(tofilter){
  var filtered = false;
  blacklist.forEach(listitem=>{
    if(tofilter.replace(/ /g,"").includes(listitem)) filtered = true;
  })
  return filtered;
}

function markup(tomarkup){
  Object.keys(markuprules).forEach(markuprule=>{ 
    var toggler = true;
    tomarkup = tomarkup.split(markuprule);
    for(ii=0;ii<tomarkup.length;ii++){
      toggler = !toggler;
      if(toggler) tomarkup[ii] = "<"+markuprules[markuprule]+">"+ tomarkup[ii] + "</"+markuprules[markuprule]+">"
    }
    tomarkup = tomarkup.join("");
  })
  return tomarkup
}