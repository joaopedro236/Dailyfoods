import './BanBruteForce.css'
import PhotoBan from '../../assets/Photos/Ban.png'
export default function BanBruteForce({ban}){
    return(
        <>
        <section className={`BanBruteForce absolute ${ban ? 'flex' : 'hidden'} items-center justify-center z-[999] w-full h-screen top-0 left-0`}>
            <img src={PhotoBan} alt='Photo ban' className='w-full max-w-[350px]'/>
        </section>
        </>
    )
}   