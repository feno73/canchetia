import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Reservar Cancha',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Ver Detalles',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Cancelar',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Editar',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Eliminar Reserva',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: 'Pequeño',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Mediano',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Grande',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    children: 'Procesando...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'No Disponible',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Confirmar Reserva',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithIcons: Story = {
  args: {
    children: 'Buscar Canchas',
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
    rightIcon: React.createElement('svg', {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24", 
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, [
      React.createElement('polyline', { points: "9,18 15,12 9,6", key: 'polyline' })
    ]),
  },
};