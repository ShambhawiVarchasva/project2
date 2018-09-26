var express = require("express");
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var io2 = require("socket.io")(http);
var Posts = require('./schema/posts');
var Comments = require('./schema/comments');

var port = process.env.port || 3000;


app.use(express.static(__dirname + "/public" ));
app.set('view engine', 'ejs');


app.get('/',function(req,res){
    Posts.find({}, function(err, posts) {
        if (err) {
          console.log(err);
        } else {
          res.render('index', { posts: posts });
        }
    }); 
});

app.get('/',function(req,res){
    Comments.find({}, function(err, comments) {
        if (err) {
          console.log(err);
        } else {
          res.render('index', { comments: comments });
        }
    }); 
});

/*app.get('/comments/detail/:id',function(req,res){
    Comments.findById(req.params.id, function (err, commentDetail) {
        if (err) {
          console.log(err);
        } else {
            Posts.find({'postId':req.params.id}, function (err, comments) {
                res.render('post-detail', { postDetail: postDetail, comments: comments, postId: req.params.id });
            });
        }
    }); 
});*/

app.get('/posts/detail/:id',function(req,res){
    Posts.findById(req.params.id, function (err, postDetail) {
        if (err) {
          console.log(err);
        } else {
            Comments.find({'postId':req.params.id}, function (err, comments) {
                res.render('post-detail', { postDetail: postDetail, comments: comments, postId: req.params.id });
            });
        }
    }); 
});



// DB connection
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/posts_db', { useMongoClient: true })

.then(() => console.log('connection succesful'))
.catch((err) => console.error(err));
// DB connection end
io2.on('connection',function(psocket){
    psocket.on('title',function(data2){
        var postData = new Posts(data2);
        postData.save();
        psocket.broadcast.emit('title',data2);  
    });

});

io.on('connection',function(socket){
    socket.on('comment',function(data){
        var commentData = new Comments(data);
        commentData.save();
        socket.broadcast.emit('comment',data);  
    });

});


http.listen(port,function(){
console.log("Server running at port "+ port);
});