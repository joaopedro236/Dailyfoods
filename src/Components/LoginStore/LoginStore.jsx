import './LoginStore.css'
import { useEffect, useState } from 'react'
export default function LoginStore({ state, setState, setNextStep }) {
    const APIURL = import.meta.env.VITE_API_URL
    const [CNPJ, setCNPJ] = useState("");
    
    const [password, setPassword] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${APIURL}/api/loginStore`, {
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

            const data = await response.json();

            if (data.Status) {
                alert("Login successful!");
                setState(3)
                setNextStep(true)
                
            } else {
                alert("Invalid CNPJ or password");
                
            }
        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <section className={`loginStore flex-col p-3 pt-[80px] w-full gap-[30px]  h-screen justify-center ${state == 4 ? 'flex' : 'hidden'} ${status ? 'items-center' : ''}`}>
                <header className={` flex-col `}>
                    <h1>Login Restaurant</h1>
                </header>
                <form onSubmit={handleLogin} className={`flex flex-col gap-6`}>
                    <input
                        type="text"
                        className='p-3 rounded-[10px] w-full max-w-[600px]'
                        placeholder="CNPJ"
                        value={CNPJ}
                        onChange={(e) => setCNPJ(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        className='p-3 rounded-[10px] w-full max-w-[600px]'
                        onChange={(e) => setPassword(e.target.value)}
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