import './BottomNavbar.css'
import bottomNavbarItems from './BottomNavbarJSON'
import { useState } from 'react'
export default function BottomNavbar() {
    const [itemBottomNavbarActive, setItemBottomNavbarActive] = useState(1) 
    return (
        <>
        <section className="bottomNavbar fixed w-full flex flex-col p-3 px-7 items-center justify-center bg-white bottom-0  left-0">
            <ul className='flex w-full items-center justify-between'>
                {
                    bottomNavbarItems.map((bottomNavbarItemsMap) => (
                        
                        <li key={bottomNavbarItemsMap.id} className='flex flex-col items-center cursor-pointer' onClick={() => setItemBottomNavbarActive(bottomNavbarItemsMap.id)}>
                            <img src={bottomNavbarItemsMap.image} alt="Icons Bottom Navbar" className={`w-5 grayscale opacity-85 ${itemBottomNavbarActive == bottomNavbarItemsMap.id ? 'grayscale-0 opacity-100' : 'grayscale opacity-85'} duration-300`}/>
                            <p className={`text-sm  textBottomNavbar ${itemBottomNavbarActive == bottomNavbarItemsMap.id ? 'Active' : 'text-gray-500'} duration-300`}>{bottomNavbarItemsMap.name}</p>
                        </li>
                    ))
                }
            </ul>
        </section>
        </>
    )
}