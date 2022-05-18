import { withIronSessionApiRoute } from "iron-session/next";
import { parseBody } from '../../lib/parseBody';
import { sessionCookie } from '../../lib/session';
import { Client } from "pg";
  
export default withIronSessionApiRoute( async function handler(req, res) {

    const {sheet_id, action} = parseBody(req.body)

    const user = req.session.user

    const client = new Client({connectionString: process.env.DATABASE_URL})

    await client.connect()

    const query = {
        name: 'fetch-attendance',
        text: `
            SELECT
                *
            FROM
                attendance
            WHERE
                user_id = $1
                AND sheet_id = $2;
                `,
            values: [user.id, sheet_id],
    }
    
    const attendance = (await client.query(query)).rows[0]

    //check if atendance have been created
    if (!attendance) {

        const query = {
            name: 'insert-attendance',
            text: `
                INSERT INTO
                    attendance (user_id, sheet_id)
                VALUES
                    ($1, $2)
                RETURNING *;
                    `,
                values: [user.id, sheet_id],
            }
    
        const attendance = (await client.query(query)).rows[0]

        await client.end()

        return res.json({status: "success", data: attendance});

    } else if (action === "sign-out") {
        
        const query = {
            name: 'insert-attendance',
            text: `
                UPDATE
                    attendance
                SET
                    sign_out = TRUE,
                    sign_out_time = CURRENT_TIMESTAMP
                WHERE
                    id = $1
                RETURNING *;
                    `,
                values: [attendance.id],
            }
    
        const data = (await client.query(query)).rows[0]

        await client.end()

        return res.json({status: "success", data });
    }

    res.json({status: "success", data: attendance});
    
}, sessionCookie())
