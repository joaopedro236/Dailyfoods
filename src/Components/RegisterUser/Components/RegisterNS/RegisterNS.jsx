import './RegisterNS.css'
import User from '../User/User'
import inputs from './InputsJSON'
import { useState, useEffect } from 'react'
export default function RegisterNS({ user, setUser, state, setState, handleForm, formData, handleFormEdit, stateSection, CNPJExists }) {
    const [submitActive, setSubmitActive] = useState(false)
    const [userData, setUserData] = useState({})
    const APIURL = import.meta.env.VITE_API_URL
    const APICall = async () => {
        try {
            const response = await fetch(`${APIURL}/api/user`, {

                credentials: 'include'
            })
            const json = await response.json()
            if (json.Status === true) {
                setUser(true)
                setUserData({
                    name: json.name,
                    email: json.email
                })
            }
        }

        catch (error) {
            console.error(error)
            return false
        }
    }
    useEffect(() => {

        APICall()
    }, [])
    return (
        <>
            <section className={`registerNS ${state == true && stateSection == 5 ? 'flex' : 'hidden'} ${user == true ? '!hidden' : ''} bg-white w-full h-screen  pt-7 `}>
                <div className="cardRegisterNS w-full max-w-[720px] rounded-[16px] relative flex flex-col py-7  px-10 gap-4 h-full max-h-[580px]">
                    <header className='flex flex-col text-center items-center justify-center gap-0.5'>
                        <h1 className='text-[19px]'>It's great to see you here!</h1>
                        <p className='text-[13px] text-gray-600'>The information below will be used to begin registering your restaurant.</p>

                    </header>
                    <button className='closeRegisterNS absolute top-5 right-5 text-red-700' onClick={() => setState(false)}>X</button>
                    <form className='flex flex-col gap-5 justify-center h-full' onSubmit={async (e) => {
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
                            inputs.map((inputsMap) => (

                                <div className="flex flex-col gap-1" key={inputsMap.id}>
                                    <label htmlFor={inputsMap.name} className='text-sm'>{inputsMap.label}</label>
                                    <input type={inputsMap.type} value={formData[inputsMap.formData] || ''} name={inputsMap.name} className='input_registerNS p-3  rounded-lg w-full' placeholder={inputsMap.placeholder} minLength={inputsMap.minLength} maxLength={inputsMap.maxLength} onChange={handleFormEdit} required />
                                </div>


                            ))
                        }
                        <p className={`text-red-700 text-sm ${CNPJExists ? 'flex' : 'hidden'}`}>CNPJ exists</p>
                        <p className='text-gray-600 text-xs'>To adjust, go back to the previous screen.</p>
                        < input type="submit" disabled={submitActive} value={submitActive ? "Loading..." : "Required data is missing."} className={`submit__registerStore  text-white rounded-[12px] p-3 mt-2 cursor-pointer w-full  ${submitActive ? 'opacity-85' : ''}`} />
                    </form>
                </div>
            </section>
            <User user={user} formData={userData} stateSection={stateSection} />
        </>
    )
}