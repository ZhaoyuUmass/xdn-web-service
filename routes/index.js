var express = require('express');
var router = express.Router();

var passport = require('passport');
var net = require('net');
var mongodb = require('mongodb');

var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
// var MongoClient = require('mongodb').MongoClient;

// const db_url = "mongodb://127.0.0.1:27017/node-login";
// const coll_name = "accounts";

var AM = require('../modules/account-manager');
var EM = require('../modules/email-dispatcher');

const UPDATE_CODE = "update_code",
    REMOVE_CODE = "remove_code",
    UPDATE_RECORD = "update_record",
    DELETE_RECORD = "delete_record",
    UPDATE_FIELD = "update_field",
    DELETE_FIELD = "delete_field",
    UPDATE_MX = "update_mx",
    DELETE_MX = "delete_mx",
    UPDATE_NS = "update_ns",
    DELETE_NS = "delete_ns",
    UPDATE_CNAME = "update_cname",
    DELETE_CNAME = "delete_cname";


const LOGIN = 'basic/login',
    REGISTER = 'basic/register',
    INDEX = 'basic/index',
    ERROR = 'template/error';

router.get('/', function (req, res) {
    console.log("REQ:"+JSON.stringify(req.session["user"]));
    var user = req.session["user"];
    console.log("USER:"+JSON.stringify(user));
    if(user){
        var username = user.user;
        console.log("USERNAME:"+username);
        MongoClient.connect(db_url, function(err, db){
            if(err){
                return res.render(ERROR, { error: "Cannot connect to db when fetching data."});
            }else {
                var collection = db.collection(coll_name);
                collection.find({user: username}).toArray(function(err, results) {
                    console.log("ERROR:"+err);
                    console.log("DB:"+JSON.stringify(results));
                    if(err){
                        res.render(ERROR, {
                            message: err.message,
                            error: err
                        });
                    } else {
                        var code = results[0].code;
                        var record = results[0].record,
                            mx = results[0].mx,
                            ns = results[0].ns,
                            cname = results[0].cname;
                        var fields = results[0].fields;
                        var json = {
                            username: username,
                            code: code,
                            record: record,
                            mx: mx,
                            ns: ns,
                            cname: cname,
                            fields:fields
                        };
                        res.render(INDEX, user);
                    }
                });

            }
        });

        // res.render(INDEX, user);
    }else {
        res.render(INDEX, null);
    }
});

router.post('/', function (req, res) {
    var query = req.body.action,
        username = req.user.username,
        action = null;

    //console.log("POST handler receives a request:"+JSON.stringify(req));
    // Fetch the record from db first
    MongoClient.connect(db_url, function(err, db){
        if(err){
            res.render(ERROR, {
                message: err.message,
                error: err
            });
            // db.close();
        }else {
            var collection = db.collection(coll_name);

            collection.find({username:username}).toArray(function(err, results) {
                if(err){
                    res.render(ERROR, {
                        message: err.message,
                        error: err
                    });
                    // db.close();
                }else {
                    console.log("This is the record retrieved from DB:"+JSON.stringify(results[0]));
                    var guid = results[0].guid;
                    var toUpdate = true;

                    // now let's check whether it's necessary to update
                    switch(query) {
                        case "code":
                            var currentCode = results[0].code;
                            var code = req.body.code;
                            // currentCode != code, then it needs to update
                            if (currentCode.localeCompare(code) != 0) {
                                if (code.localeCompare("") == 0) {
                                    action = REMOVE_CODE;
                                } else {
                                    action = UPDATE_CODE;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        case "record":
                            var currentRecord = results[0].record;
                            var record = req.body.record;
                            // currentRecord != record, then it needs to update
                            if (currentRecord.localeCompare(record) != 0) {
                                if (record.localeCompare("") == 0) {
                                    action = DELETE_RECORD;
                                } else {
                                    action = UPDATE_RECORD;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        case "field":
                            // The currentFields is a map containing all fields
                            var currentFields = results[0].fields;
                            // There is only one field to be update
                            var field = req.body.field;
                            var value = req.body.value;
                            // if the currentFields does not contain the field, then it needs to update
                            if (currentFields.hasOwnProperty(field)){
                                if(value.localeCompare("") ==  0){
                                    action = DELETE_FIELD;
                                } else {
                                    action = UPDATE_FIELD;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        case "mx":
                            var currentMX = results[0].mx;
                            var mx = req.body.mx;

                            // currentMX != mx, then it needs to update
                            if(currentMX.localeCompare(mx) != 0) {
                                if(mx.localeCompare("") == 0){
                                    action = DELETE_MX;
                                } else {
                                    action = UPDATE_MX;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        case "ns":
                            var currentNS = results[0].ns;
                            var ns = req.body.ns;

                            console.log("ns is "+ns+", and currentNS is "+currentNS);
                            // currentNS != ns, then it needs to update
                            if(currentNS.localeCompare(ns) != 0){
                                if(ns.localeCompare("") == 0){
                                    action = DELETE_NS;
                                } else {
                                    action = UPDATE_NS;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        case "cname":
                            var currentCNAME = results[0].cname;
                            var cname = req.body.cname;
                            // currentCNAME != cname, then it needs to update
                            if(currentCNAME.localeCompare(cname) != 0){
                                if(cname.localeCompare("") == 0) {
                                    action = DELETE_CNAME;
                                } else {
                                    action = UPDATE_CNAME;
                                }
                            } else {
                                toUpdate = false;
                            }
                            break;
                        default:
                            break;
                    }

                    if (toUpdate) {
                        var response = generateResponse(action, username, guid, req);

                        console.log("Construct request:" + JSON.stringify(response));

                        sendRequestToProxy(response, function (data) {
                            if (data) {
                                // If it's an operation on field, we need to update the fields to include the new key-value pair into the json object
                                if(action.localeCompare(UPDATE_FIELD) == 0 ||
                                    action.localeCompare(DELETE_FIELD) == 0){
                                    response.fields = results[0].fields;
                                    var field = req.body.field,
                                        value = req.body.value;
                                    response.fields[field] = value;
                                }
                                collection.update(
                                    {username: req.user.username},
                                    {$set: response}
                                );
                                res.send(req.user.username + ".pnsanonymous.org successfully updated!");
                            } else {
                                res.send("Unable to update record for domain "
                                    + req.user.username + ".pnsanonymous.org");
                            }
                            // db.close();
                        });
                    } else {
                        res.send("No need to update for " + req.user.username + ".pnsanonymous.org");
                    }
                }

            });

        }

    });

});

// logout: delete user from the session
router.get('/logout', function (req, res){
    req.session['user'] = null;
    res.redirect('/');
});

function generateResponse(action, username, guid, req){
    var json = {
        action: action,
        username: username,
        guid: guid
    };
    console.log("Construct JSON request before putting into action:"+JSON.stringify(json));
    switch(action){
        case UPDATE_CODE:
            json.code = req.body.code;
            break;
        case REMOVE_CODE:
            break;
        case UPDATE_RECORD:
            json.record = req.body.record;
            break;
        case DELETE_RECORD:
            break;
        case UPDATE_FIELD:
            json.field = req.body.field;
            json.value = req.body.value;
            break;
        case DELETE_FIELD:
            json.field = req.body.field;
            break;
        case UPDATE_MX:
            json.mx = req.body.mx;
            break;
        case DELETE_MX:
            break;
        case UPDATE_NS:
            json.ns = req.body.ns;
            break;
        case DELETE_NS:
            break;
        case UPDATE_CNAME:
            json.cname = req.body.cname;
            break;
        case DELETE_CNAME:
            break;
        default:
            break;
    }
    return json;
}

function sendRequestToProxy(json, next){

    var client = new net.Socket();
    client.connect(9090, '127.0.0.1', function () {
        client.write(JSON.stringify(json)+"\n");
        console.log('Connected:'+JSON.stringify(json));
    });

    client.on('data', function (data) {
        console.log('Received: ' + data);

        client.destroy(); // kill client after server's response
        next(JSON.parse(data));
    });
}

router.get('/register', function(req, res) {
    res.render(REGISTER, { });
});

router.post('/register', function(req, res) {
    console.log('Received a request:'+req);
    AM.addNewAccount({
        name 	: req.body['name'],
        email 	: req.body['email'],
        user 	: req.body['user'],
        pass	: req.body['pass']
    }, function(e){
        if (e){
            res.status(400).send(e);
            //res.render(REGISTER, { error: "Cannot connect to db when creating this account."});
        } else {
            res.status(200).send('ok');
            //res.redirect('/');
        }
    });
    /*
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render(REGISTER, { error : err.message });
        }

        var json = { action:"create", username:req.body.username };
        sendRequestToProxy(json, function(data){
            if(data) {
                MongoClient.connect(db_url, function(err, db){
                    if(err){
                        return res.render(REGISTER, { error: "Cannot connect to db when creating this account."});
                    }else {
                        //var collection = db.collection('users');
                        // no code and no record for the domain
                        json.code = "";
                        json.record = "";
                        json.fields = {};
                        json.mx = "";
                        json.ns = "";
                        json.cname = "";
                        json.guid = data.guid;
                        collection.insert([json], function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Inserted into the "users" collection. The documents inserted with "_id" are:', result);
                                passport.authenticate('local')(req, res, function () {
                                    req.session.save(function (err) {
                                        if (err) {
                                            return res.render(REGISTER, { error: "Wrong authentication when registered!"});
                                        }
                                        res.redirect('/');
                                    });
                                });
                            }
                        });
                    }

                    // db.close();
                });

            } else {
                return res.render(REGISTER, { error: "Cannot create this account on GNS, please try later."});
            }
        });


    });
    */
});


router.get('/login', function(req, res) {
    res.render(LOGIN, { user : req.user, error : req.flash(ERROR)});
});

router.post('/login', function(req, res){
    AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
        if (!o){
            res.status(400).send(e);
        }	else{
            req.session.user = o;
            if (req.body['remember-me'] == 'true'){
                res.cookie('user', o.user, { maxAge: 900000 });
                res.cookie('pass', o.pass, { maxAge: 900000 });
            }
            console.log(JSON.stringify(o));
            res.status(200).send(o);
        }
    });
    /*
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: "The account doesn't exist or the password is incorrect" }), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
    */
});

router.post('/lost-password', function(req, res){
    // look up the user's account via their email //
    AM.getAccountByEmail(req.body['email'], function(o){
        if (o){
            EM.dispatchResetPasswordLink(o, function(e, m){
                // this callback takes a moment to return //
                // TODO add an ajax loader to give user feedback //
                if (!e){
                    res.status(200).send('ok');
                }	else{
                    for (k in e) console.log('ERROR : ', k, e[k]);
                    res.status(400).send('unable to dispatch password reset');
                }
            });
        }	else{
            res.status(400).send('email-not-found');
        }
    });
});

router.get('/reset-password', function(req, res) {
    var email = req.query["e"];
    var passH = req.query["p"];
    AM.validateResetLink(email, passH, function(e){
        if (e != 'ok'){
            res.redirect('/');
        } else{
            // save the user's email in a session instead of sending to the client //
            req.session.reset = { email:email, passHash:passH };
            res.render('basic/reset', { title : 'Reset Password' });
        }
    })
});

router.post('/reset-password', function(req, res) {
    var nPass = req.body['pass'];
    // retrieve the user's email from the session to lookup their account and reset password //
    var email = req.session.reset.email;
    // destory the session immediately after retrieving the stored email //
    req.session.destroy();
    AM.updatePassword(email, nPass, function(e, o){
        if (o){
            res.status(200).send('ok');
        }	else{
            res.status(400).send('unable to update password');
        }
    })
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});


module.exports = router;