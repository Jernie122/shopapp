import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i._id === product._id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i._id !== id)
  })),

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    return useCartStore.getState().items.reduce(
      (total, item) => total + item.price * item.quantity, 0
    );
  }
}));

export default useCartStore;