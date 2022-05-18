import { withIronSessionSsr } from "iron-session/next";
import Head from 'next/head'
import { Client } from "pg";
import SideBar from '../../components/SideBar'
import styles from '../../styles/Home.module.css'
import dashboard from '../../styles/Dashboard.module.css'
import { sessionCookie } from "../../lib/session";



export default function Page(props) {

  const data = JSON.parse(props.attendanceSheet)

  console.log(data)

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
              <th> Attendance Id</th> <th>Date</th> <th>Sheet Id</th>
              <th> Name </th> <th> Email </th> <th> Role </th>
              <th>Sign In Time</th> <th>Sign Out Time</th> 
            </tr> 

          </thead>

          <tbody>

            {
              data?.map(data => {

                const {id, created_at, attendance_id, sheet_id, name, email, role, sign_in_time, sign_out, sign_out_time  } = data

                return (
       
                  <tr key={attendance_id}> 

                    <td>{attendance_id}</td> 
                    
                    <td>{created_at}</td>  

                    <td>{sheet_id}</td> 

                    <td>{name}</td> 
                    
                    <td>{email}</td>

                    <td>{role}</td>

                    <td>{sign_in_time}</td>

                    <td>{sign_out ? sign_out_time: "User did not Sign Out"}</td>  
                        
                  </tr>)

              })

            }

            </tbody>
                  
          </table>

        </div>

      </main>

    </div>
  )
}

export const getServerSideProps = withIronSessionSsr(async () => {

  const client = new Client({connectionString: process.env.DATABASE_URL})

  await client.connect()

  const query = {
    name: 'fetch-attendances',
    text: `
        SELECT
          attendance.id as attendance_id,
          *
        FROM
          attendance
        JOIN users ON attendance.user_id = users.id
        ORDER BY
          sheet_id DESC
          `
  }

  const attendanceSheet = (await client.query(query)).rows

  client.end()

  return {
    props: {
      attendanceSheet: JSON.stringify(attendanceSheet),
    }
  }

}, sessionCookie()) 
