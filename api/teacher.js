var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var teacher_list = [];
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.post('/list', function(req, res, next) {
    var searchText = req.body.searchText;
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.default_limit;
    var sort = req.body.sort;

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        connection.query(`SELECT teachers.id,first_name,last_name,phone,email,current_courses 
        FROM teachers,users
        WHERE teachers.id = users.id`, function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }

            teacher_list = result.rows;
            var search_list = [];
            if (searchText == null) {
                search_list = teacher_list;
            } else {
                for (var i = 0; i < teacher_list.length; i++) {
                    if (teacher_list[i].first_name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 || teacher_list[i].last_name.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(teacher_list[i]);
                    }
                }
            }
            if (sort != 'none') {
                _global.sortListByKey(sort, search_list, 'last_name');
            }
            if (limit == -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    page: page,
                    limit: limit,
                    teacher_list: search_list
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    page: page,
                    limit: limit,
                    teacher_list: _global.filterListByPage(page, limit, search_list)
                });
            }
            done();
        });
    });
});

router.get('/detail/:id', function(req, res, next) {
    var id = req.params['id'];
    pool_postgres.connect(function(error, connection, done) {
        connection.query(format(`SELECT users.*,current_courses FROM users join teachers on users.id = teachers.id WHERE users.id = %L LIMIT 1`, id), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            var teacher = result.rows[0];
            connection.query(format(`SELECT courses.id, teacher_teach_course.teacher_role, courses.code AS course_code, 
                                    courses.name AS course_name,class_has_course.attendance_count,classes.name AS class_name,
                                    semesters.name AS semester_name 
                FROM teacher_teach_course , courses, classes , semesters , class_has_course 
                WHERE teacher_teach_course.course_id = courses.id AND courses.id = class_has_course.course_id AND
                 teacher_teach_course.teacher_id = %L AND classes.id = class_has_course.class_id AND
                  semesters.id = courses.semester_id `, id), function(error, result, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                res.send({ result: 'success', teacher: teacher, teaching_courses: result.rows });
                done();
            });
        });
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.first_name == '') {
        _global.sendError(res, null, "First name is required");
        return;
    }
    if (req.body.last_name == '') {
        _global.sendError(res, null, "Last name is required");
        return;
    }
    if (req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    if (isNaN(req.body.phone)) {
        _global.sendError(res, null, "Invalid Phone Number");
        return;
    }
    var new_first_name = req.body.first_name;
    var new_last_name = req.body.last_name;
    var new_email = req.body.email;
    var new_phone = req.body.phone;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        connection.query(format(`SELECT email FROM users WHERE email= %L LIMIT 1`, new_email), function(error, result, fields) {
            if (error) {
                _global.sendError(res, error.message);
                done();
                return console.log(error);
            }
            //check email exist
            if (result.rowCount > 0) {
                _global.sendError(res, "Email already existed");
                done();
                return console.log("Email already existed");
            }
            //new teacher data
            var new_password = new_email.split('@')[0];
            var new_user = [[
                new_first_name,
                new_last_name,
                new_email,
                new_phone,
                bcrypt.hashSync(new_password, 10),
                _global.role.teacher
            ]];
            //begin adding teacher
            connection.query('BEGIN', function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    done();
                    return console.log(error);
                }
                //add data to user table
                connection.query(format('INSERT INTO users (first_name,last_name,email,phone,password,role_id) VALUES %L', new_user), function(error, result, fields) {
                    if (error) {
                        _global.sendError(res.error.message);
                        return connection.query('ROLLBACK', function(error) {
                            done();
                            return console.log(error);
                        });
                    }
                    connection.query('COMMIT', function(error) {
                        if (error) {
                            _global.sendError(res.error.message);
                            return connection.query('ROLLBACK', function(error) {
                                done();
                                return console.log(error);
                            });
                        }
                        console.log('success adding teacher!');
                        res.send({ result: 'success', message: 'Teacher Added Successfully' });
                        done();
                    });
                });
            });
        });
    });
});

router.put('/update', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == '') {
        _global.sendError(res, null, "Teacher id is required");
        return;
    }
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    if (req.body.phone == undefined || isNaN(req.body.phone)) {
        _global.sendError(res, null, "Invalid Phone Number");
        return;
    }
    var user_id = req.body.id;
    var new_last_name = _global.getLastName(req.body.name);
    var new_first_name = _global.getFirstName(req.body.name);
    var new_email = req.body.email;
    var new_phone = req.body.phone;
    var new_avatar = req.body.avatar ? req.body.avatar : 'http://i.imgur.com/FTa2JWD.png';

    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }

        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //update user table
            function(callback) {
                connection.query(format(`UPDATE users SET first_name = %L, last_name = %L, email = %L, phone = %L, avatar = %L WHERE id = %L`, new_first_name, new_last_name, new_email, new_phone,new_avatar, user_id), function(error, result, fields) {
                    if (error) {
                        console.log(error.message + ' at Update Users info');
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Commit transaction
            function(callback) {
                connection.query('COMMIT', function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function(error) {
            if (error) {
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', function() {
                    done();
                    return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                console.log('success updating profile!---------------------------------------');
                res.send({ result: 'success', message: 'Profile Updated Successfully' });
                done();
            }
        });
    });
});

router.post('/import', function(req, res, next) {
    if (req.body.teacher_list == undefined || req.body.teacher_list.length == 0) {
        _global.sendError(res, null, "Teacher list is required");
        return;
    }
    var teacher_list = req.body.teacher_list;
    pool_postgres.connect(function(error, connection, done) {
        if (error) {
            _global.sendError(res, error.message);
            done();
            return console.log(error);
        }
        var class_id = 0;
        async.series([
            //Start transaction
            function(callback) {
                connection.query('BEGIN', function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //Insert student into class
            function(callback) {
                async.each(teacher_list, function(teacher, callback) {
                    connection.query(format(`SELECT id FROM users WHERE email = %L LIMIT 1`, teacher.email), function(error, result, fields) {
                        if (error) {
                            console.log(error.message + ' at check teacher exist');
                            callback(error);
                        } else {
                            if (result.rowCount == 0) {
                                //new teacher to system
                                var new_user = [[
                                    teacher.first_name,
                                    teacher.last_name,
                                    teacher.email,
                                    teacher.phone,
                                    _global.role.teacher,
                                    bcrypt.hashSync(teacher.email.split('@')[0], 10),
                                ]];
                                connection.query(format(`INSERT INTO users (first_name,last_name,email,phone,role_id,password) VALUES %L`, new_user), function(error, result, fields) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        callback();
                                    }
                                });
                            } else {
                                //old teacher => ignore
                                callback();
                            }
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Commit transaction
            function(callback) {
                connection.query('COMMIT', function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function(error) {
            if (error) {
                _global.sendError(res, null, error.message);
                connection.query('ROLLBACK', function() {
                    done();
                    return console.log(error);
                });
                done();
                return console.log(error);
            } else {
                console.log('success import teachers!---------------------------------------');
                res.send({ result: 'success', message: 'Teachers imported successfully' });
                done();
            }
        });
    });
});
module.exports = router;
