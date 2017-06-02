const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extented:true}));
// app.get('/',function(request,response){
// 	response.send("hello word1");
// })
var db;
app.locals.quote = {};
app.locals.action = 'insert';

app.get('/',(request,response)=>{

	db.collection('quotes').find().toArray(function(err,results){
		if(err) return console.log(err);
		
		app.locals.quote = {};
		app.locals.action = 'insert';
		response.render('index.ejs',{quotes: results,errors:{}});
	});
	
})
app.post('/quotes/:action',(request,response)=>{
	var error = {};
	if(request.body.name == ""){
		error['name'] = 1;
	}
	if(request.body.quote == ""){
		error['quote'] = 1;
	}
	app.locals.error = error;
	if(Object.keys(error).length > 0){
		db.collection('quotes').find().toArray(function(err,results){
		if(err) return console.log(err);
		
		app.locals.quote = request.body;
		console.log(app.locals.quote);
		app.locals.action = request.params.action;
		response.render('index.ejs',{quotes: results,errors:error});
		});
		return false;
	}
	if(request.params.action == "update"){
		db.collection('quotes').update({"_id" : new ObjectID(request.body.id)},{$set:{'name':request.body.name,'quote':request.body.quote}},(err,result)=>{
			if(err) return console.log(err);
			console.log("Updated in database!");
			response.redirect("/");	
		})
	}
	else{
		db.collection('quotes').save(request.body,(err,result)=>{
			if(err) return console.log(err);
			console.log("saved to database!");
			response.redirect("/");	
		})			
	}
})
app.get('/edit/:id',(request,response)=>{

	db.collection('quotes').find().toArray(function(err,results){
		if(err) return console.log(err);
		app.locals.quote = results.filter(function(x){return x._id==request.params.id})[0]; //arr here is you result array
		console.log(app.locals.quote);
		app.locals.action = 'update';
		response.render('index.ejs',{quotes: results,errors:{}});
		
	});
})
app.get('/delete/:id',(request,response)=>{
	try {
		console.log(ObjectID(request.params.id));
	var cursor = db.collection('quotes').remove({ "_id" : new ObjectID(request.params.id)});
	
		response.redirect("/");
	} catch (e) {
	  console.log(e);
	}
})

MongoClient.connect('mongodb://stars_quotes_user:stars_quotes_user@ds143081.mlab.com:43081/stars_quotes',(err,database)=>{
	if(err) return console.log(err);
	db = database;
	app.listen(3000,function(){
		console.log("Connection Established!");	
	})
})