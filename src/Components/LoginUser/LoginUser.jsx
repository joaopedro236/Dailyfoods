import './LoginUser.css'
import { useState, useEffect } from 'react'

export default function LoginUser({ state, setState, setUser, setNextStep }) {
    const [CNPJ, setCNPJ] = useState("")
    const [password, setPassword] = useState("")
    const [formDataAPI, setFormDataAPI] = useState({})
    const APIURL = import.meta.env.VITE_API_URL
    const handleForm = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${APIURL}/api/loginUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    CNPJ,
                    password,
                }),
            });
            const data = await response.json()
            if (data.Status) {
                if (data.token) {
                    localStorage.setItem(
                        'user_session_token',
                        data.token
                    )
                }
                const userResponse = await fetch(`${APIURL}/api/user`, {
                    credentials: "include",
                    headers: {
                        Authorization: data.token,
                    },
                });
                const userData = await userResponse.json();

                if (userData.Status) {
                    setUser(userData);
                }
                setState(5)
                setNextStep(true)
                setUser(true)
            }
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <section className={`loginUser ${state == 3 ? 'flex' : 'hidden'} bg-white w-full h-screen p-3 pt-[90px] justify-center flex-col gap-7`}>
                <header>
                    <h1>Login User</h1>
                </header>
                <form className={`flex flex-col gap-6`} onSubmit={handleForm}>
                    <input
                        type="text"
                        className='p-3 rounded-[10px] w-full max-w-[600px]'
                        value={CNPJ}
                        onChange={(e) => setCNPJ(e.target.value)}
                        placeholder="CNPJ"
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='p-3 rounded-[10px] w-full max-w-[600px]'
                    />
                    <p className='text-sm text-blue-600 cursor-pointer'>I forgot the password.</p>
                    <button type="submit" className='submit_loginStore p-3 rounded-lg text-white '>
                        Entrar
                    </button>
                </form>
            </section>
        </>
    )
}