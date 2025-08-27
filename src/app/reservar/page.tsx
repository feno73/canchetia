'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const steps = [
    { number: 1, title: 'Seleccionar Cancha' },
    { number: 2, title: 'Fecha y Hora' },
    { number: 3, title: 'Confirmación' },
    { number: 4, title: 'Pago' },
  ];

  const mockFields = [
    {
      id: '1',
      name: 'Cancha 1 - Fútbol 5',
      type: 5,
      surface: 'sintético',
      covered: true,
      price: 8000,
      image: '/placeholder-field.jpg'
    },
    {
      id: '2',
      name: 'Cancha 2 - Fútbol 7',
      type: 7,
      surface: 'sintético',
      covered: false,
      price: 12000,
      image: '/placeholder-field.jpg'
    }
  ];

  const mockTimeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((s) => (
          <div key={s.number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${step >= s.number 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {s.number}
            </div>
            <span className={`ml-2 text-sm ${step >= s.number ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              {s.title}
            </span>
            {s.number < steps.length && (
              <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona una cancha</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {mockFields.map((field) => (
          <Card
            key={field.id}
            className={`cursor-pointer border-2 transition-colors ${
              selectedField === field.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedField(field.id)}
          >
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
                <span className="text-gray-500 ml-2">Foto de la cancha</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{field.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Fútbol {field.type}</span>
                  <span>{field.surface}</span>
                  {field.covered && <span>Techada</span>}
                </div>
                <div className="text-2xl font-bold text-primary-600">
                  ${field.price.toLocaleString('es-AR')}/hora
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!mockFields.length && (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay canchas disponibles
          </h3>
          <p className="text-gray-600 mb-6">
            Aún no hay complejos registrados en el sistema.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Elige fecha y horario</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Selecciona la fecha</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-4">Horarios disponibles</h3>
          <div className="grid grid-cols-3 gap-2">
            {mockTimeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`
                  p-3 rounded-lg border text-center transition-colors
                  ${selectedTime === time
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
          {selectedDate && !mockTimeSlots.length && (
            <p className="text-gray-500 text-center py-4">
              No hay horarios disponibles para esta fecha
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedFieldData = mockFields.find(f => f.id === selectedField);
    
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirma tu reserva</h2>
        
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Resumen de la reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Cancha:</span>
                <span className="font-semibold">{selectedFieldData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-semibold">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('es-AR') : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horario:</span>
                <span className="font-semibold">{selectedTime}:00 - {parseInt(selectedTime) + 1}:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-semibold">1 hora</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary-600">
                  ${selectedFieldData?.price.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Método de pago</h2>
      
      <div className="space-y-4">
        <Card className="border-2 border-primary-200 bg-primary-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-semibold">Pagar con Mercado Pago</h3>
                <p className="text-gray-600 text-sm">Pago seguro online con tarjeta o transferencia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                💵
              </div>
              <div>
                <h3 className="font-semibold">Pagar en el lugar</h3>
                <p className="text-gray-600 text-sm">Reserva ahora y paga cuando llegues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>Nota:</strong> Las funciones de pago estarán disponibles en la próxima versión. 
          Por ahora puedes simular el proceso de reserva.
        </p>
      </div>
    </div>
  );

  const canContinue = () => {
    switch (step) {
      case 1: return selectedField !== '';
      case 2: return selectedDate !== '' && selectedTime !== '';
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Canchetia
            </Link>
            <Link
              href="/buscar"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Volver a búsqueda
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderStepIndicator()}
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Anterior
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canContinue()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Siguiente
            </Button>
          ) : (
            <Button className="bg-success-600 hover:bg-success-700">
              Confirmar Reserva
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}