 const Inputs = [
    {
        id: 1,
        name: 'name',
        placeholder: 'Enter Your Company Name',
        label: 'Company name',
        type: 'text',
        minLength: 5,
        maxLength: 200,
    },

  
    {
        id: 2,
        name: 'CNPJ',
        placeholder: 'Enter Your CNPJ',
        label: 'CNPJ',
        type: 'text',
        minLength: 14,
        maxLength: 14,
    },
    {
        id: 3,
        name: 'CEP',
        placeholder: 'Enter Your CEP',
        label: 'CEP',
        type: 'text',
        minLength: 3,
        maxLength: 8
    },
    {
        id:4,
        name:'password',
        placeholder:'Enter Your password',
        label:'password',
        type:'password',
        minLength:10,
        maxLength:200   
    }
]


export default Inputs