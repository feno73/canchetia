'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Test de Componentes UI</h1>
        
        {/* Buttons */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Peligro</Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input 
              label="Nombre del complejo" 
              placeholder="Ej: Club Atlético Boca"
            />
            <Input 
              label="Email"
              type="email" 
              placeholder="ejemplo@email.com"
            />
            <Input 
              label="Con error"
              placeholder="Campo requerido"
              error="Este campo es obligatorio"
            />
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Disponible</Badge>
            <Badge variant="success">Confirmado</Badge>
            <Badge variant="warning">Pendiente</Badge>
            <Badge variant="danger">Cancelado</Badge>
            <Badge variant="info">Información</Badge>
          </div>
        </div>

        {/* Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Complejo Deportivo San Lorenzo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Canchas de fútbol 5 y 7 con césped sintético de última generación.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="success">Disponible</Badge>
                  <Badge variant="info">Premium</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <span className="text-lg font-bold text-argentinian-blue">$15.000/hora</span>
                  <Button variant="primary" size="sm">Ver Disponibilidad</Button>
                </div>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Reserva #R123456</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Fecha:</strong> 15 de Marzo, 2024</div>
                  <div><strong>Horario:</strong> 20:00 - 21:00</div>
                  <div><strong>Cancha:</strong> Fútbol 7</div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold text-fern-green">$15.000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">Modificar</Button>
                  <Button variant="danger" size="sm" className="flex-1">Cancelar</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Color Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test de Colores de Marca</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg bg-argentinian-blue text-white">
              <div className="font-semibold">Argentinian Blue</div>
              <div className="text-sm">#5aa9e6</div>
            </div>
            <div className="p-4 rounded-lg bg-cinereous text-white">
              <div className="font-semibold">Cinereous</div>
              <div className="text-sm">#987d7c</div>
            </div>
            <div className="p-4 rounded-lg bg-black text-white">
              <div className="font-semibold">Black</div>
              <div className="text-sm">#020202</div>
            </div>
            <div className="p-4 rounded-lg bg-fern-green text-white">
              <div className="font-semibold">Fern Green</div>
              <div className="text-sm">#50723c</div>
            </div>
            <div className="p-4 rounded-lg bg-light-green text-black">
              <div className="font-semibold">Light Green</div>
              <div className="text-sm">#a1e887</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}