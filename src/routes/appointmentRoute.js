const express=require('express');
const router=express.Router();
const {createAppointment, cancelAppointment, getStudentAppointments}=require('../controllers/appointmentController');
const authMiddleware=require('../middleware/authMiddleware');

router.post('/book',authMiddleware,createAppointment);

router.delete('/cancel/:appointmentId',authMiddleware,cancelAppointment);

router.get('/student',authMiddleware,getStudentAppointments);

module.exports=router;