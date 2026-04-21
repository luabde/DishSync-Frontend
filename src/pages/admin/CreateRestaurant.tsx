import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useCreateRestaurant } from '../../hooks/createRestaurant.hook';
import { restaurantApi } from '../../api/restaurant.api';
import { useAuth } from '../../hooks/auth.hook';
import { StaffSidebar } from '../../components/StaffSidebar';
import { getRoleDisplayLabel, getSidebarNavItems } from '../../navigation/staffSidebarNav';

// Import Modular Components
import Step1Info from '../../components/CreateRestaurant/Step1Info';
import Step2Shifts from '../../components/CreateRestaurant/Step2Shifts';
import Step3Zones from '../../components/CreateRestaurant/Step3Zones';
import Step4TableMap from '../../components/CreateRestaurant/Step4TableMap';
import Step5Users from '../../components/CreateRestaurant/Step5Users';
import Step5Summary from '../../components/CreateRestaurant/Step5Summary';

const CreateRestaurantContent: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        step,
        setStep,
        formData,
        photos,
        shifts,
        zones,
        tables,
        tableTypes,
        selectedUsers
    } = useCreateRestaurant();
    const [isStep1Valid, setIsStep1Valid] = React.useState(false);
    const [step1SubmitAttempted, setStep1SubmitAttempted] = React.useState(false);
    const [isStep2Valid, setIsStep2Valid] = React.useState(false);
    const [step2SubmitAttempted, setStep2SubmitAttempted] = React.useState(false);
    // Estado de validación para paso de mesas (step 4).
    const [isStep4Valid, setIsStep4Valid] = React.useState(false);
    const [step4SubmitAttempted, setStep4SubmitAttempted] = React.useState(false);
    // Estado de validación para paso de usuarios (step 5).
    const [isStep5Valid, setIsStep5Valid] = React.useState(false);
    const [step5SubmitAttempted, setStep5SubmitAttempted] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const sidebarNavItems = getSidebarNavItems(user?.rol);

    React.useEffect(() => {
        if (step !== 1 && step1SubmitAttempted) {
            setStep1SubmitAttempted(false);
        }
    }, [step, step1SubmitAttempted]);

    React.useEffect(() => {
        if (step !== 2 && step2SubmitAttempted) {
            setStep2SubmitAttempted(false);
        }
    }, [step, step2SubmitAttempted]);

    React.useEffect(() => {
        if (step !== 4 && step4SubmitAttempted) {
            setStep4SubmitAttempted(false);
        }
    }, [step, step4SubmitAttempted]);

    React.useEffect(() => {
        if (step !== 5 && step5SubmitAttempted) {
            setStep5SubmitAttempted(false);
        }
    }, [step, step5SubmitAttempted]);

    React.useEffect(() => {
        if (!sidebarOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [sidebarOpen]);

    /**
     * Construye un JSON global con todo el estado del wizard.
     * Este objeto es la base para, en el siguiente paso, enviarlo al backend
     * y hacer los inserts definitivos.
     */
    const buildCreateRestaurantPayload = () => ({
        // Campos que necesita actualmente el backend para crear RESTAURANTS
        nom: formData.name,
        direccio: formData.address,
        horaris: `${formData.startTime} - ${formData.endTime}`,
        telefon: formData.phone,
        descripcio: formData.description,
        url: '',
        // Bloque global para siguientes pasos (inserts de turnos, zonas y mesas)
        wizardData: {
            shifts,
            zones,
            selectedUsers: selectedUsers.map((u) => ({ id: u.id })),
            tableTypesCatalog: tableTypes,
            tablesByZone: tables,
        }
    });

    const handlePrimaryAction = async () => {
        if (step === 1) {
            setStep1SubmitAttempted(true);
            if (!isStep1Valid) return;
        }
        if (step === 2) {
            setStep2SubmitAttempted(true);
            if (!isStep2Valid) return;
        }
        if (step === 4) {
            // Fuerza visualización de errores del step 4 antes de bloquear avance.
            setStep4SubmitAttempted(true);
            if (!isStep4Valid) return;
        }
        if (step === 5) {
            // Fuerza visualización de errores del step 5 antes de bloquear avance.
            setStep5SubmitAttempted(true);
            if (!isStep5Valid) return;
        }

        if (step < 6) {
            setStep(step + 1);
            return;
        }

        const payload = buildCreateRestaurantPayload();
        console.log('[CREATE_RESTAURANT_PAYLOAD_JSON]', JSON.stringify(payload, null, 2));

        try {
            const response = await restaurantApi.createRestaurant({
                ...payload,
                imageFile: photos[0],
            });

            // Respuesta del backend tras crear el restaurante con el body JSON generado
            console.log('[CREATE_RESTAURANT_RESPONSE]', response);
            navigate('/restaurants');
        } catch (error) {
            console.error('Error al crear restaurante', error);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Info onValidityChange={setIsStep1Valid} submitAttempted={step1SubmitAttempted} />;
            case 2: return <Step2Shifts onValidityChange={setIsStep2Valid} submitAttempted={step2SubmitAttempted} />;
            case 3: return <Step3Zones />;
            case 4: return (
                <Step4TableMap onValidityChange={setIsStep4Valid} submitAttempted={step4SubmitAttempted} />
            );
            case 5: return <Step5Users onValidityChange={setIsStep5Valid} submitAttempted={step5SubmitAttempted} />;
            case 6: return <Step5Summary />;
            default: return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9F7F2] font-body text-brand-gray antialiased">
            <StaffSidebar
                navItems={sidebarNavItems}
                userDisplayName={user?.nom ?? ''}
                userRoleLabel={getRoleDisplayLabel(user?.rol)}
                onLogout={() => void logout()}
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col border-l border-black/5 pb-12 transition-all duration-500">
                <header className="max-w-4xl mx-auto pt-8 px-6 text-center w-full">
                    <div className="flex items-center justify-start mb-6 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex size-11 items-center justify-center rounded-ds-sm border border-ds-brand-wine/30 text-ds-brand-wine"
                            aria-expanded={sidebarOpen}
                            aria-controls="staff-sidebar-mobile"
                            aria-label="Obrir menú"
                        >
                            <Menu className="size-6" />
                        </button>
                    </div>
                    <nav className="flex items-center justify-center gap-2 text-xs font-medium text-brand-gray/40 mb-12 uppercase tracking-widest">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Restaurants</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-brand-primary/60">Nou</span>
                    </nav>
                    <h1 className="text-center font-ds-display text-2xl font-black uppercase leading-tight tracking-tight text-ds-brand-wine sm:text-3xl md:text-4xl md:leading-[1.15] lg:text-[48px] lg:leading-[64.8px] lg:tracking-[-3px]">
                        Crear restaurant
                    </h1>
                    <p className="mx-auto mt-3 mb-12 max-w-[699px] px-1 text-center font-ds-sans text-sm font-medium italic text-ds-brand-wine/90 sm:mt-4 sm:text-base">
                        Control de menús i gestió de plats.
                    </p>
                </header>

                <main className="max-w-4xl mx-auto px-6 transition-all duration-700 w-full">
                    <div className="bg-white rounded-ds-table shadow-2xl shadow-brand-primary/10 p-10 md:p-14 transition-all duration-700">
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
                                {[1, 2, 3, 4, 5, 6].map((s) => (
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
                                className="w-full py-4 bg-ds-brand-wine text-white rounded-ds-sm font-ds-sans text-sm font-bold uppercase tracking-[1.5px] shadow-sm transition-all duration-300 hover:bg-ds-brand-wine/90 hover:shadow-ds-btn active:scale-[0.98]"
                            >
                                {step === 6 ? 'Crear Restaurant' : 'CONTINUAR'}
                            </button>
                        </div>
                    </div>
                    <footer className="mt-10 w-full max-w-3xl mx-auto border-t border-ds-footer-rule pt-6 pb-12 text-center font-ds-ui text-xs text-ds-ui-muted sm:mt-16 sm:pt-8 sm:text-sm">
                        <p>
                            Necessites ajuda per configurar el teu establiment?{' '}
                            <a
                                href="#"
                                className="font-semibold text-ds-brand-gold hover:underline"
                            >
                                Contacta amb suport tècnic
                            </a>
                        </p>
                    </footer>
                </main>
            </div>

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
