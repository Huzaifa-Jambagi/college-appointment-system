const express=require('express');
const router=express.Router();
const {bookAppointment, cancelAppointment, getStudentAppointments}=require('../controllers/appointmentController');
const authMiddleware=require('../middleware/authMiddleware');

router.post('/book',authMiddleware,bookAppointment);

router.delete('/cancel/:appointmentId',authMiddleware,cancelAppointment);

router.get('/student',authMiddleware,getStudentAppointments);

module.exports=router;