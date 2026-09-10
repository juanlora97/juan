import type { Category, Profile, Project } from '@/lib/types';

export const sampleCategories: Category[] = [
  { id: 'urbano', name: 'Urbano', slug: 'urbano', display_order: 1, is_active: true },
  { id: 'esportes', name: 'Esportes', slug: 'esportes', display_order: 2, is_active: true },
  { id: 'imobiliaria', name: 'Imobiliária', slug: 'imobiliaria', display_order: 3, is_active: true },
  { id: 'institucional', name: 'Institucional', slug: 'institucional', display_order: 4, is_active: true },
  { id: 'documental', name: 'Fotojornalismo / Documental', slug: 'documental', display_order: 5, is_active: true },
];

function blackImage(w: number, h: number): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0a0a0a"/></svg>`
  )}`;
}

const H = (w = 1200, h = 800) => blackImage(w, h);
const V = (w = 800, h = 1200) => blackImage(w, h);

function makeImages(projectId: string, count: number, captions: string[]): { id: string; project_id: string; image_url: string; caption: string; display_order: number }[] {
  const images: { id: string; project_id: string; image_url: string; caption: string; display_order: number }[] = [];
  for (let i = 0; i < count; i++) {
    const isVertical = i % 2 === 1;
    images.push({
      id: `${projectId}-img-${i + 1}`,
      project_id: projectId,
      image_url: isVertical ? V() : H(),
      caption: captions[i] ?? captions[0] ?? '',
      display_order: i + 1,
    });
  }
  return images;
}

const projectDefs: Array<{ id: string; title: string; description: string; categoryIndex: number; coverVertical: boolean; imageCount: number; captions: string[] }> = [
  { id: 'cidade-em-movimento', title: 'Cidade em movimento', description: 'Retratos do cotidiano urbano e das histórias que atravessam a cidade.', categoryIndex: 0, coverVertical: false, imageCount: 6, captions: ['Cidade em movimento', 'Entre prédios e silêncios', 'Cruzamentos', 'Vitrines', 'Madrugada', 'Linha do horizonte'] },
  { id: 'asfalto-e-chuva', title: 'Asfalto e chuva', description: 'A cidade sob a água, reflexos e texturas do urbano.', categoryIndex: 0, coverVertical: true, imageCount: 4, captions: ['Asfalto e chuva', 'Poças', 'Guarda-chuvas', 'Neon molhado'] },
  { id: 'linhas-de-forca', title: 'Linhas de força', description: 'Geometria urbana e a arquitetura que organiza o cotidiano.', categoryIndex: 0, coverVertical: false, imageCount: 5, captions: ['Linhas de força', 'Concreto', 'Viaduto', 'Sombra e luz', 'Perspectiva'] },
  { id: 'corpo-e-ritmo', title: 'Corpo e ritmo', description: 'A energia, a concentração e a presença do esporte.', categoryIndex: 1, coverVertical: false, imageCount: 5, captions: ['Corpo e ritmo', 'Aquecimento', 'Banco de reservas', 'Vitória', 'Derrota'] },
  { id: 'acao-e-pausa', title: 'Ação e pausa', description: 'O instante do movimento e o silêncio que o cerca.', categoryIndex: 1, coverVertical: true, imageCount: 4, captions: ['Ação e pausa', 'Saída dos blocos', 'Cronômetro', 'Linha de chegada'] },
  { id: 'arena', title: 'Arena', description: 'Competição, plateia e a tensão do jogo.', categoryIndex: 1, coverVertical: false, imageCount: 3, captions: ['Arena', 'Torcida', 'Apito final'] },
  { id: 'materia-e-luz', title: 'Matéria e luz', description: 'Arquitetura, interiores e a experiência de habitar.', categoryIndex: 2, coverVertical: false, imageCount: 5, captions: ['Matéria e luz', 'Sala de estar', 'Cozinha', 'Varanda', 'Detalhe'] },
  { id: 'espacos-vazios', title: 'Espaços vazios', description: 'Ambientes prontos para receber histórias.', categoryIndex: 2, coverVertical: true, imageCount: 4, captions: ['Espaços vazios', 'Corredor', 'Janela', 'Pé direito alto'] },
  { id: 'fachadas', title: 'Fachadas', description: 'A pele dos edifícios e o que ela conta sobre a cidade.', categoryIndex: 2, coverVertical: false, imageCount: 3, captions: ['Fachadas', 'Entrada', 'Marquise'] },
  { id: 'presenca', title: 'Presença', description: 'Pessoas, equipes e marcas em seus espaços de atuação.', categoryIndex: 3, coverVertical: false, imageCount: 5, captions: ['Presença', 'Reunião', 'Workshop', 'Equipe', 'Handshake'] },
  { id: 'bastidores', title: 'Bastidores', description: 'O que não aparece no palco, mas sustenta tudo.', categoryIndex: 3, coverVertical: true, imageCount: 4, captions: ['Bastidores', 'Camarim', 'Cabelo e maquiagem', 'Espera'] },
  { id: 'territorios', title: 'Territórios', description: 'Ensaios documentais sobre paisagem, memória e pertencimento.', categoryIndex: 4, coverVertical: false, imageCount: 6, captions: ['Territórios', 'Casa', 'Rua de terra', 'Cercas', 'Horizonte', 'Retrato'] },
  { id: 'memoria', title: 'Memória', description: 'Rastros do tempo em objetos, lugares e rostos.', categoryIndex: 4, coverVertical: true, imageCount: 4, captions: ['Memória', 'Álbum', 'Cartas', 'Parede descascada'] },
  { id: 'rua-e-gente', title: 'Rua e gente', description: 'Fotojornalismo de rua, o cotidiano como notícia.', categoryIndex: 4, coverVertical: false, imageCount: 5, captions: ['Rua e gente', 'Banca', 'Point', 'Manifestação', 'Retrato de passagem'] },
];

export const sampleProjects: Project[] = projectDefs.map((def, i) => ({
  id: def.id,
  title: def.title,
  description: def.description,
  category_id: sampleCategories[def.categoryIndex].id,
  cover_image_url: def.coverVertical ? V() : H(),
  sort_mode: 'manual' as const,
  display_order: i + 1,
  is_published: true,
  category: sampleCategories[def.categoryIndex],
  images: makeImages(def.id, def.imageCount, def.captions),
}));

export const sampleProfile: Profile = {
  id: 'juan-lora',
  name: 'Juan Lora',
  email: 'Juanloracardoso@gmail.com',
  phone: '+55 24 9-9906.7132',
  bio: 'Fotografia urbana, documental e institucional.',
};
