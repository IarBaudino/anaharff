export interface StoreItem {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
}

export interface SiteContent {
  home: {
    titulo: string;
    parrafoEs: string;
    parrafoEn: string;
  };
  sobreMi: {
    bio1: string;
    bio2: string;
    sesionTexto: string;
  };
  tienda: {
    titulo: string;
    descripcion: string;
    items: StoreItem[];
  };
}

export const defaultSiteContent: SiteContent = {
  home: {
    titulo: "ANA HARFF",
    parrafoEs:
      "Abrazar la diversidad y la autenticidad es crucial para liberarnos de los estereotipos. Te invito a reflexionar sobre la importancia de la representación del cuerpo y a ser parte de una necesaria reflexión sobre la igualdad, la emancipación y la lucha por la autenticidad corporal.",
    parrafoEn:
      "Embracing diversity and authenticity is crucial to liberate ourselves from stereotypes. I invite you to reflect on the importance of body representation and to be part of a necessary reflection about equality, emancipation and the struggle for body authenticity.",
  },
  sobreMi: {
    bio1:
      "Fotógrafa analógica radicada en Buenos Aires. Mi trabajo explora la representación del cuerpo, la diversidad y la autenticidad. A través de la fotografía analógica busco capturar momentos de vulnerabilidad y verdad.",
    bio2:
      "Mi práctica fotográfica se centra en desnudos artísticos, retratos íntimos y series que cuestionan los estereotipos corporales. Creo en la importancia de la representación diversa y en la lucha por la emancipación del cuerpo.",
    sesionTexto:
      "Ofrezco sesiones de fotografía analógica personalizadas. Si te interesa reservar una sesión, no dudes en contactarme.",
  },
  tienda: {
    titulo: "Tienda",
    descripcion:
      "Imágenes en edición limitada. Fotografía analógica impresa o en formato digital de alta resolución.",
    items: [
      {
        id: "1",
        titulo: "Serie Unica - #1",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=1",
      },
      {
        id: "2",
        titulo: "Serie Unica - #2",
        descripcion: "Fotografía analógica 35mm",
        precio: 15000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=2",
      },
      {
        id: "3",
        titulo: "Retrato - #1",
        descripcion: "Impresión fine art",
        precio: 25000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=3",
      },
      {
        id: "4",
        titulo: "Retrato - #2",
        descripcion: "Impresión fine art",
        precio: 25000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=4",
      },
      {
        id: "5",
        titulo: "Experimental - #1",
        descripcion: "Edición limitada",
        precio: 18000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=5",
      },
      {
        id: "6",
        titulo: "Experimental - #2",
        descripcion: "Edición limitada",
        precio: 18000,
        imagenUrl: "https://placehold.co/600x800/f7f5f0/1a1a1a?text=6",
      },
    ],
  },
};
