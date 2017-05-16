/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : qldd

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2017-05-08 13:11:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for absence_requests
-- ----------------------------
DROP TABLE IF EXISTS `absence_requests`;
CREATE TABLE `absence_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for attendance
-- ----------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `student_count` tinyint(1) DEFAULT NULL,
  `teacher_checkin` datetime DEFAULT NULL,
  `teacher_checkout` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `validation_time` datetime DEFAULT NULL,
  `addition_info` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for attendance_detail
-- ----------------------------
DROP TABLE IF EXISTS `attendance_detail`;
CREATE TABLE `attendance_detail` (
  `attendance_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_time` datetime DEFAULT NULL,
  `attendance_type` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`attendance_id`,`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for classes
-- ----------------------------
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'missing class name',
  `email` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `semester_id` tinyint(1) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `attendance_count` tinyint(1) NOT NULL DEFAULT '0',
  `total_stud` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for feedbacks
-- ----------------------------
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_id` int(11) DEFAULT NULL,
  `to_id` int(11) DEFAULT NULL,
  `type` tinyint(1) DEFAULT NULL,
  `title` varchar(50) CHARACTER SET utf8 NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP,
  `object_id` int(11) DEFAULT NULL,
  `object_type` tinyint(1) DEFAULT NULL,
  `user_action` tinyint(1) DEFAULT NULL,
  `field` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `old_value` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `new_value` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for programs
-- ----------------------------
DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'missing program name',
  `code` varchar(10) COLLATE utf8_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'role name',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for semesters
-- ----------------------------
DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `id` int(11)  NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '???',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `vacation_time` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `stud_id` varchar(10) CHARACTER SET utf8 NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `current_courses` tinyint(1) DEFAULT '0',
  `note` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for student_enroll_course
-- ----------------------------
DROP TABLE IF EXISTS `student_enroll_course`;
CREATE TABLE `student_enroll_course` (
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_status` tinyint(1) DEFAULT '0',
  `enrollment_status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`course_id`,`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for teachers
-- ----------------------------
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `current_courses` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for teacher_teach_course
-- ----------------------------
DROP TABLE IF EXISTS `teacher_teach_course`;
CREATE TABLE `teacher_teach_course` (
  `teacher_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_role` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`teacher_id`,`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lastname` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `fisrtname` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `phone` varchar(12) CHARACTER SET utf8 DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for votes
-- ----------------------------
DROP TABLE IF EXISTS `votes`;
CREATE TABLE `votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `rate` tinyint(1) DEFAULT NULL,
  `note` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for class_has_course
-- ----------------------------
DROP TABLE IF EXISTS `class_has_course`;
CREATE TABLE `class_has_course` (
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `schedules` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`class_id`,`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;