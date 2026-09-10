import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Instagram, Mail, Menu, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sampleCategories, sampleProfile, sampleProjects } from '@/data/samplePortfolio';
import type { Category, PortfolioImage, Profile, Project } from '@/lib/types';

type View = 'portfolio' | 'admin';
type Filter = 'all' | string;

function mergeProjects(categories: Category[], projects: Array<Omit<Project, 'images'> & { portfolio_images?: PortfolioImage[] }>, images: PortfolioImage[]) {
  return projects.map((project) => ({
    ...project,
    category: categories.find((category) => category.id === project.category_id) ?? null,
    images: images.filter((image) => image.project_id === project.id).sort((a, b) => a.display_order - b.display_order),
  }));
}

function App() {
  const [view, setView] = useState<View>(window.location.pathname.startsWith('/admin') ? 'admin' : 'portfolio');
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [profile, setProfile] = useState<Profile>(sampleProfile);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadPortfolio = async () => {
      const [categoriesResult, projectsResult, imagesResult, profileResult] = await Promise.all([
        supabase.from('portfolio_categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('portfolio_projects').select('*').eq('is_published', true).order('display_order'),
        supabase.from('portfolio_images').select('*').order('display_order'),
        supabase.from('portfolio_profile').select('*').limit(1).maybeSingle(),
      ]);
      if (!categoriesResult.error && categoriesResult.data?.length) setCategories(categoriesResult.data as Category[]);
      if (!projectsResult.error && projectsResult.data?.length) {
        const loadedCategories = categoriesResult.data?.length ? categoriesResult.data as Category[] : sampleCategories;
        const loadedImages = imagesResult.error ? [] : imagesResult.data as PortfolioImage[];
        setProjects(mergeProjects(loadedCategories, projectsResult.data as Array<Omit<Project, 'images'> & { portfolio_images?: PortfolioImage[] }>, loadedImages));
      }
      if (!profileResult.error && profileResult.data) setProfile(profileResult.data as Profile);
      setLoading(false);
    };
    void loadPortfolio();
  }, []);

  useEffect(() => {
    const handlePopState = () => setView(window.location.pathname.startsWith('/admin') ? 'admin' : 'portfolio');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filteredProjects = useMemo(() => {
    const visible = activeFilter === 'all' ? projects : projects.filter((project) => project.category_id === activeFilter);
    return [...visible].sort((a, b) => a.display_order - b.display_order);
  }, [activeFilter, projects]);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedImageIndex(0);
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setView(path.startsWith('/admin') ? 'admin' : 'portfolio');
    setMobileMenuOpen(false);
  };

  if (view === 'admin') {
    return <AdminView categories={categories} projects={projects} profile={profile} onProjectsChange={setProjects} onCategoriesChange={setCategories} onProfileChange={setProfile} onBack={() => navigate('/')} />;
  }

  return (
    <div className="portfolio-shell">
      <aside className={`site-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="sidebar-topline">
          <button className="wordmark" onClick={() => { setActiveFilter('all'); navigate('/'); }} aria-label="Voltar para a página inicial">
            <span>JUAN</span><span>LORA</span>
          </button>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <nav className="category-nav" aria-label="Categorias do portfólio">
          <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => { setActiveFilter('all'); setMobileMenuOpen(false); }}>TODOS</button>
          {categories.map((category) => <button key={category.id} className={activeFilter === category.id ? 'active' : ''} onClick={() => { setActiveFilter(category.id); setMobileMenuOpen(false); }}>{category.name.toUpperCase()}</button>)}
          <button onClick={() => { setMobileMenuOpen(false); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>SOBRE + CONTATO</button>
        </nav>
        <div className="sidebar-contact">
          <div className="social-row"><a href="mailto:Juanloracardoso@gmail.com" aria-label="Enviar email"><Mail size={18} /></a><a href="#about" aria-label="Instagram"><Instagram size={18} /></a></div>
          <p>Contato:</p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a>
        </div>
      </aside>

      <button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu"><Menu size={22} /></button>
      <main className="portfolio-main">
        <header className="mobile-header"><span>JUAN LORA</span><span>{activeFilter === 'all' ? 'TODOS' : categories.find((category) => category.id === activeFilter)?.name}</span></header>
        {loading ? <div className="loading-state">Carregando trabalhos</div> : <section className="project-grid" aria-label="Trabalhos fotográficos">
          {filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onClick={() => openProject(project)} />)}
        </section>}
        {!loading && filteredProjects.length === 0 && <div className="empty-state">Ainda não há trabalhos nesta categoria.</div>}
        <section id="about" className="about-section">
          <p className="eyebrow">SOBRE + CONTATO</p>
          <h1>{profile.name}</h1>
          <p>{profile.bio}</p>
          <div className="about-links"><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a></div>
          <button className="admin-link" onClick={() => navigate('/admin')}>GERENCIAR PORTFÓLIO <ArrowRight size={14} /></button>
        </section>
      </main>
      {selectedProject && <Lightbox project={selectedProject} imageIndex={selectedImageIndex} onClose={() => setSelectedProject(null)} onPrevious={() => setSelectedImageIndex((index) => (index - 1 + selectedProject.images.length) % selectedProject.images.length)} onNext={() => setSelectedImageIndex((index) => (index + 1) % selectedProject.images.length)} />}
    </div>
  );
}

function ProjectCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const coverVertical = project.cover_image_url.includes('h%3D1200');
  return <button className={`project-card ${coverVertical ? 'card-tall' : 'card-wide'}`} onClick={onClick} aria-label={`Abrir trabalho ${project.title}`}><img src={project.cover_image_url} alt={project.title} loading={index < 3 ? 'eager' : 'lazy'} /><span className="card-label"><strong>{project.title}</strong><small>{project.category?.name}</small></span></button>;
}

function Lightbox({ project, imageIndex, onClose, onPrevious, onNext }: { project: Project; imageIndex: number; onClose: () => void; onPrevious: () => void; onNext: () => void }) {
  const image = project.images[imageIndex] ?? { image_url: project.cover_image_url, caption: project.title };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); if (event.key === 'ArrowLeft') onPrevious(); if (event.key === 'ArrowRight') onNext(); };
    window.addEventListener('keydown', onKeyDown); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; };
  }, [onClose, onNext, onPrevious]);
  return <div className="lightbox-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><button className="lightbox-close" onClick={onClose} aria-label="Fechar"><X size={22} /></button><button className="lightbox-arrow left" onClick={onPrevious} aria-label="Foto anterior"><ArrowLeft size={20} /></button><figure className="polaroid"><div className="polaroid-image"><img src={image.image_url} alt={image.caption || project.title} /></div><figcaption><strong>{image.caption || project.title}</strong><span>{project.title} · {imageIndex + 1} / {project.images.length}</span></figcaption></figure><button className="lightbox-arrow right" onClick={onNext} aria-label="Próxima foto"><ArrowRight size={20} /></button></div>;
}

function AdminView({ categories, projects, profile, onProjectsChange, onCategoriesChange, onProfileChange, onBack }: { categories: Category[]; projects: Project[]; profile: Profile; onProjectsChange: (projects: Project[]) => void; onCategoriesChange: (categories: Category[]) => void; onProfileChange: (profile: Profile) => void; onBack: () => void }) {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [authMode, setAuthMode] = useState<'login' | 'signup'>('login'); const [message, setMessage] = useState('');
  const [draft, setDraft] = useState({ title: '', category_id: categories[0]?.id ?? '', description: '', image_url: '' });
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session))); }, []);
  const submitAuth = async (event: FormEvent) => { event.preventDefault(); setMessage(''); const result = authMode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (result.error) setMessage('Não foi possível concluir. Confira seus dados e tente novamente.'); else { setSession(true); setMessage(authMode === 'signup' ? 'Conta criada. Você já pode acessar o gerenciamento.' : ''); } };
  const addProject = async (event: FormEvent) => { event.preventDefault(); if (!draft.title.trim() || !draft.image_url.trim()) return; const { data, error } = await supabase.from('portfolio_projects').insert({ title: draft.title, description: draft.description, category_id: draft.category_id || null, cover_image_url: draft.image_url, display_order: projects.length + 1 }).select().maybeSingle(); if (!error && data) { const project = { ...data as Project, category: categories.find((category) => category.id === data.category_id), images: [] }; const imageResult = await supabase.from('portfolio_images').insert({ project_id: data.id, image_url: draft.image_url, caption: draft.title, display_order: 1 }).select().maybeSingle(); onProjectsChange([...projects, { ...project, images: imageResult.data ? [imageResult.data as PortfolioImage] : [] }]); setDraft({ title: '', category_id: categories[0]?.id ?? '', description: '', image_url: '' }); setMessage('Trabalho adicionado ao portfólio.'); } else setMessage('Não foi possível salvar o trabalho.'); };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const extension = file.name.split('.').pop() ?? 'jpg'; const path = `${crypto.randomUUID()}.${extension}`; const upload = await supabase.storage.from('portfolio-images').upload(path, file, { contentType: file.type, upsert: false }); if (upload.error) { setMessage('Não foi possível enviar essa imagem.'); return; } const { data } = supabase.storage.from('portfolio-images').getPublicUrl(path); setDraft((current) => ({ ...current, image_url: data.publicUrl })); setMessage('Imagem carregada. Agora salve o trabalho.'); };
  const updateProfile = async (event: FormEvent) => { event.preventDefault(); const result = profile.id === 'juan-lora' ? await supabase.from('portfolio_profile').insert({ name: profile.name, email: profile.email, phone: profile.phone, bio: profile.bio }).select().maybeSingle() : await supabase.from('portfolio_profile').update({ name: profile.name, email: profile.email, phone: profile.phone, bio: profile.bio }).eq('id', profile.id); if (result.error) setMessage('Não foi possível salvar seus dados.'); else setMessage('Dados de contato atualizados.'); };
  if (session === null) return <div className="admin-loading">Abrindo gerenciamento</div>;
  if (!session) return <div className="admin-auth"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Voltar ao portfólio</button><div className="auth-card"><p className="eyebrow">ÁREA PRIVADA</p><h1>{authMode === 'login' ? 'Entrar no gerenciamento' : 'Criar acesso'}</h1><p className="muted">Gerencie seus trabalhos, imagens e informações públicas.</p><form onSubmit={(event) => void submitAuth(event)}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label><button className="primary-button" type="submit">{authMode === 'login' ? 'ENTRAR' : 'CRIAR ACESSO'}</button></form><button className="text-button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'Ainda não tenho acesso' : 'Já tenho acesso'}</button>{message && <p className="form-message">{message}</p>}</div></div>;
  return <div className="admin-page"><header className="admin-header"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Ver portfólio</button><div><span className="admin-kicker">PAINEL DE JUAN LORA</span><h1>Gerenciamento</h1></div><button className="text-button" onClick={() => { void supabase.auth.signOut(); setSession(false); }}>Sair</button></header><div className="admin-content">{message && <p className="form-message">{message}</p>}<section className="admin-panel"><div><p className="eyebrow">NOVO TRABALHO</p><h2>Adicionar uma capa</h2></div><form className="project-form" onSubmit={(event) => void addProject(event)}><label>Título<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Nome do trabalho" required /></label><label>Categoria<select value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Descrição<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Uma frase sobre o trabalho" /></label><label>Imagem da capa<div className="upload-row"><input value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} placeholder="URL da imagem" required /><label className="upload-button">ENVIAR FOTO<input type="file" accept="image/*" onChange={(event) => void uploadImage(event)} /></label></div></label><button className="primary-button" type="submit"><Plus size={16} /> ADICIONAR TRABALHO</button></form></section><section className="admin-panel"><div><p className="eyebrow">TRABALHOS PUBLICADOS</p><h2>{projects.length} trabalhos</h2></div><div className="admin-list">{projects.map((project) => <div className="admin-list-item" key={project.id}><img src={project.cover_image_url} alt="" /><div><strong>{project.title}</strong><span>{project.category?.name}</span></div><small>{project.images.length} fotos</small></div>)}</div></section><section className="admin-panel"><div><p className="eyebrow">SOBRE + CONTATO</p><h2>Informações públicas</h2></div><form className="project-form" onSubmit={(event) => void updateProfile(event)}><label>Nome<input value={profile.name} onChange={(event) => onProfileChange({ ...profile, name: event.target.value })} /></label><label>Email<input type="email" value={profile.email} onChange={(event) => onProfileChange({ ...profile, email: event.target.value })} /></label><label>Telefone<input value={profile.phone} onChange={(event) => onProfileChange({ ...profile, phone: event.target.value })} /></label><label>Bio<textarea value={profile.bio} onChange={(event) => onProfileChange({ ...profile, bio: event.target.value })} /></label><button className="primary-button" type="submit">SALVAR INFORMAÇÕES</button></form></section></div></div>;
}

export default App;
