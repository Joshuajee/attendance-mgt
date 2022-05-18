import { withIronSessionSsr } from "iron-session/next";
import Head from 'next/head'
import { useState, useCallback } from "react";
import { Client } from "pg";
import SideBar from '../../components/SideBar'
import styles from '../../styles/Home.module.css'
import dashboard from '../../styles/Dashboard.module.css'
import { sessionCookie } from "../../lib/session";
import { postData } from "../../lib/request";


export default function Page(props) {

  const [attendanceSheet, setState] = useState(JSON.parse(props.attendanceSheet));

  const sign = useCallback((action="") => {

    const body = {
      id: attendanceSheet.id,
      action
    }

    postData("/api/sign-attendance", body).then(data => {

      if (data.status === "success") {

        setState(prevState => {

          const newState = {...prevState}

          newState = data.data

          return newState

        })
     
      }

    })

  }, [attendanceSheet])


  const createAttendance = useCallback(() => {

    postData("/api/create-attendance").then(data => {

      if (data.status === "success") {
        alert("New Attendance Sheet Created")
        setState({...data.data})
      }

    })

  }, [])

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

          {
            props.isAdmin && <button className={dashboard.create} onClick={createAttendance}>Create Attendance Sheet</button>
          }
            
          { attendanceSheet &&

            <table className={dashboard.table}>
              <thead>
                <tr> 
                  <th>Id</th> <th>Created At</th> <th>Sign In</th> <th>Sign Out</th> 
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{attendanceSheet.id}</td>
                  <td>{attendanceSheet.created_at}</td>
                  <td>{attendanceSheet.sign_in_time ? attendanceSheet.sign_in_time: <button onClick={() => sign("sign")}> Sign In </button> }</td>
                  <td>{attendanceSheet.sign_out ? attendanceSheet.sign_out_time: <button onClick={() => sign("sign-out")}> Sign Out </button> }</td>  
                </tr>
              </tbody>

            </table>

          }
          
        </div>

      </main>

    </div>
  )
}

export const getServerSideProps = withIronSessionSsr( async ({req}) => {

  const user = req.session.user

  const client = new Client({connectionString: process.env.DATABASE_URL})

  await client.connect()

  const attendanceSheetQuery = {
    name: 'fetch-attendance-sheet',
    text: `SELECT * FROM attendance_sheet ORDER BY id DESC LIMIT 1`
  }

  const sheet = (await client.query(attendanceSheetQuery)).rows[0]

  const query = {
    name: 'fetch-attendance',
    text: `
          SELECT
            *
          FROM
            attendance
          WHERE
            sheet_id = $1
          AND user_id = $2;`,
          values: [sheet?.id,user.id],
  }

  const attendanceSheet = (await client.query(query)).rows[0]

  if (attendanceSheet)
    return {
      props: {
        attendanceSheet: JSON.stringify(attendanceSheet),
        isAdmin: user.role === "ADMIN"
      }
    }

  if (sheet)
    return {
      props: {
        attendanceSheet: JSON.stringify(sheet),
        isAdmin: user.role === "ADMIN"
      }
    }
  
  return {
    props: {
      attendanceSheet: null,
      isAdmin: user.role === "ADMIN"
    }
  }

}, sessionCookie()) 
