import './filtersRestaurant.css'
export default function Filters_Restaurant({state,setState,filterOrdersExists ,setFilterOrdersExists}){
    return (
        <>
        <section className={`filtersRestaurant duration-300 ${state == true ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} flex gap-12  flex-col pt-[17px] z-[90] absolute top-0 left-0 w-full h-screen`}>
            <header className='flex h-min items-center justify-between w-full px-4'>
                <h1 className='text-[21px]'>Filters</h1>
                <button className='bg-transparent border-none font-bold' onClick={() => setState(false)}>X</button>
            </header>
            <div className="filtersContent flex flex-col gap-2 px-2 w-full">
                <div className="filter flex items-center justify-between px-2 w-full">
                    <button className='flex items-center py-3 justify-between w-full ' onClick={() => setFilterOrdersExists(prev => !prev)}> 
                        <h1 className={`${filterOrdersExists ? 'text-black' : 'text-gray-800'}`}>Hide no-menu</h1>
                        <h1 className={`${filterOrdersExists ?'flex' : 'hidden'}`}>✓</h1>
                    </button>
                </div>
            </div>
        </section>
        </>
    )
}