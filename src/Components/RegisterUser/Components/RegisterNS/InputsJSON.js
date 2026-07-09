const inputs = [
    {
        id: 1,
        label: 'Full Name',
        name:'name',
        formData:'name',
        type: 'text',
        placeholder: 'Enter Your Name',
        minLength: 20,
        maxLength: 250,
    },
    {
        id: 2,
        name: 'CNPJ',
        placeholder: 'Enter Your CNPJ',
        label: 'CNPJ',
        formData:'CNPJ',
        type: 'number',
        minLength: 14,
        maxLength: 14,
    },
    {
        id: 3,
        name: 'CEP',
        placeholder: 'Enter Your CEP',
        label: 'CEP',
        formData:'CEP',
        type: 'text',
        minLength: 5,
        maxLength: 250
    }
]
export default inputs