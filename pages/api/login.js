import { withIronSessionApiRoute } from "iron-session/next";
import { parseBody } from '../../lib/parseBody';
import { sessionCookie } from '../../lib/session';
import { Client } from "pg";

export default withIronSessionApiRoute(
    async function loginRoute(req, res) {

      const { email, password } = parseBody(req.body)

      const client = new Client({connectionString: process.env.DATABASE_URL})

      await client.connect()

      const query = {
        name: 'fetch-user',
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email],
      }

      const results = await client.query(query)

      const user = results.rows[0]

      client.end()

      if(user.password === password) {

        // get user from database then:
        user.password = undefined
        req.session.user = user
        await req.session.save();

        return res.send({ status: 'success', data: user });

      };

    res.send({ status: 'error', message: "incorrect email or password" });

  },
  sessionCookie(),
);

