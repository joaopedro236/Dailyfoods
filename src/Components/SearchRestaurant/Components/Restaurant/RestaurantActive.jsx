import './RestaurantActive.css'
import { useState } from 'react'
export default function Restaurant({ restaurant, restaurantActive, setRestaurantActive }) {
    if (!restaurant) return null
    const orders = restaurant.orderName.map((name, index) => ({
        name,
        image: restaurant.orderImage[index],
        price: restaurant.orderPrice[index],
        description: restaurant.orderDescription[index],
        state: restaurant.orderState[index],
        comments: restaurant.restaurantComments
    }))
    const [orderActive, setOrderActive] = useState(-1)
    const [comment, setComment] = useState('')
    const sendComment = async () => {
        const formData = new FormData();

        formData.append("restaurantComments", comment);

        await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        setComment("");
    };
    return (
        <>
            <section className={`restaurantActive w-full absolute top-0 left-0 flex flex-col gap-2  duration-200 ${restaurantActive !== -1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <header className='restaurantActiveHeader pt-[50px] w-full flex flex-col gap-2 items-center justify-center py-3'>
                    <img src={restaurant.image} alt="photo restaurant" className='w-full max-w-[140px] rounded-full' />
                    <h1 className='text-white text-[17.5px]'>{restaurant.name}</h1>
                </header>
                <div className="restaurantActiveContent flex flex-col w-full gap-6 p-3">
                    <header className='flex items-center justify-between'>
                        <h1>Orders</h1>
                        <p className='text-sm cursor-pointer' onClick={() => setRestaurantActive(-1)}>Back</p>
                    </header>
                    <div className="orders_restaurantActive flex flex-col gap-3 w-full">
                        {
                            orders?.map((restaurantMap, index) => (
                                <div className={`order_restaurantActive flex items-center cursor-pointer gap-4 p-2 w-full ${orderActive === index ? 'flex-col items-start !opacity-100' : ''}`} key={index} onClick={() => setOrderActive(orderActive === index ? -1 : index)}>
                                    <img src={`http://localhost:8000/uploadsOrders/${restaurantMap?.image}`} alt="orders image" className='w-full max-w-[65px] rounded-lg' />
                                    <h1>{restaurantMap?.name}</h1>
                                    <p className={`${orderActive === index ? 'flex' : 'hidden'}`}>{restaurantMap?.description}</p>
                                    <p className='ml-auto text-sm'>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(restaurantMap?.price ?? 0)}</p>
                                </div>
                            ))
                        }
                    </div>
                    <div className="comments flex flex-col gap-7">
                        <header className='flex '>
                            <h1>Create Comments</h1>
                        </header>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder='Write your comment...'
                            className='rounded-lg bg-white p-4 '
                        />
                        <button onClick={sendComment} className='submitComment text-white rounded-lg p-3'>Send</button>
                        <h1>Comments</h1>

                        <div className='comment flex flex-col gap-3 ' >
                            {
                                restaurant?.restaurantComments.map((comments, index) => (

                                    <p key={index}>{comments}</p>
                                ))
                            }
                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}