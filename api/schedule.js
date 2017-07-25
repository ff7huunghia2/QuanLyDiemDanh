var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

router.put('/update/', function(req, res, next) {
    if (req.body.classes == undefined) {
        _global.sendError(res, null, "Class is required");
        return;
    }
    var classes = [];
    if (Array.isArray(req.body.classes)) {
        classes = req.body.classes;
    } else {
        classes.push(req.body.classes);
    }
    pool.getConnection(function(error, connection) {
        async.each(classes, function(_class, callback) {
            connection.query(format(`UPDATE class_has_course SET schedules = %L WHERE class_id = %L AND course_id = %L`,_class.schedules, _class.class_id, _class.course_id), function(error, result, fields) {
                if (error) {
                    console.log(error.message + ' at insert class_has_course');
                    callback(error);
                } else {
                    callback();
                }
            });
        }, function(error) {
            if (error) {
                var message = error.message + ' at update schedule at class_has_course';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                console.log('updated class_has_course');
                res.send({ result: 'success', message: 'Schedule updated successfully' });
                done();
            }
        });
    });
});

router.post('/schedules-and-courses/', function(req, res, next) {
    if (req.body.program_id == undefined || req.body.program_id == 0) {
        _global.sendError(res, null, "Program is required");
        return;
    }
    if (req.body.semester_id == undefined || req.body.semester_id == 0) {
        _global.sendError(res, null, "Semester is required");
        return;
    }
    var program_id = req.body.program_id;
    var semester_id = req.body.semester_id;
    var class_id = req.body.class_id ? req.body.class_id : 0;
    pool.getConnection(function(error, connection) {
        if (class_id == 0) {
            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                FROM courses, class_has_course, classes 
                WHERE class_has_course.course_id = courses.id AND courses.semester_id = %L AND courses.program_id = %L AND class_has_course.class_id = classes.id`, semester_id, program_id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get schedule and course';
                    _global.sendError(res, message);
                    done();
                    return console.log(error);
                } else {
                    res.send({ result: 'success', courses: result });
                    done();
                }
            });
        } else {
            connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs  
                FROM courses, class_has_course, classes 
                WHERE class_has_course.course_id = courses.id AND courses.semester_id = %L AND courses.program_id = %L AND class_has_course.class_id = classes.id AND classes.id = %L`, semester_id, program_id, class_id), function(error, result, fields) {
                if (error) {
                    var message = error.message + ' at get schedule and course';
                    _global.sendError(res, message);
                    done();
                    return console.log(error);
                } else {
                    res.send({ result: 'success', courses: result });
                    done();
                }
            });
        }
    });
});

router.get('/schedules-and-courses-by-student/', function(req, res, next) {
    var student_id = req.decoded.id;
    pool.getConnection(function(error, connection) {
        connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                    (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                                    FROM teacher_teach_course,users 
                                    WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                FROM courses, class_has_course, classes , student_enroll_course
                WHERE class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND student_enroll_course.class_has_course_id = class_has_course.id 
                AND courses.semester_id = (SELECT MAX(id) from semesters) 
                AND student_enroll_course.student_id = %L`, student_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get schedule and course by student';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                res.send({ result: 'success', courses: result });
                done();
            }
        });
    });
});

router.get('/schedules-and-courses-by-teacher/', function(req, res, next) {
    var teacher_id = req.decoded.id;
    pool.getConnection(function(error, connection) {
        connection.query(format(`SELECT courses.*,class_has_course.schedules,classes.name as class_name,
                            (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                            courses.id = teacher_teach_course.course_id AND 
                            teacher_teach_course.teacher_role = 0) as lecturers,
                            (SELECT array_to_string(array_agg(CONCAT(users.first_name,' ',users.last_name)), E'\r\n')
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                            courses.id = teacher_teach_course.course_id AND 
                            teacher_teach_course.teacher_role = 1) as TAs 
            FROM courses, class_has_course, classes , teacher_teach_course 
            WHERE class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
             teacher_teach_course.course_id = class_has_course.course_id 
             AND courses.semester_id = (SELECT MAX(id) from semesters) AND teacher_teach_course.teacher_id = %L`, teacher_id), function(error, result, fields) {
            if (error) {
                var message = error.message + ' at get schedule and course by teacher';
                _global.sendError(res, message);
                done();
                return console.log(error);
            } else {
                res.send({ result: 'success', courses: result });
                done();
            }
        });
    });
});

module.exports = router;
