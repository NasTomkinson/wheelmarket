import Link from 'next/link'

export default function AccountSidebar () { 
    return (
        <aside className="sidebar"> 
            <div className="sidebar_nav"> 
                <ul>
                    <li className="sidebar_nav-item"> <h3> Account </h3> </li>
                    <li className="sidebar_nav-item"> <Link href="/account/listings"> My listings </Link> </li>
                    <li className="sidebar_nav-item"> <Link href="/account"> Orders </Link> </li>
                </ul>
                <ul>
                    <li className="sidebar_nav-item"> <h3> Settings  </h3> </li>
                    <li className="sidebar_nav-item"> <Link href="/account"> Preferences </Link> </li> 
                </ul> 
                <ul>
                    <Link href="/account/listings/new" className="btn btn-primary"> Sell my wheels </Link>
                </ul>
            </div>
        </aside>
    )
}