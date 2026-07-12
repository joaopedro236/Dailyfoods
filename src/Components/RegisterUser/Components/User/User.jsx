import hiddenPhoto from '../../../../assets/Photos/219eaea67aafa864db091919ce3f5d82.jpg'
import './User.css'
import cardsUser from './UserCards.js'
import cameraPhoto from '../../../../assets/Icons/icons8-câmera-30.png'
export default function User({ user, formData, stateSection }) {
    return (
        <>
            <section className={`user w-full z-[80] h-screen flex-col ${user == true  && stateSection == 5? 'flex' : 'hidden'}`}>
                <header className='w-full flex flex-col items-center justify-center h-[250px] text-center relative gap-3'>
                    <figure className='relative'>
                        <img src={hiddenPhoto} alt="photo user" className='w-[130px] rounded-full' />
                        <button className='bg-white w-[25px] bottom-2 right-0 p-1 rounded-full absolute'><img src={cameraPhoto} alt="camera Photo" /></button>
                    </figure>
                    <h1 className='text-white font-[20px]'>{formData?.name}</h1>
                    <span className='text-white text-sm px-8 mt-1 relative py-0.5 font-stretch-expanded rounded-[15px]'>Verified User</span>
                </header>
                <div className="userContent py-4 p-2 flex flex-col gap-4">
                    <h3 className='pl-3'>Account management</h3>
                    <div className="cards_user flex cursor-pointer flex-col gap-2 rounded-lg">
                        {
                            cardsUser.map((cardsUserMap) => (
                                
                                    <div className='card_user flex gap-5 p-4 rounded-lg w-full items-center' key={cardsUserMap.id}>
                                        <img src={cardsUserMap.image} alt="icon card" className='icon_user w-5 '/>
                                        <p className='text-sm'>{cardsUserMap.text}</p>
                                        <p className='ml-auto font-bold'>&gt;</p>
                                    </div>
                                
                            ))
                        }
                    </div>
                </div>
            </section>
        </>
    )
}