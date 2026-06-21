// src/features/productos/api/product.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import {
    FindModelsRequest,
    FindPercentajesRequest,
    InitialData,
    Model,
    Percentaje,
    ProductoList,
    SaveProductoDto,
} from "../types/product.types";
import { ListProductosParams, ListProductosResponse } from "../types/product-list.types";

export const productApi = {
    /** Datos iniciales: marcas, impuestos, tipos de ítem */
    getNewData: async (): Promise<InitialData> => {
        const { data } = await api.get<InitialData>("/items/getnewdata");
        return data;
    },

    /** Últimos 5 productos guardados — panel derecho */
    last5Saves: async (): Promise<ProductoList[]> => {
        const { data } = await api.get<ProductoList[]>("/items/last5saves");
        return data;
    },

    /** Modelos filtrados por marca */
    findModels: async (body: FindModelsRequest): Promise<Model[]> => {
        const { data } = await api.post<Model[]>("/catalogos/findmodels", body);
        return data;
    },

    /** Porcentajes de impuesto filtrados por tipo de impuesto */
    findPercentajes: async (body: FindPercentajesRequest): Promise<Percentaje[]> => {
        const { data } = await api.post<Percentaje[]>("/catalogos/findpercentajes", body);
        return data;
    },

    /** Guarda un nuevo producto */
    save: async (dto: SaveProductoDto): Promise<void> => {
        await api.post("/items/save", dto);
        toast.success("Producto guardado correctamente");
    },
    fetchProducts: async (params: ListProductosParams): Promise<ListProductosResponse> => {
        const { data } = await api.post<ListProductosResponse>("/items/list", params);
        return data;
    },
    findOne: async (body: { id: number }): Promise<any> => {
        const { data } = await api.post("/items/findoneproduct", body);
        return data;
    },
    updateProduct: async (payload: {
        id: number;
        nombre: string;
        descripcion: string;
        precio_unitario: number;
        id_tarifa_impuesto: number;
        modelos_ids: number[];
        lotes: { lote_id: number; cantidad: number }[];
    }): Promise<void> => {
        await api.put("/items/editproduct", payload);
        toast.success("Producto actualizado correctamente");
    },
    /** Busca productos por id/name (selector genérico) */
    findProductsIdName: async (params: { search?: string }): Promise<{ id: number; name: string }[]> => {
        const { data } = await api.post<{ id: number; name: string }[]>("/items/findproductsidname", params);
        return data;
    },

    /** Busca productos habilitados para compra */
    findForPurchase: async (params: { search?: string }): Promise<{ id: number; name: string; precio_actual: number }[]> => {
        const { data } = await api.post<{ id: number; name: string; precio_actual: number }[]>("/items/find-for-purchase", params);
        return data;
    },
};