import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'white',
      values: [
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'light',
          value: '#f8fafc',
        },
        {
          name: 'dark',
          value: '#020202',
        },
        {
          name: 'argentinian-blue',
          value: '#5aa9e6',
        },
      ],
    },
    docs: {
      theme: {
        colorPrimary: '#5aa9e6',
        colorSecondary: '#987d7c',
        appBg: '#ffffff',
        appContentBg: '#ffffff',
        textColor: '#020202',
        brandTitle: 'Canchetia Design System',
        brandUrl: '/',
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;