import { withIronSessionApiRoute } from "iron-session/next";
import { sessionCookie } from '../../lib/session';
import { Client } from "pg";
  
export default withIronSessionApiRoute( async function handler(req, res) {

  const user = req.session.user

  const client = new Client({connectionString: process.env.DATABASE_URL})

  await client.connect()

  const query = {
    name: 'insert-attendance-sheet',
    text: `
        INSERT INTO
          attendance_sheet (user_id)
        VALUES
          ($1)
        RETURNING *;
          `,
        values: [user.id],
    }

  const attendanceSheet = (await client.query(query)).rows[0]

  await client.end()

  res.json({status: "success", data: attendanceSheet});
    
}, sessionCookie())
