import './OrderActive.css'
import { useState, useEffect } from 'react'
export default function OrderActive({ selectedOrder, setSelectedOrder }) {
    const [loading, setLoading] = useState(false)
    const handlePay = async () => {
        
        setLoading(true)
        const formData = new FormData()

        formData.append('orderPrice', String(selectedOrder[0]?.price))
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pay`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            const data = await response.json()
            if (data.Error == 'Unfortunately, the user does not have a sufficient balance.') {
                alert('Unfortunately, the user does not have a sufficient balance.')
            }
            if(data.Status) {setSelectedOrder([])
                alert('Pay success')
            }
            if(data.Error == "You cannot pay for your own restaurant.") alert('You cannot pay for your own restaurant.')
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false)
        }

    }
    useEffect(() => {
        const keyboard = (e) => {
            if (e.ctrlKey) {
                if (e.key === 'b') {
                    e.preventDefault()
                    setSelectedOrder([])
                }
               
            }
        }

        window.addEventListener('keydown', keyboard)

        return () => {
            window.removeEventListener('keydown', keyboard)
        }
    }, [])
    return (
        <>
            <section className={`orderActive ${selectedOrder.length > 0 ? 'flex' : 'hidden'} bg-white  fixed top-0 left-0 w-full h-screen flex-col p-3 pt-[70px] gap-2`}>
                <header className=' flex flex-col gap-5 '>
                    <h1 >Order: </h1>
                    <div className='flex w-full flex-wrap gap-4 items-center ml-4'>
                        <img
                            src={`${import.meta.env.VITE_API_URL}/uploadsOrders/${selectedOrder[0]?.image}`}
                            alt={selectedOrder[0]?.name}
                            className='w-full max-w-[100px] rounded-lg'
                        />
                        <div>
                            <h1 className='text-black '>{selectedOrder[0]?.name}</h1>
                            <p className="text-[13px]">{selectedOrder[0]?.description}</p>
                            <p className="text-[13px]">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, }).format(selectedOrder[0]?.price)}</p>
                        </div>
                    </div>
                </header>

                <h1 className='mt-7'>Payment</h1>
                <p className='text-[13px] text-gray-500 max-w-[300px]'>Make your payment quickly and securely. Once confirmed, your order will be processed.</p>
                <button className='w-full max-w-[450px] p-3 rounded-lg text-white mt-8' onClick={handlePay} disabled={loading}>
                    {loading ? 'Loading' : 'Pay'}
                </button>
                <p className='text-sm mt-4' onClick={()=> setSelectedOrder([])}>Press Ctrl + B to go back or click on me.</p>
            </section>
        </>
    )
}