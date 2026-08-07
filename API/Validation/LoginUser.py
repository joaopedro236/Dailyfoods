from pydantic import BaseModel, field_validator

class LoginUser(BaseModel):
    CNPJ: str
    password: str
    @field_validator("CNPJ")
    @classmethod
    def validationCNPJ(cls, value):
        value = value.replace(".", "").replace("-", "").replace("/", "")
        if len(value) != 14:
            raise ValueError("Error: The CNPJ must have 14 digits.  ")
        if not value.isdigit():
            raise ValueError("INVALID CNPJ")
        return value