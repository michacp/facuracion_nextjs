// src/features/ventas/utils/saleForm.utils.ts
import type { ProductoLinea, ImpuestoSales } from "../types/saleForm.types";

export function redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export interface TotalesCalculados {
    subtotal: number;
    descuentoTotal: number;
    iva: number;
    total: number;
}

export function calcularTotales(
    productos: ProductoLinea[],
    impuestos: ImpuestoSales[]
): TotalesCalculados {
    let subtotal = 0;
    let descuentoTotal = 0;
    let ivaTotal = 0;

    for (const p of productos) {
        const cantidad = Number(p.cantidad) || 0;
        const precio = Number(p.precioUnitario) || 0;
        const descuento = Number(p.descuento) || 0;

        const subtotalLinea = redondear(cantidad * precio);
        const valorConDescuento = redondear(subtotalLinea - descuento);

        const impuesto = impuestos.find((i) => i.id === p.codigoImpuesto);
        const porcentaje = impuesto ? Number(impuesto.percentage) : 0;

        const valorIVA = redondear(valorConDescuento * (porcentaje / 100));

        subtotal += valorConDescuento;
        ivaTotal += valorIVA;
        descuentoTotal += descuento;
    }

    subtotal = redondear(subtotal);
    ivaTotal = redondear(ivaTotal);
    descuentoTotal = redondear(descuentoTotal);
    const total = redondear(subtotal + ivaTotal);

    return { subtotal, descuentoTotal, iva: ivaTotal, total };
}

export function formatDateToLocalString(date: Date | string): string {
    if (typeof date === "string") date = new Date(date + "T00:00:00");
    const pad = (n: number) => n.toString().padStart(2, "0");
    // Usa la hora local del dispositivo (Guayaquil = UTC-5)
    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

export function parseSaveResponse(response: any): {
    title: string;
    message: string;
    success: boolean;
    ventaId?: any;
} {
    let title = "Venta guardada exitosamente";
    let message = "Comprobante sin emisión electrónica.";
    let success = true;

    const obj = response;

    if (obj?.facData) {
        const { estado, mensajeSRI } = obj.facData;

        if (estado === "AUTORIZADO") {
            title = "✅ Factura Autorizada";
            message = `Autorizada correctamente. Clave: ${obj.facData.claveAcceso}`;
        } else if (estado === "DEVUELTA") {
            title = "⚠️ Factura Devuelta por el SRI";
            message = mensajeSRI || "El SRI devolvió la factura con errores.";
            success = false;
        } else if (estado === "NO AUTORIZADO") {
            title = "❌ Factura No Autorizada";
            message = mensajeSRI || "El comprobante no fue autorizado.";
            success = false;
        } else if (estado === "PENDIENTE") {
            title = "⏳ Factura Pendiente";
            message = "El SRI no respondió a tiempo. Puede consultarla después.";
            success = false;
        } else if (estado === "ERROR") {
            title = "❌ Error al enviar";
            message = mensajeSRI || "No se pudo enviar la factura al SRI.";
            success = false;
        }
    }

    return { title, message, success, ventaId: obj?.ventaId ?? null };
}