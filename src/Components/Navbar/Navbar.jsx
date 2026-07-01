import './Navbar.css'
import { useState, useEffect,useRef } from 'react'
import iconSearch from '../../assets/icons8-pesquisar-30.png'
import ItemsNavbar from './NavbarJSON'
export default function Navbar() {
    const [inputActive, setInputActive] = useState(false)
    const [navbarEffect, setNavbarEffect] = useState(false)
    const [textActive, setTextActive] = useState(1)
    let lastStand = useRef(0)
    useEffect(() => {
        const effectNavbar = () => {
            let currentPosition = window.scrollY
            if (currentPosition < lastStand.current) {
                setNavbarEffect(false)
                
            } else {
                setNavbarEffect(true)

            }
            lastStand.current = currentPosition
        }
        window.addEventListener('scroll', effectNavbar)
        return () => window.removeEventListener('scroll', effectNavbar)
    }, [])
    return (
        <>
            <section className={`navbar fixed w-full top-0 left-0 p-5 h-32 gap-4.5 rounded-b-[25px] flex flex-col items-center ${navbarEffect ? 'opacity-0 translate-y-[-100px]' : 'opacity-100 translate-y-0'} duration-400`}>
                <div className="input relative w-full">
                    <label htmlFor="search" className='absolute pointer-events-none top-[50%] left-[50%] flex items-center gap-3 w-full p-2 pl-4 -translate-x-1/2 -translate-y-1/2'>
                        <img src={iconSearch} alt="icon search" className={`w-5 pointer-events-none ${inputActive ? 'opacity-0' : 'opacity-100'} duration-100`} />
                        <p className={`pointer-events-none text-sm ${inputActive ? 'opacity-0' : 'opacity-100'} duration-100`}>Type in a restaurant</p>
                    </label>
                    <input type="search" name="search" id="search" onChange={(e) => {
                        const text = e.target.value
                        setInputActive(text.length > 0)
                    }} className='w-full  cursor-pointer bg-white p-2.5 rounded-[20px]' />
                </div>
                <nav className='text-white flex w-full items-center gap-3 justify-center'>
                    {
                        ItemsNavbar.map((ItemsNavbarMap) => (
                            <p key={ItemsNavbarMap.id} className={`text-sm text-gray-300 cursor-pointer ${textActive === ItemsNavbarMap.id ? 'text-white' : 'text-gray-300'} duration-200`} onClick={() => setTextActive(ItemsNavbarMap.id)}>{ItemsNavbarMap.name}</p>
                        ))
                    }
                </nav>
            </section>
        </>
    )
}