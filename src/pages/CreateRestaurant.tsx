import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCreateRestaurant } from '../hooks/createRestaurant.hook';
import { restaurantApi } from '../api/restaurant.api';

// Import Modular Components
import Step1Info from '../components/CreateRestaurant/Step1Info';
import Step2Shifts from '../components/CreateRestaurant/Step2Shifts';
import Step3Zones from '../components/CreateRestaurant/Step3Zones';
import Step4TableMap from '../components/CreateRestaurant/Step4TableMap';
import Step5Summary from '../components/CreateRestaurant/Step5Summary';

const CreateRestaurantContent: React.FC = () => {
    const navigate = useNavigate();
    const {
        step,
        setStep,
        formData,
        photos,
        shifts,
        zones,
        tables,
        tableTypes
    } = useCreateRestaurant();
    const [isStep1Valid, setIsStep1Valid] = React.useState(false);
    const [step1SubmitAttempted, setStep1SubmitAttempted] = React.useState(false);

    React.useEffect(() => {
        if (step !== 1 && step1SubmitAttempted) {
            setStep1SubmitAttempted(false);
        }
    }, [step, step1SubmitAttempted]);

    /**
     * Construye un JSON global con todo el estado del wizard.
     * Este objeto es la base para, en el siguiente paso, enviarlo al backend
     * y hacer los inserts definitivos.
     */
    const buildCreateRestaurantPayload = (image?: { base64: string; mimeType: string; originalName: string }) => ({
        // Campos que necesita actualmente el backend para crear RESTAURANTS
        nom: formData.name,
        direccio: formData.address,
        horaris: `${formData.startTime} - ${formData.endTime}`,
        telefon: formData.phone,
        descripcio: formData.description,
        imageBase64: image?.base64,
        imageMimeType: image?.mimeType,
        imageOriginalName: image?.originalName,
        // Bloque global para siguientes pasos (inserts de turnos, zonas y mesas)
        wizardData: {
            shifts,
            zones,
            tableTypesCatalog: tableTypes,
            tablesByZone: tables,
        },
    });

    // Convierte File -> base64 puro (sin prefijo data:mime/...).
    const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
            reader.readAsDataURL(file);
        });

    const handlePrimaryAction = async () => {
        if (step === 1) {
            setStep1SubmitAttempted(true);
            if (!isStep1Valid) return;
        }

        if (step < 5) {
            setStep(step + 1);
            return;
        }

        const firstPhoto = photos[0];
        const imagePayload = firstPhoto
            ? {
                base64: await toBase64(firstPhoto),
                mimeType: firstPhoto.type,
                originalName: firstPhoto.name,
            }
            : undefined;

        const payload = buildCreateRestaurantPayload(imagePayload);
        // Log legible: evitamos imprimir el base64 completo para no "ocultar" wizardData en consola.
        const { imageBase64, ...payloadWithoutImage } = payload;
        console.log('[CREATE_RESTAURANT_PAYLOAD_JSON_NO_IMAGE]', JSON.stringify(payloadWithoutImage, null, 2));
        console.log('[CREATE_RESTAURANT_WIZARD_DATA]', payload.wizardData);
        console.log('[CREATE_RESTAURANT_IMAGE_BASE64_LENGTH]', imageBase64?.length ?? 0);

        try {
            const response = await restaurantApi.createRestaurant(payload);

            // Respuesta del backend tras crear el restaurante con el body JSON generado
            console.log('[CREATE_RESTAURANT_RESPONSE]', response);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al crear restaurante', error);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Info onValidityChange={setIsStep1Valid} submitAttempted={step1SubmitAttempted} />;
            case 2: return <Step2Shifts />;
            case 3: return <Step3Zones />;
            case 4: return (
                <Step4TableMap />
            );
            case 5: return <Step5Summary />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] font-body text-brand-gray pb-12 transition-all duration-500">
            <header className="max-w-4xl mx-auto pt-8 px-6 text-center">
                <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
                    <Link to="/" className="hover:text-brand-primary transition-colors">Restaurants</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-brand-primary/60">Nou</span>
                </nav>
                <h1 className="text-6xl font-heading font-black text-brand-primary mb-12 tracking-tighter">Dish<span className="text-[#B38B59] italic uppercase text-4xl ml-2 tracking-normal font-medium">Sync</span></h1>
            </header>

            <main className="max-w-4xl mx-auto px-6 transition-all duration-700">
                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-16 px-4">
                        <button 
                            onClick={() => step > 1 && setStep(step - 1)} 
                            className={`p-4 -ml-4 rounded-full transition-all active:scale-90 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-brand-primary hover:bg-brand-primary/5'}`}
                        >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex gap-4 flex-1 max-w-xl px-12">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setStep(s)} className={`h-2.5 flex-1 rounded-full transition-all duration-700 ${s === step ? 'bg-[#4A1A12] w-full shadow-lg shadow-brand-primary/20' : s < step ? 'bg-[#4A1A12] opacity-20' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-brand-gray/30 whitespace-nowrap">STEP 0{step}</span>
                    </div>

                    {renderStep()}

                    {/* Navigation */}
                    <div className="pt-20">
                        <button 
                            onClick={handlePrimaryAction}
                            className="w-full py-7 bg-[#4A1A12] text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all duration-700 active:scale-[0.98] shadow-3xl shadow-[#4A1A12]/30"
                        >
                            {step === 5 ? 'Crear Restaurant' : 'CONTINUAR'}
                        </button>
                    </div>
                </div>
                <footer className="mt-20 text-center pb-12">
                    <p className="text-[10px] font-black text-brand-gray/10 tracking-[0.2em] uppercase">SYSTEM CORE — DISHSYNC OPERATIONAL SUITE v2.1.0</p>
                </footer>
            </main>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4A1A1215; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4A1A1230; }
            `}} />
        </div>
    );
};

export default function CreateRestaurant() {
    return <CreateRestaurantContent />;
}
