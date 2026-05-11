// Mock data for all stores in the application

export const storesData = {
  "heladeria-chio": {
    name: "Heladería Chío",
    slug: "heladeria-chio",
    category: "Heladería",
    description: "Helados artesanales y postres caseros. Más de 30 sabores para elegir.",
    address: "Av. Libertador 1234, CABA",
    phone: "+54 11 1234-5678",
    whatsapp: "+54 9 11 1234-5678",
    opening_hours: "Lunes a Domingo, 12:00 a 23:00",
    is_accepting_reservations: true,
    is_active: true,
    cover_image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=400&fit=crop",
    menuCategories: [
      { id: 1, name: "Helados" },
      { id: 2, name: "Postres" },
      { id: 3, name: "Bebidas" }
    ],
    menuItems: [
      {
        id: 1,
        category_id: 1,
        name: "1kg de Helado",
        description: "Elegí hasta 4 sabores de nuestra amplia variedad",
        price: 15000
      },
      {
        id: 2,
        category_id: 1,
        name: "1/2kg de Helado",
        description: "Elegí hasta 2 sabores",
        price: 8000
      },
      {
        id: 3,
        category_id: 1,
        name: "1/4kg de Helado",
        description: "Ideal para probar un sabor nuevo",
        price: 4500
      },
      {
        id: 4,
        category_id: 2,
        name: "Brownie con Helado",
        description: "Brownie casero tibio con helado de vainilla",
        price: 5500
      },
      {
        id: 5,
        category_id: 2,
        name: "Copa Dulce de Leche",
        description: "Helado de dulce de leche con salsa y almendras",
        price: 4800
      },
      {
        id: 6,
        category_id: 3,
        name: "Licuado",
        description: "Banana, frutilla o dulce de leche",
        price: 3500
      },
      {
        id: 7,
        category_id: 3,
        name: "Café",
        description: "Expresso, capuchino o cortado",
        price: 2500
      }
    ],
    reservations: [
      {
        id: 1,
        customer_name: "María González",
        customer_phone: "+54 11 2345-6789",
        people_count: 4,
        reservation_date: "2025-12-05",
        reservation_time: "20:00",
        message: "Mesa cerca de la ventana si es posible",
        status: "pending"
      },
      {
        id: 2,
        customer_name: "Carlos Ruiz",
        customer_phone: "+54 11 3456-7890",
        people_count: 2,
        reservation_date: "2025-12-05",
        reservation_time: "19:30",
        message: "",
        status: "confirmed"
      },
      {
        id: 3,
        customer_name: "Ana Martínez",
        customer_phone: "+54 11 4567-8901",
        people_count: 6,
        reservation_date: "2025-12-06",
        reservation_time: "21:00",
        message: "Cumpleaños, necesitamos espacio para torta",
        status: "pending"
      }
    ]
  },
  "cafe-bistro": {
    name: "Café & Bistró",
    slug: "cafe-bistro",
    category: "Café",
    description: "Café de especialidad, brunch y platos gourmet. Ambiente acogedor y moderno.",
    address: "Calle Corrientes 5678, CABA",
    phone: "+54 11 8765-4321",
    whatsapp: "+54 9 11 8765-4321",
    opening_hours: "Lunes a Viernes, 8:00 a 20:00 | Sábados y Domingos, 9:00 a 22:00",
    is_accepting_reservations: true,
    is_active: true,
    cover_image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",
    menuCategories: [
      { id: 1, name: "Desayunos" },
      { id: 2, name: "Almuerzos" },
      { id: 3, name: "Bebidas" },
      { id: 4, name: "Postres" }
    ],
    menuItems: [
      {
        id: 1,
        category_id: 1,
        name: "Desayuno Completo",
        description: "Café o té, medialunas, tostadas con mermelada y jugo de naranja",
        price: 6500
      },
      {
        id: 2,
        category_id: 1,
        name: "Avocado Toast",
        description: "Pan artesanal con palta, huevo poché y queso crema",
        price: 7800
      },
      {
        id: 3,
        category_id: 1,
        name: "Pancakes",
        description: "Stack de 3 pancakes con maple syrup y frutas frescas",
        price: 6200
      },
      {
        id: 4,
        category_id: 2,
        name: "Bowl Mediterráneo",
        description: "Quinoa, vegetales asados, hummus y falafel",
        price: 9500
      },
      {
        id: 5,
        category_id: 2,
        name: "Hamburguesa Gourmet",
        description: "Carne premium, queso cheddar, bacon y papas rústicas",
        price: 11000
      },
      {
        id: 6,
        category_id: 2,
        name: "Ensalada César",
        description: "Lechuga romana, pollo grillado, croutones y parmesano",
        price: 8500
      },
      {
        id: 7,
        category_id: 3,
        name: "Café de Especialidad",
        description: "Expresso, americano, flat white o cappuccino",
        price: 3200
      },
      {
        id: 8,
        category_id: 3,
        name: "Smoothie",
        description: "Frutas frescas, yogur y granola",
        price: 4500
      },
      {
        id: 9,
        category_id: 3,
        name: "Té de Autor",
        description: "Selección de tés premium importados",
        price: 2800
      },
      {
        id: 10,
        category_id: 4,
        name: "Cheesecake",
        description: "Cheesecake de frutos rojos con salsa de frambuesa",
        price: 5200
      },
      {
        id: 11,
        category_id: 4,
        name: "Tiramisú",
        description: "Clásico italiano con café y mascarpone",
        price: 4800
      }
    ],
    reservations: [
      {
        id: 1,
        customer_name: "Lucía Fernández",
        customer_phone: "+54 11 5555-1111",
        people_count: 2,
        reservation_date: "2025-12-04",
        reservation_time: "10:00",
        message: "Brunch de cumpleaños",
        status: "confirmed"
      },
      {
        id: 2,
        customer_name: "Roberto Díaz",
        customer_phone: "+54 11 5555-2222",
        people_count: 4,
        reservation_date: "2025-12-05",
        reservation_time: "13:30",
        message: "",
        status: "pending"
      },
      {
        id: 3,
        customer_name: "Sofía López",
        customer_phone: "+54 11 5555-3333",
        people_count: 3,
        reservation_date: "2025-12-06",
        reservation_time: "19:00",
        message: "Preferimos mesa tranquila",
        status: "pending"
      },
      {
        id: 4,
        customer_name: "Juan Pérez",
        customer_phone: "+54 11 5555-4444",
        people_count: 8,
        reservation_date: "2025-12-07",
        reservation_time: "20:30",
        message: "Cena de empresa, necesitamos factura",
        status: "confirmed"
      }
    ]
  }
};

// Helper function to get store by slug
export const getStoreBySlug = (slug) => {
  return storesData[slug] || null;
};

// Get all stores as array for listing
export const getAllStores = () => {
  return Object.values(storesData).map(store => ({
    id: store.slug,
    name: store.name,
    slug: store.slug,
    category: store.category,
    description: store.description,
    address: store.address,
    phone: store.phone,
    whatsapp: store.whatsapp,
    is_active: store.is_active,
    cover_image_url: store.cover_image_url
  }));
};
