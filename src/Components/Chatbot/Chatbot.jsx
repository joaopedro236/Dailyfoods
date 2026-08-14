    import './Chatbot.css'
    import { useState } from 'react';
    import iconChatbot from '../../assets/Icons/icons8-bate-papo-50.png'
    export default function Chatbot({chatbotActive,  setChatBotActive}) {
        const [message, setMessage] = useState("");
        
        const [messages, setMessages] = useState([]);
        const [loading, setLoading] = useState(false);
        const apiURL = import.meta.env.VITE_API_URL
        async function sendMessage(e) {
            e.preventDefault();
            try {
                setMessages(prev => [
                    ...prev,
                    { role: "user", content: message }
                ]);
                setMessage("");
                setLoading(true);
                const response = await fetch(`${apiURL}/chatbot`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify({
                        text: message
                    })

                })
                const data = await response.json()
                if (data.Status) {
                    setMessages(prev => [
                        ...prev,
                        { role: "assistant", content: data.Response }
                    ]);

                } else {
                    setMessages(prev => [
                        ...prev,
                        { role: "assistant", content: "An error occurred while processing your message." }
                    ]);
                }
            } catch (error) {
                console.error(error)
                setMessages("Unable to connect to the chatbot.");
            } finally {
                setLoading(false)
            }
        }
        return (
            <>
                <button className={`chatBotBtn z-[55]  ${chatbotActive ? 'hidden' : 'flex'} items-center justify-center p-4.5 fixed bottom-6 right-6 rounded-full w-[60px]`} onClick={() => setChatBotActive(true)}>
                    <img src={iconChatbot} alt="icon chatbot" />
                </button>
                <section className={`chatBot ${chatbotActive ? 'flex' : 'hidden'} flex-col gap-2 p-3 fixed bottom-4 right-4 bg-gray-100 rounded-lg w-full max-w-[360px] h-[360px]`}>
                    <header className='flex justify-center items-center relative'>
                        <button className='absolute top-2 left-2 bg-white w-[30px] h-[30px] rounded-full' onClick={() => {setChatBotActive(false) }}>X</button>
                    </header>
                    <div className='flex flex-col gap-2 overflow-y-auto'>
                        {
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'items-end' : 'items-start'} flex-col`}>
                                    <p className='text-sm text-gray-500'>{msg.role === 'user' ? 'You:' : 'IA:'}</p>
                                    <p className='bg-white text-black p-2 rounded-lg max-w-[80%] ml-1'>{msg.content}</p>
                                </div>
                            ))
                        }
                        {loading && (
                            <div className='flex justify-start flex-col'>
                                <p className='text-sm text-gray-500'>IA: </p>
                                <p className='bg-white text-black p-2 rounded-lg ml-1'>
                                    🤖 Typing...
                                </p>
                            </div>
                        )}
                    </div>
                    <form className='w-full flex mt-auto ' onSubmit={sendMessage}>
                        
                        <input type="text" placeholder='Type a question' value={message} minLength={2} maxLength={1600}
                            onChange={(e) => setMessage(e.target.value)} className='w-100 bg-gray-200 p-2 rounded-lg' />
                        <input type="submit" disabled={message.trim().length < 2 || loading} value="Send" className='chatBotSubmit cursor-pointer text-white p-2 text-sm rounded-lg ml-2 ' />
                    </form>
                </section>
            </>
        )
    }