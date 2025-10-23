const Availability = require('../models/availabilityModel');
const Appointment = require('../models/appointmentModel');

const createAvailability = async (req, res) => {
    try {
        const { date, timeSlots } = req.body;

        const startDay = new Date(date);
        startDay.setHours(0, 0, 0, 0); 

        const endDay = new Date(date);
        endDay.setHours(23, 59, 59, 999); 

        if (req.user.role !== 'professor') {
            return res.status(403).json({ success: false, message: 'Only professors can create availability' });
        }

        if (!date || !timeSlots || timeSlots.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date and time slots are required' 
             });
        }
        const professor = req.user.id;

        const existingAvailability = await Availability.findOne({
             professor,
              date :{$gte:startDay, $lte:endDay}
            })

        if (existingAvailability) {

            timeSlots.forEach((slot) => {
                if (!existingAvailability.slots.includes(slot)) {
                    existingAvailability.slots.push(slot)
                }
            });
         await existingAvailability.save();

     res.status(200).json({ 
                success: true, 
                message: 'Availability updated',
                data: existingAvailability 
            });

        } else {
            const newAvailability=await Availability.create({
               professor,
                date,
                slots: timeSlots,
            })
            res.status(201).json({ 
                success: true, 
                message:'Availability created successfully',
                 data:newAvailability 
            });
        }
    } catch (error) {
 res.status(500).json({ 
            success: false, 
            message: `Error in creating availability: ${error.message}` 
        });    
    }
}

const checkAvailability = async (req, res) => {
    try {
        const { professor, date } = req.params;
        const startDay= new Date(date);
        startDay.setHours(0, 0, 0, 0);

        const endDay= new Date(date);
        endDay.setHours(23, 59, 59, 999);

        const availability = await Availability.findOne(
            {
                 professor,
                 date: { $gte:startDay, $lte:endDay }

            });

        if(!availability){
            return res.status(404).json({ 
                success: false,
                 message: 'No availability found for the given professor and date' 
            });
        }

        const bookedAppointments = await Appointment.find(
            {
                 professor, 
                 date: { $gte:startDay, $lte:endDay }, 
                 status: 'booked' 
                
            });

        const bookedSlots = bookedAppointments.map(appointment => appointment.slot);

        const availableSlots = availability.slots.filter(slot => !bookedSlots.includes(slot));

        const checkAvailability={
           professor,
           date: startDay,
           availableSlots
        }

        res.status(200).json({ 
            success: true, 
            message: 'Availability fetched successfully',
            data:checkAvailability
         });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `Error in checking availability: 
            ${error.message}`
         });
    }
}

module.exports = { createAvailability, checkAvailability };