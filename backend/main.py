from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
from fpdf import FPDF
import uuid
import os

app = FastAPI()

DATA_FILE = "data.json"


# -------------------------------
# MODELO DE COMPRA
# -------------------------------
class Compra(BaseModel):
    usuario: str
    items: list  # [{nombre: "...", precio: 120}, ...]
    total: float
    metodo_pago: str


# -------------------------------
# GUARDAR COMPRA EN data.json
# -------------------------------
def guardar_compra(compra_data):
    with open(DATA_FILE, "r") as file:
        data = json.load(file)

    data["compras"].append(compra_data)

    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=4)


# -------------------------------
# ENDPOINT PARA REGISTRAR COMPRA
# -------------------------------
@app.post("/comprar")
def comprar(compra: Compra):

    compra_id = str(uuid.uuid4())[:8]  # id corto
    compra_data = compra.dict()
    compra_data["id"] = compra_id

    guardar_compra(compra_data)

    return {
        "msg": "Compra registrada",
        "id": compra_id
    }


# -------------------------------
# GENERAR FACTURA PDF
# -------------------------------
def generar_pdf(compra):

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="FACTURA DE COMPRA", ln=1, align='C')
    pdf.ln(10)

    pdf.cell(100, 10, txt=f"Usuario: {compra['usuario']}", ln=1)
    pdf.cell(100, 10, txt=f"Metodo de pago: {compra['metodo_pago']}", ln=1)
    pdf.cell(100, 10, txt=f"Compra ID: {compra['id']}", ln=1)
    pdf.ln(5)

    pdf.cell(200, 10, txt="Items:", ln=1)
    pdf.ln(5)

    for item in compra["items"]:
        pdf.cell(200, 8, txt=f"- {item['nombre']}  .....  ${item['precio']}", ln=1)

    pdf.ln(5)
    pdf.cell(200, 10, txt=f"TOTAL: ${compra['total']}", ln=1)

    # archivo
    file_name = f"factura_{compra['id']}.pdf"
    pdf.output(file_name)

    return file_name


# -------------------------------
# ENDPOINT PARA DESCARGAR FACTURA
# -------------------------------
@app.get("/factura/{compra_id}")
def factura(compra_id: str):

    with open(DATA_FILE, "r") as file:
        data = json.load(file)

    compra = next((c for c in data["compras"] if c["id"] == compra_id), None)

    if not compra:
        return {"error": "Compra no encontrada"}

    pdf_file = generar_pdf(compra)

    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename=pdf_file
    )

