const Availability = require('../models/availabilityModel');
const Appointment = require('../models/appointmentModel');

const createAvailability = async (req, res) => {
    try {
        const { date, slots } = req.body;

        const startDay = new Date(date);
        startDay.setHours(0, 0, 0, 0); 

        const endDay = new Date(date);
        endDay.setHours(23, 59, 59, 999); 

        if (req.user.role !== 'professor') {
            return res.status(403).json({
                 success: false,
                  message: 'Only professors can create availability'
                 });
        }

        if (!date || !slots || slots.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date and time slots are required' 
             });
        }
        const professor = req.user.id;

        let existingAvailability = await Availability.findOne({
             professor,
              date :{$gte:startDay, $lte:endDay}
            })

        if (existingAvailability) {

            slots.forEach((slot) => {
                if (!existingAvailability.slots.includes(slot)) {
                    existingAvailability.slots.push(slot)
                }
            });
         await existingAvailability.save();
      
         existingAvailability = await existingAvailability.populate('professor', 'name');
         
     res.status(200).json({ 
                success: true, 
                message: 'Availability updated',
                data: existingAvailability 
            });

        } else {
            let newAvailability=await Availability.create({
               professor,
                date,
                slots
            })

            newAvailability = await newAvailability.populate('professor', 'name');

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

        let  availability = await Availability.findOne(
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
        
        availability= await availability.populate('professor', 'name');

        const bookedAppointments = await Appointment.find(
            {
                 professor, 
                 date: { $gte:startDay, $lte:endDay }, 
                 status: 'booked' 
                
            });

        const bookedSlots = bookedAppointments.map(appointment => appointment.slot);

        const availableSlots = availability.slots.filter(slot => !bookedSlots.includes(slot));

        const availabilityData={
           professorId:professor,
           professorName:availability.professor.name,
           date: startDay,
           availableSlots
        }

        res.status(200).json({ 
            success: true, 
            message: 'Availability fetched successfully',
            data:availabilityData
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