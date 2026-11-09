/* ============================================================
   TRAJES LA TENDENCIA · Catálogo base
   ------------------------------------------------------------
   Este archivo es el "catálogo semilla". El panel de
   administración guarda los cambios en el navegador y puede
   exportar un archivo como este para publicarlos definitivamente.
   ============================================================ */
window.LT_DATA = {
  version: 1,
  // Sube automáticamente al exportar desde el panel. Permite que los
  // visitantes que ya entraron antes reciban el catálogo nuevo.
  revision: 3,

  brand: {
    name: "Trajes La Tendencia",
    tagline: "Trajes y confecciones hechas a mano",
    phone: "3345 1029",
    whatsapp: "50233451029",
    email: "pedidos@trajeslatendencia.com",
    address: "Sipacapa, San Marcos, Guatemala",
    hours: "Lunes a sábado · 8:00 a 18:00",
    facebook: "https://www.facebook.com/trajes.la.tendencia",
    instagram: "",
    tiktok: "",
    currency: "Q"
  },

  settings: {
    freeShippingFrom: 600,
    shippingLocal: 25,
    shippingNational: 60,
    codFee: 15,
    deliveryNote: "Entregas de 2 a 5 días hábiles. Envíos a todo Guatemala por Guatex o Cargo Expreso.",
    bank: {
      bank: "Banco Industrial",
      account: "000-000000-0",
      holder: "Trajes La Tendencia",
      type: "Cuenta monetaria"
    },
    wholesaleFrom: 6,
    announcement: [
      "Envío gratis en compras desde Q600 · Todo Guatemala",
      "Trajes hechos a mano · Piezas únicas",
      "Mayoreo y detalle · Pedidos al 3345 1029"
    ]
  },

  categories: [
    {
      id: "trajes",
      name: "Trajes",
      short: "Trajes regionales",
      desc: "Conjuntos de blusa bordada y corte amplio, confeccionados a mano.",
      image: "assets/img/traje-1.svg"
    },
    {
      id: "blusas",
      name: "Blusas",
      short: "Blusas bordadas",
      desc: "Blusas de telar, encaje y bordado artesanal para todos los días.",
      image: "assets/img/blusa-2.svg"
    },
    {
      id: "cortes",
      name: "Cortes típicos",
      short: "Cortes y telas",
      desc: "Cortes tradicionales de distintos departamentos, por vara o pieza.",
      image: "assets/img/corte-1.svg"
    }
  ],

  products: [
    {
      id: "traje-regional-bordado",
      name: "Traje Regional Bordado",
      category: "trajes",
      price: 850,
      compareAt: 950,
      stock: 6,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Rosa", hex: "#C2185B" },
        { name: "Vino", hex: "#7B1733" }
      ],
      badge: "Más vendido",
      featured: true,
      active: true,
      images: ["assets/img/traje-1.svg"],
      desc: "Conjunto de blusa y corte confeccionado a mano. El bordado geométrico del cuello y las franjas del corte se tejen pieza por pieza, así que no hay dos iguales.",
      details: [
        "Blusa de tela tejida con bordado a mano",
        "Corte amplio con faja incluida",
        "Telas de algodón de alta resistencia",
        "Hecho a mano"
      ]
    },
    {
      id: "traje-ceremonial-coyote",
      name: "Traje Ceremonial Coyote",
      category: "trajes",
      price: 1250,
      compareAt: 0,
      stock: 3,
      sizes: ["S", "M", "L"],
      colors: [
        { name: "Vino", hex: "#7B1733" },
        { name: "Dorado", hex: "#C39A4A" }
      ],
      badge: "Edición limitada",
      featured: true,
      active: true,
      images: ["assets/img/traje-2.svg"],
      desc: "Una pieza de gala inspirada en los trajes ceremoniales del altiplano. Bordado denso en hilo dorado, tonos vino y un corte de caída amplia para ocasiones especiales.",
      details: [
        "Bordado ceremonial en hilo dorado",
        "Confección de 3 a 4 semanas",
        "Incluye faja tejida",
        "Pieza numerada"
      ]
    },
    {
      id: "traje-gala-jade",
      name: "Traje de Gala Jade",
      category: "trajes",
      price: 1150,
      compareAt: 0,
      stock: 5,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Jade", hex: "#1F6F63" },
        { name: "Crema", hex: "#EFD9A6" }
      ],
      badge: "Nuevo",
      featured: true,
      active: true,
      images: ["assets/img/traje-3.svg"],
      desc: "Verde jade con detalles en hilo crema. Un traje fresco y elegante que combina el telar tradicional con un corte contemporáneo, ideal para fiestas y ceremonias.",
      details: [
        "Tela de telar con acabado suave",
        "Bordado en hilo crema",
        "Corte fresco para clima cálido",
        "Hecho a mano"
      ]
    },
    {
      id: "traje-indigo-fiesta",
      name: "Traje Índigo de Fiesta",
      category: "trajes",
      price: 980,
      compareAt: 0,
      stock: 4,
      sizes: ["M", "L", "XL"],
      colors: [
        { name: "Índigo", hex: "#2C3E70" },
        { name: "Celeste", hex: "#CBD8F2" }
      ],
      badge: "",
      featured: false,
      active: true,
      images: ["assets/img/traje-4.svg"],
      desc: "El azul índigo profundo de los tintes naturales, con franjas celestes y un corte que estiliza la silueta. Una pieza versátil para el día y para la noche.",
      details: [
        "Tinte de inspiración natural",
        "Franjas tejidas a mano",
        "Corte amplio y fresco",
        "Incluye faja"
      ]
    },
    {
      id: "blusa-bordada-terracota",
      name: "Blusa Bordada Terracota",
      category: "blusas",
      price: 325,
      compareAt: 0,
      stock: 9,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "Terracota", hex: "#A8402B" },
        { name: "Mostaza", hex: "#D9A227" }
      ],
      badge: "Más vendido",
      featured: true,
      active: true,
      images: ["assets/img/blusa-1.svg"],
      desc: "Blusa de mangas cortas con bordado floral en el pecho. Su tela ligera y el escote cuadrado la hacen perfecta para el día a día o para combinar con tu corte favorito.",
      details: [
        "Bordado floral hecho a mano",
        "Tela ligera de algodón",
        "Escote cuadrado con terminación tejida",
        "Disponible en varias tallas"
      ]
    },
    {
      id: "blusa-encaje-marfil",
      name: "Blusa de Encaje Marfil",
      category: "blusas",
      price: 375,
      compareAt: 425,
      stock: 7,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        { name: "Marfil", hex: "#EFE3D4" },
        { name: "Dorado", hex: "#C39A4A" }
      ],
      badge: "Edición limitada",
      featured: true,
      active: true,
      images: ["assets/img/blusa-2.svg"],
      desc: "Encaje marfil con detalles dorados y mangas con terminación festoneada. Una blusa delicada que eleva cualquier look, inspirada en los encajes de la colección de novia.",
      details: [
        "Encaje con terminación festoneada",
        "Detalles en hilo dorado",
        "Forro interior suave",
        "Ideal para ocasiones especiales"
      ]
    },
    {
      id: "blusa-artesanal-girasol",
      name: "Blusa Artesanal Girasol",
      category: "blusas",
      price: 295,
      compareAt: 0,
      stock: 12,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Mostaza", hex: "#D9A227" },
        { name: "Vino", hex: "#7B1733" }
      ],
      badge: "",
      featured: true,
      active: true,
      images: ["assets/img/blusa-3.svg"],
      desc: "Un sol en forma de blusa. Tono mostaza con bordado en vino y detalles tejidos en el cuello y las mangas. Cómoda, fresca y llena de color.",
      details: [
        "Bordado en hilo vino",
        "Corte holgado y fresco",
        "Tela de algodón",
        "Hecha a mano"
      ]
    },
    {
      id: "blusa-turquesa-feria",
      name: "Blusa Turquesa de Feria",
      category: "blusas",
      price: 345,
      compareAt: 0,
      stock: 8,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        { name: "Turquesa", hex: "#2A8C8C" },
        { name: "Crema", hex: "#F4E4B8" }
      ],
      badge: "Nuevo",
      featured: false,
      active: true,
      images: ["assets/img/blusa-4.svg"],
      desc: "Turquesa intenso con bordado crema, inspirada en las ferias del altiplano. Una blusa alegre que se lleva sola o debajo de tu traje preferido.",
      details: [
        "Bordado geométrico en crema",
        "Manga corta con terminación tejida",
        "Tela suave de algodón",
        "Tallas de XS a L"
      ]
    },
    {
      id: "corte-tipico-solola",
      name: "Corte Típico Sololá",
      category: "cortes",
      price: 475,
      compareAt: 0,
      stock: 10,
      sizes: ["2 varas", "3 varas", "4 varas"],
      colors: [
        { name: "Morado", hex: "#5B2A6E" },
        { name: "Lila", hex: "#C9A3D4" }
      ],
      badge: "Hecho a mano",
      featured: true,
      active: true,
      images: ["assets/img/corte-1.svg"],
      desc: "Corte de Sololá con pliegues profundos y franjas tejidas en tonos morado y lila. Se vende por vara o en pieza completa, listo para confeccionar o lucir.",
      details: [
        "Tejido tradicional de Sololá",
        "Se vende por vara o pieza",
        "Colores firmes, no destiñe",
        "Ideal para traje o decoración"
      ]
    },
    {
      id: "corte-tradicional-nebaj",
      name: "Corte Tradicional Nebaj",
      category: "cortes",
      price: 520,
      compareAt: 0,
      stock: 6,
      sizes: ["2 varas", "3 varas", "4 varas"],
      colors: [
        { name: "Verde", hex: "#4E6B2F" },
        { name: "Crema", hex: "#F0E0A8" }
      ],
      badge: "",
      featured: true,
      active: true,
      images: ["assets/img/corte-2.svg"],
      desc: "Verde profundo con motivos geométricos en crema, inspirado en los tejidos de Nebaj. Un corte de peso medio, ideal para climas frescos del altiplano.",
      details: [
        "Tejido de peso medio",
        "Motivos geométricos tejidos",
        "Disponible por vara",
        "Hecho a mano"
      ]
    },
    {
      id: "corte-gala-coban",
      name: "Corte de Gala Cobán",
      category: "cortes",
      price: 560,
      compareAt: 620,
      stock: 4,
      sizes: ["2 varas", "3 varas", "4 varas"],
      colors: [
        { name: "Coral", hex: "#D9644A" },
        { name: "Durazno", hex: "#F2CDA9" }
      ],
      badge: "Edición limitada",
      featured: true,
      active: true,
      images: ["assets/img/corte-3.svg"],
      desc: "Coral y durazno en un corte de gala con franjas y bordes tejidos. Una pieza vibrante para ocasiones especiales, inspirada en los textiles de Cobán.",
      details: [
        "Franjas tejidas a mano",
        "Bordes con terminación artesanal",
        "Colores de alta duración",
        "Pieza de edición limitada"
      ]
    }
  ],

  testimonials: [
    {
      name: "María López",
      city: "San Marcos",
      text: "Pedí un traje para el cumpleaños de mi mamá y llegó hermoso, tal como en las fotos. El bordado es finísimo y la atención por WhatsApp fue de diez.",
      stars: 5
    },
    {
      name: "Ana Pérez",
      city: "Quetzaltenango",
      text: "Compré tres blusas para mis hermanas y quedaron encantadas. La tela es fresca y los colores son exactamente los de la página. Ya quiero pedir más.",
      stars: 5
    },
    {
      name: "Rosa Méndez",
      city: "Ciudad de Guatemala",
      text: "Me ayudaron a elegir la talla por mensaje y el envío llegó en tres días. Se nota que cada pieza está hecha con calma y con cariño.",
      stars: 5
    }
  ]
};
