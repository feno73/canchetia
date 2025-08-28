import type { Meta, StoryObj } from '@storybook/react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import Button from './Button';

const meta: Meta<typeof Card> = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Complejo Deportivo San Lorenzo</h3>
        <p className="text-gray-600">Canchas de fútbol 5 y 7 con césped sintético de última generación.</p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Reserva Confirmada</h3>
        <p className="text-gray-600">Su reserva para el 15 de marzo a las 20:00 ha sido confirmada.</p>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Información Importante</h3>
        <p className="text-gray-600">Recuerde llegar 10 minutos antes del horario reservado.</p>
      </div>
    ),
  },
};

export const ComplexCard: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Complejo Deportivo Boca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📍</span>
              La Boca, Buenos Aires
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🕐</span>
              Disponible 08:00 - 23:00
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">⭐</span>
              4.8/5 (124 reseñas)
            </div>
            <p className="text-gray-600 mt-3">
              Canchas de fútbol 5 y 7 con césped sintético de última generación. 
              Cuenta con vestuarios, estacionamiento y parrilla.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <span className="text-lg font-bold text-argentinian-blue">$15.000/hora</span>
            <Button variant="primary">Ver Disponibilidad</Button>
          </div>
        </CardFooter>
      </>
    ),
  },
};

export const ReservationCard: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader>
          <CardTitle>Reserva #R123456</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Complejo:</span>
                <p className="text-gray-600">Club Atlético Boca</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cancha:</span>
                <p className="text-gray-600">Cancha 2 (Fútbol 7)</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha:</span>
                <p className="text-gray-600">15 de Marzo, 2024</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Horario:</span>
                <p className="text-gray-600">20:00 - 21:00</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="text-lg font-bold text-fern-green">$15.000</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">Modificar</Button>
            <Button variant="danger" className="flex-1">Cancelar</Button>
          </div>
        </CardFooter>
      </>
    ),
  },
};

export const Clickable: Story = {
  args: {
    variant: 'elevated',
    onClick: () => alert('Card clicked!'),
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Cancha Clickeable</h3>
        <p className="text-gray-600">Haz clic en esta tarjeta para ver más detalles.</p>
        <p className="text-sm text-argentinian-blue mt-2">Clic para más información →</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'outlined',
    padding: 'none',
    children: (
      <div>
        <img 
          src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop" 
          alt="Campo de fútbol" 
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Campo con Imagen</h3>
          <p className="text-gray-600">Ejemplo de card sin padding inicial con imagen.</p>
        </div>
      </div>
    ),
  },
};