import './Order.css'
import inputs from './OrdersInputs'
import { useState } from 'react'
export default function Orders({ stateSection, setOrdersSectionActive, OrdersSectionActive }) {

    async function handleSubmit(e) {
        e.preventDefault()

        const data = new FormData(e.target)
        const APIURL = import.meta.env.VITE_API_URL
        await fetch(`${APIURL}/orders`, {
            method: "POST",
            credentials: "include",
            body: data
        })
    }
    return (
        <>
            <section className={`ordersCreate flex  w-full h-screen px-4 flex-col absolute top-0 left-0 z-[90] gap-2`}>
                <header className='flex items-center gap-6 py-4'>
                    <button className='font-bold text-[20px]'>&lt;</button>
                    <h1 className='text-[21px]'>Create Menu</h1>
                </header>
                <div className="inputs_ordersCreate flex w-full flex-col mt-1">
                    <form encType="multipart/form-data" className='p-2 flex flex-1 flex-col relative gap-6 justify-center' onSubmit={handleSubmit}>
                        {
                            inputs.map((inputsMap) => (
                                <div key={inputsMap.id} className='form_ordersCreate flex gap-0.5 w-full flex-col '>
                                    <label htmlFor={inputsMap.name} className='text-sm'>{inputsMap.label}</label>
                                    <input type={inputsMap.type} name={inputsMap?.name} placeholder={inputsMap?.placeholder} className='bg-transparent p-2 py-2.5 rounded-md w-full' accept={inputsMap?.accept} minLength={inputsMap?.minLength} maxLength={inputsMap?.maxLength} required />
                                </div>
                            ))
                        }
                        <p className='text-sm text-gray-500'>If you click "Submit," you also accept our terms.</p>
                        <input type="submit" value="Submit" className='submit_orders  text-white rounded-lg  text-sm w-full m-auto p-3 cursor-pointer' />
                    </form>
                </div>
            </section>
        </>
    )
}