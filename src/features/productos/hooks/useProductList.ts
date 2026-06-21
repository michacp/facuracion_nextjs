// src/features/productos/hooks/useProductList.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { productApi } from "../api/product.api";
import {
    ListProductosParams,
    ProductoListItem,
} from "../types/product-list.types";

export function useProductList() {
    const [products, setProducts] = useState<ProductoListItem[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | string>("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    // Para detectar si el search se borró (onKeyup en Angular)
    const prevSearchRef = useRef("");

    // ── Carga principal ───────────────────────────────────────────────────────

    const applyFilters = useCallback(async (
        overrides: Partial<ListProductosParams> = {}
    ) => {
        setLoading(true);
        try {
            const params: ListProductosParams = {
                search: overrides.search ?? searchText,
                category: overrides.category ?? selectedCategory,
                page: overrides.page ?? currentPage,
                limit: overrides.limit ?? itemsPerPage,
            };
            const res = await productApi.fetchProducts(params);
            setProducts(res.items);
            setTotalItems(res.total);
            setCategories(res.categories);
        } catch (err) {
            console.error("Error fetching products:", err);
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, selectedCategory, currentPage, itemsPerPage]);

    // ngOnInit
    useEffect(() => { applyFilters(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── onKeyup — aplica si se borró el campo ─────────────────────────────────

    function onKeyup(e: React.KeyboardEvent<HTMLInputElement>) {
        const current = searchText.trim();
        if (!current && prevSearchRef.current) {
            prevSearchRef.current = "";
            applyFilters({ search: "", page: 0 });
        }
        if (current) prevSearchRef.current = current;
    }

    // ── Enter en el buscador ──────────────────────────────────────────────────

    function onSearchEnter() {
        setCurrentPage(0);
        applyFilters({ page: 0 });
    }

    // ── Cambio de categoría ───────────────────────────────────────────────────

    function onCategoryChange(val: number | string) {
        setSelectedCategory(val);
        setCurrentPage(0);
        applyFilters({ category: val, page: 0 });
    }

    // ── Paginación ────────────────────────────────────────────────────────────

    function onPageChange(page: number, limit: number) {
        setCurrentPage(page);
        setItemsPerPage(limit);
        applyFilters({ page, limit });
    }

    return {
        // datos
        products, categories, totalItems,
        // filtros (state)
        searchText, setSearchText,
        selectedCategory,
        currentPage, itemsPerPage,
        loading,
        // acciones
        onKeyup,
        onSearchEnter,
        onCategoryChange,
        onPageChange,
        reload: () => applyFilters(),
    };
}