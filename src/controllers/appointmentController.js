const Appointment = require("../models/appointmentModel");
const Availability = require("../models/availabilityModel");

const createAppointment = async (req, res) => {
  try {
    const { professor, date, slot } = req.body;

    const startDay = new Date(date);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(date);
    endDay.setHours(23, 59, 59, 999);

    if (req.user.role !== "student") {
      return res.status(403).json({
          success: false,
          message: "Only students can book appointments",
        });
    }

    const alreadyBooked = await Appointment.findOne({
      professor,
      date: { $gte: startDay, $lte: endDay },
      slot,
      status: "booked",
    });

    if (alreadyBooked) {
      return res.status(400).json({ 
        success: false,
         message: "This slot is already booked"
         });
    }

    const availability = await Availability.findOne({
      professor,
      date: { $gte: startDay, $lte: endDay },
      slots: slot,
    });

    if (!availability) {
      return res.status(400).json({
          success: false,
          message: "Prof is not available for the selected slot",
        });
    }

    const appointment = await Appointment.create({
      student: req.user.id,
      professor,
      date,
      slot,
      status: "booked",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: `Error in booking appointment: ${error.message}`,
    })
  };
}

const cancelAppointment = async (req, res) => {
    try {
        if(req.user.role!=='professor'){
            return res.status(401).json({
                success:false,
                message:'Only professors can cancel appointments'
            });
        }

        const { appointmentId } = req.params;        

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
         if(req.user.id!==appointment.professor.toString()){
            return res.status(403).json({
                success:false,
                message:'You are not authorized to cancel this appointment'
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error in cancelling appointment: ${error.message}`
        });
    }
}

const getStudentAppointments = async (req, res) => {
    try {
        if(req.user.role!=='student'){
        return res.status(403).json({
            success:false,
            message:'Only students can view their appointments'
        })
      
    }
        const appointments = await Appointment.find({student:req.user.id}).populate('professor','name email');
        res.status(200).json({
            success:true,
            message:'Appointments fetched successfully',
            data:appointments
        });
    }
     catch (error) {
        res.status(500).json({
            success: false,
            message: `Error in fetching appointments: ${error.message}`
        });
    }
}
module.exports = {createAppointment, cancelAppointment, getStudentAppointments};
