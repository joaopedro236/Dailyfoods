import './RestaurantActive.css'
export default function Restaurant({ restaurant, restaurantActive, setRestaurantActive }) {
    if (!restaurant) return null
    const orders = restaurant.orderName.map((name, index) => ({
        name,
        image: restaurant.orderImage[index],
        price: restaurant.orderPrice[index],
        description: restaurant.orderDescription[index],
        state: restaurant.orderState[index]
    }));
    
    return (
        <>
            <section className={`restaurantActive w-full absolute top-0 left-0 flex flex-col gap-2 h-screen duration-200 ${restaurantActive !==-1? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <header className='restaurantActiveHeader pt-[50px] w-full flex flex-col gap-2 items-center justify-center py-3'>
                    <img src={restaurant.image} alt="photo restaurant" className='w-full max-w-[140px] rounded-full' />
                    <h1 className='text-white text-[17.5px]'>{restaurant.name}</h1>
                </header>
                <div className="restaurantActiveContent flex flex-col w-full gap-2 p-3">
                    <header className='flex items-center justify-between'>
                        <h1>Orders</h1>
                        <p className='text-sm cursor-pointer' onClick={() => setRestaurantActive(-1)}>Back</p>
                    </header>
                    <div className="orders_restaurantActive flex flex-col gap-3 w-full">
                        {
                            orders?.map((restaurantMap, index) => (
                                <div className="order_restaurantActive flex items-center cursor-pointer gap-4 p-2 w-full" key={index}>
                                    <img src={`http://localhost:8000/uploadsOrders/${restaurantMap?.image}`} alt="orders image" className='w-full max-w-[65px] rounded-lg' />
                                    <h1>{restaurantMap?.name}</h1>
                                    <p className='ml-auto text-sm'>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(restaurantMap?.price ?? 0)}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
        </>
    )
}