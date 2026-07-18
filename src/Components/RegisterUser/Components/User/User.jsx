import hiddenPhoto from '../../../../assets/Photos/219eaea67aafa864db091919ce3f5d82.jpg'
import './User.css'
import cardsUser from './UserCards.js'
import { useState, useEffect } from 'react'
import cameraPhoto from '../../../../assets/Icons/icons8-câmera-30.png'
export default function User({ user, formData, stateSection }) {
    const firstname = formData?.name?.trim().split(' ')[0] || ''
    const [data, setData] = useState(new Date())
    useEffect(() => {
        const time = setInterval(() => {
            setData(new Date())
        }, 1000)
        return () => clearInterval(time)
    }, [])
    return (
        <>
            <section className={`user w-full z-[80] h-screen flex-col ${user == true && stateSection == 5 ? 'flex' : 'hidden'}`}>
                <nav className='p-2 pl-3 hidden items-start w-full items-center justify-between px-6'>
                    <header>
                        <h1 className='text-black'>Hello, {firstname}!👍</h1>
                        <p className='text-gray-400 text-sm'>Welcome back</p>
                    </header>
                    <div className='flex gap-3 items-center '>
                        <img src={hiddenPhoto} alt="photo user" className='w-[30px] rounded-full' />
                        <p className='text-sm'>{formData?.name?.trim().split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                </nav>
                <div className="userContent flex flex-col gap-1 relative">
                    <header className='userHeader w-full flex flex-col items-center justify-center h-[250px] text-center relative gap-3'>
                        <figure className='relative'>
                            <img src={hiddenPhoto} alt="photo user" className='w-[130px] rounded-full' />
                            <button className='bg-white w-[25px] bottom-2 right-0 p-1 rounded-full absolute'><img src={cameraPhoto} alt="camera Photo" /></button>
                        </figure>
                        <div className="userHeaderContent flex flex-col  justify-center items-center">
                            <h1 className='text-white font-[20px]'>{formData?.name}</h1>
                            <span className='text-white text-sm w-full max-w-[170px] mt-1 relative py-0.5  font-stretch-expanded rounded-[15px]'>Verified User</span>
                        </div>
                    </header>



                    <div className="cardContent_user py-6 p-2 w-full  flex flex-col gap-4">
                        <h3 className='pl-3'>Account management</h3>
                        <div className="cards_user flex cursor-pointer flex-col gap-2 rounded-lg">
                            {
                                cardsUser.map((cardsUserMap) => (

                                    <div className='card_user flex gap-5 p-4 rounded-lg w-full items-center' key={cardsUserMap.id}>
                                        <img src={cardsUserMap.image} alt="icon card" className='icon_user w-5 ' />
                                        <p className='text-sm'>{cardsUserMap.text}</p>
                                        <p className='ml-auto font-bold'>&gt;</p>
                                    </div>

                                ))
                            }
                        </div>
                    </div>
                </div>
                <article className='flex w-full flex-col p-5 gap-5'>
                    <div className="cardsArticle_user items-center flex flex-wrap gap-5 justify-center w-full">
                        <div className="promotion w-full max-w-[450px] h-[200px] items-center justify-center flex px-4 flex-col rounded-[20px]">
                            <div className="promotionTexts flex flex-col">
                                <h1 className='text-[23px]'>Invite your friends and get a discount.</h1>
                                <p className='text-[14px] text-gray-700'>Share your code and earn rewards.</p>
                                <button className='w-full h-[40px] text-sm mt-4 rounded-lg text-white'>Invite Friends</button>
                            </div>
                        </div>
                        <div className="time promotion w-full rounded-[20px] max-w-[400px] h-[200px] flex  flex-col items-center justify-center ">
                            
                            <h1 className='text-[50px] font-bold'>{data.toLocaleTimeString()}</h1>
                        </div>
                    </div>
                    
                </article>
            </section>
        </>
    )
}