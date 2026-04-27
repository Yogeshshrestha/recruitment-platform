export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'slate',
    },
    button: {
      slots: {
        base: 'rounded-lg font-medium transition-none',
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'text-inverted bg-primary hover:bg-primary active:bg-primary disabled:bg-primary aria-disabled:bg-primary',
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'ring ring-inset ring-primary/50 text-primary bg-default hover:bg-default active:bg-default disabled:bg-default aria-disabled:bg-default',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'ring ring-inset ring-accented text-default bg-default hover:bg-default active:bg-default disabled:bg-default aria-disabled:bg-default',
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-default bg-transparent hover:bg-transparent active:bg-transparent disabled:bg-transparent aria-disabled:bg-transparent',
        },
      ],
      defaultVariants: {
        color: 'neutral',
      },
    },
    card: {
      slots: {
        root: 'rounded-xl border border-slate-200 shadow-sm bg-white',
      },
    },
    input: {
      slots: {
        base: 'rounded-lg ring-1 ring-slate-200 bg-white focus:bg-slate-50 focus:ring-slate-300',
      },
    },
    textarea: {
      slots: {
        base: 'rounded-lg ring-1 ring-slate-200 bg-white focus:bg-slate-50 focus:ring-slate-300',
      },
    },
  },
})
