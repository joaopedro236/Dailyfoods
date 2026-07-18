import './Login.css'
import { useState, useEffect } from 'react'
import RegisterNSComponent from './Components/RegisterNS/RegisterNS'
import PhotoBackground from '../../assets/Photos/Gemini_Generated_Image_b7rt8lb7rt8lb7rt.png'

export default function Login({ state }) {
    const [submitActive, setSubmitActive] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const [CNPJExists, setCNPJExists] = useState(false)
    const [nextStep, setNextStep] = useState(false)
    const [user, setUser] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        CNPJ: '',
        CEP: '',
        password: ''

    })
    const handleFormEdit = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await fetch(`${apiURL}/api/user`, {
                    credentials: 'include'
                })
                const json = await response.json()

                if (json.Status === true) {
                    setUser(true)
                    setNextStep(true)
                }
            } catch (error) {
                console.error(error)
            }
        }

        restoreSession()
    }, [apiURL])

    const handleForm = async (event) => {
        event.preventDefault()
        setSubmitActive(true)
        try {
            const fields = Object.values(formData)
            if (fields.some(values => String(values).trim() === '')) {
                alert('Fill in all fields.')
                return false
            }
            const response = await fetch(`${apiURL}/api/registerUser`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const json = await response.json()
            if (!response.ok) {
                return false
            }

            if (json.StatusEmail === true) {
                setEmailExists(true)
                return false
            }
            setEmailExists(false)
            if (json.StatusCnpj == true) {
                setCNPJExists(true)
                return false
            }
            setCNPJExists(false)


            return true

        } catch (error) {
            console.error(error)
            return false
        } finally {
            setSubmitActive(false);
        }
    }
    return (
        <>
            <section className={`login w-full relative z-30 px-1 flex-col ${nextStep == false && state == 5 && user == false ? 'flex' : 'hidden'} `}>
                <header className='loginHeader relative z-10 flex flex-col p-7 gap-2 h-[300px] justify-center'>
                    <h1 className='text-white font-bold w-full max-w-56x text-[20px] '>Discover Dailyfoods plans and boost your sales.</h1>
                    <p className='text-gray-300 text-[12px]'>Discover how Dailyfoods plans can boost your sales by connecting your restaurant to millions of potential customers.</p>
                </header>
                <img src={PhotoBackground} alt="Photo Background" className='photoMain__login absolute top-0 left-0 w-full h-[300px] brightness-[0.4] block' />
                <div className="cardLogin w-full max-w-[500px]   z-10 bg-white flex flex-col p-8 gap-7 ">
                    <header className='flex flex-col items-center justify-center text-center '>
                        <h1 className='text-lg font-bold    '>Register your kitchen on Dailyfoods</h1>
                        <p className='text-[14px] text-gray-700 '>Sign up and get a free month on the ideal plan for your business.</p>
                    </header>
                    <form className='  flex flex-col gap-3' onSubmit={(e) => {
                        e.preventDefault()
                        setNextStep(true)
                    }}>
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" placeholder={`Enter your email`} required className='bg-transparent p-2 py-2.5 rounded-md w-full' value={formData.email} onChange={handleFormEdit} />
                        <p className={`text-red-700 text-sm ${emailExists ? 'flex' : 'hidden'}`}>This email already exists.</p>
                        <input type="submit" disabled={submitActive} value={submitActive ? "Loading..." : "Sign Up Now"} className={`submit__login  text-white rounded-[12px] mt-4 p-3 cursor-pointer w-full ${submitActive ? 'opacity-85' : ''}`} />
                    </form>
                    <p className='text-sm text-gray-600'>By continuing, you agree to receive communications from Dailyfoods.</p>
                </div>
            </section>
            <RegisterNSComponent state={nextStep} CNPJExists={CNPJExists} user={user} setUser={setUser} stateSection={state} setState={setNextStep} handleForm={handleForm} formData={formData} handleFormEdit={handleFormEdit} />

        </>
    )
}