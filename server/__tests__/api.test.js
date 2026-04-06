const request = require('supertest');
const { openSqlJsDatabase } = require('../db/sqlJsAdapter');
const { migrate } = require('../db/migrate');
const { seed } = require('../db/seed');
const { createApp } = require('../app');

describe('Doctor appointment API', () => {
  let db;
  let app;

  beforeEach(async () => {
    db = await openSqlJsDatabase(':memory:');
    db.pragma('foreign_keys = ON');
    migrate(db);
    seed(db);
    app = createApp(db);
  });

  afterEach(() => {
    if (db) db.close();
  });

  it('GET /doctors returns seeded doctors', async () => {
    const res = await request(app).get('/doctors').expect(200);
    expect(res.body.doctors.length).toBeGreaterThanOrEqual(3);
    expect(res.body.doctors[0]).toMatchObject({
      name: expect.any(String),
      specialization: expect.any(String),
    });
  });

  it('GET /doctors/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/doctors/99999').expect(404);
    expect(res.body.error).toBe('Information not available.');
  });

  it('GET /availability/:doctorId returns dates', async () => {
    const res = await request(app).get('/availability/1').expect(200);
    expect(res.body.dates.length).toBeGreaterThan(0);
  });

  it('GET /availability/:doctorId?date= returns slots', async () => {
    const list = await request(app).get('/availability/1').expect(200);
    const d = list.body.dates[0];
    const res = await request(app).get(`/availability/1?date=${d}`).expect(200);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(res.body.slots[0]).toMatchObject({
      id: expect.any(Number),
      slot_time: expect.any(String),
    });
  });

  it('POST /book-appointment creates appointment and locks slot', async () => {
    const list = await request(app).get('/availability/1').expect(200);
    const d = list.body.dates[0];
    const slots = await request(app).get(`/availability/1?date=${d}`).expect(200);
    const slotId = slots.body.slots[0].id;

    const res = await request(app)
      .post('/book-appointment')
      .send({
        doctorId: 1,
        slotId,
        patientName: 'Test Patient',
        patientPhone: '+15551234567',
      })
      .expect(201);

    expect(res.body.appointmentId).toBeTruthy();
    expect(res.body.status).toBe('confirmed');

    const again = await request(app)
      .post('/book-appointment')
      .send({
        doctorId: 1,
        slotId,
        patientName: 'Other',
        patientPhone: '+15559876543',
      })
      .expect(409);
    expect(again.body.error).toMatch(/available/i);
  });

  it('POST /user returns controlled reply for list doctors', async () => {
    const res = await request(app).post('/user').send({ msg: 'list doctors' }).expect(200);
    expect(res.body.reply).toContain('Dr.');
    expect(res.body.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('POST /user shows FAQ menu then answers from DB by number', async () => {
    const menu = await request(app).post('/user').send({ msg: 'menu' }).expect(200);
    expect(menu.body.reply).toContain('Choose a question');
    expect(menu.body.reply).toMatch(/clinic hours/i);
    const sid = menu.body.sessionId;

    const ans = await request(app).post('/user').send({ sessionId: sid, msg: '1' }).expect(200);
    expect(ans.body.reply).toContain('Monday');
    expect(ans.body.reply).toContain('Friday');
    expect(ans.body.sessionId).toBe(sid);
  });

  it('POST /user booking flow completes with same sessionId', async () => {
    const s1 = await request(app).post('/user').send({ msg: 'book appointment' }).expect(200);
    const sid = s1.body.sessionId;

    const s2 = await request(app).post('/user').send({ sessionId: sid, msg: '1' }).expect(200);
    expect(s2.body.sessionId).toBe(sid);
    expect(s2.body.reply).toMatch(/\d{4}-\d{2}-\d{2}/);

    const dateMatch = s2.body.reply.match(/\d{4}-\d{2}-\d{2}/);
    expect(dateMatch).toBeTruthy();
    const date = dateMatch[0];

    const s3 = await request(app).post('/user').send({ sessionId: sid, msg: date }).expect(200);
    expect(s3.body.reply).toMatch(/Available times/);

    const slotMatch = s3.body.reply.match(/(\d+)\.\s+(\d{2}:\d{2})/);
    expect(slotMatch).toBeTruthy();
    const slotRowId = slotMatch[1];

    const s4 = await request(app).post('/user').send({ sessionId: sid, msg: slotRowId }).expect(200);
    expect(s4.body.reply).toMatch(/name/i);

    const s5 = await request(app).post('/user').send({ sessionId: sid, msg: 'Jane Doe' }).expect(200);
    expect(s5.body.reply).toMatch(/phone/i);

    const s6 = await request(app)
      .post('/user')
      .send({ sessionId: sid, msg: '+15551112222' })
      .expect(200);
    expect(s6.body.reply).toMatch(/Booking confirmed/);
    expect(s6.body.reply).toMatch(/Appointment ID/);
  });
});
