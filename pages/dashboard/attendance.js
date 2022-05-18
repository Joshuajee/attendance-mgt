import { withIronSessionSsr } from "iron-session/next";
import Head from 'next/head'
import { Client } from "pg";
import SideBar from '../../components/SideBar'
import styles from '../../styles/Home.module.css'
import dashboard from '../../styles/Dashboard.module.css'
import { sessionCookie } from "../../lib/session";



export default function Page(props) {

  const data = JSON.parse(props.attendances)

  return (
    <div>

      <Head>
        <title>Attendance Management Dashboard</title>
        <meta name="description" content="dashboard" />
      </Head>

      <div className={styles.navbar}></div>

      <main className={styles.dashboard}>

        <SideBar />

        <div className={dashboard.users}>

        <table className={dashboard.table}>

          <thead>

            <tr> 
              <th> Attendance ID</th> 
              <th>Date</th> 
              <th> Sheet ID</th> 
              <th>Sign In Time</th> 
              <th>Sign Out Time</th> 
            </tr> 

          </thead>

            <tbody>

              {
                data.map(data =>   {

                  const {id, created_at, sheet_id, sign_in, sign_out, sign_in_time, sign_out_time } = data

                  return (
                    <tr key={id}> 
                      <td>{id}</td> 
                      <td>{created_at}</td> 
                      <td>{sheet_id}</td>   
                      <td>{!sign_in? "You did not Sign In": sign_in_time }</td>
                      <td>{!sign_out? "You did not Sign Out": sign_out_time }</td>
                    </tr>
                  )

                })

              }  

            </tbody>

          </table>

        </div>

      </main>

    </div>
  )
}

export const getServerSideProps = withIronSessionSsr( async ({req}) => {

  const user = req.session.user

  const client = new Client({connectionString: process.env.DATABASE_URL})

  await client.connect()

  const query = {
    name: 'fetch-attendances',
    text: `
          SELECT
            *
          FROM
            attendance
          WHERE
            user_id = $1
          ORDER BY id DESC;`,
          values: [user.id],
  }

  const attendances = (await client.query(query)).rows

  client.end()

  return {
    props: {
      attendances: JSON.stringify(attendances),
    }
  }

}, sessionCookie()) 
