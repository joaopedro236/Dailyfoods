import './Order.css'
import inputs from './OrdersInputs'
import { useState } from 'react'
export default function Orders({ stateSection, setOrdersSectionActive, OrdersSectionActive, ordersMetrics }) {
    const refreshMetrics = typeof ordersMetrics === 'function' ? ordersMetrics : async () => {};

    async function handleSubmit(e) {
        e.preventDefault()

        const form = e.currentTarget
        const data = new FormData(form)
        const APIURL = import.meta.env.VITE_API_URL

        const response = await fetch(`${APIURL}/orders`, {
            method: "POST",
            credentials: "include",
            body: data
        })

        const dataResponse = await response.json()
        if (dataResponse.Status) {
            await refreshMetrics();
            setOrdersSectionActive(false);
        }
    }
    return (
        <>
            {OrdersSectionActive && (

                <section className={`ordersCreate flex ${stateSection === 3 && OrdersSectionActive ? 'opacity-100 pointer-events-auto ' : 'opacity-0 pointer-events-none'} w-full h-screen px-4 flex-col absolute top-0 left-0 z-[90] gap-2`}>
                    <header className='flex items-center gap-[15px] py-4'>
                        <button className='font-bold text-[20px]' onClick={() => setOrdersSectionActive(false)}
                        >&lt;</button>  
                        <h1 className='text-[23px]'>Create Menu</h1>
                    </header>
                    <div className="inputs_ordersCreate flex-1 flex w-full flex-col mt-1">
                        <form encType="multipart/form-data" className='p-2 flex flex-1 flex-col h-full justify-between' onSubmit={handleSubmit}>
                            <div className="inputForm_orders flex flex-col gap-6 h-full justify-center">
                                {
                                    inputs.map((inputsMap) => (
                                        <div key={inputsMap.id} className='form_ordersCreate flex gap-0.5 w-full flex-col '>
                                            <label htmlFor={inputsMap.name} className='text-sm'>{inputsMap.label}</label>
                                            <input type={inputsMap.type} name={inputsMap?.name} placeholder={inputsMap?.placeholder} className='bg-transparent p-2 py-2.5 rounded-md w-full' accept={inputsMap?.accept} minLength={inputsMap?.minLength} maxLength={inputsMap?.maxLength} required />
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='flex flex-col gap-2'>
                             
                                <input type="submit" value="Submit" className='submit_orders text-white rounded-lg  text-sm w-full p-3 cursor-pointer' />
                            </div>
                        </form>
                    </div>
                </section>
            )}
        </>
    )
}