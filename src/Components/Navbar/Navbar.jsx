import './Navbar.css'
import { useState, useEffect, useRef } from 'react'
import iconSearch from '../../assets/Icons/icons8-pesquisar-30.png'
import itemsNavbar from './NavbarJSON'
import iconMenu from '../../assets/Icons/icons8-cardápio-48.png'

export default function Navbar({setState, state}) {
    const [inputItemsActive, setInputItemsActive] = useState(false)
    const [menuActive, setMenuActive] = useState(false)
    const [textMenuActive, setTextMenuActive] = useState(1)
   
    return (
        <>
            <section className={`navbar fixed w-full top-0 z-50 left-0 p-4 justify-between h-14  flex items-center`}>
                <h1 className='text-lg text-white font-bold'>Dailyfood</h1>
            <button className='btnMenu w-[20px] z-40 flex items-center justify-center h-min' onClick={() => setMenuActive(true)}>
                <img src={iconMenu} alt="icon Menu" className='btnMenu invert-100  ' />
            </button>
            </section>
            <section className={`menu fixed top-0 left-0 z-50 w-full h-screen flex items-center p-10 duration-300 ${menuActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <button className='text-white fixed top-10 right-10 cursor-pointer ' onClick={() => setMenuActive(false)}>X</button>
                <ul className='flex flex-col gap-2.5'>
                    {
                        itemsNavbar.map((ItemsMenuMap) => (

                            <li key={ItemsMenuMap.id} className={`duration-300 text-gray-300 text-lg font-bold cursor-pointer ${ItemsMenuMap.id == textMenuActive ? 'text-white Active' : 'text-gray-300'}`} onClick={() => {
                                setTextMenuActive(ItemsMenuMap.id)
                                setState(ItemsMenuMap.id)
                                setMenuActive(false)
                            }}>{ItemsMenuMap.name}</li>

                        ))
                    }
                </ul>
            </section>
        </>
    )
}