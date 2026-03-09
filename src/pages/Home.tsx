// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Wallet, Heart, ArrowRight, Salad, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

interface TestimonialCardProps {
  name: string;
  image: string;
  text: string;
  achievement: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="mb-5 bg-green-50 w-16 h-16 flex items-center justify-center rounded-2xl text-green-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => (
  <div className="text-center text-white relative flex flex-col items-center">
    <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg z-10">
      {number}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-green-50 text-lg max-w-sm mx-auto">{description}</p>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, image, text, achievement }) => (
  <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-50 hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4 mb-6">
      <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
      <div>
        <h4 className="font-bold text-gray-800 text-lg">{name}</h4>
        <div className="flex items-center gap-1 text-green-600 font-medium text-sm mt-1">
          <CheckCircle size={16} />
          <span>{achievement}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-600 italic text-lg leading-relaxed">"{text}"</p>
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      
      {/* Hero Section - Ahora ocupa toda la pantalla (min-h-screen) */}
<section className="relative min-h-[calc(100vh-80px)] flex items-center bg-gradient-to-br from-green-50 via-white to-green-100 py-10">        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="flex-1 text-center lg:text-left z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-sm font-semibold tracking-wider mb-6">
                NUEVA FORMA DE COMER
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">NutriCasa</span>
                <br />
                Tu cocina, tu salud.
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Planes de alimentación personalizados basados en tus objetivos, 
                presupuesto y preferencias. ¡Come rico y saludable sin complicaciones!
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-700 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Comenzar ahora <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-colors flex items-center justify-center"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              {/* Decorative blob shape behind image */}
              <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 transform translate-x-10 translate-y-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" 
                alt="Comida saludable" 
                className="relative rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto lg:max-w-full object-cover h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Fondo blanco para contraste */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              ¿Por qué elegir <span className="text-green-600">NutriCasa</span>?
            </h2>
            <p className="text-xl text-gray-600">Todo lo que necesitas para alcanzar tus metas nutricionales, diseñado específicamente para ti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target size={32} />}
              title="Objetivos personalizados"
              description="Pérdida de peso, ganancia muscular o mantenimiento. Adaptamos cada caloría a ti."
            />
            <FeatureCard 
              icon={<Wallet size={32} />}
              title="Ajustado a tu presupuesto"
              description="Planes semanales que respetan tu bolsillo utilizando ingredientes accesibles."
            />
            <FeatureCard 
              icon={<Heart size={32} />}
              title="Alergias y preferencias"
              description="Vegetariano, vegano, sin gluten, sin lactosa. Tu dieta a tu manera."
            />
            <FeatureCard 
              icon={<Salad size={32} />}
              title="Macros calculados"
              description="Distribución exacta de proteínas, carbohidratos y grasas para tu objetivo."
            />
            <FeatureCard 
              icon={<TrendingUp size={32} />}
              title="Seguimiento de progreso"
              description="Visualiza tu avance semanalmente y ajusta tu plan cuando lo necesites."
            />
            <FeatureCard 
              icon={<Clock size={32} />}
              title="Ahorra tiempo"
              description="Olvídate de calcular calorías y pensar qué cocinar, nosotros lo hacemos por ti."
            />
          </div>
        </div>
      </section>

      {/* How it works - Fondo verde sólido */}
      <section className="bg-green-600 py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-700 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-20">
            ¿Cómo funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-1 bg-green-500 rounded-full -z-10"></div>
            
            <StepCard 
              number="1"
              title="Completa tu perfil"
              description="Cuéntanos tu edad, peso, altura, objetivo y preferencias alimenticias."
            />
            <StepCard 
              number="2"
              title="Recibe tu plan"
              description="Calculamos tus calorías diarias y creamos un menú 100% personalizado."
            />
            <StepCard 
              number="3"
              title="¡Disfruta los resultados!"
              description="Sigue tus comidas, come delicioso y alcanza tus metas de forma saludable."
            />
          </div>
        </div>
      </section>

      {/* Testimonials - Fondo sutil gris/verde */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Historias de éxito
            </h2>
            <p className="text-xl text-gray-600">No solo lo decimos nosotros, escucha a quienes ya transformaron su vida.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="María González"
              image="https://images.unsplash.com/photo-1494790108777-466fd04c0e3b?auto=format&fit=crop&w=200&q=80"
              text="He perdido 8 kg en 3 meses siguiendo los planes de NutriCasa. ¡Los cálculos son perfectos para mí y nunca paso hambre!"
              achievement="8 kg perdidos"
            />
            <TestimonialCard 
              name="Carlos Rodríguez"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              text="Como vegetariano siempre me costaba saber si comía suficientes proteínas. NutriCasa me da esa tranquilidad todos los días."
              achievement="+5 kg de músculo"
            />
            <TestimonialCard 
              name="Ana Martínez"
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"
              text="Con alergia al gluten y presupuesto ajustado, pensé que era imposible. NutriCasa me demostró que sí se puede comer sano y barato."
              achievement="100% libre de gluten"
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Decorative circles inside CTA */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">
              ¿Listo para transformar tu alimentación?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto relative z-10">
              Únete a miles de personas que ya mejoraron su salud con NutriCasa. Empieza hoy mismo, sin compromisos.
            </p>
            <Link 
              to="/register" 
              className="bg-white text-green-600 px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-50 hover:scale-105 transition-all inline-flex items-center gap-3 shadow-lg relative z-10"
            >
              Crear mi cuenta gratis <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;