export interface Item {
    id: number;
    name: string;
}

export interface GenericChipsSelectorProps {
    label?: string;
    availableItems: Item[];
    preselectedItems?: Item[];
    onSelectionChange: (ids: number[]) => void;
    /** Pasa `true` si el html/body tiene la clase `dark` activa */
    isDark?: boolean;
}