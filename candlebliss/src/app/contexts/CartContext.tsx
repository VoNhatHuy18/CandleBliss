'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
    localCartBadge: number;
    setLocalCartBadge: (count: number) => void; // Add this line
    updateCartBadge: (count: number) => void;
    incrementCartBadge: (amount?: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [localCartBadge, setLocalCartBadge] = useState(0);

    // Load initial value from localStorage
    useEffect(() => {
        const savedBadge = localStorage.getItem('cartBadge');
        if (savedBadge) {
            setLocalCartBadge(parseInt(savedBadge));
        }
    }, []);

    const updateCartBadge = (count: number) => {
        localStorage.setItem('cartBadge', count.toString());
        setLocalCartBadge(count);

        // Dispatch event for other components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartBadgeUpdated', {
                detail: { count }
            }));
        }
    };

    const incrementCartBadge = (amount = 1) => {
        const newCount = localCartBadge + amount;
        localStorage.setItem('cartBadge', newCount.toString());
        setLocalCartBadge(newCount);

        // Dispatch event for other components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartBadgeUpdated', {
                detail: { count: newCount }
            }));
        }
    };

    return (
        <CartContext.Provider value={{
            localCartBadge,
            setLocalCartBadge, // Add this line
            updateCartBadge,
            incrementCartBadge
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};