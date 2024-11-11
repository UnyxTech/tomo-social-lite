export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: {
          // DEFAULT: '#121212',
          // dark: '#ffffffe9'
          DEFAULT: 'rgb(var(--tms-colors-primary))',
          dark: 'var(--tms-colors-primary-dark)'
        },
        // only primary btn
        primaryBtnText: {
          DEFAULT: '#fff',
          dark: 'var(--tms-colors-primary-btn-text-dark)'
        },
        mbg: {
          DEFAULT: '#F6F6F6',
          dark: '#121212'
        },
        tc1: {
          DEFAULT: '#121212',
          dark: '#fff'
        },
        tc2: {
          DEFAULT: '#a0a0a0',
          dark: '#a0a0a0'
        },
        tc4: {
          DEFAULT: '#12121266',
          dark: '#ffffff66'
        },
        borc: {
          DEFAULT: '#f3f3f3',
          dark: '#303030'
        },
        white: {
          DEFAULT: '#fff',
          dark: '#1b1b1b'
        },
        abg: {
          DEFAULT: '#D9D9D9',
          dark: '#444444'
        },
        iconc: '#999999',
        warning: '#FFBA0A',
        success: '#52c41a',
        danger: '#ED4A47'
      },
      boxShadow: {
        header: '0px 4px 4px 0px #D5D5D540'
      },
      fontFamily: {
        poppins: 'Poppins'
      },
      fontSize: {
        xs: '0.7rem'
      },
      borderRadius: {
        lg: 'var(--tms-rounded-lg)',
        DEFAULT: 'var(--tms-rounded)',
        md: 'var(--tms-rounded-md)',
        xl: 'var(--tms-rounded-xl)',
        '2xl': 'var(--tms-rounded-2xl)',
        '3xl': 'var(--tms-rounded-3xl)',
        full: 'var(--tms-rounded-full)'
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  prefix: 'tm-',
  important: true,
  plugins: []
}
