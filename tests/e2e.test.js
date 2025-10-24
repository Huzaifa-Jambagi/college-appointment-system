const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
require("dotenv").config();

let S1token, S2token, P1token;
let professorId, appointmentId;

describe("College Appointment System E2E", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Full E2E Flow", async () => {
    // 1 Professor P1 registers & logs in

    console.log("Step 1: Professor P1 Registration");

    await request(app).post("/auth/register").send({
      name: "P1",
      email: "p1@gmail.com",
      password: "1234",
      role: "professor",
    });

    console.log("Professor P1 registered successfully");

    console.log(" Professor P1 Login");
    const profLogin = await request(app).post("/auth/login").send({
      email: "p1@gmail.com",
      password: "1234",
    });
    P1token = profLogin.body.token;
    professorId = profLogin.body.user.id;
    console.log("Professor P1 logged in successfully");

    // 2 Student A1 registers & logs in

    console.log("Step 2: Student A1 Registration");

    await request(app).post("/auth/register").send({
      name: "S1",
      email: "s1@gmail.com",
      password: "1234",
      role: "student",
    });
    console.log("Student A1 registered successfully");

    console.log(" Student A1 Login");

    const s1Login = await request(app).post("/auth/login").send({
      email: "s1@gmail.com",
      password: "1234",
    });
    S1token = s1Login.body.token;

    console.log("Student A1 logged in successfully");

    // 3 Student A2 registers & logs in

    console.log("Step 3: Student A2 Registration");
    await request(app).post("/auth/register").send({
      name: "S2",
      email: "s2@gmail.com",
      password: "1234",
      role: "student",
    });
    const s2Login = await request(app).post("/auth/login").send({
      email: "s2@gmail.com",
      password: "1234",
    });
    S2token = s2Login.body.token;
    console.log("Student A2 logged in successfully");

    // 4 Professor P1 creates availability

    console.log("Step 4: Professor P1 Creating Availability");
    const date = "2025-10-25";
    const availability = await request(app)
      .post("/availability/create")
      .set("Authorization", `Bearer ${P1token}`)
      .send({
        date,
        slots: ["10:00", "11:00", "12:00", "13:00"],
      });
    expect(availability.statusCode).toBe(201);
    console.log("Professor P1 availability created successfully");

    // 5 Student A1 checks availability for professor

    console.log("Step 5: Student A1 Checking Availability");
    const availCheck = await request(app)
      .get(`/availability/${professorId}/${date}`)
      .set("Authorization", `Bearer ${S1token}`);
    expect(availCheck.body.data.availableSlots.length).toBeGreaterThan(0);
    console.log("Student A1 checked availability successfully");

    // 6 Student A1 books appointment at time T1

    console.log("Step 6: Student A1 Booking Appointment");
    const book1 = await request(app)
      .post("/appointment/book")
      .set("Authorization", `Bearer ${S1token}`)
      .send({
        professor: professorId,
        date,
        slot: "10:00",
      });
    expect(book1.statusCode).toBe(201);
    appointmentId = book1.body.data._id;
    console.log("Student A1 booked appointment successfully");

    // 7 Student A2 books appointment at time T2

    console.log("Step 7: Student A2 Booking Appointment");
    const book2 = await request(app)
      .post("/appointment/book")
      .set("Authorization", `Bearer ${S2token}`)
      .send({
        professor: professorId,
        date,
        slot: "11:00",
      });
    expect(book2.statusCode).toBe(201);
    console.log("Student A2 booked appointment successfully");

    // 8 Professor P1 cancels Student A1's appointment

    console.log("Step 8: Professor P1 Cancelling  A1's Appointment");
    const cancel = await request(app)
      .delete(`/appointment/cancel/${appointmentId}`)
      .set("Authorization", `Bearer ${P1token}`);
    expect(cancel.statusCode).toBe(200);
    console.log("Professor P1 cancelled Student A1's appointment successfully");

    // 9 Student A1 checks their appointments — should be empty

    console.log("Step 9: Student A1 Checking Appointments");
    const studentAppointments = await request(app)
      .get("/appointment/student")
      .set("Authorization", `Bearer ${S1token}`);
    expect(studentAppointments.body.data.length).toBe(0);
    console.log("Student A1 has no appointments as expected");
  });
});
