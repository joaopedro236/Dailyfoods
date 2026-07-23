import './SearchRestaurant.css'
import Filters_Restaurant from './Components/FiltersRestaurant'
import { useState, useEffect } from 'react'
import iconSearch from '../../assets/Icons/icons8-pesquisar-48.png'
export default function SearchRestaurant({ state, setState }) {
    const [SearchActive, setSearchActive] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [filterOrdersExists, setFilterOrdersExists] = useState(false);
    const [filterActive, setFilterActive] = useState(false )
    const searchItems = searchValue.trim() !== '';
    const [apiResult, setApiResult] = useState([])
    const apiUrl = import.meta.env.VITE_API_URL
    const apiCall = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/restaurants`)
            const data = await response.json()
            setApiResult(data.result)
        } catch (error) {
            console.error(error)
        }
    }
    const filteredRestaurants = apiResult
        .filter((restaurant) =>
            restaurant?.name.toLowerCase().includes(searchValue.toLowerCase())
        )
        .filter((restaurant) =>
            filterOrdersExists ? restaurant.ordersExists : true
        )


    useEffect(() => {
        apiCall()
        const interval = setInterval(() => {
            apiCall()
        }, 30000);
        return () => clearInterval(interval)
    }, [])
    const apiFilters = async () => {
        try {
            const responseFilters = await fetch(`${apiUrl}/`)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <section className={`${state == 1 ? 'flex' : 'hidden'} w-full searchSection gap-2 flex-col pt-[60px] relative`}>
                <header className='w-full flex px-3 relative justify-center'>
                    <div className='relative w-full max-w-[500px]'>
                        <label htmlFor="search" className='absolute top-[50%] -translate-y-1/2 left-3'>
                            <img src={iconSearch} alt="icon search" className={`w-5 h-5 opacity-55 duration-200 ${SearchActive ? 'opacity-100' : 'opacity-55'}`} />
                        </label>
                        <input type="search" name="search" id="search" placeholder='Search for a restaurant' onFocus={() => setSearchActive(true)} onBlur={() => setSearchActive(false)} className={`w-full relative max-w-[500px] duration-200 py-3  px-10 rounded-[20px]  ${SearchActive
                            ? 'text-black placeholder:text-black'
                            : ''
                            }`} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </header>
                <div className="filters_search flex flex-col w-full items-end  px-3">
                    <button className={`w-min duration-200 text-sm ${SearchActive ? 'Active' : ''}`} onClick={() => setFilterActive(prev => !prev)}>Filters</button>
                </div>
                <div className="restaurants flex flex-col gap-4 mt=4">
                    {filteredRestaurants.map((itemsRestaurantMap) => (
                        <div className={`restaurant  px-5  py-2 cursor-pointer items-center gap-4 ${searchValue.trim() === '' || searchItems ? 'flex' : 'hidden'}`} key={itemsRestaurantMap.id}>
                            <img src={itemsRestaurantMap.image} alt="photo restaurant" className='w-[85px] rounded-lg' />
                            <h1>{itemsRestaurantMap.name}</h1>
                            <p className='ml-auto'>+</p>
                        </div>
                    ))}
                </div>
                <Filters_Restaurant state={filterActive} filterOrdersExists={filterOrdersExists} setFilterOrdersExists={setFilterOrdersExists} apiResult={apiResult} setState={setFilterActive} />
            </section>
        </>
    )
}