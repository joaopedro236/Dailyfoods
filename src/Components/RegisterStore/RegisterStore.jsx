import './RegisterStore.css'
import DashboardStore from './Components/DashboardStore'
import PhotoDesktop from '../../assets/Photos/screenshot_30.png'
import { useState, useEffect } from 'react'
import inputs from './RegisterStoreJSON'
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
    const [cnpjError, setCnpjError] = useState(false)
    const [nextStep, setNextStep] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        CNPJ: '',
        CEP: '',
        image: null,
    })
    const [previewImage, setPreviewImage] = useState(null)
    const [formDataAPI, setFormDataAPI] = useState({})
    const handleFormEdit = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const APIURL = import.meta.env.VITE_API_URL

    const updateSelectedImage = (file) => {
        setFormData(prev => ({
            ...prev,
            image: file
        }))

        if (previewImage?.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage)
        }

        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setPreviewImage(imageUrl)
            setFormDataAPI(prev => ({
                ...prev,
                image: imageUrl
            }))
        } else {
            setPreviewImage(null)
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] ?? null
        updateSelectedImage(file)
    }

    const handleForm = async (event) => {
        try {
            event.preventDefault()
            const form = new FormData()
            const imageInput = event.currentTarget?.querySelector('input[name="image"]')
            const selectedImage = imageInput?.files?.[0] ?? formData.image ?? null

            setFormData(prev => ({ ...prev, image: selectedImage }))

            form.append("name", formData.name)
            if (selectedImage) {
                form.append("image", selectedImage, selectedImage.name)
            }
            form.append("CNPJ", formData.CNPJ)
            form.append("CEP", formData.CEP)
            const response = await fetch(`${APIURL}/api/registerStore`, {
                method: 'POST',
                credentials: 'include',
              
                body: form
            })
            const json = await response.json()
            if (!response.ok) {
                return false
            }
            if (json.Status == false) {
                setCnpjError(true)
                setNextStep(false)
                return false
            }
            setCnpjError(false)
            setFormDataAPI(prev => ({
                ...prev,
                name: formData.name,
                CNPJ: formData.CNPJ,
                CEP: formData.CEP,
                image: json.image || previewImage || prev.image
            }))
            try {
                await APICall()
            } catch (error) {
                console.error(error)
            }
            setNextStep(true)
            return true

        } catch (error) {
            console.error(error)
            return false
        }

    }
    const APICall = async () => {
        try {
            const responseCall = await fetch(`${APIURL}/api/store`, {

                credentials: 'include'
            })
            const jsonCall = await responseCall.json()
            if (jsonCall.Status === true) {
                setFormDataAPI({
                    name: jsonCall.name,
                    image:jsonCall.image,
                    CNPJ: jsonCall.CNPJ,
                    CEP: jsonCall.CEP,
                    invoicing: jsonCall.invoicing,
                    invoicing_history: jsonCall.invoicing_history,
                    orders: jsonCall.orders,
                    completed: jsonCall.completed,
                    progress: jsonCall.progress
                })
                setNextStep(true)
                return
            }
            setNextStep(false)
        }

        catch (error) {
            console.error(error)
            return false
        }
    }
    useEffect(() => {
        APICall()
        return () => {
            if (previewImage?.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage)
            }
        }
    }, [])
    return (
        <>
            <section className={`registerStore w-full  min-h-screen  z-30 px-4 py-2 pt-5 items-center justify-center ${state === 3 && nextStep == false ? 'flex' : 'hidden'} `}>
                <div className=" card__registerStore w-full max-w-[930px]  h-min flex  gap-6 rounded-[16px]  items-center justify-center px-3">
                    <div className="cardContent w-full  flex flex-col gap-6 h-min">
                        <header className='flex flex-col text-center items-center justify-center'>
                            <h1 className='text-[20px] font-bold'>Create your restaurant account</h1>

                            <p className='text-gray-600 text-sm'>Get your business off to a great start.</p>
                        </header>
                        <div className="inputs__registerStore flex  relative    ">
                            <form className='w-full h-full flex flex-col gap-7 relative' onSubmit={async (e) => {
                                e.preventDefault()
                                if (submitActive) return
                                setSubmitActive(true);
                                try {
                                    const success = await handleForm(e)

                                    await APICall()
                                } catch (error) {
                                    console.error(error)
                                }
                                finally {
                                    setSubmitActive(false);
                                }
                            }}>
                                {

                                    inputs.map((inputsJSONMap) => (
                                        <Fragment key={inputsJSONMap.id}>
                                            <Input name={inputsJSONMap.name} label={inputsJSONMap.label} placeholder={inputsJSONMap.placeholder} type={inputsJSONMap.type} onChange={handleFormEdit} minLength={inputsJSONMap.minLength} maxLength={inputsJSONMap.maxLength} value={formData[inputsJSONMap.name]} />
                                        </Fragment>
                                    ))
                                }
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="image" className='text-sm'>Restaurant photo</label>
                                    <input type="file" name="image" id="image" accept="image/*" onChange={handleFileChange} className='bg-transparent p-2 py-2.5 rounded-md w-full' />
                                 
                                </div>
                                <input type="submit" value={`${submitActive ? 'Loading' : 'Sign up Now'}`} className={`submit__registerStore  text-white rounded-[12px] p-3 cursor-pointer w-full ${submitActive ? 'opacity-85' : ''}`} />
                                <p className={`text-sm text-red-700 ${cnpjError ? 'flex' : 'hidden'}`}>This CNPJ is already in use.</p>
                            </form>
                        </div>
                    </div>
                    <div className="complementary h-min w-full hidden max-w-[360px] flex flex-col  px-7 items-center  gap-5">
                        <img src={PhotoDesktop} alt="photo restaurant" className='w-full h-[240px]' />
                        <h1 className='text-[18px] font-bold'>Grow your restaurant with confidence.</h1>
                        <p className='text-md text-gray-500'>DailyFoods provides everything you need to manage your menu, track orders, optimize daily operations, and deliver an exceptional dining experience.</p>
                    </div>
                </div>
            </section>

            <DashboardStore formDataAPI={formDataAPI} setFormDataAPI={setFormDataAPI} nextStep={nextStep} setNextStep={setNextStep} state={state} previewImage={previewImage} setPreviewImage={setPreviewImage} onImageSelect={updateSelectedImage} />
        </>
    )
}