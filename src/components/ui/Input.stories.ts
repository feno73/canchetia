import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Ingrese su texto aquí',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Nombre del jugador',
    placeholder: 'Ej: Juan Pérez',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    label: 'Correo electrónico',
    placeholder: 'jugador@email.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Contraseña',
    placeholder: '••••••••',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'correo@ejemplo.com',
    error: 'El formato del email no es válido',
    value: 'email-invalido',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Teléfono',
    placeholder: '+54 9 11 1234-5678',
    hint: 'Incluya código de área para mejor comunicación',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Buscar canchas',
    placeholder: 'Nombre del complejo o ubicación',
    leftIcon: React.createElement('svg', {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, [
      React.createElement('circle', { cx: "11", cy: "11", r: "8", key: 'circle' }),
      React.createElement('path', { d: "m21 21-4.35-4.35", key: 'path' })
    ]),
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Ubicación',
    placeholder: 'Ingrese su dirección',
    rightIcon: React.createElement('svg', {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, [
      React.createElement('path', { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", key: 'path' }),
      React.createElement('circle', { cx: "12", cy: "10", r: "3", key: 'circle' })
    ]),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Campo deshabilitado',
    placeholder: 'No editable',
    disabled: true,
    value: 'Valor no editable',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    label: 'Cantidad de jugadores',
    placeholder: '10',
    min: 1,
    max: 22,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Comentarios adicionales',
    placeholder: 'Ingrese cualquier comentario sobre la reserva...',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};