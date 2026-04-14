// src/pages/Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Target, Wallet, Heart, ArrowRight, Salad, TrendingUp, Clock, CheckCircle, ChevronLeft, ChevronRight, Users, Award, Zap } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay?: string;
}

interface TestimonialCardProps {
  name: string;
  image: string;
  text: string;
  achievement: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => (
  <div className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 reveal ${delay}`}>
    <div className="mb-6 bg-green-50 w-16 h-16 flex items-center justify-center rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<StepCardProps> = ({ number, title, description, delay }) => (
  <div className={`text-center text-white relative flex flex-col items-center reveal ${delay}`}>
    <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl z-10 border-4 border-green-400">
      {number}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-green-50 text-lg max-w-sm mx-auto opacity-90">{description}</p>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, image, text, achievement }) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 transition-all duration-500 hover:shadow-2xl glass-morphism">
    <div className="flex items-center gap-5 mb-8">
      <div className="relative">
        <img src={image} alt={name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-sm">
          <Award size={14} />
        </div>
      </div>
      <div>
        <h4 className="font-extrabold text-gray-900 text-xl">{name}</h4>
        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mt-1 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircle size={16} />
          <span>{achievement}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 italic text-xl leading-relaxed font-medium">"{text}"</p>
  </div>
);

const StatItem: React.FC<{ icon: React.ReactNode, value: string, label: string, delay?: string }> = ({ icon, value, label, delay }) => (
  <div className={`flex flex-col items-center p-6 reveal ${delay}`}>
    <div className="text-green-600 mb-4 bg-green-50 p-4 rounded-2xl">
      {icon}
    </div>
    <span className="text-4xl font-black text-gray-900 mb-2">{value}</span>
    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">{label}</span>
  </div>
);

const Home: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const scrollRef = useRef<IntersectionObserver | null>(null);

  const testimonials: TestimonialCardProps[] = [
    {
      name: "María González",
      image: "https://images.unsplash.com/photo-1494790108777-466fd04c0e3b?auto=format&fit=crop&w=200&q=80",
      text: "He perdido 8 kg en 3 meses siguiendo los planes de NutriCasa. ¡Los cálculos son perfectos para mí y nunca paso hambre!",
      achievement: "8 kg perdidos"
    },
    {
      name: "Carlos Rodríguez",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      text: "Como vegetariano siempre me costaba saber si comía suficientes proteínas. NutriCasa me da esa tranquilidad todos los días.",
      achievement: "+5 kg de músculo"
    },
    {
      name: "Ana Martínez",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
      text: "Con alergia al gluten y presupuesto ajustado, pensé que era imposible. NutriCasa me demostró que sí se puede comer sano y barato.",
      achievement: "100% libre de gluten"
    },
    {
      name: "David Soto",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      text: "Como estudiante con poco tiempo, NutriCasa me salvó con sus recetas de 20 minutos. Logré mi meta de mantenimiento sin estrés.",
      achievement: "Energía al máximo"
    },
    {
      name: "Elena Rivas",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      text: "A mis 55 años, necesitaba controlar mi colesterol. Los planes personalizados me enseñaron a comer rico y balanceado.",
      achievement: "Colesterol controlado"
    },
    {
      name: "Javier López",
      image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=200&q=80",
      text: "Entreno para triatlones y necesitaba una precisión milimétrica en mis carbohidratos. NutriCasa es mi mejor herramienta de rendimiento.",
      achievement: "PB en Triatlón"
    },
    {
      name: "Lucía Méndez",
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80",
      text: "Siendo madre de tres, cocinar saludable era un reto. Ahora mis hijos aman las recetas y yo ahorro tiempo en la cocina.",
      achievement: "Bienestar familiar"
    }
  ];

  useEffect(() => {
    // Intersection Observer for scroll animations
    scrollRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      scrollRef.current?.observe(el);
    });

    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      scrollRef.current?.disconnect();
      clearInterval(timer);
    };
  }, [testimonials.length]);

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden selection:bg-green-100 selection:text-green-800">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-white py-10 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[40rem] h-[40rem] bg-green-100 rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-[-10%] w-[30rem] h-[30rem] bg-green-50 rounded-full blur-[80px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-center lg:text-left reveal-left active">
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-green-600/10 text-green-700 text-sm font-bold tracking-wider mb-8 border border-green-200">
                <Zap size={16} fill="currentColor" /> LA REVOLUCIÓN NUTRICIONAL
              </span>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 mb-8 leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-green-500 to-green-400">NutriCasa</span>
                <br />
                Tu cocina, <br />tu salud.
              </h1>
              <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Planes de alimentación ultra-personalizados basados en tu biometría, 
                presupuesto y estilo de vida. No es una dieta, es libertad.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-green-700 hover:shadow-[0_20px_50px_rgba(22,163,74,0.3)] hover:-translate-y-2 transition-all duration-500 flex items-center justify-center gap-3"
                >
                  Mejorar mi vida <ArrowRight size={24} />
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white border-2 border-gray-100 text-gray-800 px-10 py-5 rounded-2xl text-xl font-bold hover:border-green-300 hover:text-green-600 hover:bg-green-50/50 transition-all duration-500 flex items-center justify-center"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative reveal-right active">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-green-500 to-green-300 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity animate-pulse-slow"></div>
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=90" 
                  alt="Comida saludable Premium" 
                  className="relative rounded-[3rem] shadow-2xl w-full max-w-2xl mx-auto lg:max-w-full object-cover h-[650px] animate-float"
                />
                {/* Floating Overlay Card */}
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl hidden md:block animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                      <Target size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500">Logro diario</p>
                      <p className="text-xl font-black text-gray-900">100% kcal meta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatItem icon={<Users size={32} />} value="15,000+" label="Usuarios Activos" delay="delay-100" />
            <StatItem icon={<Award size={32} />} value="98%" label="Tasa de Éxito" delay="delay-200" />
            <StatItem icon={<Salad size={32} />} value="500+" label="Recetas Únicas" delay="delay-300" />
            <StatItem icon={<TrendingUp size={32} />} value="2M+" label="Kcal Registradas" delay="delay-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24 reveal">
            <span className="text-green-600 font-bold tracking-widest uppercase text-sm mb-4 block">Beneficios Exclusivos</span>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
              ¿Por qué <span className="text-green-600">NutriCasa</span>?
            </h2>
            <p className="text-2xl text-gray-500 leading-relaxed">Combinamos ciencia, tecnología y sabor para que tu camino hacia la salud sea irresistible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Target size={32} />}
              title="Objetivos Dinámicos"
              description="Algoritmos que recalculan tus necesidades en tiempo real según tu progreso diario."
              delay="delay-100"
            />
            <FeatureCard 
              icon={<Wallet size={32} />}
              title="Presupuesto Inteligente"
              description="Ahorra hasta un 30% en mandado con listas de compras optimizadas por precio."
              delay="delay-200"
            />
            <FeatureCard 
              icon={<Heart size={32} />}
              title="Respeto Total"
              description="Vegetariano, Keto o Paleo. Tú eliges, nosotros equilibramos los macros por ti."
              delay="delay-300"
            />
            <FeatureCard 
              icon={<Salad size={32} />}
              title="IA de Recetas"
              description="Sugerencias inteligentes basadas en lo que tienes en tu refrigerador."
              delay="delay-100"
            />
            <FeatureCard 
              icon={<TrendingUp size={32} />}
              title="Analítica Visual"
              description="Gráficas interactivas que muestran cómo cambia tu composición corporal."
              delay="delay-200"
            />
            <FeatureCard 
              icon={<Clock size={32} />}
              title="Gestión de Tiempo"
              description="Recetas de máximo 20 minutos para que la falta de tiempo no sea una excusa."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-green-600 py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-center text-white mb-24 tracking-tight reveal">
            Pasos al éxito
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-1 bg-green-400 dash-line opacity-30"></div>
            
            <StepCard 
              number="1"
              title="Mapeo Biométrico"
              description="Ingresa tus datos y deja que nuestra IA cree tu perfil metabólico único."
              delay="delay-100"
            />
            <StepCard 
              number="2"
              title="Plan de Acción"
              description="Recibe menús diarios con recetas paso a paso y lista de compras exacta."
              delay="delay-300"
            />
            <StepCard 
              number="3"
              title="Transformación"
              description="Registra tus avances y mira cómo NutriCasa ajusta tu plan para optimizar resultados."
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24 reveal">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
              Impacto Real
            </h2>
            <p className="text-2xl text-gray-500">Únete a la comunidad que está redefiniendo el bienestar.</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Navigation Buttons */}
            <button 
              onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-[-20px] md:left-[-70px] top-1/2 -translate-y-1/2 z-20 p-5 bg-white rounded-full shadow-2xl text-gray-400 hover:text-green-600 transition-all hover:scale-110 active:scale-95 group"
            >
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
              className="absolute right-[-20px] md:right-[-70px] top-1/2 -translate-y-1/2 z-20 p-5 bg-white rounded-full shadow-2xl text-gray-400 hover:text-green-600 transition-all hover:scale-110 active:scale-95 group"
            >
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Testimonial Slide */}
            <div className="transition-all duration-700 ease-in-out transform reveal">
              <TestimonialCard 
                {...testimonials[activeTestimonial]}
              />
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-4 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-3 rounded-full transition-all duration-500 ${
                    i === activeTestimonial ? 'w-16 bg-green-600' : 'w-3 bg-gray-300 hover:bg-green-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 rounded-[4rem] p-16 md:p-32 text-center text-white shadow-[0_50px_100px_rgba(22,163,74,0.2)] relative overflow-hidden reveal">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[40rem] h-[40rem] bg-white opacity-10 rounded-full blur-[100px]"></div>
            
            <h2 className="text-5xl md:text-8xl font-black mb-10 relative z-10 tracking-tight leading-tight">
              ¿Listo para tu mejor versión?
            </h2>
            <p className="text-2xl md:text-3xl mb-16 opacity-90 max-w-3xl mx-auto relative z-10 font-medium leading-relaxed">
              Empieza tu transformación hoy mismo. NutriCasa es el compañero que siempre debiste tener en tu cocina.
            </p>
            <Link 
              to="/register" 
              className="bg-white text-green-700 px-14 py-7 rounded-[2rem] text-2xl font-black hover:bg-green-50 hover:scale-105 active:scale-95 hover:shadow-2xl transition-all duration-500 inline-flex items-center gap-4 shadow-xl relative z-10"
            >
              Unirme a NutriCasa <ArrowRight size={28} />
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;