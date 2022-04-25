import Link from 'next/link'
import styles from '../styles/SideBar.module.css'

const SideBar = () => {

    return (
        <nav className={styles.sidebar}>

            <ul>

                <li> <Link href="/dashboard"> Dashboard</Link> </li>

                <li> <Link href="/dashboard/attendance"> Attendance </Link> </li>

                <li> <Link href="/dashboard/attendance-sheet"> Attendance Sheet </Link> </li>

            </ul>

        </nav>
    )

}

export default SideBar