import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Disponible',
  },
};

export const Success: Story = {
  args: {
    children: 'Confirmado',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Pendiente',
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    children: 'Cancelado',
    variant: 'danger',
  },
};

export const Info: Story = {
  args: {
    children: 'Información',
    variant: 'info',
  },
};

export const Small: Story = {
  args: {
    children: 'Nuevo',
    size: 'sm',
    variant: 'success',
  },
};

export const Medium: Story = {
  args: {
    children: 'Mediano',
    size: 'md',
    variant: 'info',
  },
};

// Ejemplos contextuales para la aplicación de canchas
export const FieldAvailable: Story = {
  args: {
    children: 'Disponible',
    variant: 'success',
  },
};

export const FieldReserved: Story = {
  args: {
    children: 'Reservado',
    variant: 'warning',
  },
};

export const FieldMaintenance: Story = {
  args: {
    children: 'Mantenimiento',
    variant: 'danger',
  },
};

export const PremiumComplex: Story = {
  args: {
    children: 'Premium',
    variant: 'info',
  },
};

export const PopularTime: Story = {
  args: {
    children: 'Horario Popular',
    variant: 'warning',
    size: 'sm',
  },
};

export const NewComplex: Story = {
  args: {
    children: '¡Nuevo!',
    variant: 'success',
    size: 'sm',
  },
};

export const FieldType: Story = {
  args: {
    children: 'Fútbol 5',
    variant: 'default',
  },
};

export const Surface: Story = {
  args: {
    children: 'Césped Sintético',
    variant: 'info',
    size: 'sm',
  },
};