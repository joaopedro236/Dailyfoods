import './RegisterStore.css'
import PhotoDesktop from '../../assets/Photos/screenshot_30.png'
import { useState } from 'react'
import  inputs  from './RegisterStoreJSON'
import { Fragment } from 'react'
function Input(props) {
    return (
        <>
            <div className={`flex flex-col gap-1 `}>
                <label htmlFor={props.name} className='text-sm'>{props.label}</label>
                <input type={props.type} name={props.name} id={props.name} placeholder={props.placeholder} value={props.value} onChange={(e) => { props.onChange(e) }} required minLength={props.minLength} maxLength={props.maxLength} className='bg-transparent p-2 py-2.5 rounded-md w-full' />
            </div>
        </>
    )
}
export default function RegisterStore({ state }) {
    const [submitActive, setSubmitActive] = useState(false)
    const[cnpjError, setCnpjError] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        CNPJ: '',
        CEP: '',

    })
    const handleFormEdit = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const apiURl = import.meta.env.VITE_API_URL
    const handleForm = async (event) => {
        try {
            event.preventDefault()
            const response = await fetch(`${apiURl}/api/registerStore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const json = await response.json()
            if (!response.ok) {
                alert(json.message);
                return
            }
            if(json.Status == false){
                setCnpjError(true)
            }else setCnpjError(false)


        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <section className={`registerStore w-full  min-h-screen  z-30 px-4 py-2  items-center justify-center ${state === 4 ? 'flex' : 'hidden'} `}>
                <div className=" card__registerStore w-full max-w-[830px] h-min flex  gap-6 rounded-[16px]  items-center justify-center px-3">
                    <div className="cardContent w-full  flex flex-col gap-6 h-min">
                        <header className='flex flex-col text-center items-center justify-center'>
                            <h1 className='text-[20px] font-bold'>Create your restaurant account</h1>

                            <p className='text-gray-600 text-sm'>Get your business off to a great start.</p>
                        </header>
                        <div className="inputs__registerStore flex  relative    ">
                            <form className='w-full h-full flex flex-col gap-7 relative' onSubmit={handleForm}>
                                {

                                    inputs.map((inputsJSONMap) => (
                                        <Fragment key={inputsJSONMap.id}>
                                            <Input  name={inputsJSONMap.name} label={inputsJSONMap.label} placeholder={inputsJSONMap.placeholder} type={inputsJSONMap.type} onChange={handleFormEdit} minLength={inputsJSONMap.minLength} maxLength={inputsJSONMap.maxLength} value={formData[inputsJSONMap.name]} />
                                        </Fragment>
                                    ))
                                }
                                <input type="submit" value="Sign Up Now" className={`submit__registerStore  text-white rounded-[12px] p-3 cursor-pointer w-full ${submitActive ? 'opacity-85' : ''}`} onClick={() => setSubmitActive(prev => !prev)} />
                                <p className={`text-sm text-red-700 ${cnpjError ? 'flex' : 'hidden'}`}>This CPF is already in use.</p>
                            </form>
                        </div>
                    </div>
                    <div className="complementary h-min w-full hidden max-w-[330px] flex flex-col  px-7 items-center  gap-5">
                        <img src={PhotoDesktop} alt="photo restaurant" className='w-full h-[240px]' />
                        <h1 className='text-[18px] font-bold'>Grow your restaurant with confidence.</h1>
                        <p className='text-md text-gray-500'>DailyFoods provides everything you need to manage your menu, track orders, optimize daily operations, and deliver an exceptional dining experience.</p>
                    </div>
                </div>

            </section>
        </>
    )
}