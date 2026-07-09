import './Aside.css'
import ItemsAside from './AsideJSON'
import { useState, useEffect } from 'react'
import iconConfig from '../../assets/Icons/icons8-config-50.png'
import iconCloseAside from '../../assets/Icons/icons8-fechar-abas-no-painel-esquerdo-48.png'
export default function Aside({ setState }) {
    const [itemsAsideActive, setItemsAsideActive] = useState(1)
    const [asideActive, setAsideActive] = useState(true)
   
    return (
        <>
            <section className={`aside w-52 hidden duration-300 fixed top-0 left-0 h-screen flex-col z-40 p-5 justify-between overflow-y-auto overflow-x-hidden ${asideActive ? '!w-20' : 'w-52'} z-20`}>
                <h1 translate='no' className={`text-white text-lg font-bold ${asideActive ? 'flex items-center justify-center' : ''}`} >{asideActive ? 'DF' : 'Dailyfoods'}</h1>
                <ul className='flex justify-center flex-col gap-4.5'>

                    {
                        ItemsAside.map(ItemsAsideMap => (
                            <li className={`text-gray-300  text-[14.5px] flex gap-3 w- p-2.5 cursor-pointer ${itemsAsideActive == ItemsAsideMap.id ? 'Active rounded-sm' : ''} ${asideActive ? ' items-center justify-center' : 'rounded-sm'}`} onClick={() => {
                                setItemsAsideActive(ItemsAsideMap.id)
                                setState(ItemsAsideMap.id)
                            }} key={ItemsAsideMap.id}>
                                <img src={ItemsAsideMap.image} alt="icons Aside" className='brightness-0 invert-100 w-5' />
                                <p className={`${asideActive ? 'hidden' : 'flex'}`}>{ItemsAsideMap.name}</p>
                            </li>
                        ))
                    }
                </ul>
                <div className={`configsAside flex items-center justify-between w-full ${asideActive ? 'justify-center' : 'justify-between'}`}>
                    <img src={iconConfig} alt="icon config" className={`w-5 cursor-pointer ${asideActive ? 'hidden' : 'flex'}`} />
                    <img src={iconCloseAside} alt="icon close Aside" className='w-5 cursor-pointer' onClick={() => setAsideActive(prev => !prev)} />
                </div>
            </section>
        </>
    )
}